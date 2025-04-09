import nodemailer from "nodemailer";
/**
 * Отправляет email с PDF (или другим вложением), поддерживает path (прямой путь) и content (если из буфера).
 *
 * Должен быть установлен nodemailer: `npm install nodemailer`.
 *
 * Требуется Google Account с двуфакторной аутентификацией и сгенерированным паролём приложения.
 *
 * @param {Object} config
 * @param {Object} config.auth - { user (почтовый адрес аккаунта), pass (пароль приложения, не аккаунта!) }
 * @param {string} config.to - Кому отправлять письмо
 * @param {string} config.subject - Тема письма
 * @param {string} config.text - Текст письма
 * @param {Object} config.attachment - Вложение с полями:
 *   - `filename`: string — имя файла с расширением или произвольное имя для буфера
 *   - `path`?: string — путь до файла на диске
 *   - `content`?: Buffer|string|Stream — содержимое (буфер, строка или поток)
 *   - `contentType`?: string — MIME-тип (например, application/pdf), при использовании `content`
 *
 */
export async function sendEmailWithAttachment({
  auth,
  to,
  subject,
  text,
  attachment,
}) {
  if (!auth?.user || !auth?.pass || !to || !subject || !attachment?.filename) {
    throw new Error("Missing required fields");
  }

  if (!attachment.path && !attachment.content) {
    throw new Error("Attachment must include either path or content");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth,
  });

  const mailOptions = {
    from: `"ADHD Support app 📬" <${auth.user}>`,
    to,
    subject,
    text,
    attachments: [attachment],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}
