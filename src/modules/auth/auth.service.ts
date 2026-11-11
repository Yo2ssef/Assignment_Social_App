import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { EmailSubjectEnums, LogoutEnum, ProviderUserEnum } from '../../common/enum';
import { ConflictException, NotFoundException, TooManyRequestException, UnauthorizedException } from '../../common/exception';
import { userRepository, UserRepository } from '../../common/repository';
import { compareHash, hash } from '../../common/security';
import { cacheService, CacheService, tokenService, TokenService } from '../../common/service';
import { createNumberOtp, emailEvent } from '../../common/utils';
import { JwtPayloadType } from '../../common/types';
import { ACCESS_TOKEN_EXPIRES_IN, WEB_CLIENT_ID } from '../../config';
import { HUser } from '../../database/model';
import { ILoginResponse, ILogoutResponse, ISignupOrLoginWithGoogleResponse } from './entities/auth.entities';
import { SignupDto, ConfirmEmailDto, ResetPasswordDto, LoginDto } from './dto';

class AuthService {
    private readonly userRepository: UserRepository;
    private readonly cacheService: CacheService;
    private readonly client: OAuth2Client
    private readonly tokenService: TokenService
    constructor() {
        this.client = new OAuth2Client();
        this.userRepository = userRepository;
        this.cacheService = cacheService;
        this.tokenService = tokenService;
    }
    private getEmailOtpKey({ email, subject }: { email: string, subject: EmailSubjectEnums }): string {
        return `User::${email}::${subject}::Otp`
    }
    private getEmailOtpRequestCountKey({ email, subject }: { email: string, subject: EmailSubjectEnums }): string {
        return `${this.getEmailOtpKey({ email, subject })}::Trials`
    }
    private getLoginAttemptCountKey({ email }: { email: string }): string {
        return `User::${email}::Block::Count`
    }
    private async sendEmailOtp({
        email,
        subject,
        expiresIn = 120,
        maxTrials = 3,
        otpRequestBlockDurationSeconds = (600 + expiresIn),
        requestCountWindowSeconds = 600
    }: {
        email: string,
        subject: EmailSubjectEnums,
        expiresIn?: number,
        maxTrials?: number,
        otpRequestBlockDurationSeconds?: number,
        requestCountWindowSeconds?: number
    }): Promise<void> {
        // Check if the user has already requested an OTP and if it is still valid
        const existingOtpTtl = await this.cacheService.ttl({ key: this.getEmailOtpKey({ email, subject }) })
        if (existingOtpTtl > 0) {
            throw new ConflictException(`You can request a new code after ${existingOtpTtl} seconds.`)
        }

        // Check if the user has exceeded the maximum number of trials
        const otpRequestCount = await this.cacheService.get({ key: this.getEmailOtpRequestCountKey({ email, subject }) }) ?? 0
        if (otpRequestCount >= maxTrials) {
            const blockTtl = await this.cacheService.ttl({ key: this.getEmailOtpRequestCountKey({ email, subject }) })
            throw new TooManyRequestException(
                `You have exceeded the maximum number of attempts. Please try again after ${blockTtl} seconds.`
            )
        }

        // Generate a new OTP and store it in the cache with an expiration time
        const otp = createNumberOtp()
        await this.cacheService.set({
            key: this.getEmailOtpKey({ email, subject }),
            value: await hash(String(otp)) as string,
            ttl: expiresIn
        })

        // Increment the trial count and set an expiration time for the trial count if it reaches the maximum
        const updatedOtpRequestCount = await this.cacheService.incrBy({
            key: this.getEmailOtpRequestCountKey({ email, subject })
        })
        if (updatedOtpRequestCount === 1) {
            await this.cacheService.expire({
                key: this.getEmailOtpRequestCountKey({ email, subject }),
                ttl: requestCountWindowSeconds
            })
        }

        if (updatedOtpRequestCount == maxTrials) {
            await this.cacheService.expire({
                key: this.getEmailOtpRequestCountKey({ email, subject }),
                ttl: otpRequestBlockDurationSeconds
            })
        }

        emailEvent.emit("sendEmail", {
            recipients: { to: email },
            subject,
            data: { code: otp }
        })
    }
    private async handleFailedLoginAttempt({
        email,
        trials = 5,
        blockLTrialsTtl = 300
    }: { email: string, trials?: number, blockLTrialsTtl?: number }): Promise<void> {
        // Increment the login attempt count and set an expiration time for the count if it reaches the maximum
        const attempts = await this.cacheService.incrBy({ key: this.getLoginAttemptCountKey({ email }) })
        if (attempts === 1) {
            await this.cacheService.expire({
                key: this.getLoginAttemptCountKey({ email }),
                ttl: blockLTrialsTtl
            })
        }
        if (attempts === trials) {
            await this.cacheService.expire({
                key: this.getLoginAttemptCountKey({ email }),
                ttl: blockLTrialsTtl
            })
        }
        throw new NotFoundException("Invalid email or password or email not confirmed.")
    }
    private async verifyGoogleIdToken(idToken: string): Promise<TokenPayload> {
        let ticket
        try {
            ticket = await this.client.verifyIdToken({
                idToken,
                audience: WEB_CLIENT_ID
            })
        } catch {
            throw new UnauthorizedException("Invalid or expired Google ID token.")
        }

        const payload = ticket.getPayload()
        if (!payload?.email || !payload.email_verified) {
            throw new UnauthorizedException("Google account email is not verified.")
        }

        return payload
    }

    async signupOrLoginWithGoogle({ idToken }: { idToken: string }, issuer: string): Promise<ISignupOrLoginWithGoogleResponse> {
        const { name, email, picture } = await this.verifyGoogleIdToken(idToken)
        const existingAccount = await this.userRepository.findOne({
            filter: { email: email! }
        })

        if (existingAccount) {
            if (existingAccount.provider !== ProviderUserEnum.GOOGLE) {
                throw new ConflictException("This email is already registered with a different provider. Please use the appropriate login method.")
            }
            return {
                status: 200,
                message: " Successfully logged in.",
                data: await this.tokenService.createLoginCredentials({ user: existingAccount, issuer })
            }
        }

        const user = await this.userRepository.createOne({
            data: {
                email,
                userName: name,
                provider: ProviderUserEnum.GOOGLE,
                confirmEmail: new Date(),
                image: picture
            }
        })
        return {
            status: 201,
            message: " Successfully signed up and logged in.",
            data: await this.tokenService.createLoginCredentials({ user, issuer })
        }
    }

    async signup({ userName, email, password, gender, dateOfBirth, phone }: SignupDto["body"]): Promise<HUser> {
        const existingAccount = await this.userRepository.findOne({
            filter: { email }
        })
        if (existingAccount) throw new ConflictException("Email already exists.");

        const createdUser = await this.userRepository.createOne({
            data: { userName, email, password, gender, dateOfBirth, phone }
        })
        await this.sendEmailOtp({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL });
        return createdUser
    }

    async resendConfirmEmail({ email }: { email: string }): Promise<void> {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: false }
            }
        })
        if (!account) throw new ConflictException("Account not found or already confirmed.");
        await this.sendEmailOtp({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL });
        return;
    }

    async confirmEmail({ email, otp }: ConfirmEmailDto["body"]): Promise<HUser> {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: false }
            }
        })
        if (!account) throw new NotFoundException("Account not found or already confirmed.");

        const hashedOtp = await this.cacheService.get({
            key: this.getEmailOtpKey({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL })
        })
        if (!hashedOtp || !await compareHash(otp, hashedOtp)) {
            throw new ConflictException("Invalid or expired confirm email code.")
        }

        account.confirmEmail = new Date()
        await account.save()
        await this.cacheService.del({
            key: await this.cacheService.keys({
                prefix: this.getEmailOtpKey({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL })
            })
        });
        return account
    }

    async requestPasswordResetCode({ email }: { email: string }): Promise<void> {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: true }
            }
        })
        if (!account) throw new ConflictException("Account not found or not confirmed.");
        await this.sendEmailOtp({ email, subject: EmailSubjectEnums.FORGOT_PASSWORD, expiresIn: 180 })
    }

    async verifyPasswordResetCode({ email, otp }: ConfirmEmailDto["body"]): Promise<HUser> {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: true }
            }
        })
        if (!account) throw new NotFoundException("Account not found or not confirmed.");

        const hashedOtp = await this.cacheService.get({
            key: this.getEmailOtpKey({ email, subject: EmailSubjectEnums.FORGOT_PASSWORD })
        })
        if (!hashedOtp || !await compareHash(otp, hashedOtp)) {
            throw new ConflictException("Invalid or expired forgot password code.")
        }
        return account
    }

    async resetPassword({ email, otp, password }: ResetPasswordDto["body"]): Promise<HUser> {
        const account = await this.verifyPasswordResetCode({ email, otp })
        account.password = password
        account.changeCredentialsTime = new Date()
        await account.save()
        const result = await Promise.all([
            this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: account._id }) }),
            this.cacheService.keys({ prefix: this.getEmailOtpKey({ email, subject: EmailSubjectEnums.FORGOT_PASSWORD }) })
        ])
        await this.cacheService.del({
            key: [...result[0], ...result[1]]
        })
        return account
    }

    async login({ email, password }: LoginDto["body"], issuer: string): Promise<ILoginResponse | void> {
        const loginAttempts = await this.cacheService.get({ key: this.getLoginAttemptCountKey({ email }) }) ?? 0
        if (loginAttempts >= 5) {
            const blockTtl = await this.cacheService.ttl({ key: this.getLoginAttemptCountKey({ email }) })
            throw new TooManyRequestException(
                `You have exceeded the maximum number of login attempts. Please try again after ${blockTtl} seconds.`
            )
        }

        const user = await this.userRepository.findOne({
            filter: {
                email,
                provider: ProviderUserEnum.SYSTEM,
                confirmEmail: { $exists: true }
            },
        })
        if (!user) return await this.handleFailedLoginAttempt({ email });
        if (!user?.password) return await this.handleFailedLoginAttempt({ email });

        const isPasswordValid = await compareHash(password, user.password)
        if (!isPasswordValid) return await this.handleFailedLoginAttempt({ email });

        await this.cacheService.del({ key: this.getLoginAttemptCountKey({ email }) });

        return await this.tokenService.createLoginCredentials({ user, issuer });
    }

    async rotateToken(user: HUser, payload: JwtPayloadType, issuer: string): Promise<ILoginResponse> {
        const accessTokenExpiresAt = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
        const currentTime = Date.now() + (5 * 60000)
        if (currentTime < accessTokenExpiresAt) {
            throw new ConflictException(
                "Sorry we cannot create new login credentials while current access token still within valid time range"
            )
        }
        const data = await this.tokenService.createLoginCredentials({ user, issuer })
        await this.tokenService.createRevokeToken({ payload });
        return data
    }

    async logout(user: HUser, payload: JwtPayloadType, { action }: { action: LogoutEnum }): Promise<ILogoutResponse> {
        let message;
        switch (action) {
            case LogoutEnum.ALL:
                user.changeCredentialsTime = new Date()
                await user.save()
                const userSessionKeys = await this.cacheService.keys({
                    prefix: this.tokenService.userBaseRevokeTokenKey({ userId: user._id })
                }) ?? []
                if (userSessionKeys.length) await this.cacheService.del({ key: userSessionKeys });
                message = "Logged out from all sessions successfully."
                break;
            default:
                await this.tokenService.createRevokeToken({ payload });
                message = "Logged out from current session successfully."
                break;
        }
        return { user, message }
    }
}

export default new AuthService()