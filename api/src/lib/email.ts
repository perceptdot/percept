/** Resend 내부 알림 (thunova0318@gmail.com) */
export async function sendInternalAlert(
  resendApiKey: string,
  subject: string,
  text: string
): Promise<void> {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "perceptdot <service@perceptdot.com>",
        to: ["thunova0318@gmail.com"],
        subject,
        text,
      }),
    });
  } catch (e) {
    console.error("Internal alert failed:", e);
  }
}

/** Resend로 API 키 이메일 발송 */
export async function sendApiKeyEmail(
  resendApiKey: string,
  to: string,
  apiKey: string,
  plan: "free" | "pro" | "team"
): Promise<{ ok: boolean; error?: string }> {
  const planLabel =
    plan === "team"  ? "Unlimited" :
    plan === "pro"   ? "Pro" :
                       "Free";

  const planQuota =
    plan === "free" ? "100 tiles / month" : "Unlimited tiles";

  const planColor = plan === "free" ? "#888" : "#ff1a3c";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#07000d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07000d;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- HEADER -->
        <tr><td style="padding:0 0 32px 0;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:10px;vertical-align:middle;">
                <img src="https://perceptdot.com/logo-email.png" width="32" height="32" alt="perceptdot" style="display:block;">
              </td>
              <td style="vertical-align:middle;">
                <span style="font-size:18px;font-weight:700;color:#f2f0f5;letter-spacing:-0.5px;">percept<span style="color:#ff1a3c;">dot</span></span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- TITLE -->
        <tr><td style="padding:0 0 8px 0;">
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#f2f0f5;line-height:1.3;">
            Your API key is ready 👁️
          </h1>
        </td></tr>
        <tr><td style="padding:0 0 28px 0;">
          <p style="margin:0;font-size:15px;color:#888;line-height:1.6;">
            Give your AI agent eyes. Connect perceptdot to Claude Code and start catching visual bugs automatically.
          </p>
        </td></tr>

        <!-- PLAN BADGE -->
        <tr><td style="padding:0 0 20px 0;">
          <span style="display:inline-block;background:${planColor}22;border:1px solid ${planColor}44;color:${planColor};font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;letter-spacing:0.5px;">
            ${planLabel.toUpperCase()} PLAN &nbsp;·&nbsp; ${planQuota}
          </span>
        </td></tr>

        <!-- API KEY BOX -->
        <tr><td style="padding:0 0 8px 0;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#888;letter-spacing:1px;text-transform:uppercase;">Your API Key</p>
          <div style="background:#160024;border:1px solid rgba(255,26,60,0.25);border-radius:8px;padding:16px 20px;">
            <code style="font-family:'Courier New',monospace;font-size:14px;color:#ff6080;word-break:break-all;letter-spacing:0.5px;">${apiKey}</code>
          </div>
          <p style="margin:8px 0 0;font-size:12px;color:#555;">Keep this key private. Don't commit it to public repos.</p>
        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="padding:28px 0;">
          <div style="height:1px;background:rgba(255,26,60,0.1);"></div>
        </td></tr>

        <!-- INSTALL STEP -->
        <tr><td style="padding:0 0 8px 0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#f2f0f5;">① Install the MCP server</p>
          <div style="background:#160024;border:1px solid rgba(255,26,60,0.15);border-radius:8px;padding:14px 16px;">
            <code style="font-family:'Courier New',monospace;font-size:12px;color:#ccc;">claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp</code>
          </div>
        </td></tr>

        <!-- USE STEP -->
        <tr><td style="padding:16px 0 0 0;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#f2f0f5;">② Ask Claude to check a site</p>
          <div style="background:#160024;border:1px solid rgba(255,26,60,0.15);border-radius:8px;padding:14px 16px;">
            <code style="font-family:'Courier New',monospace;font-size:12px;color:#ccc;">Check https://yoursite.com for visual bugs</code>
          </div>
        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="padding:28px 0;">
          <div style="height:1px;background:rgba(255,26,60,0.1);"></div>
        </td></tr>

        ${plan === "free" ? `
        <!-- FREE TIER NOTE -->
        <tr><td style="padding:0 0 28px 0;">
          <div style="background:#160024;border:1px solid rgba(255,26,60,0.2);border-radius:8px;padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#ff6080;">FREE PLAN — 100 tiles</p>
            <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
              100 tiles ready to use. After that, leave a quick feedback to unlock more.<br>
              1 tile = one 1280×1600px section of a page.
            </p>
          </div>
        </td></tr>
        ` : ""}

        <!-- CTA -->
        <tr><td style="padding:0 0 32px 0;" align="center">
          <a href="https://perceptdot.com" style="display:inline-block;background:#ff1a3c;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;">
            View Docs →
          </a>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding:24px 0 0 0;">
          <p style="margin:0;font-size:12px;color:#444;line-height:1.8;">
            perceptdot · AI Visual QA · <a href="https://perceptdot.com" style="color:#666;text-decoration:none;">perceptdot.com</a><br>
            Questions? <a href="mailto:service@perceptdot.com" style="color:#666;text-decoration:none;">service@perceptdot.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "perceptdot <service@perceptdot.com>",
        to: [to],
        subject: `[perceptdot] Your API Key — ${planLabel}`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Resend error ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
