import express from 'express';
import { Util } from '../models/util.js';
import { multiMails } from '../utils/mailer.js';
import { auth, requireAdmin } from '../middleware/auth.js';
import { recordActivity } from '../utils/activityLogger.js';

const router = express.Router();

// getting all utils
router.get("/", auth, async (req, res) => {
	try {
		const utils = await Util.find();
		res.send(utils[0]);
	} catch (x) {
		return res.status(500).send("Something Went Wrong...");
	}
});

// updating a util
router.put("/update/:id", auth, requireAdmin, async (req, res) => {
	const { id } = req.params;

	try {
		const util = await Util.findByIdAndUpdate(
			id,
			{
				$set: req.body,
			},
			{
				new: true,
				runValidators: true,
			},
		);

		if (!util) return res.status(404).send("Util not found");

		await recordActivity({
			req,
			actor: req.authUser,
			action: "admin_update_utils",
			targetCollection: "utils",
			targetId: id,
			metadata: req.body,
		});

		res.status(200).send(util);
	} catch (error) {
		for (i in error.errors) res.status(500).send(error.errors[i].message);
	}
});

// deleting a util
router.delete("/:id", auth, requireAdmin, async (req, res) => {
	const { id } = req.params;

	try {
		const util = await Util.findByIdAndRemove(id);
		if (!util) return res.status(404).send("Util not found");

		res.status(200).send(util);
	} catch (error) {
		for (i in error.errors) res.status(500).send(error.errors[i].message);
	}
});

// POST route to send mail
router.post("/send-mail", auth, requireAdmin, async (req, res) => {
	const { emails, subject, message } = req.body;

	if (!emails || !Array.isArray(emails) || emails.length === 0) {
		return res.status(400).json({ message: "A valid array of emails is required" });
	}

	if (!subject || !message) {
		return res.status(400).json({ message: "Subject and message are required" });
	}

	try {
		const emailData = await multiMails(emails, subject, message);
		if (emailData.error) return res.status(400).send({ message: emailData.error });

		await recordActivity({
			req,
			actor: req.authUser,
			action: "admin_send_mail",
			targetCollection: "utils",
			metadata: { emails, subject },
		});

		res.status(200).json({
			message: "Emails sent successfully",
		});
	} catch (error) {
		console.error("Error sending emails:", error);
		res.status(500).json({ message: "Failed to send emails", error });
	}
});

export default router;
