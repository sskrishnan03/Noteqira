import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
}

const tokens = new Map();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD?.trim(),
  },
});

transporter.verify().then(() => {
  console.log('SMTP connection ready');
}).catch((err) => {
  console.error('SMTP connection failed:', err.message);
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, { email, expires: Date.now() + 3600000 });

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await transporter.sendMail({
      from: `"Noteqira Support" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Reset your Noteqira password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0B0B0B; border: 1px solid #2A2A2A; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #fff; font-size: 20px; margin: 0;">Noteqira</h1>
          </div>
          <p style="color: #8A8A8A; font-size: 14px; line-height: 1.6;">
            We received a request to reset the password for your Noteqira account.
            Click the button below to choose a new password.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #1A1A1A; border: 1px solid #333; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
              Reset Password
            </a>
          </div>
          <p style="color: #555; font-size: 12px; line-height: 1.5;">
            If you didn't request this, you can safely ignore this email.
            This link expires in 1 hour.
          </p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/api/validate-reset-token', (req, res) => {
  const { token, email } = req.body;
  const data = tokens.get(token);
  if (!data || data.email !== email || data.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired reset link' });
  }
  res.json({ valid: true });
});

app.post('/api/reset-password', (req, res) => {
  const { token, email, newPassword } = req.body;
  const data = tokens.get(token);
  if (!data || data.email !== email || data.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired reset link' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  tokens.delete(token);
  res.json({ success: true, email });
});

if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Noteqira server running on port ${PORT}`);
});
