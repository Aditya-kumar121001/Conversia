// widget.js — self-contained chat widget with styled UI
(function () {
  const script = document.currentScript;
  const domain = (script && script.getAttribute('data-domain')) || 'Conversia';

  // Prevent double-insert
  if (document.getElementById('cw-root')) return;

  // Styles
  const css = `
  /* Container */
  #cw-root { position: fixed; right: 20px; bottom: 20px; width: 440px; max-width: calc(100% - 28px); height: 640px; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 40px rgba(2,6,23,0.22); font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; z-index: 2147483000; display: flex; flex-direction: column; background: #fff; }
  /* Header */
#cw-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: black;       /* themeColor */
  color: var(--cw-contrast);         /* auto contrast */
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* green pulse indicator */
#cw-online {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  animation: cw-pulse 1.4s infinite ease-in-out;
  flex: 0 0 auto;
}

/* title (domain + Bot) */
#cw-title {
  font-size: 15px;
  font-weight: 600;
  color: white;
}

/* small "online" tag */
#cw-status {
  font-size: 12px;
  border-radius: 4px;
  background: var(--cw-theme);
  color: white;
  opacity: 0.9;
}

/* close button */
#cw-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--cw-contrast);
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  opacity: 0.7;
}
#cw-close:hover {
  background: rgba(0,0,0,0.08);
  opacity: 1;
}

/* pulse animation */
@keyframes cw-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
  70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}

  /* Body */
  #cw-body { flex:1; padding:18px; background: linear-gradient(180deg,#fbfdff,#f7f8fb); overflow:auto; display:flex; flex-direction:column; gap:12px; }
  .cw-row { display:flex; gap:10px; align-items:flex-end; }
  .cw-avatar { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#7c3aed,#06b6d4); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; flex:0 0 auto; box-shadow:0 4px 14px rgba(2,6,23,0.06); }
  .cw-bubble { max-width:78%; padding:12px 14px; border-radius:14px; box-shadow:0 6px 18px rgba(2,6,23,0.04); font-size:14px; line-height:1.35; color:#111827; background:#fff; }
  .cw-bubble.user { background:#000; color:#fff; border-radius:18px; align-self:flex-end; box-shadow: 0 6px 18px rgba(2,6,23,0.12); }
  /* Footer / input */
  #cw-footer { padding:12px; background:#fff; border-top: 1px solid rgba(15,23,42,0.04); display:flex; gap:10px; align-items:center; }
  #cw-input { flex:1; padding:10px 14px; border-radius:999px; border:1px solid rgba(15,23,42,0.06); outline:none; font-size:14px; background:#fff; }
  #cw-send { background:#000; color:#fff; border:none; padding:10px 14px; border-radius:999px; cursor:pointer; font-weight:600; }
  #cw-send:active { transform: translateY(1px); }
  /* small screens */
  @media (max-width:520px) {
    #cw-root { right:12px; left:12px; bottom:12px; width:auto; height:72vh; }
  }
  `;

  const style = document.createElement('style');
  style.id = 'cw-styles';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // Root
  const root = document.createElement('div');
  root.id = 'cw-root';
  root.style.display = 'none'; // start hidden
  root.innerHTML = `
    <div id="cw-header">
      <div id="cw-online" aria-hidden="true"></div>
      <div style="display:flex;flex-direction:column;">
        <div id="cw-title">${escapeHtml(domain)} Bot</div>
        <div id="cw-status">online</div>
      </div>
      <button id="cw-close" aria-label="Close chat">&times;</button>
    </div>

    <div id="cw-body" role="log" aria-live="polite">
      <!-- sample messages inserted by JS -->
    </div>

    <div id="cw-footer">
      <input id="cw-input" type="text" aria-label="Type a message" placeholder="Type a message..." />
      <button id="cw-send" aria-label="Send message">Send</button>
    </div>
  `;
  document.body.appendChild(root);

  // Floating toggle button
  const fab = document.createElement('button');
  fab.id = 'cw-fab';
  fab.setAttribute('aria-label', `${domain} chat`);
  fab.style.cssText = 'position:fixed;right:20px;bottom:20px;width:58px;height:58px;border-radius:50%;background:#111827;color:#fff;border:none;display:flex;align-items:center;justify-content:center;z-index:2147483001;box-shadow:0 8px 30px rgba(2,6,23,0.18);cursor:pointer;font-size:22px';
  fab.innerHTML = '💬';
  document.body.appendChild(fab);

  // Elements
  const bodyEl = document.getElementById('cw-body');
  const inputEl = document.getElementById('cw-input');
  const sendBtn = document.getElementById('cw-send');
  const closeBtn = document.getElementById('cw-close');

  // sample messages
  const sampleMessages = [
    { from: 'bot', text: `Hi there! I'm ${domain} — how can I help you today?` },
  ];

  // helper: escape html
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }

  // render a message
  function renderMsg(msg) {
    const row = document.createElement('div');
    row.className = 'cw-row';
    if (msg.from === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'cw-avatar';
      avatar.textContent = 'V'; // placeholder logo/initial
      const bubble = document.createElement('div');
      bubble.className = 'cw-bubble bot';
      bubble.innerHTML = escapeHtml(msg.text);
      row.appendChild(avatar);
      row.appendChild(bubble);
    } else {
      const bubble = document.createElement('div');
      bubble.className = 'cw-bubble user';
      bubble.innerHTML = escapeHtml(msg.text);
      row.style.justifyContent = 'flex-end';
      row.appendChild(bubble);
    }
    bodyEl.appendChild(row);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  // initial render
  sampleMessages.forEach(m => renderMsg(m));

  // show/hide logic
  function openWidget() {
    root.style.display = 'flex';
    fab.style.display = 'none';
  }
  function closeWidget() {
    root.style.display = 'none';
    fab.style.display = 'flex';
  }

  fab.addEventListener('click', openWidget);
  closeBtn.addEventListener('click', closeWidget);

  // render a user message (right side)
function addUserMessage(text) {
  const body = document.getElementById("cw-body");

  const row = document.createElement("div");
  row.className = "cw-row";
  row.style.justifyContent = "flex-end";

  const bubble = document.createElement("div");
  bubble.className = "cw-bubble user";
  bubble.innerHTML = escapeHtml(text);

  row.appendChild(bubble);
  body.appendChild(row);
  scrollToBottom();
}

// render a bot message (left side)
function addBotMessage(text) {
  const body = document.getElementById("cw-body");

  const row = document.createElement("div");
  row.className = "cw-row";

  const avatar = document.createElement("div");
  avatar.className = "cw-avatar";
  avatar.textContent = "V";

  const bubble = document.createElement("div");
  bubble.className = "cw-bubble bot";
  bubble.innerHTML = escapeHtml(text);

  row.appendChild(avatar);
  row.appendChild(bubble);
  body.appendChild(row);
  scrollToBottom();
}

// thinking indicator
function showThinking() {
  let existing = document.getElementById("cw-thinking");
  if (existing) return;

  const body = document.getElementById("cw-body");

  const row = document.createElement("div");
  row.id = "cw-thinking";
  row.className = "cw-row";

  row.innerHTML = `
    <div class="cw-avatar">V</div>
    <div class="cw-bubble bot">
      <div class="thinking-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  body.appendChild(row);
  scrollToBottom();
}

function hideThinking() {
  const el = document.getElementById("cw-thinking");
  if (el) el.remove();
}

function scrollToBottom() {
  const box = document.getElementById("cw-body");
  box.scrollTop = box.scrollHeight;
}

// ---------- FIXED SEND HANDLER ---------- //

async function handleSend() {
  const msg = inputEl.value.trim();
  if (!msg) return;

  inputEl.value = "";

  addUserMessage(msg);      // show user bubble
  showThinking();           // show typing bubble

  try {
    // Show "...", then replace with final reply when resolved
    const thinkingBubble = document.getElementById("cw-thinking");
    if (thinkingBubble) {
      const bubble = thinkingBubble.querySelector(".cw-bubble.bot");
      if (bubble) bubble.innerHTML = '...';
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = {
      reply: `Mocked reply: You said "${msg}"`
    };
    

    hideThinking();
    addBotMessage(data.reply);

  } catch (err) {
    hideThinking();
    addBotMessage("Oops! Something went wrong.");
  }
}

// bind events
sendBtn.addEventListener("click", handleSend);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSend();
});
})();
