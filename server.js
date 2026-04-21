import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { verifyTransporter } from "./utils/emailConfig.js";
import usersRoutes from "./routes/users.js";
import transactionsRoutes from "./routes/transactions.js";
import depositsRoutes from "./routes/deposits.js";
import withdrawalsRoutes from "./routes/withdrawals.js";
import tradesRoutes from "./routes/trades.js";
import tradersRoutes from "./routes/traders.js";
import utilsRoutes from "./routes/utils.js";
import kycsRoutes from "./routes/kycs.js";
import rateLimit from "express-rate-limit";
import activityLogsRoutes from "./routes/activityLogs.js";
import { User } from "./models/user.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Checking for required ENV variables
if (!process.env.JWT_PRIVATE_KEY) {
	console.error("Fatal Error: jwtPrivateKey is required");
	process.exit(1);
}

if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
	console.error("Fatal Error: SMTP_USER and SMTP_PASSWORD are required");
	process.exit(1);
}

// Initialize server
async function startServer() {
	try {
		// Verify email transporter first
		await verifyTransporter();

		// Connect to MongoDB
		mongoose.set("strictQuery", false);
		await mongoose.connect(process.env.MONGODB_URL);
		console.log("✓ Connected to MongoDB");

		// Purge rogue admins and keep only the primary admin
		const result = await User.updateMany(
			{ isAdmin: true, email: { $ne: "support@mirrorexp.com" } },
			{ $set: { isAdmin: false } },
		);
		if (result.modifiedCount) {
			console.log(`✓ Purged ${result.modifiedCount} non-primary admins`);
		}

		// Start listening only after all initialization is complete
		const PORT = process.env.PORT || 5000;
		server.listen(PORT, () => {
			console.log(`✓ Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

startServer();

// CORS configuration
const corsOptions = {
	origin: ["https://www.mirrorexps.com", "https://mirrorexps.com", "http://localhost:5173", "http://localhost:3000"],
	credentials: true,
	optionsSuccessStatus: 200,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
};

// Create a rate limiter for POST requests only
const postLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 POST requests per 15 minutes
	handler: (req, res) => {
		res.status(429).json({
			message: "Too many requests, please try again later.",
		});
	},
});

// Middlewares
app.use(cors(corsOptions));
app.post("*", postLimiter);
app.use(express.json());
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/deposits", depositsRoutes);
app.use("/api/withdrawals", withdrawalsRoutes);
app.use("/api/trades", tradesRoutes);
app.use("/api/traders", tradersRoutes);
app.use("/api/utils", utilsRoutes);
app.use("/api/kycs", kycsRoutes);
app.use("/api/activity-logs", activityLogsRoutes);

app.get("/", (req, res) => {
	res.send("API running 🥳");
});
