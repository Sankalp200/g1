# Gmail OTP Login System

A secure authentication system that uses Gmail OAuth and OTP (One-Time Password) verification via email. Built with Node.js, Express, SQLite, and modern web technologies.

## Features

- 🔐 **Gmail OAuth Authentication**: Secure login with Google accounts
- 📧 **OTP Email Verification**: Two-factor authentication via email
- 🗄️ **Database Management**: SQLite database for user management (1000+ users)
- 🛡️ **Security Features**: Rate limiting, session management, and encryption
- 📱 **Responsive Design**: Modern UI that works on all devices
- 📊 **User Analytics**: Dashboard with user statistics
- ⚡ **Real-time Features**: Live countdown, auto-refresh stats

## Prerequisites

Before running this application, you need:

1. **Node.js** (v14 or higher)
2. **Gmail account** with App Password enabled
3. **Google Cloud Console** project for OAuth

## Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository (if using git)
git clone <repository-url>
cd gmail-otp-login

# Install dependencies
npm install
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** and **Gmail API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
7. Copy the **Client ID** and **Client Secret**

### 3. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Under "Signing in to Google", select **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)

### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your credentials
nano .env
```

Fill in your credentials in the `.env` file:

```env
PORT=3000
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console

# Gmail
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### 5. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### User Flow

1. **Login Page**: User clicks "Sign in with Gmail"
2. **Google OAuth**: User authenticates with Google
3. **OTP Generation**: System generates and emails 6-digit OTP
4. **OTP Verification**: User enters OTP from email
5. **Dashboard**: User gains access to secure dashboard

### Features

- **Rate Limiting**: 5 login attempts per 15 minutes per IP
- **OTP Expiry**: OTP codes expire after 10 minutes
- **Session Management**: 24-hour session timeout
- **User Statistics**: Real-time user metrics on dashboard
- **Responsive Design**: Works on desktop, tablet, and mobile

## Database Schema

The application uses SQLite with two main tables:

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    google_id TEXT,
    name TEXT,
    verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);
```

### OTPs Table
```sql
CREATE TABLE otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
- `GET /` - Login page
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /verify-otp` - OTP verification page
- `POST /send-otp` - Generate and send OTP
- `POST /verify-otp` - Verify OTP and complete login
- `POST /logout` - Logout user

### Dashboard
- `GET /dashboard` - User dashboard (protected)
- `GET /api/user` - Get current user info
- `GET /api/stats` - Get user statistics

## Security Features

1. **HTTPS Ready**: Secure headers with Helmet.js
2. **Rate Limiting**: Express rate limiter for login attempts
3. **Session Security**: Secure session configuration
4. **Input Validation**: OTP and email validation
5. **CORS Protection**: Cross-origin resource sharing protection
6. **SQL Injection Protection**: Parameterized queries

## Customization

### Styling
- Edit `public/styles.css` for custom styling
- Colors, fonts, and animations can be modified
- Responsive breakpoints are defined for mobile/tablet

### Email Template
- Modify the OTP email template in `server.js`
- Located in the `/send-otp` route
- HTML email with inline CSS for better compatibility

### Database
- SQLite is used by default for simplicity
- Can be replaced with PostgreSQL, MySQL, etc.
- Database connection is in `server.js`

## Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Use HTTPS (set `cookie.secure = true`)
3. Use a strong session secret
4. Consider using PostgreSQL for production
5. Set up proper logging
6. Use a process manager like PM2

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=very-long-random-string-for-production
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
GMAIL_USER=your-production-email@gmail.com
GMAIL_APP_PASSWORD=production-app-password
```

## Troubleshooting

### Common Issues

1. **OAuth Error**: Check redirect URIs in Google Console
2. **Email Not Sending**: Verify Gmail App Password and 2FA
3. **Database Error**: Ensure write permissions for SQLite file
4. **Session Issues**: Check session secret configuration
5. **Rate Limiting**: Wait 15 minutes or restart server in development

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=express:* npm run dev
```

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Verify all environment variables are set correctly
3. Ensure Google Cloud Console configuration is complete
4. Check server logs for detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request