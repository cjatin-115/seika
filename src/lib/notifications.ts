import nodemailer from 'nodemailer';

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[EMAIL STUB]', { to, subject, html, text });
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: html || text,
      text: text || html,
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendSMS({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<void> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('[SMS STUB]', { to, message });
    return;
  }

  try {
    // Twilio would be called here
    // For now, just stub it
    console.log('[SMS]', { to, message });
  } catch (error) {
    console.error('SMS send error:', error);
  }
}

// Appointment confirmation email template
export function getAppointmentConfirmationEmail({
  patientName,
  doctorName,
  hospitalName,
  appointmentDate,
  appointmentTime,
  appointmentId,
}: {
  patientName: string;
  doctorName: string;
  hospitalName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentId: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: "Noto Sans JP", sans-serif; background-color: #FAFAF8; }
          .container { max-width: 600px; margin: 0 auto; background-color: #F2F0EB; padding: 32px; border-radius: 12px; }
          .header { border-bottom: 1px solid #E2DDD5; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { color: #1A1916; font-family: "Noto Serif JP", serif; font-size: 24px; margin: 0; }
          .content { color: #6B6760; line-height: 1.8; }
          .appointment-details { background-color: #FAFAF8; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E2DDD5; }
          .detail-row { display: flex; padding: 8px 0; }
          .detail-label { font-weight: 600; width: 120px; color: #1A1916; }
          .detail-value { color: #6B6760; }
          .cta { background-color: #D4768A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 20px; }
          .footer { border-top: 1px solid #E2DDD5; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #6B6760; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>フ・ッポイント確認 Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p>こんにちは, ${patientName}さん</p>
            <p>Your appointment has been confirmed. Here are the details:</p>
            
            <div class="appointment-details">
              <div class="detail-row">
                <div class="detail-label">Doctor:</div>
                <div class="detail-value">${doctorName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Hospital:</div>
                <div class="detail-value">${hospitalName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${appointmentDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Time:</div>
                <div class="detail-value">${appointmentTime}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Ref ID:</div>
                <div class="detail-value">${appointmentId}</div>
              </div>
            </div>

            <p>Please arrive 10 minutes early. If you need to cancel or reschedule, please do so at least 2 hours before your appointment time.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/appointments/${appointmentId}" class="cta">View Appointment</a>
          </div>
          <div class="footer">
            <p>MediBook • Hospital & Clinic Appointment Platform</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Reminder email template
export function getReminderEmail({
  patientName,
  doctorName,
  hospitalName,
  appointmentDate,
  appointmentTime,
  hoursBefore,
}: {
  patientName: string;
  doctorName: string;
  hospitalName: string;
  appointmentDate: string;
  appointmentTime: string;
  hoursBefore: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: "Noto Sans JP", sans-serif; background-color: #FAFAF8; }
          .container { max-width: 600px; margin: 0 auto; background-color: #F2F0EB; padding: 32px; border-radius: 12px; }
          .header { border-bottom: 1px solid #E2DDD5; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { color: #1A1916; font-family: "Noto Serif JP", serif; font-size: 24px; margin: 0; }
          .content { color: #6B6760; line-height: 1.8; }
          .reminder-box { background-color: #FFF8F9; padding: 16px; border-left: 4px solid #D4768A; margin: 20px 0; }
          .footer { border-top: 1px solid #E2DDD5; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #6B6760; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Appointment Reminder</h1>
          </div>
          <div class="content">
            <p>Your appointment is coming up in ${hoursBefore} hour(s)!</p>
            
            <div class="reminder-box">
              <p><strong>${doctorName}</strong> at ${hospitalName}<br>
              <strong>${appointmentDate}</strong> at <strong>${appointmentTime}</strong></p>
            </div>

            <p>Please plan to arrive a few minutes early.</p>
          </div>
          <div class="footer">
            <p>MediBook • Hospital & Clinic Appointment Platform</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
