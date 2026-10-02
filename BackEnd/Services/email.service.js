import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const verifyEmailConnection = async () => {
    await transporter.verify();

    console.log(
        "Email service: SMTP connection verified."
    );
};

export const sendEmail = async ({
    to,
    subject,
    html,
    text,
}) => {
    const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text,
        html,
    });

    console.log(
        `Email sent successfully: ${info.messageId}`
    );

    return info;
};

export default transporter;
