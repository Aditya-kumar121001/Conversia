(function () {
  const script = document.currentScript;
  const domain = (script && script.getAttribute('data-domain')) || 'Conversia';

  // Prevent double-insert
  if (document.getElementById('cw-root')) return;

  function getStoredEmail() {
    try {
      return localStorage.getItem('cw_email') || '';
    } catch (e) {
      return '';
    }
  }

  function setStoredEmail(email) {
    try {
      localStorage.setItem('cw_email', email);
    } catch (e) {}
  }

  // Styles
  const css = `
  #cw-root { position: fixed; right: 20px; bottom: 20px; width: 440px; max-width: calc(100% - 28px); height: 640px; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 40px rgba(2,6,23,0.22); font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; z-index: 2147483000; display: flex; flex-direction: column; background: #fff; }
  #cw-header { padding: 14px 16px; display: flex; align-items: center; gap: 12px; background: black; color: white; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  #cw-online { width: 10px; height: 10px; border-radius: 50%; background: #10b981; animation: cw-pulse 1.4s infinite ease-in-out; flex: 0 0 auto; }
  #cw-title { font-size: 15px; font-weight: 600; color: white; }
  #cw-status { font-size: 12px; border-radius: 4px; background: black; color: white; opacity: 0.9; }
  #cw-close { margin-left: auto; background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 6px; border-radius: 6px; opacity: 0.7; }
  #cw-close:hover { background: rgba(0,0,0,0.08); opacity: 1; }
  @keyframes cw-pulse { 0% { box-shadow: 0 0 0 0 rgba(12, 200, 65, 0.81); } 70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
  #cw-body { flex:1; padding:18px; background: linear-gradient(180deg,#fbfdff,#f7f8fb); overflow:auto; display:flex; flex-direction:column; gap:12px; }
  .cw-row { display:flex; gap:10px; align-items:flex-end; }
  .cw-avatar { width:36px; height:36px; border-radius:100%; display:flex; align-items:center; justify-content:center; font-weight:700; flex:0 0 auto; }
  .cw-bubble { max-width:78%; padding:12px 14px; border-radius:14px; box-shadow:0 6px 18px rgba(2,6,23,0.04); font-size:14px; line-height:1.35; color:#111827; background:#fff; }
  .cw-bubble.user { background:#000; color:#fff; border-radius:18px; align-self:flex-end; box-shadow: 0 6px 18px rgba(2,6,23,0.12); }
  #cw-footer { padding: 6px 8px; background:#fff; border-top: 1px solid rgba(15,23,42,0.04); display:flex; gap:10px; align-items:center; }
  #cw-input { flex:1; padding:8px 10px; border-radius:999px; border:1px solid rgba(15,23,42,0.06); outline:none; font-size:14px; background:#fff; }
  #cw-email-container { padding: 0 6px; padding-top: 2px; background:#fff; display:flex; gap:10px; align-items:center; }
  #cw-email { flex:1; padding:6px 8px; outline:none; font-size:14px; background:#fff; width:90%; border-width:0 0 1px 0; border-style:solid; border-color:rgba(15,23,42,0.06); }
  #cw-send { background:#000; color:#fff; border:none; padding:10px 14px; border-radius:999px; cursor:pointer; font-weight:600; }
  #cw-send:active { transform: translateY(1px); }
  @media (max-width:520px) { #cw-root { right:12px; left:12px; bottom:12px; width:auto; height:72vh; } }
  .thinking-dots { display:inline-flex; gap:4px; }
  .thinking-dots span { width:6px; height:6px; border-radius:50%; background:#9ca3af; animation:cw-dot 1s infinite ease-in-out; }
  .thinking-dots span:nth-child(2) { animation-delay: 0.15s; }
  .thinking-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes cw-dot { 0%, 80%, 100% { transform: scale(0.6); opacity:0.4; } 40% { transform: scale(1); opacity:1; } }
  `;

  const style = document.createElement('style');
  style.id = 'cw-styles';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // Root
  const root = document.createElement('div');
  root.id = 'cw-root';
  root.style.display = 'none';
  root.innerHTML = `
    <div id="cw-header">
      <div id="cw-online" aria-hidden="true"></div>
      <div style="display:flex;flex-direction:column;">
        <div id="cw-title">${escapeHtml(domain)} Bot</div>
        <div id="cw-status">online</div>
      </div>
      <button id="cw-close" aria-label="Close chat">&times;</button>
    </div>

    <div id="cw-body" role="log" aria-live="polite"></div>

    <div id="cw-email-container">
      <input id="cw-email" type="email" aria-label="Enter your email" placeholder="Enter your email..." />
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
  fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>`;
  document.body.appendChild(fab);

  // Elements
  const bodyEl = document.getElementById('cw-body');
  const inputEl = document.getElementById('cw-input');
  const sendBtn = document.getElementById('cw-send');
  const closeBtn = document.getElementById('cw-close');
  const emailInputEl = document.getElementById('cw-email');
  const emailContainer = document.getElementById('cw-email-container');

  // Email state
  let userEmail = getStoredEmail();
  if (userEmail) {
    emailInputEl.value = userEmail;
    emailContainer.style.display = 'none';
  }

  // Helpers
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function scrollToBottom() {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'cw-row';
    row.style.justifyContent = 'flex-end';

    const bubble = document.createElement('div');
    bubble.className = 'cw-bubble user';
    bubble.innerHTML = escapeHtml(text);

    row.appendChild(bubble);
    bodyEl.appendChild(row);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const row = document.createElement('div');
    row.className = 'cw-row';

    const avatar = document.createElement('div');
    avatar.className = 'cw-avatar';
    const img = document.createElement('img');
    img.src = 'https://avatar.iran.liara.run/public/job/operator/male';
    img.alt = 'Bot Avatar';
    img.style.width = '26px';
    img.style.height = '26px';
    img.style.borderRadius = '50%';
    avatar.appendChild(img);

    const bubble = document.createElement('div');
    bubble.className = 'cw-bubble bot';
    bubble.innerHTML = escapeHtml(text);

    row.appendChild(avatar);
    row.appendChild(bubble);
    bodyEl.appendChild(row);
    scrollToBottom();
  }

  function showThinking() {
    if (document.getElementById('cw-thinking')) return;

    const row = document.createElement('div');
    row.id = 'cw-thinking';
    row.className = 'cw-row';

    row.innerHTML = `
      <div class="cw-avatar">V</div>
      <div class="cw-bubble bot">
        <div class="thinking-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

    bodyEl.appendChild(row);
    scrollToBottom();
  }

  function hideThinking() {
    const el = document.getElementById('cw-thinking');
    if (el) el.remove();
  }

  // Initial welcome message
  addBotMessage(`Hi there! I'm ${escapeHtml(domain)} bot.\n\nHow can I help you today?`);

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

  emailInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const emailVal = emailInputEl.value.trim();
      if (!emailVal) return;
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!valid) return;
      userEmail = emailVal;
      setStoredEmail(userEmail);
      emailContainer.style.display = 'none';
      inputEl.focus();
    }
  });

  function cleanLLMText(text) {
    text = text.replace(/\*+/g, ""); 
    text = text.replace(/\*\*(.*?)\*\*/g, "$1");
    text = text.replace(/\*(.*?)\*/g, "$1");
    text = text.replace(/#+/g, "");
    text = text.replace(/<[^>]*>/g, "");
    text = text.replace(/\n\s*\n/g, "\n");
    text = text.replace(/\s+/g, " ").trim();
    return text;
  }

  function sanitizeForDisplay(text) {
    const safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  
    return safe;
  }

  function generateVisitorId() {
    // Try to re-use a visitorId from localStorage if available
    let visitorId = localStorage.getItem('cw_visitor_id');
    if (visitorId) return visitorId;
    // Otherwise, generate a new one (UUID v4, very simple version)
    visitorId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c =='x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('cw_visitor_id', visitorId);
    return visitorId;
  }

  fab.addEventListener('click', async function() {
    const visitorId = generateVisitorId();
    try {
      const response = await fetch(`http://localhost:3000/execution/chat/${domain}/session`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ visitorId: visitorId })
      });
      const data = await response.json();
      localStorage.setItem(data.sessionId)
      console.log('Session response:', data);
    } catch (e) {
      console.error('Failed to create session:', e);
    }
  });
  
  async function handleSend() {
    const emailVal = emailInputEl.value.trim();

    // enforce email once before first message
    if (!userEmail) {
      if (!emailVal) {
        emailInputEl.focus();
        return;
      }
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!valid) {
        emailInputEl.focus();
        return;
      }

      userEmail = emailVal;
      setStoredEmail(userEmail);
      emailContainer.style.display = 'none';
    }

    const msg = inputEl.value.trim();
    if (!msg) return;

    inputEl.value = '';
    addUserMessage(msg);
    showThinking();

    try {
      const thinkingBubble = document.getElementById('cw-thinking');
      if (thinkingBubble) {
        const bubble = thinkingBubble.querySelector('.cw-bubble.bot');
        if (bubble) bubble.innerHTML = '...';
      }

      let response;
      try {
        response = await fetch(`http://localhost:3000/execution/chat/${domain}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          // include email with the message
          body: JSON.stringify({ message: msg, email: userEmail, role: "bot"})
        });
      } finally {
        hideThinking();
      }

      const data = await response.json();
      console.log(data.message)
      const cleaned = sanitizeForDisplay(cleanLLMText(data.message));
      console.log(cleaned)
    
      addBotMessage(cleaned || 'No response received.');  

    } catch (err) {
      hideThinking();
      addBotMessage('Oops! Something went wrong.');
    }
  }

  // Bind events
  sendBtn.addEventListener('click', handleSend);  
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSend();
  });

})();
