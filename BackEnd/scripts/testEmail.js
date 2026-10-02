import "dotenv/config";
import {
    verifyEmailConnection,
    sendEmail,
} from "../Services/email.service.js";

try {
    await verifyEmailConnection();

    await sendEmail({
        to: process.env.EMAIL_USER,
        subject: "DOMINOS Email Test",
        text: "DOMINOS Gmail email service is working correctly.",
        html: `
            <h2>DOMINOS Email Test</h2>
            <p>Gmail SMTP is working correctly.</p>
        `,
    });

    console.log("Test email sent successfully.");
    process.exit(0);
} catch (error) {
    console.error("Email test failed:");
    console.error(error);
    process.exit(1);
}
