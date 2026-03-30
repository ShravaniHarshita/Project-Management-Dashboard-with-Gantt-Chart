const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isReady = false;
    this.testAccount = null;
    this.mode = 'console'; // 'production' | 'ethereal' | 'console'
    this._initPromise = this._initialize();
  }

  async _initialize() {
    // 1) Try production SMTP credentials first
    const emailFrom = process.env.EMAIL_FROM;
    const emailPass = process.env.EMAIL_PASSWORD;
    if (
      emailFrom && emailPass &&
      emailFrom !== 'your-email@gmail.com' &&
      emailPass !== 'your-app-specific-password'
    ) {
      try {
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: { user: emailFrom, pass: emailPass },
        });
        await this.transporter.verify();
        this.isReady = true;
        this.mode = 'production';
        console.log('✅ Email service: Connected with production credentials');
        return;
      } catch (err) {
        console.log('⚠️  Production email creds failed:', err.message);
        console.log('   Falling back to Ethereal test account...');
      }
    }

    // 2) Fallback: auto-create Ethereal test account (always works, no config)
    try {
      this.testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass,
        },
      });
      this.isReady = true;
      this.mode = 'ethereal';
      console.log('✅ Email service: Using Ethereal test account (emails are captured online)');
      console.log(`   📧 Ethereal user : ${this.testAccount.user}`);
      console.log(`   📧 Ethereal pass : ${this.testAccount.pass}`);
    } catch (err) {
      console.log('⚠️  Ethereal setup failed:', err.message);
      this.isReady = false;
      this.mode = 'console';
      console.log('📧 Email service: Running in console-only mode');
    }
  }

  /** Wait until the transporter is ready */
  async ensureReady() {
    await this._initPromise;
  }

  // ── W3.css HTML email builder ────────────────────────
  _buildHTML({ title, body, otp, actionUrl, actionLabel }) {
    const otpBlock = otp
      ? `<div style="text-align:center;margin:28px 0">
           <div style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-size:36px;letter-spacing:14px;padding:18px 36px;border-radius:10px;font-weight:700;font-family:'Courier New',monospace">${otp}</div>
           <p style="color:#6b7280;font-size:14px;margin-top:10px">This code expires in <b>10 minutes</b></p>
         </div>`
      : '';

    const btnBlock =
      actionUrl && actionLabel
        ? `<div style="text-align:center;margin:24px 0">
             <a href="${actionUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px">${actionLabel}</a>
           </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:32px;text-align:center">
      <div style="font-size:20px;font-weight:700;margin-bottom:8px">🚀 Project Dashboard</div>
      <h1 style="margin:0;font-size:24px">${title}</h1>
    </div>
    <div style="padding:32px;line-height:1.7;color:#374151">
      ${body}
      ${otpBlock}
      ${btnBlock}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <div class="w3-panel w3-pale-blue w3-leftbar w3-border-blue" style="padding:12px;border-radius:4px;background:#eff6ff;border-left:4px solid #3b82f6">
        <p style="margin:0;font-size:13px;color:#1e40af">
          <b>🔒 Security Notice</b><br>
          If you didn't request this, you can safely ignore this email.<br>
          Never share your OTP or reset link with anyone.
        </p>
      </div>
    </div>
    <div style="background:#f9fafb;padding:20px;text-align:center;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb">
      Project Management Dashboard &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;
  }

  // ── Core send helper ─────────────────────────────────
  async _send(to, subject, html, text) {
    await this.ensureReady();

    if (!this.isReady || !this.transporter) {
      // Console-only fallback
      console.log(`\n📧 [CONSOLE EMAIL]\n   To: ${to}\n   Subject: ${subject}\n   ${text}\n`);
      return { success: true, mode: 'console', previewUrl: null };
    }

    const fromAddr =
      this.mode === 'production'
        ? { name: 'Project Dashboard', address: process.env.EMAIL_FROM }
        : { name: 'Project Dashboard', address: this.testAccount.user };

    const info = await this.transporter.sendMail({ from: fromAddr, to, subject, html, text });

    let previewUrl = null;
    if (this.mode === 'ethereal') {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📧 Email sent → Preview URL: ${previewUrl}`);
    } else {
      console.log(`📧 Email sent to ${to} (messageId: ${info.messageId})`);
    }

    return { success: true, mode: this.mode, messageId: info.messageId, previewUrl };
  }

  // ── Public methods ───────────────────────────────────

  /** Send a 6-digit OTP for password reset */
  async sendOTPEmail(email, otp) {
    const html = this._buildHTML({
      title: 'Your Password Reset Code',
      body: `<p>Hello,</p>
             <p>We received a request to reset the password for your account (<b>${email}</b>).</p>
             <p>Use the following <b>6-digit code</b> to verify your identity:</p>`,
      otp,
    });
    const text = `Your password reset OTP is: ${otp}. It expires in 10 minutes.`;
    return this._send(email, `Password Reset Code: ${otp}`, html, text);
  }

  /** Send a reset link (legacy / alternative) */
  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    const html = this._buildHTML({
      title: 'Reset Your Password',
      body: `<p>Hello,</p>
             <p>We received a request to reset the password for your account (<b>${email}</b>).</p>
             <p>Click the button below to set a new password:</p>`,
      actionUrl: resetUrl,
      actionLabel: 'Reset Password',
    });
    const text = `Reset your password: ${resetUrl}\nThis link expires in 10 minutes.`;
    return this._send(email, 'Reset Your Password - Project Dashboard', html, text);
  }

  /** Welcome email after registration */
  async sendWelcomeEmail(email, userName) {
    const html = this._buildHTML({
      title: 'Welcome to Project Dashboard!',
      body: `<p>Hello <b>${userName}</b>,</p>
             <p>Your account has been created successfully 🎉. Start managing your projects now!</p>`,
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`,
      actionLabel: 'Go to Dashboard',
    });
    const text = `Welcome ${userName}! Your account is ready.`;
    return this._send(email, 'Welcome to Project Dashboard!', html, text);
  }

  /** Confirmation after password change */
  async sendPasswordChangeEmail(email, userName) {
    const html = this._buildHTML({
      title: 'Password Changed',
      body: `<p>Hello <b>${userName}</b>,</p>
             <p>Your password was changed on <b>${new Date().toLocaleString()}</b>.</p>
             <p>If you didn't make this change, please contact support immediately.</p>`,
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`,
      actionLabel: 'Sign In',
    });
    const text = `Your password was changed. If this wasn't you, contact support.`;
    return this._send(email, 'Password Changed - Project Dashboard', html, text);
  }
}

module.exports = new EmailService();