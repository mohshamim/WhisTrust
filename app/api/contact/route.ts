import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Initialize Resend instances for both email addresses
// API key for codesquare01@gmail.com
const resendCodeSquare = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// API key for info@aisar.sa
const resendAisar = process.env.RESEND_API_KEY_AISAR
  ? new Resend(process.env.RESEND_API_KEY_AISAR)
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
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6; 
              color: #333333;
              background: #f5f5f5;
              padding: 20px;
            }
            .email-wrapper { 
              max-width: 650px; 
              margin: 0 auto; 
              background: #ffffff;
              border: 1px solid #e0e0e0;
            }
            .header { 
              background: #8B4513;
              color: white; 
              padding: 30px 40px;
              border-bottom: 3px solid #6d3410;
            }
            .header h1 { 
              font-size: 22px;
              font-weight: 600;
              margin: 0;
              letter-spacing: 0.3px;
            }
            .header p {
              margin-top: 6px;
              opacity: 0.9;
              font-size: 14px;
              font-weight: 400;
            }
            .content { 
              padding: 35px 40px;
            }
            .info-row { 
              padding: 16px 0;
              border-bottom: 1px solid #e8e8e8;
            }
            .info-row:last-of-type {
              border-bottom: none;
            }
            .label { 
              font-weight: 600;
              color: #666666;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 6px;
            }
            .value { 
              color: #1a1a1a;
              font-size: 15px;
              font-weight: 400;
              word-wrap: break-word;
              margin-top: 4px;
            }
            .value a {
              color: #8B4513;
              text-decoration: none;
              font-weight: 500;
            }
            .value a:hover {
              text-decoration: underline;
            }
            .inquiry-type {
              display: inline-block;
              background: #8B4513;
              color: white;
              padding: 6px 16px;
              border-radius: 4px;
              font-size: 13px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .message-section {
              background: #fafafa;
              padding: 18px;
              border-left: 3px solid #8B4513;
              margin-top: 8px;
              line-height: 1.7;
              font-size: 14px;
              color: #333333;
            }
            .footer { 
              background: #f9f9f9;
              padding: 25px 40px;
              border-top: 1px solid #e0e0e0;
            }
            .footer-info {
              font-size: 12px;
              color: #777777;
              line-height: 1.8;
            }
            .footer-info strong {
              color: #333333;
            }
            .submission-id {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              color: #8B4513;
              background: #fff;
              padding: 4px 8px;
              border: 1px solid #e0e0e0;
              display: inline-block;
              margin: 4px 0;
            }
            .brand {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #e0e0e0;
              font-size: 11px;
              color: #999999;
              text-align: center;
            }
            .brand strong {
              color: #8B4513;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1>New Contact Inquiry</h1>
              <p>WhisTrust Contact Management System</p>
            </div>
            
            <div class="content">
              <div class="info-row">
                <div class="label">Inquiry Type</div>
                <div class="value">
                  <span class="inquiry-type">${subjectMap[subject] || subject}</span>
                </div>
              </div>
              
              <div class="info-row">
                <div class="label">Contact Name</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Email Address</div>
                <div class="value">
                  <a href="mailto:${email}">${email}</a>
                </div>
              </div>
              
              ${company ? `
              <div class="info-row">
                <div class="label">Company</div>
                <div class="value">${company}</div>
              </div>
              ` : ''}
              
              ${phone ? `
              <div class="info-row">
                <div class="label">Phone Number</div>
                <div class="value">
                  <a href="tel:${phone}">${phone}</a>
                </div>
              </div>
              ` : ''}
              
              ${companySize ? `
              <div class="info-row">
                <div class="label">Company Size</div>
                <div class="value">${companySize}</div>
              </div>
              ` : ''}
              
              ${message ? `
              <div class="info-row">
                <div class="label">Message</div>
                <div class="message-section">${message.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <div class="footer-info">
                <strong>Submission Details</strong><br>
                <span class="submission-id">${submission.id}</span><br>
                Received: ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </div>
              <div class="brand">
                <strong>WhisTrust</strong> — Secure, Confidential & Professional
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

    // Send emails to both addresses using their respective API keys
    const emailResults = {
      codesquare: { success: false, id: null as string | null, error: null as string | null },
      aisar: { success: false, id: null as string | null, error: null as string | null },
    };

    // Send to codesquare01@gmail.com
    if (resendCodeSquare) {
      try {
        const { data: emailData1, error: emailError1 } = await resendCodeSquare.emails.send({
          from: "WhisTrust Contact <onboarding@resend.dev>",
          to: ["codesquare01@gmail.com"],
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
          replyTo: email,
        });

        if (emailError1) {
          console.error("Email error (codesquare01@gmail.com):", emailError1);
          emailResults.codesquare.error = emailError1.message;
        } else {
          emailResults.codesquare.success = true;
          emailResults.codesquare.id = emailData1?.id || null;
        }
      } catch (error) {
        console.error("Exception sending to codesquare01@gmail.com:", error);
        emailResults.codesquare.error = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      console.warn("Resend not configured for codesquare01@gmail.com");
      emailResults.codesquare.error = "API key not configured";
    }

    // Send to info@aisar.sa
    if (resendAisar) {
      try {
        const { data: emailData2, error: emailError2 } = await resendAisar.emails.send({
          from: "WhisTrust Contact <onboarding@resend.dev>",
          to: ["info@aisar.sa"],
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
          replyTo: email,
        });

        if (emailError2) {
          console.error("Email error (info@aisar.sa):", emailError2);
          emailResults.aisar.error = emailError2.message;
        } else {
          emailResults.aisar.success = true;
          emailResults.aisar.id = emailData2?.id || null;
        }
      } catch (error) {
        console.error("Exception sending to info@aisar.sa:", error);
        emailResults.aisar.error = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      console.warn("Resend not configured for info@aisar.sa");
      emailResults.aisar.error = "API key not configured";
    }

    // Determine overall success
    const anySuccess = emailResults.codesquare.success || emailResults.aisar.success;
    const allSuccess = emailResults.codesquare.success && emailResults.aisar.success;

    if (!anySuccess) {
      // Both failed
      return NextResponse.json(
        {
          success: true,
          message: "Form submitted successfully, but all email notifications failed",
          submissionId: submission.id,
          emailResults,
        },
        { status: 200 }
      );
    }

    if (!allSuccess) {
      // Partial success
      return NextResponse.json(
        {
          success: true,
          message: "Form submitted successfully, but some email notifications failed",
          submissionId: submission.id,
          emailResults,
        },
        { status: 200 }
      );
    }

    // Full success!
    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
        submissionId: submission.id,
        emailResults,
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

