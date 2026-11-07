"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const security_1 = require("../../common/security");
const service_1 = require("../../common/service");
const utils_1 = require("../../common/utils");
const config_1 = require("../../config/config");
class AuthService {
    userRepository;
    cacheService;
    client;
    tokenService;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.client = new google_auth_library_1.OAuth2Client();
        this.cacheService = service_1.cacheService;
        this.tokenService = service_1.tokenService;
    }
    getEmailOtpKey({ email, subject }) {
        return `User::${email}::${subject}::Otp`;
    }
    getEmailOtpRequestCountKey({ email, subject }) {
        return `${this.getEmailOtpKey({ email, subject })}::Trials`;
    }
    getLoginAttemptCountKey({ email }) {
        return `User::${email}::Block::Count`;
    }
    async sendEmailOtp({ email, subject, expiresIn = 120, maxTrials = 3, otpRequestBlockDurationSeconds = (600 + expiresIn), requestCountWindowSeconds = 600 }) {
        const existingOtpTtl = await this.cacheService.ttl({ key: this.getEmailOtpKey({ email, subject }) });
        if (existingOtpTtl > 0) {
            throw new exception_1.ConflictException(`You can request a new code after ${existingOtpTtl} seconds.`);
        }
        const otpRequestCount = await this.cacheService.get({ key: this.getEmailOtpRequestCountKey({ email, subject }) }) ?? 0;
        if (otpRequestCount >= maxTrials) {
            const blockTtl = await this.cacheService.ttl({ key: this.getEmailOtpRequestCountKey({ email, subject }) });
            throw new exception_1.TooManyRequestException(`You have exceeded the maximum number of attempts. Please try again after ${blockTtl} seconds.`);
        }
        const otp = (0, utils_1.createNumberOtp)();
        await this.cacheService.set({
            key: this.getEmailOtpKey({ email, subject }),
            value: await (0, security_1.hash)(String(otp)),
            ttl: expiresIn
        });
        const updatedOtpRequestCount = await this.cacheService.incrBy({
            key: this.getEmailOtpRequestCountKey({ email, subject })
        });
        if (updatedOtpRequestCount === 1) {
            await this.cacheService.expire({
                key: this.getEmailOtpRequestCountKey({ email, subject }),
                ttl: requestCountWindowSeconds
            });
        }
        if (updatedOtpRequestCount == maxTrials) {
            await this.cacheService.expire({
                key: this.getEmailOtpRequestCountKey({ email, subject }),
                ttl: otpRequestBlockDurationSeconds
            });
        }
        utils_1.emailEvent.emit("sendEmail", {
            recipients: { to: email },
            subject,
            data: { code: otp }
        });
    }
    async handleFailedLoginAttempt({ email, trials = 5, blockLTrialsTtl = 300 }) {
        const attempts = await this.cacheService.incrBy({ key: this.getLoginAttemptCountKey({ email }) });
        if (attempts === 1) {
            await this.cacheService.expire({
                key: this.getLoginAttemptCountKey({ email }),
                ttl: blockLTrialsTtl
            });
        }
        if (attempts === trials) {
            await this.cacheService.expire({
                key: this.getLoginAttemptCountKey({ email }),
                ttl: blockLTrialsTtl
            });
        }
        throw new exception_1.NotFoundException("Invalid email or password or email not confirmed.");
    }
    async verifyGoogleIdToken(idToken) {
        let ticket;
        try {
            ticket = await this.client.verifyIdToken({
                idToken,
                audience: config_1.WEB_CLIENT_ID
            });
        }
        catch {
            throw new exception_1.UnauthorizedException("Invalid or expired Google ID token.");
        }
        const payload = ticket.getPayload();
        if (!payload?.email || !payload.email_verified) {
            throw new exception_1.UnauthorizedException("Google account email is not verified.");
        }
        return payload;
    }
    async signUpOrLoginWithGoogle({ idToken }, issuer) {
        const { name, email, picture } = await this.verifyGoogleIdToken(idToken);
        const existingAccount = await this.userRepository.findOne({
            filter: { email: email }
        });
        if (existingAccount) {
            if (existingAccount.provider !== enum_1.ProviderUserEnum.GOOGLE) {
                throw new exception_1.ConflictException("Invalid account provider.");
            }
            return { status: 200, data: await this.tokenService.createLoginCredentials({ user: existingAccount, issuer }) };
        }
        const user = await this.userRepository.createOne({
            data: {
                email,
                userName: name,
                provider: enum_1.ProviderUserEnum.GOOGLE,
                confirmEmail: new Date(),
                image: picture
            }
        });
        return { status: 201, data: await this.tokenService.createLoginCredentials({ user, issuer }) };
    }
    async signUp({ userName, email, password, gender, dateOfBirth, phone }) {
        const existingAccount = await this.userRepository.findOne({
            filter: { email }
        });
        if (existingAccount)
            throw new exception_1.ConflictException("Email already exists.");
        const createdUser = await this.userRepository.createOne({
            data: {
                userName,
                email,
                password,
                gender,
                dateOfBirth,
                phone
            }
        });
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnums.CONFIRM_EMAIL });
        return createdUser;
    }
    async resendConfirmEmail({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: false }
            }
        });
        if (!account)
            throw new exception_1.ConflictException("Account not found or already confirmed.");
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnums.CONFIRM_EMAIL });
        return;
    }
    async confirmEmail({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: false }
            }
        });
        if (!account)
            throw new exception_1.NotFoundException("Account not found or already confirmed.");
        const hashedOtp = await this.cacheService.get({
            key: this.getEmailOtpKey({ email, subject: enum_1.EmailSubjectEnums.CONFIRM_EMAIL })
        });
        if (!hashedOtp || !await (0, security_1.compareHash)(otp, hashedOtp)) {
            throw new exception_1.ConflictException("Invalid or expired confirm email code.");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.cacheService.del({
            key: await this.cacheService.keys({
                prefix: this.getEmailOtpKey({ email, subject: enum_1.EmailSubjectEnums.CONFIRM_EMAIL })
            })
        });
        return account;
    }
    async requestPasswordResetCode({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: true }
            }
        });
        if (!account)
            throw new exception_1.ConflictException("Account not found or not confirmed.");
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnums.FORGOT_PASSWORD, expiresIn: 180 });
    }
    async verifyPasswordResetCode({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: true }
            }
        });
        if (!account)
            throw new exception_1.NotFoundException("Account not found or not confirmed.");
        const hashedOtp = await this.cacheService.get({
            key: this.getEmailOtpKey({ email, subject: enum_1.EmailSubjectEnums.FORGOT_PASSWORD })
        });
        if (!hashedOtp || !await (0, security_1.compareHash)(otp, hashedOtp)) {
            throw new exception_1.ConflictException("Invalid or expired forgot password code.");
        }
        return account;
    }
    async resetPassword({ email, otp, password }) {
        const account = await this.verifyPasswordResetCode({ email, otp });
        account.password = password;
        account.changeCredentialsTime = new Date();
        await account.save();
        const result = await Promise.all([
            this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: account._id }) }),
            this.cacheService.keys({ prefix: this.getEmailOtpKey({ email, subject: enum_1.EmailSubjectEnums.FORGOT_PASSWORD }) })
        ]);
        await this.cacheService.del({
            key: [...result[0], ...result[1]]
        });
        return account;
    }
    async login({ email, password }, issuer) {
        const loginAttempts = await this.cacheService.get({ key: this.getLoginAttemptCountKey({ email }) }) ?? 0;
        if (loginAttempts >= 5) {
            const blockTtl = await this.cacheService.ttl({ key: this.getLoginAttemptCountKey({ email }) });
            throw new exception_1.TooManyRequestException(`You have exceeded the maximum number of login attempts. Please try again after ${blockTtl} seconds.`);
        }
        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: true }
            },
        });
        if (!user)
            return await this.handleFailedLoginAttempt({ email });
        if (!user?.password)
            return await this.handleFailedLoginAttempt({ email });
        const isPasswordValid = await (0, security_1.compareHash)(password, user.password);
        if (!isPasswordValid)
            return await this.handleFailedLoginAttempt({ email });
        await this.cacheService.del({ key: this.getLoginAttemptCountKey({ email }) });
        return await this.tokenService.createLoginCredentials({ user, issuer });
    }
    async rotateToken(user, payload, issuer) {
        const accessTokenExpiresAt = (payload.iat + config_1.ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const currentTime = Date.now() + (5 * 60000);
        if (currentTime < accessTokenExpiresAt) {
            throw new exception_1.ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range");
        }
        const data = await this.tokenService.createLoginCredentials({ user, issuer });
        await this.tokenService.createRevokeToken({ payload });
        return data;
    }
    async logout(user, payload, { action }) {
        let message;
        switch (action) {
            case enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                const userSessionKeys = await this.cacheService.keys({
                    prefix: this.tokenService.userBaseRevokeTokenKey({ userId: user._id })
                }) ?? [];
                if (userSessionKeys.length)
                    await this.cacheService.del({ key: userSessionKeys });
                message = "Logged out from all sessions successfully.";
                break;
            default:
                await this.tokenService.createRevokeToken({ payload });
                message = "Logged out from current session successfully.";
                break;
        }
        return { user, message };
    }
}
exports.default = new AuthService();
