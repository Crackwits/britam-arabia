// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';


export const runtime = "nodejs";
export async function POST(request: NextRequest) {
    try {
        const formData = await request.json();

        // Create a transporter using environment variables
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        // Email to the company
        const htmlContent = `
      <h2>New Risk Assessment Submission</h2>
      
      <h3>Organisation & Contact Information</h3>
      <ul>
        <li><strong>Organization Name:</strong> ${formData.organizationName}</li>
        <li><strong>Contact Name:</strong> ${formData.contactName}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Position:</strong> ${formData.position}</li>
        <li><strong>Telephone:</strong> ${formData.telephone}</li>
      </ul>

      <h3>Facility Profile</h3>
      <ul>
        <li><strong>Facility Type:</strong> ${formData.facilityType}</li>
        <li><strong>Facility Size:</strong> ${formData.facilitySize}</li>
        <li><strong>Project Stage:</strong> ${formData.projectStage}</li>
      </ul>

      <h3>Risk & Hazard Profile</h3>
      <ul>
        <li><strong>Hazards:</strong> ${formData.hazards.join(', ')}</li>
      </ul>

      <h3>Current Fire & Life Safety Readiness</h3>
      <ul>
        <li><strong>Emergency Fire & Rescue Service:</strong> ${formData.emergencyService}</li>
        <li><strong>Pre Risk Assessment:</strong> ${formData.preRiskAssessment}</li>
      </ul>

      <h3>Services & Support Required</h3>
      <ul>
        <li><strong>Services Interested:</strong> ${formData.servicesInterested.join(', ')}</li>
        <li><strong>Support Required:</strong> ${formData.supportRequired}</li>
      </ul>

      <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
    `;

        const textContent = `
New Risk Assessment Submission

Organisation & Contact Information
- Organization Name: ${formData.organizationName}
- Contact Name: ${formData.contactName}
- Email: ${formData.email}
- Position: ${formData.position}
- Telephone: ${formData.telephone}

Facility Profile
- Facility Type: ${formData.facilityType}
- Facility Size: ${formData.facilitySize}
- Project Stage: ${formData.projectStage}

Risk & Hazard Profile
- Hazards: ${formData.hazards.join(', ')}

Current Fire & Life Safety Readiness
- Emergency Fire & Rescue Service: ${formData.emergencyService}
- Pre Risk Assessment: ${formData.preRiskAssessment}

Services & Support Required
- Services Interested: ${formData.servicesInterested.join(', ')}
- Support Required: ${formData.supportRequired}

Submitted at: ${new Date().toLocaleString()}
    `;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.HR_EMAIL,
            replyTo: formData.email,
            subject: `New Risk Assessment Submission from ${formData.contactName}`,
            text: textContent,
            html: htmlContent,
        });

        // Send confirmation email to the user
        const confirmationEmailContent = `
      <h2>Risk Assessment Received</h2>
      <p>Dear ${formData.contactName},</p>
      
      <p>Thank you for completing the risk assessment form. We have received your submission and our team will review your responses shortly.</p>
      
      <p>We will assess your operational and Civil Defence compliance requirements and contact you to arrange a consultation and site visit to discuss the next steps.</p>
      
      <h3>Submission Summary</h3>
      <ul>
        <li><strong>Organization:</strong> ${formData.organizationName}</li>
        <li><strong>Facility Type:</strong> ${formData.facilityType}</li>
        <li><strong>Services Interested:</strong> ${formData.servicesInterested.join(', ')}</li>
      </ul>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br/>The Risk Assessment Team</p>
    `;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: formData.email,
            replyTo: process.env.HR_EMAIL,
            subject: 'Risk Assessment Received - Thank You',
            html: confirmationEmailContent,
            text: confirmationEmailContent.replace(/<[^>]*>/g, ''),
        });

        return NextResponse.json(
            { success: true, message: 'Email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to send email', error: String(error) },
            { status: 500 }
        );
    }
}