export function renderBrandedEmailHTML(params: {
  subject: string;
  bodyHtml: string;
  organization: {
    name: string;
    branding?: {
      email_logo_url?: string;
      primary_color?: string;
      support_email?: string;
      support_phone?: string;
    };
  };
}) {
  const brand = params.organization.branding || {};
  const color = brand.primary_color || "#0EA5E9";
  const logo = brand.email_logo_url || "";
  const supportEmail = brand.support_email || "";
  const supportPhone = brand.support_phone || "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(params.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:${color};padding:16px 24px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  ${logo ? `<img src="${logo}" alt="${escapeHtml(
                    params.organization.name
                  )}" height="28" style="display:block;max-height:28px;" />` : `<span style="font-weight:700;color:#fff;">${escapeHtml(
                    params.organization.name
                  )}</span>`}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${params.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                <div>${escapeHtml(params.organization.name)}</div>
                ${supportEmail ? `<div>Support: <a href="mailto:${escapeHtml(
                  supportEmail
                )}" style="color:${color};text-decoration:none;">${escapeHtml(supportEmail)}</a></div>` : ``}
                ${supportPhone ? `<div>Phone: ${escapeHtml(supportPhone)}</div>` : ``}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


