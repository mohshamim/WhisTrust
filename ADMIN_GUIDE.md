# 📘 WhisTrust Administrator Guide

Complete guide for organization administrators to manage their whistleblowing and compliance platform.

---

## 👥 Who Is This Guide For?

This guide is for:
- **Organization Admins** - Full access to manage your organization's portal
- **Managers** - Oversight and case review capabilities
- **Investigators** - Case handling and resolution

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Reports](#managing-reports)
4. [User Management](#user-management)
5. [Analytics & Insights](#analytics--insights)
6. [Settings & Customization](#settings--customization)
7. [Audit Logs](#audit-logs)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing Your Portal

Your organization has a unique subdomain:

```
https://www.whistrust.com/org/[your-subdomain]/login
```

**Example:**
- CodeSquare: `https://www.whistrust.com/org/codesquare/login`
- AISAR: `https://www.whistrust.com/org/aisar/login`

### First Login

1. Navigate to your organization's login page
2. Enter your email and password
3. You'll be redirected to the dashboard

**Need help logging in?**
- Contact your organization's administrator
- Or reach out to the platform super admin

### Understanding User Roles

| Role | Permissions | Common Use Case |
|------|------------|----------------|
| **Admin** | Full access to all features | Organization compliance officer |
| **Manager** | View all cases, approve resolutions | Department heads, senior management |
| **Investigator** | Handle assigned cases only | HR, legal, compliance team members |

---

## Dashboard Overview

The dashboard is your command center for monitoring and managing compliance.

### Key Metrics

**Total Reports**
- All reports submitted to your organization
- Color-coded by status (Submitted, Under Review, Investigating, Resolved, Closed)

**Pending Cases**
- Reports requiring immediate attention
- Shows unassigned and at-risk cases

**Average Resolution Time**
- Time from submission to resolution
- Helps track team efficiency

**Active Investigators**
- Number of team members currently handling cases
- Click to see detailed workload distribution

### Quick Actions

From the dashboard, you can:
- 📊 **View Recent Reports** - See latest submissions
- 👥 **Manage Team** - Invite or edit team members
- 📈 **View Analytics** - Detailed insights and trends
- ⚙️ **Access Settings** - Configure your organization

### Recent Activity

The activity feed shows:
- New report submissions
- Status changes
- Assignments and reassignments
- Resolution completions
- User login events

---

## Managing Reports

### Viewing All Reports

**Access:** Sidebar → Reports

**Filter Options:**
- Status: All, Submitted, Under Review, Investigating, Resolved, Closed
- Priority: All, Low, Medium, High, Critical
- Category: Ethics, Fraud, Harassment, Safety, etc.
- Assigned To: All team members or specific investigator

### Report Details

Click any report to view:

**Case Information:**
- Case number (unique identifier)
- Tracking code (for reporter)
- Category and title
- Full description
- Status and priority
- Submission date

**Reporter Information:**
- Anonymous by default
- If provided: name and contact info
- IP address is NEVER logged

**Attachments:**
- View uploaded files
- Download securely
- Preview supported formats

**Timeline:**
- Complete audit trail
- Status changes
- Assignments
- Messages sent/received
- Resolution notes

### Case Management Actions

#### 1. Update Status

```
Submitted → Under Review → Investigating → Resolved → Closed
```

**Best Practice:** Update status regularly to keep reporters informed.

#### 2. Set Priority

- **Low**: Minor policy violations, no immediate risk
- **Medium**: Moderate concerns requiring attention
- **High**: Serious violations, potential legal implications
- **Critical**: Immediate safety concerns, ongoing harm

**Best Practice:** Set priority within 24 hours of submission.

#### 3. Assign Investigator

- Click "Assign" button
- Select team member from dropdown
- Assignee receives notification (if enabled)
- Reporter sees "Under Review" status update

**Best Practice:** Assign based on:
- Expertise (HR for harassment, Legal for fraud)
- Current workload
- Conflict of interest considerations

#### 4. Add Internal Notes

- Private notes visible only to your team
- Document investigation steps
- Track evidence collected
- Record witness interviews

**Best Practice:** Date-stamp important actions and decisions.

#### 5. Message Reporter

- Send secure, anonymous messages
- Request additional information
- Provide updates
- All messages logged in timeline

**Best Practice:** 
- Respond within 48 hours of submission
- Keep messages professional and empathetic
- Respect anonymity at all times

### Case Resolution

When closing a case:

1. **Set Final Status:**
   - Resolved: Issue addressed
   - Closed: Case complete

2. **Add Resolution Notes:**
   - Summary of investigation
   - Actions taken
   - Outcomes achieved
   - Lessons learned

3. **Optional:**
   - Send final update to reporter
   - Export case for records
   - Archive attachments

---

## User Management

**Access:** Sidebar → Users

### Adding Team Members

1. Click "Invite User"
2. Fill in details:
   - Full name
   - Email address
   - Role (Admin, Manager, Investigator)
   - Department (optional)
3. Click "Send Invite"
4. User receives email with login instructions

**Invite Email Contains:**
- Organization name
- Login URL
- Temporary password (first-time login)
- Instructions to set permanent password

### Managing Existing Users

**View User Details:**
- Name, email, role, department
- Join date
- Last login
- Current case assignments
- Activity history

**Edit User:**
- Update name, email, or department
- Change role/permissions
- Suspend access temporarily

**Remove User:**
- Reassign their open cases first
- Remove access (keeps audit history)
- Cannot be undone

### Role Permissions Matrix

| Feature | Admin | Manager | Investigator |
|---------|-------|---------|--------------|
| View all reports | ✅ | ✅ | Assigned only |
| Assign cases | ✅ | ✅ | ❌ |
| Update case status | ✅ | ✅ | ✅ |
| Message reporters | ✅ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Access settings | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ |

---

## Analytics & Insights

**Access:** Sidebar → Analytics

### Available Reports

#### 1. Reports by Category

**Chart Type:** Bar chart

**Shows:**
- Distribution of reports across categories
- Helps identify systemic issues

**Example Use:**
- High fraud reports? Review financial controls
- Multiple harassment reports? Review HR policies

#### 2. Reports by Status

**Chart Type:** Pie chart

**Shows:**
- Current state of all cases
- Pending vs. resolved distribution

**Example Use:**
- Too many "Submitted" status? Need more investigators
- High "Investigating" count? Cases may be stuck

#### 3. Reports Over Time

**Chart Type:** Line chart

**Shows:**
- Submission trends by month
- Seasonal patterns
- Volume increases/decreases

**Example Use:**
- Sudden spike? Investigate potential systemic issue
- Declining reports? May indicate distrust in system

#### 4. Average Resolution Time

**Chart Type:** Metric + trend

**Shows:**
- Days from submission to resolution
- Trend over time (improving/declining)

**Example Use:**
- Track efficiency improvements
- Identify bottlenecks
- Set SLA targets

#### 5. Reports by Priority

**Chart Type:** Donut chart

**Shows:**
- Distribution of priority levels
- Helps with resource allocation

**Example Use:**
- Many critical cases? Hire more investigators
- Mostly low priority? Review classification process

### Exporting Data

- Click "Export" button
- Choose format (CSV, PDF)
- Select date range
- Download report

**Use Cases:**
- Board presentations
- Compliance audits
- Annual reports
- Trend analysis

---

## Settings & Customization

**Access:** Sidebar → Settings

### Organization Profile

**Editable Fields:**
- Organization name
- Contact email
- Phone number
- Address
- Website URL

**Best Practice:** Keep contact info current for reporter communications.

### Avatar Customization

**12 Professional Styles Available:**
- Profile (default)
- Man, Man-1, Man-2, Man-3
- Woman, Woman-1
- Boy
- Arab-Man, Arab-Man-1
- Moslem-Woman
- Arab

**How to Change:**
1. Go to Settings
2. Scroll to "Avatar Style"
3. Click on any avatar to select
4. Changes save automatically
5. New avatar appears in sidebar immediately

**Note:** Avatar only affects your profile display, not functionality.

### Notification Preferences

*Coming Soon*

- Email notifications for new reports
- Daily digest of activity
- Assignment notifications
- Resolution reminders

### Security Settings

**Session Management:**
- Auto-logout after 30 minutes of inactivity
- Secure session cookies
- Multi-device support

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

**Best Practice:** Change password every 90 days.

---

## Audit Logs

**Access:** Sidebar → Audit Logs

### What Is Logged?

**All actions are tracked:**
- User logins/logouts
- Report views
- Status updates
- Assignments
- Messages sent
- Settings changes
- User management actions

### Viewing Audit Logs

**Log Entries Show:**
- Timestamp (date and time)
- User (who performed the action)
- Action (what was done)
- Details (additional context)
- IP address (for security)

**Filter Options:**
- By user
- By action type
- By date range
- By report ID

### Why Audit Logs Matter

**Compliance:**
- Required for many regulatory frameworks
- Demonstrates due diligence
- Supports investigations

**Security:**
- Detect unauthorized access
- Track suspicious activity
- Investigate data breaches

**Accountability:**
- Who did what and when
- Resolve disputes
- Performance tracking

### Exporting Audit Logs

1. Set date range filter
2. Click "Export"
3. Choose CSV or PDF format
4. Download for records

**Best Practice:** Export monthly for archival purposes.

---

## Best Practices

### Report Handling

#### Initial Triage (Within 24 Hours)

1. ✅ Read full report and attachments
2. ✅ Assess priority and urgency
3. ✅ Assign to appropriate investigator
4. ✅ Send acknowledgment message to reporter
5. ✅ Update status to "Under Review"

#### Investigation Phase

1. ✅ Document all steps in internal notes
2. ✅ Collect evidence systematically
3. ✅ Interview relevant parties
4. ✅ Keep reporter updated every 5-7 days
5. ✅ Respect confidentiality at all times

#### Resolution Phase

1. ✅ Document findings clearly
2. ✅ Take appropriate corrective action
3. ✅ Inform reporter of outcome (where appropriate)
4. ✅ Update policies/procedures if needed
5. ✅ Close case with detailed notes

### Communication Guidelines

**With Reporters:**
- ✅ Professional and empathetic tone
- ✅ Clear, jargon-free language
- ✅ Timely responses (within 48 hours)
- ✅ Never promise specific outcomes
- ✅ Respect anonymity always

**Internal Team Communication:**
- ✅ Use internal notes for sensitive info
- ✅ Tag team members for input
- ✅ Document decisions and rationale
- ✅ Maintain confidentiality

### Data Protection

**Do:**
- ✅ Access reports only when necessary
- ✅ Log out when leaving workstation
- ✅ Use secure devices and networks
- ✅ Report suspicious activity immediately
- ✅ Follow your organization's data policies

**Don't:**
- ❌ Share login credentials
- ❌ Discuss cases outside the platform
- ❌ Take screenshots or photos of reports
- ❌ Forward reports via email
- ❌ Access reports out of curiosity

### Case Assignment Strategy

**Consider:**
- Expertise match (HR, Legal, IT, etc.)
- Current workload balance
- Potential conflicts of interest
- Sensitivity and confidentiality needs
- Geographic location (if relevant)

**Best Practice:** Create a rotation schedule to ensure fair distribution.

---

## Troubleshooting

### Common Issues

#### Can't Login

**Problem:** "Invalid credentials" error

**Solutions:**
1. Verify you're using the correct subdomain URL
2. Check email address for typos
3. Try password reset
4. Contact your organization administrator
5. Check if account is active/not suspended

#### Not Seeing All Reports

**Problem:** Missing reports in list

**Possible Causes:**
- **Investigator Role:** You only see assigned cases
- **Filters Applied:** Check filter settings (status, category, etc.)
- **Date Range:** Adjust date filter to show older reports

**Solution:** Click "Clear Filters" or ask admin for access.

#### File Upload Failed

**Problem:** Can't download attachment

**Solutions:**
1. Check internet connection
2. Try different browser
3. Clear browser cache
4. Verify file hasn't been deleted
5. Contact support if issue persists

#### Messages Not Sending

**Problem:** Message to reporter fails

**Solutions:**
1. Check message isn't empty
2. Verify case status allows messaging
3. Check for special characters causing issues
4. Try shorter message
5. Refresh page and try again

#### Dashboard Metrics Wrong

**Problem:** Numbers don't match expectations

**Solutions:**
1. Refresh browser (Ctrl+R or Cmd+R)
2. Check date range filters
3. Verify you have access to all data
4. Log out and log back in
5. Report bug if numbers still incorrect

### Getting Help

**For Technical Issues:**
1. Check this guide first
2. Try clearing browser cache
3. Test in different browser
4. Contact your organization admin
5. Super admin can escalate to platform support

**For Process Questions:**
1. Review relevant section of this guide
2. Check your organization's policies
3. Consult with manager or senior admin
4. Refer to compliance/legal team

**For Emergency Issues:**
- Critical security concerns
- System downtime
- Data breach suspicion
- Contact super admin immediately

---

## Quick Reference

### Keyboard Shortcuts

| Action | Shortcut (Windows) | Shortcut (Mac) |
|--------|-------------------|----------------|
| Search reports | Ctrl + K | Cmd + K |
| Refresh dashboard | Ctrl + R | Cmd + R |
| Navigate back | Alt + ← | Option + ← |
| Open settings | Ctrl + , | Cmd + , |

### Status Definitions

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| Submitted | New report received | Triage and assign |
| Under Review | Admin reviewing | Initial assessment |
| Investigating | Active investigation | Gather evidence |
| Resolved | Issue addressed | Document outcome |
| Closed | Case complete | Archive |

### Priority Levels

| Level | Response Time | Examples |
|-------|--------------|----------|
| Low | 5-7 days | Policy questions, minor violations |
| Medium | 2-3 days | Moderate concerns, potential violations |
| High | 24 hours | Serious violations, legal implications |
| Critical | Immediate | Safety risks, ongoing harm, legal mandates |

### Support Contacts

**Organization Admin:**
- First point of contact for most issues
- Can manage users and settings

**Platform Super Admin:**
- For platform-wide issues
- Organization-level configuration
- Emergency escalations

**Technical Support:**
- Available through super admin
- For bugs and technical problems

---

## Appendix

### Report Categories Explained

**Ethics & Code of Conduct**
- Policy violations
- Conflicts of interest
- Inappropriate behavior

**Fraud & Financial Misconduct**
- Embezzlement
- Expense fraud
- Financial reporting issues

**Harassment & Discrimination**
- Sexual harassment
- Workplace bullying
- Discriminatory practices

**Safety & Health Violations**
- Workplace hazards
- Safety protocol breaches
- Health code violations

**Data Privacy & Security**
- Data breaches
- Privacy violations
- Information security concerns

**Environmental Issues**
- Pollution
- Waste disposal violations
- Environmental policy breaches

**Other**
- Matters not fitting other categories
- General compliance concerns

### Compliance Frameworks

WhisTrust helps you comply with:

- **SOX** (Sarbanes-Oxley Act)
- **GDPR** (General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **Whistleblower Protection Acts**
- **OSHA** (Occupational Safety and Health)
- **Industry-specific regulations**

### Glossary

**Anonymous Reporting:** Submitting concerns without revealing identity

**Audit Log:** Complete record of all system actions

**Case Number:** Unique identifier for each report

**RLS (Row-Level Security):** Database security ensuring data isolation

**Tracking Code:** Unique code given to reporters to check case status

**Multi-Tenant:** Architecture where each organization has isolated data

---

**Need More Help?**

📧 Contact your organization administrator  
📘 Review [README.md](./README.md) for technical details  
🚀 Check [DEPLOYMENT.md](./DEPLOYMENT.md) for system administration

---

**Thank you for using WhisTrust to maintain ethical, compliant, and safe workplaces! 🛡️**

