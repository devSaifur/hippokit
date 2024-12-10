import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.google.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_APP_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  const options = {
    from: process.env.EMAIL_APP_USER,
    to,
    subject,
    html,
  }

  try {
    await transporter.sendMail(options)
  } catch (err) {
    console.error(err)
    throw err
  }
}
