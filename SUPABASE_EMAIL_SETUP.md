# Supabase Email Configuration Guide

## Problem
When admins create users, confirmation emails are not being sent.

## Solution
You need to configure Supabase email settings. The Admin API `createUser` does NOT automatically send confirmation emails.

## Steps to Fix

### 1. Check Supabase Email Settings

Go to your Supabase Dashboard:
1. Navigate to **Authentication** → **Settings**
2. Check **Email Auth** section
3. Ensure **Enable email confirmations** is enabled
4. Check **SMTP Configuration**

### 2. Configure SMTP (Required for Production)

Supabase's default email service has limitations:
- Only sends to pre-authorized email addresses
- Strict rate limits
- May not work in production

**You need to configure a custom SMTP server:**

#### Option A: Use Supabase's Built-in Email (Testing Only)
- Works for testing with pre-authorized emails
- Go to **Authentication** → **Settings** → **Email Auth**
- Add test email addresses if needed

#### Option B: Configure Custom SMTP (Recommended for Production)

1. **Choose an Email Provider:**
   - SendGrid (recommended)
   - Mailgun
   - Postmark
   - AWS SES
   - Gmail SMTP (for testing)

2. **Get SMTP Credentials:**
   - Host (e.g., `smtp.sendgrid.net`)
   - Port (usually 587 for TLS)
   - Username/API Key
   - Password

3. **Configure in Supabase:**
   - Go to **Authentication** → **Settings** → **SMTP Configuration**
   - Enter your SMTP details:
     - **SMTP Host**: Your provider's SMTP host
     - **SMTP Port**: Usually 587 (TLS) or 465 (SSL)
     - **SMTP User**: Your SMTP username/API key
     - **SMTP Password**: Your SMTP password
     - **Sender Name**: Your app name (e.g., "Bethlehem Medical Center")
     - **Sender Email**: Your verified sender email

4. **Save Settings**

### 3. Verify Email Templates

1. Go to **Authentication** → **Templates**
2. Check **Confirm signup** template
3. Ensure it includes:
   - `{{ .ConfirmationURL }}` - The confirmation link
   - Proper formatting

### 4. Test Email Sending

1. Create a test user through your admin panel
2. Check if confirmation email is received
3. Check Supabase logs: **Logs** → **Auth** for any errors

### 5. Check Email Logs

In Supabase Dashboard:
- Go to **Logs** → **Auth**
- Filter for email-related events
- Look for errors like:
  - SMTP connection failures
  - Authentication errors
  - Template errors

## Code Changes Made

The code has been updated to use regular `signUp()` method which automatically sends confirmation emails, instead of Admin API `createUser()` which doesn't send emails.

## SQL Configuration

**No SQL changes needed** - Email configuration is done in Supabase Dashboard, not in SQL.

## Troubleshooting

### Emails not sending?
1. Check SMTP configuration in Supabase Dashboard
2. Verify sender email is verified with your email provider
3. Check spam folder
4. Review Supabase Auth logs
5. Test with a simple email provider first (Gmail SMTP)

### Emails going to spam?
1. Configure SPF/DKIM records for your domain
2. Use a reputable email service (SendGrid, Mailgun)
3. Verify sender email domain

### Rate limiting?
- Supabase default email has strict limits
- Use custom SMTP for production
- Consider email queue for high volume

## Quick Test with Gmail SMTP (Development)

For quick testing, you can use Gmail SMTP:

1. Enable 2-factor authentication on Gmail
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use these settings in Supabase:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP User**: Your Gmail address
   - **SMTP Password**: Your App Password (not regular password)

## Production Recommendation

For production, use a professional email service:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Postmark** (Paid, but very reliable)

These services provide:
- Better deliverability
- Email analytics
- Higher rate limits
- Professional support

