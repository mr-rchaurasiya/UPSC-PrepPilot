import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (toEmail, code) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn(`\n[EMAIL SERVICE WARNING] SMTP credentials not configured in .env file!`);
    console.warn(`Verification code for ${toEmail} is: ${code}`);
    console.warn(`Please set SMTP_USER and SMTP_PASS in your server/.env file to receive actual emails.\n`);
    return {
      success: false,
      message: 'SMTP credentials missing. Code printed in server terminal logs.'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: `"UPSC PrepPilot Support" <${user}>`,
      to: toEmail,
      subject: 'UPSC PrepPilot - Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Account Recovery</h2>
          <p>Hello Aspirant,</p>
          <p>We received a request to reset the password for your UPSC PrepPilot account. Use the 6-digit verification code below to proceed with the password reset:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f3f4f6; padding: 10px 20px; border-radius: 6px; border: 1px dashed #6366f1; color: #1e1b4b;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="text-align: center; color: #9ca3af; font-size: 12px;">PrepPilot AI UPSC Preparation Engine</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Verification email successfully sent to ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL SERVICE ERROR] Failed to send email:', error.message);
    throw error;
  }
};
