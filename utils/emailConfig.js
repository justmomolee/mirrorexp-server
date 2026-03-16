import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
	host: "smtp.hostinger.com",
	port: 465,
	secure: true,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});

export const verifyTransporter = async () => {
	try {
		await transporter.verify();
		console.log("✓ Email transporter verified successfully");
		return true;
	} catch (error) {
		console.error("✗ Email transporter verification failed:");
		console.error("  Please check your SMTP credentials:");
		console.error("  - SMTP_USER:", process.env.SMTP_USER);
		console.error("  - SMTP_PASSWORD: [hidden]");
		console.error("  Error:", error instanceof Error ? error.message : error);
		throw new Error("Email verification failed. Server cannot start without valid email configuration.");
	}
};
