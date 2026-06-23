import nodemailer from 'nodemailer'

export async function sendOTPEmail(to, otp) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env

  // Log what we actually see — helps catch .env loading issues
  console.log('SMTP config:', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER,
    passSet: !!SMTP_PASS,
  })

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      `SMTP config missing — host: "${SMTP_HOST}", user: "${SMTP_USER}", pass set: ${!!SMTP_PASS}. Check your .env file.`
    )
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false },
  })

  await transporter.sendMail({
    from: `"Inkline" <${SMTP_USER}>`,
    to,
    subject: 'Your Inkline password reset code',
    text: `Your one-time password is: ${otp}\n\nIt expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Password reset</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">Enter this code in Inkline to reset your password. Expires in <strong>10 minutes</strong>.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: 700; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}
