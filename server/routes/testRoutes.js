const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');
const { protect } = require('../middleware/auth');

/**
 * @desc    Test email functionality
 * @route   POST /api/test/email
 * @access  Private (admin only in production)
 */
router.post('/email', protect, async (req, res) => {
  try {
    const { to, type = 'test' } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required'
      });
    }

    let result;
    const resetToken = 'test-token-123';
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(to, 'Test User');
        break;
      case 'reset':
        result = await emailService.sendPasswordResetEmail(to, resetToken, resetUrl);
        break;
      case 'change':
        result = await emailService.sendPasswordChangeEmail(to, 'Test User');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid email type. Use: welcome, reset, or change'
        });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: `Test ${type} email sent successfully`
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

/**
 * @desc    Check email service status
 * @route   GET /api/test/email-status
 * @access  Private
 */
router.get('/email-status', protect, async (req, res) => {
  try {
    await emailService.ensureReady();
    
    res.status(200).json({
      success: true,
      data: {
        ready: emailService.isReady,
        mode: emailService.mode,
        service: emailService.mode === 'production' ? (process.env.EMAIL_SERVICE || 'gmail') : 'ethereal'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check email status',
      error: error.message
    });
  }
});

module.exports = router;