import { renderBrandedEmailHTML } from "./templates/base";

type OrgBrand = {
  name: string;
  branding?: {
    email_logo_url?: string;
    primary_color?: string;
    support_email?: string;
    support_phone?: string;
  };
};

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  // SMTP is currently disabled in this environment; safely no-op.
  // This function remains so callers do not need conditional checks.
  return;
}

export async function sendNewReportEmail(org: OrgBrand, recipients: string[], payload: {
  caseNumber?: string;
  category: string;
  trackingCode: string;
}) {
  if (recipients.length === 0) return;
  const html = renderBrandedEmailHTML({
    subject: `New report submitted${payload.caseNumber ? ` - ${payload.caseNumber}` : ""}`,
    organization: org as any,
    bodyHtml: `
      <h2 style="margin:0 0 12px 0;font-size:18px;">New Report Received</h2>
      <p style="margin:0 0 12px 0;">A new report has been submitted.</p>
      <ul style="margin:0 0 12px 20px;">
        ${payload.caseNumber ? `<li><strong>Case #:</strong> ${payload.caseNumber}</li>` : ""}
        <li><strong>Category:</strong> ${payload.category}</li>
        <li><strong>Tracking Code:</strong> ${payload.trackingCode}</li>
      </ul>
      <p style="margin:12px 0 0 0;">Log in to review and triage the case.</p>
    `,
  });
  await sendEmail({ to: recipients, subject: "New report submitted", html });
}

