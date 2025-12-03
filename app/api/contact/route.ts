import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, companySize, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and subject are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 1. Save to Supabase database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        company: company || null,
        phone: phone || null,
        company_size: companySize || null,
        subject,
        message: message || null,
        status: "new",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      console.error("Error code:", dbError.code);
      console.error("Error details:", dbError.details);
      console.error("Error hint:", dbError.hint);
      
      // Check if table doesn't exist
      if (dbError.code === '42P01' || dbError.message?.includes('relation') || dbError.message?.includes('does not exist')) {
        return NextResponse.json(
          {
            error: "Database not set up. Please run the contact_submissions migration.",
            setup_required: true,
            migration_file: "supabase/RUN_CONTACT_MIGRATION.sql",
            details: dbError.message,
          },
          { status: 500 }
        );
      }
      
      throw new Error(`Failed to save submission: ${dbError.message}`);
    }

    // 2. Send email notification via Resend
    const subjectMap: Record<string, string> = {
      sales: "Sales & Pricing Inquiry",
      demo: "Request a Demo",
      support: "Technical Support",
      partnership: "Partnership Opportunities",
      general: "General Question",
    };

    const emailSubject = `WhisTrust Contact: ${subjectMap[subject] || subject}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1f2937;
              background: #f3f4f6;
              padding: 20px;
            }
            .email-wrapper { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
              background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
              color: white; 
              padding: 40px 30px;
              text-align: center;
            }
            .header-icon {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
              font-size: 32px;
            }
            .header h1 { 
              font-size: 24px;
              font-weight: 700;
              margin: 0;
              letter-spacing: -0.5px;
            }
            .header p {
              margin-top: 8px;
              opacity: 0.95;
              font-size: 14px;
            }
            .content { 
              padding: 40px 30px;
            }
            .field { 
              margin-bottom: 24px;
              background: #f9fafb;
              border-radius: 12px;
              padding: 20px;
              border: 1px solid #e5e7eb;
              transition: all 0.2s;
            }
            .field:hover {
              border-color: #8B4513;
              box-shadow: 0 2px 4px rgba(139, 69, 19, 0.1);
            }
            .label { 
              font-weight: 600;
              color: #8B4513;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .label-icon {
              display: inline-block;
              width: 18px;
              height: 18px;
              background: #8B4513;
              color: white;
              border-radius: 50%;
              text-align: center;
              line-height: 18px;
              font-size: 11px;
            }
            .value { 
              color: #111827;
              font-size: 15px;
              font-weight: 500;
              word-wrap: break-word;
            }
            .value a {
              color: #2563eb;
              text-decoration: none;
              font-weight: 600;
            }
            .value a:hover {
              text-decoration: underline;
            }
            .message-box {
              background: #ffffff;
              border-left: 4px solid #8B4513;
              padding: 16px;
              border-radius: 8px;
              line-height: 1.8;
            }
            .footer { 
              margin-top: 32px;
              padding-top: 24px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
            }
            .footer-details {
              background: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 16px;
            }
            .footer-details p {
              font-size: 13px;
              color: #6b7280;
              margin: 4px 0;
            }
            .footer-details .submission-id {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              color: #8B4513;
              font-weight: 600;
            }
            .footer-brand {
              font-size: 12px;
              color: #9ca3af;
              margin-top: 12px;
            }
            .footer-brand strong {
              color: #8B4513;
              font-weight: 700;
            }
            .priority-badge {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="header-icon">📬</div>
              <h1>New Contact Form Submission</h1>
              <p>Someone is interested in WhisTrust</p>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">
                  <span class="label-icon">📝</span>
                  Inquiry Type
                </div>
                <div class="value">
                  <span class="priority-badge">${subjectMap[subject] || subject}</span>
                </div>
              </div>
              
              <div class="field">
                <div class="label">
                  <span class="label-icon">👤</span>
                  Contact Name
                </div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">
                  <span class="label-icon">📧</span>
                  Email Address
                </div>
                <div class="value">
                  <a href="mailto:${email}">${email}</a>
                </div>
              </div>
              
              ${company ? `
              <div class="field">
                <div class="label">
                  <span class="label-icon">🏢</span>
                  Company Name
                </div>
                <div class="value">${company}</div>
              </div>
              ` : ''}
              
              ${phone ? `
              <div class="field">
                <div class="label">
                  <span class="label-icon">📞</span>
                  Phone Number
                </div>
                <div class="value">
                  <a href="tel:${phone}">${phone}</a>
                </div>
              </div>
              ` : ''}
              
              ${companySize ? `
              <div class="field">
                <div class="label">
                  <span class="label-icon">👥</span>
                  Company Size
                </div>
                <div class="value">${companySize}</div>
              </div>
              ` : ''}
              
              ${message ? `
              <div class="field">
                <div class="label">
                  <span class="label-icon">💬</span>
                  Message
                </div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
              
              <div class="footer">
                <div class="footer-details">
                  <p><strong>Submission Details</strong></p>
                  <p class="submission-id">ID: ${submission.id}</p>
                  <p>Received: ${new Date().toLocaleString('en-US', { 
                    dateStyle: 'full', 
                    timeStyle: 'short' 
                  })}</p>
                </div>
                <div class="footer-brand">
                  <strong>WhisTrust</strong> Contact Management System<br>
                  Secure • Confidential • Professional
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New Contact Form Submission - WhisTrust

Type: ${subjectMap[subject] || subject}
Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}
${phone ? `Phone: ${phone}` : ''}
${companySize ? `Company Size: ${companySize}` : ''}
${message ? `\nMessage:\n${message}` : ''}

---
Submission ID: ${submission.id}
Received: ${new Date().toLocaleString()}
`;

    // Send email only if Resend is configured
    if (!resend) {
      console.warn("Resend not configured - email not sent");
      return NextResponse.json(
        {
          success: true,
          message: "Form submitted successfully (email not configured)",
          submissionId: submission.id,
        },
        { status: 200 }
      );
    }

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "WhisTrust Contact <onboarding@resend.dev>",
      to: ["codesquare01@gmail.com"], // Only verified email works with Resend test mode
      // Note: To send to info@aisar.sa, verify domain at resend.com/domains
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      replyTo: email, // Reply to the submitter
    });

    if (emailError) {
      console.error("Email error:", emailError);
      // Don't throw - we still saved to DB
      return NextResponse.json(
        {
          success: true,
          message: "Form submitted successfully, but email notification failed",
          submissionId: submission.id,
          emailError: emailError.message,
        },
        { status: 200 }
      );
    }

    // Success!
    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
        submissionId: submission.id,
        emailId: emailData?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    
    // Provide more helpful error messages
    let errorMessage = "Failed to process contact form";
    let errorDetails = error instanceof Error ? error.message : "Unknown error";
    
    if (errorDetails.includes("migration")) {
      errorMessage = "Database table not found. Please run the migration script.";
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        hint: "Check if the contact_submissions table exists in Supabase",
      },
      { status: 500 }
    );
  }
}

