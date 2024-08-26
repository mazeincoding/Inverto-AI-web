import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "maze@standsync.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function send_email(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  const mail_options = {
    from: '"StandSync" <hello@standsync.com>',
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mail_options);
}

export async function send_invitation_email(email: string, magic_link: string) {
  const subject = "Welcome to StandSync - You're Invited!";
  const text = `You've been invited to join StandSync! Click the following link to get started: ${magic_link}`;
  const html = `
    <h1>Welcome to StandSync!</h1>
    <p>You've been invited to join our platform. Click the button below to get started:</p>
    <a href="${magic_link}" style="background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">
      Join StandSync
    </a>
  `;

  await send_email(email, subject, text, html);
}
