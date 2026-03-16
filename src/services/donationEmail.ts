import { sendEmail } from "./emailService";

export const sendDonationConfirmation = async (
  email: string,
  firstName: string,
  amount: number,
  txRef: string,
) => {
  const subject = "Thank You for Your Donation ❤️";

  const html = `
    <div style="font-family: Arial; line-height:1.6;">
      <h2>Thank you for your donation ❤️</h2>

      <p>Hello ${firstName},</p>

      <p>Your donation has been successfully received.</p>

      <p><strong>Amount:</strong> ${amount} birr</p>
      <p><strong>Transaction Reference:</strong> ${txRef}</p>

      <p>Your support helps us continue helping communities in need.</p>

      <br/>

      <p>Best regards,<br/>Hibret Lebego Organization</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};
