const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database setup
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      google_id TEXT,
      name TEXT,
      verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )`);
    
    // Create OTP table
    db.run(`CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Email transporter setup
let transporter = null;

// Only create transporter if credentials are provided
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && 
    process.env.GMAIL_USER !== 'your-email@gmail.com') {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
} else {
  console.log('⚠️  Gmail credentials not configured. Email sending will be simulated.');
}

// Passport Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const googleId = profile.id;
    const name = profile.displayName;

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return done(err);
      }
      
      if (user) {
        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        return done(null, user);
      } else {
        // Create new user
        db.run('INSERT INTO users (email, google_id, name) VALUES (?, ?, ?)', 
          [email, googleId, name], function(err) {
            if (err) {
              return done(err);
            }
            const newUser = { id: this.lastID, email, google_id: googleId, name, verified: 0 };
            return done(null, newUser);
          });
      }
    });
  } catch (error) {
    return done(error);
  }
  }));
} else {
  console.log('⚠️  Google OAuth credentials not configured. Google login will not work.');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Google OAuth routes
app.get('/auth/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
    return res.status(500).json({ 
      success: false, 
      message: 'Google OAuth not configured. Please set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.' 
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Store user in session for OTP verification
    req.session.pendingUser = req.user;
    res.redirect('/verify-otp');
  }
);

// OTP verification page
app.get('/verify-otp', (req, res) => {
  if (!req.session.pendingUser) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'verify-otp.html'));
});

// Generate and send OTP
app.post('/send-otp', loginLimiter, async (req, res) => {
  try {
    if (!req.session.pendingUser) {
      return res.status(400).json({ success: false, message: 'No pending authentication' });
    }

    const email = req.session.pendingUser.email;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    db.run('INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)', 
      [email, otp, expiresAt.toISOString()], async (err) => {
        if (err) {
          console.error('Error saving OTP:', err);
          return res.status(500).json({ success: false, message: 'Error generating OTP' });
        }

        // Send OTP email
        try {
          if (transporter) {
            await transporter.sendMail({
              from: process.env.GMAIL_USER,
              to: email,
              subject: 'Your Login OTP',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Login Verification</h2>
                  <p>Your One-Time Password (OTP) for login is:</p>
                  <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; margin: 0; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
                  </div>
                  <p>This OTP will expire in 10 minutes.</p>
                  <p style="color: #666;">If you didn't request this, please ignore this email.</p>
                </div>
              `
            });
            res.json({ success: true, message: 'OTP sent to your email' });
          } else {
            // Simulate email sending for demo purposes
            console.log(`📧 Demo Mode - OTP for ${email}: ${otp}`);
            res.json({ success: true, message: 'OTP sent to your email (Demo Mode: Check console for OTP)' });
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          res.status(500).json({ success: false, message: 'Error sending OTP email' });
        }
      });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify OTP and complete login
app.post('/verify-otp', loginLimiter, (req, res) => {
  const { otp } = req.body;
  
  if (!req.session.pendingUser) {
    return res.status(400).json({ success: false, message: 'No pending authentication' });
  }

  const email = req.session.pendingUser.email;

  // Check OTP
  db.get(`SELECT * FROM otps WHERE email = ? AND otp = ? AND used = 0 AND expires_at > datetime('now') 
          ORDER BY created_at DESC LIMIT 1`, [email, otp], (err, otpRecord) => {
    if (err) {
      console.error('Error verifying OTP:', err);
      return res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    db.run('UPDATE otps SET used = 1 WHERE id = ?', [otpRecord.id], (err) => {
      if (err) {
        console.error('Error updating OTP:', err);
        return res.status(500).json({ success: false, message: 'Error verifying OTP' });
      }

      // Mark user as verified and log them in
      db.run('UPDATE users SET verified = 1, last_login = CURRENT_TIMESTAMP WHERE id = ?', 
        [req.session.pendingUser.id], (err) => {
          if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ success: false, message: 'Error completing login' });
          }

          // Complete login
          req.login(req.session.pendingUser, (err) => {
            if (err) {
              console.error('Error logging in user:', err);
              return res.status(500).json({ success: false, message: 'Error completing login' });
            }

            delete req.session.pendingUser;
            res.json({ success: true, message: 'Login successful', redirectUrl: '/dashboard' });
          });
        });
    });
  });
});

// Dashboard (protected route)
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Get user info
app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, user: req.user });
});

// Logout
app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error destroying session' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Get user statistics (admin endpoint)
app.get('/api/stats', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  db.all(`SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN verified = 1 THEN 1 END) as verified_users,
    COUNT(CASE WHEN last_login > datetime('now', '-30 days') THEN 1 END) as active_users
    FROM users`, (err, stats) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
    res.json({ success: true, stats: stats[0] });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set up your .env file with the required credentials');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});