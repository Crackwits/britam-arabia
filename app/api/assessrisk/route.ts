// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = "nodejs";

// File validation constants
const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface ValidationError {
    field: string;
    message: string;
}

// Validate file
function validateFile(file: File | null): ValidationError | null {
    if (!file) {
        return null; // File is optional
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            field: 'file',
            message: 'File must be smaller than 5MB',
        };
    }

    // Check file type
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        return {
            field: 'file',
            message: 'Only PDF, DOC, and DOCX files are accepted',
        };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ACCEPTED_FILE_EXTENSIONS.some(ext =>
        fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
        return {
            field: 'file',
            message: 'Invalid file extension. Accepted: PDF, DOC, DOCX',
        };
    }

    return null;
}

// Validate form data
function validateFormData(data: Record<string, any>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    const requiredFields = [
        'organizationName',
        'contactName',
        'email',
        'position',
        'telephone',
        'facilityType',
        'facilitySize',
        'projectStage',
        'hazards',
        'emergencyService',
        'preRiskAssessment',
        'servicesInterested',
        'supportRequired',
    ];

    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push({
                field,
                message: `${field} is required`,
            });
        }
    }

    // Email validation
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push({
                field: 'email',
                message: 'Invalid email format',
            });
        }
    }

    // Hazards and services should be arrays
    if (data.hazards && !Array.isArray(data.hazards)) {
        errors.push({
            field: 'hazards',
            message: 'Hazards must be an array',
        });
    }

    if (data.servicesInterested && !Array.isArray(data.servicesInterested)) {
        errors.push({
            field: 'servicesInterested',
            message: 'Services must be an array',
        });
    }

    return errors;
}

export async function POST(request: NextRequest) {
    try {
        // Parse form data
        const formData = await request.formData();

        // Extract file if present
        const fileInput = formData.get('file') as File | null;

        // Extract form fields
        const data: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
            if (key === 'file') continue; // Skip file field

            // Handle arrays (hazards, servicesInterested)
            if (key === 'hazards' || key === 'servicesInterested') {
                if (!data[key]) {
                    data[key] = [];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // Validate form data
        const formErrors = validateFormData(data);
        if (formErrors.length > 0) {
            return NextResponse.json(
                { success: false, errors: formErrors },
                { status: 400 }
            );
        }

        // Validate file if preRiskAssessment is "yes"
        if (data.preRiskAssessment === 'yes') {
            const fileError = validateFile(fileInput);
            if (fileError) {
                return NextResponse.json(
                    { success: false, errors: [fileError] },
                    { status: 400 }
                );
            }
        }

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

        // Prepare file attachments
        const attachments: any[] = [];
        if (fileInput) {
            const buffer = await fileInput.arrayBuffer();
            attachments.push({
                filename: fileInput.name,
                content: Buffer.from(buffer),
                contentType: fileInput.type,
            });
        }

        // Email to the company
        const htmlContent = `
      <h2>New Risk Assessment Submission</h2>
      
      <h3>Organisation & Contact Information</h3>
      <ul>
        <li><strong>Organization Name:</strong> ${escapeHtml(data.organizationName)}</li>
        <li><strong>Contact Name:</strong> ${escapeHtml(data.contactName)}</li>
        <li><strong>Email:</strong> ${escapeHtml(data.email)}</li>
        <li><strong>Position:</strong> ${escapeHtml(data.position)}</li>
        <li><strong>Telephone:</strong> ${escapeHtml(data.telephone)}</li>
      </ul>

      <h3>Facility Profile</h3>
      <ul>
        <li><strong>Facility Type:</strong> ${escapeHtml(data.facilityType)}</li>
        <li><strong>Facility Size:</strong> ${escapeHtml(data.facilitySize)}</li>
        <li><strong>Project Stage:</strong> ${escapeHtml(data.projectStage)}</li>
      </ul>

      <h3>Risk & Hazard Profile</h3>
      <ul>
        <li><strong>Hazards:</strong> ${escapeHtml(data.hazards.join(', '))}</li>
      </ul>

      <h3>Current Fire & Life Safety Readiness</h3>
      <ul>
        <li><strong>Emergency Fire & Rescue Service:</strong> ${escapeHtml(data.emergencyService)}</li>
        <li><strong>Pre Risk Assessment:</strong> ${escapeHtml(data.preRiskAssessment)}</li>
        ${fileInput ? `<li><strong>Assessment Document:</strong> ${escapeHtml(fileInput.name)} (attached)</li>` : ''}
      </ul>

      <h3>Services & Support Required</h3>
      <ul>
        <li><strong>Services Interested:</strong> ${escapeHtml(data.servicesInterested.join(', '))}</li>
        <li><strong>Support Required:</strong> ${escapeHtml(data.supportRequired)}</li>
      </ul>

      <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
    `;

        const textContent = `
New Risk Assessment Submission

Organisation & Contact Information
- Organization Name: ${data.organizationName}
- Contact Name: ${data.contactName}
- Email: ${data.email}
- Position: ${data.position}
- Telephone: ${data.telephone}

Facility Profile
- Facility Type: ${data.facilityType}
- Facility Size: ${data.facilitySize}
- Project Stage: ${data.projectStage}

Risk & Hazard Profile
- Hazards: ${data.hazards.join(', ')}

Current Fire & Life Safety Readiness
- Emergency Fire & Rescue Service: ${data.emergencyService}
- Pre Risk Assessment: ${data.preRiskAssessment}
${fileInput ? `- Assessment Document: ${fileInput.name}` : ''}

Services & Support Required
- Services Interested: ${data.servicesInterested.join(', ')}
- Support Required: ${data.supportRequired}

Submitted at: ${new Date().toLocaleString()}
    `;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.HR_CAREERS_EMAIL,
            replyTo: data.email,
            subject: `New Risk Assessment Submission from ${data.contactName}`,
            text: textContent,
            html: htmlContent,
            attachments,
        });

        // Send confirmation email to the user
        const confirmationEmailContent = `
      <h2>Risk Assessment Received</h2>
      <p>Dear ${escapeHtml(data.contactName)},</p>
      
      <p>Thank you for completing the risk assessment form. We have received your submission and our team will review your responses shortly.</p>
      
      <p>We will assess your operational and Civil Defence compliance requirements and contact you to arrange a consultation and site visit to discuss the next steps.</p>
      
      <h3>Submission Summary</h3>
      <ul>
        <li><strong>Organization:</strong> ${escapeHtml(data.organizationName)}</li>
        <li><strong>Facility Type:</strong> ${escapeHtml(data.facilityType)}</li>
        <li><strong>Services Interested:</strong> ${escapeHtml(data.servicesInterested.join(', '))}</li>
      </ul>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br/>The Risk Assessment Team</p>
    `;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: data.email,
            replyTo: process.env.HR_INFO_EMAIL,
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
            {
                success: false,
                message: 'Failed to send email',
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}