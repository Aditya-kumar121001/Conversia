"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitlistEmailHTML = waitlistEmailHTML;
function waitlistEmailHTML(email) {
    return `
    <html>
    <body style="
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
        background:#f9fafb;
        padding:24px;
        color:#111827;
    ">

        <div style="
        max-width:520px;
        margin:auto;
        background:#ffffff;
        border-radius:10px;
        padding:28px;
        box-shadow:0 1px 2px rgba(0,0,0,0.04);
        line-height:1.6;
        font-size:15px;
        ">

        <!-- Logo -->
        <div style="margin-bottom:22px;">
            <img
            src="C:\Users\iamad\Documents\GitHub\Conversia\frontend\public\conversiaLogo.svg"
            alt="Conversia.ai"
            style="height:32px; width:auto; display:block;"
            />
        </div>

        <p style="margin:0 0 14px 0;">Hi,</p>

        <p style="margin:0 0 14px 0;">
            Thanks for joining the <b>Conversia.ai</b> waitlist with
            <b>${escapeHTML(email)}</b>.
        </p>

        <p style="margin:0 0 14px 0; color:#374151;">
            We're currently rolling out access in small batches while we
            improve reliability and performance.
        </p>

        <p style="margin:0 0 20px 0;">
            We'll email you as soon as your account is ready.
        </p>

        <p style="margin-top:28px;">
            — Team Conversia.ai
        </p>

        <hr style="
            border:none;
            border-top:1px solid #e5e7eb;
            margin:28px 0;
        " />

        <p style="
            font-size:12px;
            color:#6b7280;
            margin:0;
        ">
            If you didn’t request this, you can safely ignore this email.
        </p>

        </div>

    </body>
    </html>

  `;
}
function escapeHTML(s) {
    return s.replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}
//# sourceMappingURL=waitlistMail.js.map