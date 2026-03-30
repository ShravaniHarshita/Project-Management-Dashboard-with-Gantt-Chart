import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
  const { forgotPassword, verifyOTP, resetPassword, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Step 1 = email, Step 2 = OTP, Step 3 = new password, Step 4 = success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });

  const otpRefs = useRef([]);

  // ── OTP input handlers ──────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Password strength ───────────────────────────────
  const checkPasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    const score = Object.values(checks).filter(Boolean).length;
    const feedback = [];
    if (!checks.length) feedback.push('At least 8 characters');
    if (!checks.uppercase) feedback.push('One uppercase letter');
    if (!checks.lowercase) feedback.push('One lowercase letter');
    if (!checks.number) feedback.push('One number');
    if (!checks.special) feedback.push('One special character');
    setPasswordStrength({ score, feedback });
    return score;
  };

  const getStrengthColor = (score) => {
    if (score < 2) return '#ef4444';
    if (score < 4) return '#f59e0b';
    return '#10b981';
  };

  const getStrengthLabel = (score) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  // ── Resend cooldown ─────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Step 1: Send OTP ────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      const data = await forgotPassword({ email });
      setPreviewUrl(data?.previewUrl || '');
      setStep(2);
      startResendCooldown();
    } catch (error) {
      setErrors({ general: error?.error || 'Failed to send verification code. Please try again.' });
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrors({});

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    try {
      const data = await verifyOTP({ email, otp: otpString });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (error) {
      setErrors({ otp: error?.error || 'Invalid or expired code. Please try again.' });
    }
  };

  // ── Step 3: Reset Password ──────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }
    if (passwordStrength.score < 3) {
      setErrors({ password: 'Please choose a stronger password' });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      await resetPassword(resetToken, { password });
      setStep(4);
    } catch (error) {
      setErrors({ general: error?.error || 'Failed to reset password. Please try again.' });
    }
  };

  // ── Resend OTP ──────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrors({});
    try {
      const data = await forgotPassword({ email });
      setPreviewUrl(data?.previewUrl || '');
      setOtp(['', '', '', '', '', '']);
      setMessage('A new verification code has been sent to your email.');
      startResendCooldown();
    } catch (error) {
      setErrors({ general: 'Failed to resend code. Please try again.' });
    }
  };

  // ── Step indicators ─────────────────────────────────
  const StepIndicator = () => (
    <div className="otp-steps">
      {[1, 2, 3].map((s) => (
        <div key={s} className={`otp-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
          <div className="otp-step-circle">
            {step > s ? '✓' : s}
          </div>
          <span className="otp-step-label">
            {s === 1 ? 'Email' : s === 2 ? 'Verify' : 'Password'}
          </span>
        </div>
      ))}
    </div>
  );

  // ── RENDER ──────────────────────────────────────────

  // Step 4: Success
  if (step === 4) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">✓</div>
            <h1>Password Reset Successful!</h1>
            <p>Your password has been changed. You are now signed in.</p>
          </div>
          <button
            className="auth-button"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">Go to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Create New Password'}
          </h1>
          <p>
            {step === 1 && "Enter your email and we'll send a 6-digit verification code"}
            {step === 2 && `We sent a code to ${email}`}
            {step === 3 && 'Choose a strong new password for your account'}
          </p>
        </div>

        <StepIndicator />

        {errors.general && (
          <div className="auth-message error">
            <p>{errors.general}</p>
          </div>
        )}
        {message && (
          <div className="auth-message success">
            <p>{message}</p>
          </div>
        )}

        {/* ─── Step 1: Email ─── */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                placeholder="Enter your registered email"
                className={errors.email ? 'error' : ''}
                autoComplete="email"
                autoFocus
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <><span className="loading-spinner"></span> Sending Code...</>
              ) : (
                'Send Verification Code'
              )}
            </button>

            <div className="password-reset-info">
              <h4>How it works:</h4>
              <ul>
                <li>We'll send a 6-digit code to your email</li>
                <li>Enter the code to verify your identity</li>
                <li>Then set your new password</li>
              </ul>
            </div>
          </form>
        )}

        {/* ─── Step 2: OTP ─── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label>Enter 6-Digit Code</label>
              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`otp-input ${errors.otp ? 'error' : ''}`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
              {errors.otp && <span className="error-text">{errors.otp}</span>}
            </div>

            <button type="submit" className="auth-button" disabled={loading || otp.join('').length !== 6}>
              {loading ? (
                <><span className="loading-spinner"></span> Verifying...</>
              ) : (
                'Verify Code'
              )}
            </button>

            {previewUrl && (
              <div className="email-preview-notice">
                <p>📧 <strong>Test Mode:</strong> View your email at:</p>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  Open Email Preview
                </a>
              </div>
            )}

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="auth-button secondary"
              >
                {loading ? 'Sending...' :
                  resendCooldown > 0 ? `Resend in ${resendCooldown}s` :
                    'Resend Code'}
              </button>
            </div>

            <button type="button" className="auth-button secondary" onClick={() => { setStep(1); setOtp(['','','','','','']); setErrors({}); setMessage(''); }}>
              ← Change Email
            </button>
          </form>
        )}

        {/* ─── Step 3: New Password ─── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); checkPasswordStrength(e.target.value); setErrors({}); }}
                placeholder="Create a strong password"
                className={errors.password ? 'error' : ''}
                autoComplete="new-password"
                autoFocus
              />
              {errors.password && <span className="error-text">{errors.password}</span>}

              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor(passwordStrength.score)
                      }}
                    ></div>
                  </div>
                  <div className="strength-info">
                    <span className="strength-label" style={{ color: getStrengthColor(passwordStrength.score) }}>
                      {getStrengthLabel(passwordStrength.score)} Password
                    </span>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="strength-feedback">
                        <small>Add: {passwordStrength.feedback.join(', ')}</small>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
                placeholder="Confirm your new password"
                className={errors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-button" disabled={loading || passwordStrength.score < 3}>
              {loading ? (
                <><span className="loading-spinner"></span> Resetting Password...</>
              ) : (
                'Reset Password & Sign In'
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">Back to Sign In</Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;