import transporter from "./mail.config.js";

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationUrl = `http://localhost:5173/verify-email/${verificationToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email
        to: email,  // Recipient email
        subject: 'Email Verification',
        html: `
            <p>Thank you for registering. Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">Verify Email</a>
        `,
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);

        // Check if email was successfully sent
        if (info.accepted.length > 0) {
            console.log('Verification email sent successfully');
            return { success: true, message: 'Verification email sent' };
        } else {
            console.log('Failed to send verification email');
            return { success: false, message: 'Failed to send verification email' };
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Error sending verification email', error };
    }
};

export default sendVerificationEmail;