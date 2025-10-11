# Contact Form Management Workflow

A comprehensive contact form management system for handling and responding to contact submissions from your admin panel.

## 🎯 Features

### 1. **Contact Submissions Dashboard**
Located at: `/admin/contact-submissions`

**Features:**
- View all contact form submissions in one place
- Filter by status: All, New, Read, Responded, Spam
- Click to view full submission details
- Mark submissions as Read, Responded, Spam, or Archived
- Delete (archive) submissions

### 2. **Reply Workflow**

**Simple Reply Process:**
1. Select a submission from the list
2. Click "Reply" button
3. Choose from pre-written email templates (optional)
4. Customize the subject and message
5. Send reply

**Status Tracking:**
- NEW - Unread submission
- READ - Viewed but not responded
- RESPONDED - Reply sent
- SPAM - Marked as spam
- ARCHIVED - Deleted/archived

### 3. **Email Templates**

**6 Pre-written Templates:**
1. **Thank You** - General acknowledgment
2. **Meeting Request** - Schedule a meeting
3. **Opportunity Response** - Respond to job/project opportunities
4. **Collaboration Interest** - Collaborate on projects
5. **Polite Decline** - Professionally decline requests
6. **Request More Info** - Ask for additional details

**Template Features:**
- Auto-fills recipient's name
- Pre-written professional responses
- Fully editable after selection
- Saves time on common responses

### 4. **Quick Actions**

**Available Actions:**
- **Reply** - Send email response
- **Mark as Responded** - Update status without sending email
- **Mark as Spam** - Flag spam submissions
- **Archive** - Remove from active list

## 📋 How to Use

### Responding to a Submission

1. **Go to Contact Submissions**
   - Navigate to `/admin/contact-submissions`
   - Or click "Contact Forms" from the admin dashboard

2. **View Submissions**
   - Browse submissions in the left panel
   - Filter by status using the tabs
   - Click a submission to view full details

3. **Reply to Sender**
   - Click the "Reply" button
   - (Optional) Select a template from the dropdown
   - Edit the subject and message as needed
   - Click "Send Reply"

4. **Status Updates**
   - Submissions automatically mark as READ when viewed
   - Replies automatically mark as RESPONDED when sent
   - Manually update status using action buttons

### Using Email Templates

Templates automatically replace placeholders:
- `{name}` → Contact person's name
- `{subject}` → Original subject line

**Example:**
```
Template: "Hi {name}, thank you for reaching out!"
Result: "Hi John Smith, thank you for reaching out!"
```

## 🔧 Technical Details

### API Endpoints

**Get Submissions:**
```javascript
GET /api/contact
```

**Update Status:**
```javascript
PATCH /api/contact
Body: { id, status, responded, notes }
```

**Send Reply:**
```javascript
POST /api/contact/reply
Body: { submissionId, to, subject, message }
```

### Database Fields

Contact submissions store:
- `name` - Sender's name
- `email` - Sender's email
- `subject` - Email subject (optional)
- `message` - Message content
- `status` - Current status
- `responded` - Boolean flag
- `notes` - Admin notes
- `ipAddress` - For spam prevention
- `createdAt` - Submission timestamp

## 📧 Email Integration

**Current Status:** Simulated (logs to console)

**To Enable Real Emails:**

### Option 1: Resend (Recommended)
```bash
npm install resend
```

Add to `.env.local`:
```
RESEND_API_KEY=your_key_here
```

Uncomment the Resend code in `src/app/api/contact/reply/route.ts`

### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

Add to `.env.local`:
```
SENDGRID_API_KEY=your_key_here
```

Uncomment the SendGrid code in `src/app/api/contact/reply/route.ts`

### Option 3: Nodemailer (SMTP)
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

Add to `.env.local`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Uncomment the Nodemailer code in `src/app/api/contact/reply/route.ts`

## 🎨 UI Components

### Submission List View
- Compact view showing name, email, subject, message preview
- Status badge (colored by status type)
- Timestamp
- Click to expand details

### Detail View
- Full message content
- Contact information with mailto link
- Formatted timestamp
- Action buttons

### Reply Modal
- Template selector dropdown
- Subject line input
- Message textarea
- Send/Cancel buttons
- Recipient email display

## 🔐 Security

**Current Implementation:**
- Spam prevention (rate limiting by IP)
- Email validation
- No authentication (TODO)

**Production Recommendations:**
- Add authentication middleware to admin routes
- Verify user has admin role
- Add CSRF protection
- Consider CAPTCHA on contact form
- Implement honeypot fields

## 📊 Metrics

Track contact form performance:
- Total submissions
- Response rate
- Average response time
- Spam detection rate

View stats in the Analytics dashboard at `/admin/analytics`

## 🚀 Workflow Examples

### Example 1: Job Inquiry
1. Receive submission from recruiter
2. Click submission to view details
3. Click "Reply"
4. Select "Opportunity Response" template
5. Edit to add specific questions
6. Send reply
7. Status automatically updates to RESPONDED

### Example 2: Spam
1. Receive suspicious submission
2. View submission details
3. Click "Mark as Spam"
4. Submission moves to Spam filter
5. Archive if needed

### Example 3: Meeting Request
1. Receive meeting request
2. Click "Reply"
3. Select "Meeting Request" template
4. Add availability details
5. Send reply

## 📝 Customization

### Adding New Templates

Edit `src/lib/emailTemplates.ts`:

```typescript
{
  id: 'custom-template',
  name: 'Custom Template Name',
  subject: 'Subject Line',
  message: `Hi {name},

Your message here...

Best regards,
Your Name`,
}
```

### Modifying Email Format

Update the reply API in `src/app/api/contact/reply/route.ts` to customize:
- Email headers
- HTML formatting
- Signature
- Attachments

## 🎯 Best Practices

1. **Respond Promptly**
   - Check submissions daily
   - Use templates for faster responses
   - Mark as read immediately

2. **Use Status Tracking**
   - Keep statuses updated
   - Add notes for follow-ups
   - Archive resolved submissions

3. **Professional Communication**
   - Review before sending
   - Personalize template responses
   - Proofread for typos

4. **Spam Management**
   - Mark obvious spam immediately
   - Review spam folder periodically
   - Archive old spam regularly

## 🔄 Integration Points

This workflow integrates with:
- **Analytics Dashboard** - View submission stats
- **Contact Form** (public) - Receives submissions
- **Email Service** - Sends replies (when configured)
- **Admin Dashboard** - Quick access navigation

## 📱 Mobile Responsive

The interface is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

---

**Built for:** Personal Website - Tyler Crowley
**Version:** 1.0
**Last Updated:** October 2025
