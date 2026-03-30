# Email Configuration Guide

## 📧 Setting Up Email Service for Password Reset

The Project Management Dashboard uses nodemailer for sending emails. Follow these steps to configure email functionality:

## 🚀 Quick Setup (Gmail - Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** > **2-Step Verification**
3. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. In Security settings, find **App passwords**
2. Click on it and sign in again
3. Select **Mail** and **Other (Custom name)**
4. Enter "Project Dashboard" as the name
5. Click **Generate**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

## 💾 Alternative Email Services

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_FROM=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_SERVICE=yahoo
EMAIL_FROM=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Custom SMTP
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=noreply@yourdomain.com
EMAIL_PASSWORD=your-password
```

## 🧪 Testing Email Functionality

### Method 1: API Endpoint (Development)
Send POST request to `/api/test/email`:
```json
{
  "to": "test@example.com",
  "type": "reset"
}
```

### Method 2: Check Email Status
GET request to `/api/test/email-status`

### Method 3: Console Logs (Development Mode)
When email is not configured, reset tokens are logged to console:
```
📧 EMAIL SERVICE - DEVELOPMENT MODE
=================================
Password reset requested for: user@example.com
Reset URL: http://localhost:3000/reset-password/abc123
Reset Token: abc123
=================================
```

## 🔒 Security Best Practices

1. **Never use your regular email password** - always use app-specific passwords
2. **Use environment variables** - never commit credentials to code
3. **Enable 2FA** on your email provider
4. **Use dedicated email** for applications (like noreply@yourdomain.com)
5. **Monitor email usage** for suspicious activity

## 🎨 Email Templates

The system uses W3.css for responsive HTML email templates that work across all email clients:

- **Welcome Email**: Sent when users register
- **Password Reset**: Sent when users request password reset  
- **Password Changed**: Confirmation when password is successfully changed

## 🐛 Troubleshooting

### "Authentication failed" Error
- Double-check your email and app password
- Ensure 2-Factor Authentication is enabled
- Try generating a new app password

### Emails not being received
- Check spam/junk folder
- Verify email address is correct
- Test with different email providers

### "Connection refused" Error  
- Check your internet connection
- Verify EMAIL_SERVICE is correct
- Try different SMTP settings

## 🚀 Production Deployment

For production, consider using:
- **SendGrid** - Reliable email delivery service
- **AWS SES** - Amazon's email service  
- **Mailgun** - Developer-friendly email API
- **Custom SMTP** server

Example SendGrid configuration:
```env
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@yourdomain.com
EMAIL_PASSWORD=your-sendgrid-api-key
```