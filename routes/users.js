import bcrypt from "bcrypt";
import express from "express";
import { User, validateUser, validateLogin } from "../models/user.js";
import { passwordReset, welcomeMail, otpMail } from "../utils/mailer.js";
import { Otp } from "../models/otp.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { validateProfileUpdate, createErrorMessage } from "../utils/validation.js";
import { auth, requireAdmin } from "../middleware/auth.js";
import { recordActivity } from "../utils/activityLogger.js";

const router = express.Router();

const serializeUser = (user) => {
  if (!user) return null;
  const { password, __v, ...safeData } = user.toObject();
  return safeData;
};


router.get("/getQrcode", auth, async (req, res) => {
  const secret = speakeasy.generateSecret({name: 'mirrorexp'});

  qrcode.toDataURL(secret.otpauth_url, (err, data) => {
    res.send({imgSrc: data, secret})
  })
})


router.get('/me', auth, async(req, res) => {
  try {
    const user = await User.findById(req.authUser._id)
    if(!user) return res.status(400).send({message: "user not found"})
    res.send({user: serializeUser(user)})
  } catch (x) { return res.status(500).send({message: "Something Went Wrong..."}) }
})


// Getting all users sorted by creation date (newest first)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.send(users.map(serializeUser));
  } catch (error) { return res.status(500).send({ message: "Something Went Wrong..." }) }
});



// reset password
router.get('/reset-password/:email', async(req, res) => {
  const { email } = req.params
  if(!email) return res.status(400).send({message: "Email is required"})

  try {
    const emailData = await passwordReset(email)
    if(emailData.error) return res.status(400).send({message: emailData.error})

    res.send({message: "Password reset link sent successfully"})
  } catch (error) { return res.status(500).send({message: "Something Went Wrong..."}) }
})


// verify user
router.post('/mfa', auth, async(req, res) => {
  const { email } = req.body

  try {
    let user = await User.findOne({ email })
    if(!user) return res.status(400).send({message: "user not found"})

    if (req.authUser.email !== user.email) {
      return res.status(403).send({ message: "Forbidden" });
    }
    
    user.mfa = true
    user = await user.save()
  
    res.send({message: "User verified successfully"})
  } catch (error) { return res.status(500).send({message: "Something Went Wrong..."}) }
})


// login user
router.post('/login', async(req, res) => {
  // Sanitize inputs
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;

  const sanitizedBody = { email, password };
  const { error } = validateLogin(sanitizedBody)
  if(error) return res.status(400).send({message: error.details[0].message})

  try {
    const user = await User.findOne({ email })
    if(!user) return res.status(400).send({message: "user not found"})

    const validatePassword = await bcrypt.compare(password, user.password)
    if(!validatePassword) return res.status(400).send({message: "Invalid password"})

    const token = user.genAuthToken()
    const safeUser = serializeUser(user)

    if (user.isAdmin) {
      await recordActivity({
        req,
        actor: user,
        action: "admin_login",
        targetCollection: "users",
        targetId: user._id.toString(),
      });
    }

    res.send({user: safeUser, token})
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).send({message: "Login failed. Please try again."});
  }
})




//sign up
router.post('/signup', async (req, res) => {
  // Sanitize inputs
  const username = req.body.username ? req.body.username.trim() : '';
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  const referredBy = req.body.referredBy ? req.body.referredBy.trim() : '';

  // Create sanitized body for validation
  const sanitizedBody = { username, email, password, referredBy };

  const { error } = validateUser(sanitizedBody)
  if(error) return res.status(400).send({message: error.details[0].message})

  let user = await User.findOne({ $or: [{email}, {username}] })
  if(user) return res.status(400).send({message: "username or email already exists, please login"})

  try{
    const otp = await new Otp({email}).save()
    const emailData = await otpMail(email, otp.code)
    if(emailData.error) return res.status(400).send({message: emailData.error})

    res.send({message: 'success'})
  }
  catch(e){
    console.error('Signup error:', e);
    if(e.errors) {
      for(let i in e.errors) {
        return res.status(400).send({message: e.errors[i].message});
      }
    }
    return res.status(500).send({message: "Failed to create account. Please try again."});
  }
})



//create a new user
router.post('/otp', async (req, res) => {
  // Sanitize inputs
  const username = req.body.username ? req.body.username.trim() : '';
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  const referredBy = req.body.referredBy ? req.body.referredBy.trim() : '';
  const code = req.body.code ? req.body.code.trim() : '';

  // Validate OTP code
  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return res.status(400).send({ message: "Invalid OTP code. Please enter a 6-digit code." });
  }

  // Verify OTP exists and matches
  const otpRecord = await Otp.findOne({ email, code });
  if (!otpRecord) {
    return res.status(400).send({ message: "Invalid or expired OTP code. Please request a new one." });
  }

  try{
    let user = await User.findOne({ email })

    if(!user) {
      // Create new user
      user = new User({ username, email, password, referredBy })
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      user = await user.save()
      welcomeMail(email)

      // Delete used OTP
      await Otp.deleteOne({ email, code });

      const token = user.genAuthToken();
      res.send({ user: serializeUser(user), token })
    } else {
      // User already exists, verify password
      const validatePassword = await bcrypt.compare(password, user.password)
      if(!validatePassword) return res.status(400).send({message: "Invalid password"})

      // Delete used OTP
      await Otp.deleteOne({ email, code });

      const token = user.genAuthToken();
      res.send({ user: serializeUser(user), token })
    }
  }
  catch(e){
    console.error('OTP verification error:', e);
    if(e.errors) {
      for(let i in e.errors) {
        return res.status(400).send({message: e.errors[i].message});
      }
    }
    return res.status(500).send({message: "Failed to verify account. Please try again."});
  }
})



//resend - otp
router.post('/resend-otp', async (req, res) => {
  const {email} = req.body

  try{
    const otp = await new Otp({email}).save()
    const emailData = await otpMail(email, otp.code)
    if(emailData.error) return res.status(400).send({message: emailData.error})

    res.send({message: 'success'})
  }
  catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
})




// new password
router.put('/new-password', async(req, res) => {
  const { email, password } = req.body
  if(!email) return res.status(400).send({message: "Email is required"})

  let user = await User.findOne({ email })
  if(!user) return res.status(400).send({message: "Invalid email"})

  try {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user = await user.save()
    res.send({message: "Password changed successfully"})
  } catch (error) { return res.status(500).send({message: "Something Went Wrong..."}) }
})


// Veryify 2FA for user
router.post('/verifyToken', auth, async(req, res) => {
  const { token, secret, email } = req.body

  const lookupEmail = email || req.authUser.email;

  let user = await User.findOne({ email: lookupEmail })
  if(!user) return res.status(400).send({message: "Invalid email"})

  try {
    const verify = speakeasy.totp.verify({
      secret,
      encoding: 'ascii',
      token
    })

    if(!verify) throw new Error('Invalid token')
    else {
      user.mfa = true
      user = await user.save()
      res.send({message: "Your Account Multi Factor Authentication is Now on"})
    }
  } catch (error) { return res.status(500).send({message: "Something Went Wrong..."}) }
})



router.put("/update-profile", auth, async (req, res) => {
  // Validate and sanitize profile data
  const validation = validateProfileUpdate(req.body);

  if (!validation.isValid) {
    const errorMessage = createErrorMessage(validation.errors);
    return res.status(400).send({ message: errorMessage });
  }

  try {
    let user = req.authUser;
    let targetUser = user;

    if (req.authUser.isAdmin && req.body.userId) {
      const requestedUser = await User.findById(req.body.userId);
      if (!requestedUser) return res.status(404).send({ message: "User not found" });
      targetUser = requestedUser;
    } else {
      validation.sanitized.email = user.email;
    }

    // Only update allowed fields with sanitized data
    const allowedFields = ['fullName', 'country', 'phone', 'address', 'state', 'city', 'zipCode'];

    allowedFields.forEach(field => {
      if (validation.sanitized[field] !== undefined) {
        targetUser[field] = validation.sanitized[field];
      }
    });

    targetUser = await targetUser.save();

    if (req.authUser.isAdmin && targetUser._id.toString() !== req.authUser._id.toString()) {
      await recordActivity({
        req,
        actor: req.authUser,
        action: "admin_update_user",
        targetCollection: "users",
        targetId: targetUser._id.toString(),
      });
    }

    res.send({ user: serializeUser(targetUser) });
  } catch(e) {
    console.error('Error updating profile:', e);

    // Handle mongoose validation errors
    if (e.errors) {
      const errors = Object.values(e.errors).map(err => err.message);
      return res.status(400).send({ message: createErrorMessage(errors) });
    }

    return res.status(500).send({ message: "Failed to update profile. Please try again." });
  }
})





router.get('/:id', auth, async(req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
    if(!targetUser) return res.status(400).send({message: "user not found"})

    const isSelf = req.authUser._id.toString() === targetUser._id.toString();
    if (!isSelf && !req.authUser.isAdmin) {
      return res.status(403).send({ message: "Forbidden" });
    }

    res.send({user: serializeUser(targetUser)})
  } catch (x) { return res.status(500).send({message: "Something Went Wrong..."}) }
})


//Delete multi users
router.delete('/', auth, requireAdmin, async (req, res) => {
  const { userIds, usernamePrefix, emailPrefix } = req.body;

  // Build the filter dynamically
  const filter = {};

  // Filter by IDs if provided
  if (Array.isArray(userIds) && userIds.length > 0) {
      filter._id = { $in: userIds };
  }

  // Filter by username prefix if provided
  if (usernamePrefix) {
      filter.username = { $regex: `^${usernamePrefix}`, $options: 'i' }; // Case-insensitive match
  }

  // Filter by email prefix if provided
  if (emailPrefix) {
      filter.email = { $regex: `^${emailPrefix}`, $options: 'i' }; // Case-insensitive match
  }

  // Check if the filter is empty
  if (Object.keys(filter).length === 0) {
      return res.status(400).json({ error: 'No valid filter criteria provided' });
  }

  try {
      const result = await User.deleteMany(filter);

      if (result.deletedCount) {
        await recordActivity({
          req,
          actor: req.authUser,
          action: "admin_delete_users",
          targetCollection: "users",
          metadata: { deletedCount: result.deletedCount, userIds, usernamePrefix, emailPrefix },
        });
      }

      res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete users' });
  }
});


export default router;
