/**
 * SMS Service for sending OTP codes
 * This is a simple implementation that can be replaced with actual SMS provider
 */

// Generate random 6-digit OTP
// For super admin (+972542632557), always return 123456
export function generateOTP(phone?: string): string {
  // Fixed code for super admin
  if (phone === '+972542632557') {
    return '123456';
  }
  
  // Random code for everyone else
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS via console (for development)
// Replace this with actual SMS provider API (Twilio, Nexmo, etc.)
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  console.log('📱 SMS Service');
  console.log('To:', phone);
  console.log('Message:', message);
  console.log('---');
  
  // TODO: Integrate with actual SMS provider
  // Example with Twilio:
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: twilioPhone,
  //   to: phone
  // });
  
  // For now, just log to console (development mode)
  return true;
}

// Send OTP code
export async function sendOTPCode(phone: string, code: string): Promise<boolean> {
  const message = `رمز التحقق الخاص بك في مركز نور الهدى: ${code}\nالرمز صالح لمدة 5 دقائق.`;
  return await sendSMS(phone, message);
}

// Validate phone number format
export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation for international format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

