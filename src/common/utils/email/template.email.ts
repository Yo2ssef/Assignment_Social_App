import { EmailSubjectEnums } from '../../enum';
const templates: Partial<Record<EmailSubjectEnums, (data: { subject: EmailSubjectEnums, code: number }) => string>> = {
    [EmailSubjectEnums.CONFIRM_EMAIL]: (data: { subject: EmailSubjectEnums, code: number }) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm your email</title>
</head>

<body style="margin:0;padding:0;background:#F2F2F2;color:#000000;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="background:#F2F2F2;margin:0;padding:40px 20px;">

<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:560px;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:18px;overflow:hidden;">

<!-- Header -->
<tr>
<td style="padding:30px 38px;background:#000000;">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>

<td style="font-size:16px;letter-spacing:2px;font-weight:bold;color:#FFFFFF;">
SOCIAL APP
</td>

<td align="right" style="font-size:10px;letter-spacing:2px;color:#CCCCCC;">
WELCOME
</td>

</tr>
</table>

</td>
</tr>

<!-- Main Content -->
<tr>
<td style="padding:42px 38px 20px;">

<div style="font-size:10px;letter-spacing:2.5px;color:#666666;margin-bottom:16px;font-weight:bold;">
EMAIL VERIFICATION
</div>

<div style="font-size:30px;line-height:38px;font-weight:bold;color:#000000;margin-bottom:18px;">
Confirm your email.
</div>

<div style="font-size:15px;line-height:26px;color:#555555;">
Thanks for joining Social App. We're glad to have you with us.
Enter the verification code below to confirm your email address
and complete your account registration.
</div>

</td>
</tr>

<!-- Verification Code -->
<tr>
<td style="padding:24px 38px 32px;">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="background:#000000;border-radius:14px;">

<tr>
<td align="center" style="padding:30px 20px;">

<div style="font-size:10px;letter-spacing:3px;color:#CCCCCC;margin-bottom:16px;font-weight:bold;">
YOUR VERIFICATION CODE
</div>

<div style="font-size:32px;line-height:44px;letter-spacing:8px;font-weight:bold;color:#FFFFFF;padding-left:8px;white-space:nowrap;">
${data.code}
</div>

<div style="width:45px;height:2px;background:#FFFFFF;margin-top:18px;font-size:1px;line-height:2px;">
&nbsp;
</div>

</td>
</tr>

</table>

</td>
</tr>

<!-- Expiration -->
<tr>
<td style="padding:0 38px 42px;">

<div style="font-size:13px;line-height:23px;color:#555555;">
This code will expire in
<span style="color:#000000;font-weight:bold;">2 minutes</span>.
Please enter it in the verification screen to confirm your email address.
</div>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 38px;border-top:1px solid #E5E5E5;background:#FAFAFA;">

<div style="font-size:12px;line-height:20px;color:#666666;">
If you did not create this account, you can safely ignore this email.
</div>

</td>
</tr>

</table>

<!-- Copyright -->
<div style="max-width:560px;padding-top:20px;text-align:center;font-size:10px;letter-spacing:1.5px;color:#666666;">
© 2026 SOCIAL APP. ALL RIGHTS RESERVED.
</div>

</td>
</tr>

</table>

</body>
</html>
    `
    },

    [EmailSubjectEnums.FORGOT_PASSWORD]: (data: { subject: EmailSubjectEnums, code: number }) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset your password</title>
</head>

<body style="margin:0;padding:0;background:#F2F2F2;color:#000000;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="background:#F2F2F2;margin:0;padding:40px 20px;">

<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:560px;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:18px;overflow:hidden;">

<!-- Header -->
<tr>
<td style="padding:30px 38px;background:#000000;">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>

<td style="font-size:16px;letter-spacing:2px;font-weight:bold;color:#FFFFFF;">
SOCIAL APP
</td>

<td align="right" style="font-size:10px;letter-spacing:2px;color:#CCCCCC;">
SECURITY
</td>

</tr>
</table>

</td>
</tr>

<!-- Main Content -->
<tr>
<td style="padding:42px 38px 20px;">

<div style="font-size:10px;letter-spacing:2.5px;color:#666666;margin-bottom:16px;font-weight:bold;">
PASSWORD RECOVERY
</div>

<div style="font-size:30px;line-height:38px;font-weight:bold;color:#000000;margin-bottom:18px;">
Reset your password.
</div>

<div style="font-size:15px;line-height:26px;color:#555555;">
We received a request to reset the password associated with your account.
Use the verification code below to continue.
</div>

</td>
</tr>

<!-- Verification Code -->
<tr>
<td style="padding:24px 38px 32px;">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="background:#000000;border-radius:14px;">

<tr>
<td align="center" style="padding:30px 20px;">

<div style="font-size:10px;letter-spacing:3px;color:#CCCCCC;margin-bottom:16px;font-weight:bold;">
YOUR VERIFICATION CODE
</div>

<div style="font-size:32px;line-height:44px;letter-spacing:8px;font-weight:bold;color:#FFFFFF;padding-left:8px;white-space:nowrap;">
${data.code}
</div>

<div style="width:45px;height:2px;background:#FFFFFF;margin-top:18px;font-size:1px;line-height:2px;">
&nbsp;
</div>

</td>
</tr>

</table>

</td>
</tr>

<!-- Expiration -->
<tr>
<td style="padding:0 38px 42px;">

<div style="font-size:13px;line-height:23px;color:#555555;">
This code will expire in
<span style="color:#000000;font-weight:bold;">3 minutes</span>.
If you did not request a password reset, you can safely ignore this email.
</div>

</td>
</tr>

<!-- Security Notice -->
<tr>
<td style="padding:24px 38px;border-top:1px solid #E5E5E5;background:#FAFAFA;">

<div style="font-size:12px;line-height:20px;color:#666666;">
For your security, never share this code with anyone.
</div>

</td>
</tr>

</table>

<!-- Copyright -->
<div style="max-width:560px;padding-top:20px;text-align:center;font-size:10px;letter-spacing:1.5px;color:#666666;">
© 2026 SOCIAL APP. ALL RIGHTS RESERVED.
</div>

</td>
</tr>

</table>

</body>
</html>
    `
    },


}
export const verifyEmailTemplate = (data: { subject: EmailSubjectEnums, code: number }) => {
    const template = templates[data.subject]
    if (!template) {
        throw new Error(`Unsupported email subject: ${data.subject}`)
    }
    return template(data)
}