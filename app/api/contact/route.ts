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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #8B4513; }
            .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #8B4513; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">📝 Type:</div>
                <div class="value">${subjectMap[subject] || subject}</div>
              </div>
              
              <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              ${company ? `
              <div class="field">
                <div class="label">🏢 Company:</div>
                <div class="value">${company}</div>
              </div>
              ` : ''}
              
              ${phone ? `
              <div class="field">
                <div class="label">📞 Phone:</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ` : ''}
              
              ${companySize ? `
              <div class="field">
                <div class="label">👥 Company Size:</div>
                <div class="value">${companySize}</div>
              </div>
              ` : ''}
              
              ${message ? `
              <div class="field">
                <div class="label">💬 Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
              
              <div class="footer">
                <p>Submission ID: ${submission.id}</p>
                <p>Received: ${new Date().toLocaleString()}</p>
                <p>WhisTrust Contact Management System</p>
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
      from: "WhisTrust Contact <onboarding@resend.dev>", // Change this to your verified domain
      to: ["info@aisar.sa"],
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

