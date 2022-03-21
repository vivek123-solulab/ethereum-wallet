import nodeMailer from "nodemailer"
const sendEmail = async ({ email, subject, message }) => {
  const { SMTP_MAIL, SMTP_PASSWORD, SMTP_SERVICE } = process.env
  const transporter = nodeMailer.createTransport({
    service: SMTP_SERVICE,
    auth: {
      user: SMTP_MAIL,
      pass: SMTP_PASSWORD,
    },
  })
  const mailOptions = {
    from: SMTP_MAIL,
    to: email,
    subject,
    text: message,
  }

  await transporter.sendMail(mailOptions)
}
export default sendEmail