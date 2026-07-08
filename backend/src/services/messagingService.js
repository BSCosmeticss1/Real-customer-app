const axios = require('axios');
// const User = require('../models/User'); // Removed for Prisma migration

// Personalize message content with contact data
const personalizeMessage = (content, contact) => {
  return content
    .replace(/\{\{FirstName\}\}/gi, contact.name?.split(' ')[0] || contact.name)
    .replace(/\{\{FullName\}\}/gi, contact.name || '')
    .replace(/\{\{Company\}\}/gi, contact.company || '')
    .replace(/\{\{Phone\}\}/gi, contact.phone || '')
    .replace(/\{\{Email\}\}/gi, contact.email || '')
    .replace(/\{\{Date\}\}/gi, new Date().toLocaleDateString());
};

// Send WhatsApp message via Meta Business API
const sendWhatsApp = async (to, message, userApiKeys) => {
  console.log('[sendWhatsApp] Starting send...');
  console.log('[sendWhatsApp] Input to:', to);
  console.log('[sendWhatsApp] Input message:', message);
  
  const token = userApiKeys?.whatsappToken || process.env.WHATSAPP_TOKEN;
  const phoneId = userApiKeys?.whatsappPhoneId || process.env.WHATSAPP_PHONE_ID;

  console.log('[sendWhatsApp] Using token (first 10 chars):', token?.substring(0, 10) || 'NOT FOUND');
  console.log('[sendWhatsApp] Using phoneId:', phoneId || 'NOT FOUND');

  if (!token || !phoneId) {
    console.error('[sendWhatsApp] ERROR: WhatsApp API not configured - missing token or phoneId');
    throw new Error('WhatsApp API not configured');
  }

  // Normalize phone number - requires international format
  let phone = to.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  
  // Handle Nigerian numbers (start with 08, 07, 09, convert to +234)
  if (phone.startsWith('08') || phone.startsWith('07') || phone.startsWith('09')) {
    phone = '234' + phone.substring(1);
    console.log('[sendWhatsApp] Converted Nigerian number to:', phone);
  }

  console.log('[sendWhatsApp] Final normalized phone:', phone);

  try {
    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;
    console.log('[sendWhatsApp] Request URL:', url);
    const requestBody = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message },
    };
    console.log('[sendWhatsApp] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('[sendWhatsApp] Success! Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    // Extract detailed error message from Meta
    let errorMessage = error.message;
    if (error.response && error.response.data) {
      const metaError = error.response.data;
      if (metaError.error) {
        errorMessage = `${metaError.error.message} (Code: ${metaError.error.code}, Type: ${metaError.error.type})`;
      } else {
        errorMessage = JSON.stringify(metaError);
      }
    }
    console.error('[sendWhatsApp] ERROR:', errorMessage);
    if (error.response) {
      console.error('[sendWhatsApp] Response status:', error.response.status);
    }
    throw new Error(errorMessage);
  }
};

// Send Facebook Messenger message
const sendFacebook = async (recipientId, message, userApiKeys) => {
  const token = userApiKeys?.facebookToken || process.env.FACEBOOK_PAGE_TOKEN;
  if (!token) throw new Error('Facebook API not configured');

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text: message },
    },
    { params: { access_token: token } }
  );
  return response.data;
};

// Send Instagram DM
const sendInstagram = async (recipientId, message, userApiKeys) => {
  const token = userApiKeys?.instagramToken || process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error('Instagram API not configured');

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text: message },
    },
    { params: { access_token: token } }
  );
  return response.data;
};

// Normalize a phone number into international format (digits only, no +)
const normalizePhone = (raw) => {
  let phone = String(raw).replace(/[\s\-\(\)\.]/g, '').replace(/^\+/, '');
  // Remove leading 0 and add Nigeria country code
  if (phone.startsWith('0')) {
    phone = '234' + phone.substring(1);
  }
  // If it starts with a local digit without country code (e.g. 70/80/90)
  if (!phone.startsWith('234') && (phone.startsWith('7') || phone.startsWith('8') || phone.startsWith('9'))) {
    phone = '234' + phone;
  }
  return phone;
};

// Send SMS via Termii API
const sendSMS = async (phone, message) => {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID;
  const baseUrl = process.env.TERMII_BASE_URL || 'https://v3.api.termii.com';

  if (!apiKey) throw new Error('Termii API not configured');

  const to = normalizePhone(phone);

  try {
    const response = await axios.post(
      `${baseUrl}/api/sms/send`,
      {
        to,
        from: senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: apiKey,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Termii error responses come with code !== 'ok'
    if (response.data && response.data.code && response.data.code !== 'ok') {
      throw new Error(response.data.message || 'Termii SMS failed');
    }

    return {
      messageId: response.data?.message_id || response.data?.messageId || `sms_${Date.now()}`,
      raw: response.data,
    };
  } catch (error) {
    let errorMessage = error.message;
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || JSON.stringify(error.response.data);
    }
    throw new Error(errorMessage);
  }
};

// Main dispatch function
const sendMessage = async (platform, contact, content, userApiKeys) => {
  const personalizedContent = personalizeMessage(content, contact);

  switch (platform) {
    case 'whatsapp':
      const waNumber = contact.whatsapp || contact.phone;
      if (!waNumber) throw new Error('No WhatsApp number for this contact');
      return await sendWhatsApp(waNumber, personalizedContent, userApiKeys);

    case 'facebook':
      if (!contact.facebook) throw new Error('No Facebook ID for this contact');
      return await sendFacebook(contact.facebook, personalizedContent, userApiKeys);

    case 'instagram':
      if (!contact.instagram) throw new Error('No Instagram handle for this contact');
      return await sendInstagram(contact.instagram, personalizedContent, userApiKeys);

    case 'sms':
      const smsNumber = contact.phone || contact.whatsapp;
      if (!smsNumber) throw new Error('No phone number for this contact');
      return await sendSMS(smsNumber, personalizedContent);

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

module.exports = { sendMessage, personalizeMessage };
