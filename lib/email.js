// Sends a "new lead" notification email using Resend's HTTP API.
//
// This is intentionally dependency-free (plain fetch, no SDK) and
// best-effort: if RESEND_API_KEY isn't set, or the request fails for any
// reason, we log it and move on. A flaky email provider should never stop a
// lead from being saved to Firestore.
//
// Setup (optional):
//   1. Create a free account at https://resend.com
//   2. Add + verify a sending domain (or use their default onboarding
//      domain for testing), then create an API key.
//   3. Add to .env.local:
//        RESEND_API_KEY=re_xxxxxxxx
//        LEAD_NOTIFY_FROM="Ethereal Web Agency <leads@yourdomain.com>"
//   4. Leads will then also email ADMIN_EMAIL whenever someone submits the
//      contact form, in addition to always being saved in Firestore.

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export async function sendLeadNotification(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from = process.env.LEAD_NOTIFY_FROM || 'Ethereal Web Agency <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.warn(
      '[email] Skipping lead notification email: RESEND_API_KEY or ADMIN_EMAIL is not set. ' +
      'The lead was still saved to Firestore and is visible in the admin panel.'
    );
    return { sent: false, reason: 'not_configured' };
  }

  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <h2 style="margin:0 0 12px">New quote request</h2>
      <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Service:</strong> ${escapeHtml(lead.service)}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(lead.message).replace(/\n/g, '<br/>')}</p>
      <p style="color:#888;font-size:12px;margin-top:20px">Submitted from the Ethereal Web Agency contact form. View and manage all leads in the admin panel.</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: lead.email,
        subject: `New quote request — ${lead.name}`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[email] Resend API error:', res.status, body);
      return { sent: false, reason: 'api_error' };
    }

    return { sent: true };
  } catch (err) {
    console.error('[email] Failed to send lead notification:', err.message);
    return { sent: false, reason: 'network_error' };
  }
}
