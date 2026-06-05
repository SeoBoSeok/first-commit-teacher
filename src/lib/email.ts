import { Resend } from "resend";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Spacekkabbi <onboarding@resend.dev>";

const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Send a transactional email.
 *
 * If RESEND_API_KEY isn't set (dev), prints the email to the server log
 * so the verification link is still copy-pasteable.
 */
export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<void> {
  if (!resend) {
    console.log("\n========== EMAIL (dev fallback — no RESEND_API_KEY) ==========");
    console.log("TO:     ", to);
    console.log("SUBJECT:", subject);
    console.log("BODY:");
    console.log(text);
    console.log("===============================================================\n");
    return;
  }
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

export function verificationEmail(opts: {
  nickname: string;
  verifyUrl: string;
}): { subject: string; html: string; text: string } {
  const { nickname, verifyUrl } = opts;
  const subject = "Confirm your transmission · Spacekkabbi";
  const text = [
    `★ SPACEKKABBI BROADCAST ★`,
    ``,
    `Hi ${nickname},`,
    ``,
    `Tune in by confirming this is your email address:`,
    ``,
    verifyUrl,
    ``,
    `This link expires in 24 hours.`,
    `If you didn't sign up, ignore this transmission.`,
    ``,
    `— Belt Standard`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { margin:0; padding:0; background:#08001E; color:#F4EEFF; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrap { max-width:560px; margin:0 auto; padding:32px 24px; }
    .card {
      background:linear-gradient(180deg,#150538,#08001E);
      border:1px solid rgba(82,240,255,0.4);
      border-radius:20px;
      padding:36px 28px;
    }
    .eyebrow { color:#52F0FF; font-size:11px; letter-spacing:0.35em; text-transform:uppercase; text-align:center; }
    h1 { margin:14px 0 6px; text-align:center; font-size:36px; letter-spacing:0.02em; text-transform:uppercase; color:#F4EEFF; }
    p { color:#E8DDFF; font-size:15px; line-height:1.6; margin:14px 0; }
    .btn {
      display:inline-block;
      padding:14px 28px;
      background:linear-gradient(135deg,#FF2BD6,#9D4DFF);
      color:#F4EEFF;
      text-decoration:none;
      border-radius:999px;
      font-size:12px;
      letter-spacing:0.22em;
      text-transform:uppercase;
      font-weight:700;
    }
    .center { text-align:center; }
    .small { font-size:11px; color:rgba(244,238,255,0.5); letter-spacing:0.18em; text-transform:uppercase; }
    .link { color:#52F0FF; word-break:break-all; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="eyebrow">★ Broadcast Tuning ★</div>
      <h1>Confirm your<br>transmission</h1>
      <p>Hi <strong>${escapeHtml(nickname)}</strong>,</p>
      <p>You're almost on the belt. Tap the button below to confirm this is your email and unlock sign-in.</p>
      <p class="center" style="margin:28px 0;">
        <a class="btn" href="${verifyUrl}">Confirm email →</a>
      </p>
      <p class="small center">This link expires in 24 hours.</p>
      <p class="small">If the button doesn't work, paste this URL into your browser:</p>
      <p class="link"><a href="${verifyUrl}" style="color:#52F0FF;">${verifyUrl}</a></p>
      <p class="small">If you didn't sign up, ignore this transmission.</p>
    </div>
    <p class="small center" style="margin-top:20px;">— Belt Standard</p>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ch === "&" ? "&amp;" :
    ch === "<" ? "&lt;" :
    ch === ">" ? "&gt;" :
    ch === '"' ? "&quot;" :
    "&#39;"
  );
}
