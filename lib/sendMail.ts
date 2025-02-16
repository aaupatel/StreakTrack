import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplate = (title: string, message: string, buttonText: string, buttonUrl: string) => `
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center;">
      <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="StreakTrack Logo" style="max-width: 150px; margin-bottom: 20px;">
    </div>
    <h2 style="color: #333; text-align: center;">${title}</h2>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">${message}</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${buttonUrl}" style="background-color: #0070f3; color: white; padding: 8px 20px; text-decoration: none; border-radius: 5px; font-weight: semibold; font-size: 12px;">${buttonText}</a>
    </div>
    <p style="color: #777; font-size: 14px; text-align: center;">
      If you did not request this, please ignore this email.
    </p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
    <p style="color: #777; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} StreakTrack. All rights reserved.
    </p>
  </div>
`;

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
  const mailOptions = {
    from: `"StreakTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: emailTemplate(
      "Welcome to StreakTrack!",
      "Thank you for signing up. Please verify your email address to get started.",
      "Verify Email",
      verificationUrl
    ),
  };

  await transporter.sendMail(mailOptions);
}

export async function sendCoAdminInvite(email: string, token: string, organizationName: string) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/co-admin/setup?token=${token}`;
  const mailOptions = {
    from: `"StreakTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invitation to Join ${organizationName} as Co-Admin`,
    html: emailTemplate(
      "You're Invited to StreakTrack!",
      `You have been invited to join <strong>${organizationName}</strong> as a Co-Admin. Click the button below to set up your account.`,
      "Set Up Account",
      inviteUrl
    ),
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  const mailOptions = {
    from: `"StreakTrack Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: emailTemplate(
      "Password Reset Request",
      "We received a request to reset your password. Click the button below to proceed.",
      "Reset Password",
      resetUrl
    ),
  };

  await transporter.sendMail(mailOptions);
}
