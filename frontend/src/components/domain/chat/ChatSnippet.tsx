export default function ChatSnippet({domainName} : {domainName: string} ) {
    const appUrl = "http://localhost:5173";
    //const appOrigin = new URL(appUrl).origin;

    return `(function () {
  function init() {
    // Generate or fetch visitorId
    function getVisitorId() {
      try {
        let vId = localStorage.getItem("conversia_visitor_id");
        if (!vId) {
          // crypto.randomUUID may not be available in older browsers
          vId = (crypto && crypto.randomUUID && crypto.randomUUID()) || ('v_' + Math.random().toString(36).slice(2));
          localStorage.setItem("conversia_visitor_id", vId);
        }
        return vId;
      } catch (err) {
        // fallback
        const fallback = 'v_' + Math.random().toString(36).slice(2);
        return fallback;
      }
    }

    const visitorId = getVisitorId();
    console.log("conversia visitorId:", visitorId);

    // Create iframe
    const iframe = document.createElement("iframe");
    // include visitorId properly in query string
    iframe.src = "http://localhost:5173/chatbot?domain=${domainName}&visitorId=" + encodeURIComponent(visitorId);
    iframe.className = "conversia-chat-iframe";
    iframe.style.position = "fixed";
    iframe.style.bottom = "40px";
    iframe.style.right = "40px";
    iframe.style.width = "420px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
    iframe.style.zIndex = "999999";
    iframe.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    // start hidden by default (you can change to "block" if you want open by default)
    iframe.style.display = "none";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    // Create floating toggle button
    const toggleButton = document.createElement("button");
    toggleButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    toggleButton.style.position = "fixed";
    toggleButton.style.bottom = "20px";
    toggleButton.style.right = "20px";
    toggleButton.style.width = "56px";
    toggleButton.style.height = "56px";
    toggleButton.style.borderRadius = "50%";
    toggleButton.style.backgroundColor = "#000000";
    toggleButton.style.color = "#ffffff";
    toggleButton.style.border = "none";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    toggleButton.style.zIndex = "999998";
    toggleButton.style.transition = "all 0.2s ease";
    // make it a flex container so svg centers
    toggleButton.style.display = "flex";
    toggleButton.style.alignItems = "center";
    toggleButton.style.justifyContent = "center";
    toggleButton.setAttribute("aria-label", "Open chatbot");

    // Hover effects
    toggleButton.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.07)";
      this.style.backgroundColor = "#222";
    });
    toggleButton.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
      this.style.backgroundColor = "#000";
    });

    document.body.appendChild(toggleButton);

    // Toggle function (show/hide iframe)
    function showChat() {
      iframe.style.display = "block";
      // ensure initial transform state for animation
      iframe.style.transform = "translateY(20px) scale(0.98)";
      // small timeout to allow transition
      requestAnimationFrame(() => {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0) scale(1)";
      });
      toggleButton.style.display = "none";
    }

    function hideChat() {
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px) scale(0.98)";
      setTimeout(() => {
        iframe.style.display = "none";
        toggleButton.style.display = "flex";
      }, 250);
    }

    function toggleChat() {
      if (iframe.style.display === "none" || iframe.style.display === "") {
        showChat();
      } else {
        hideChat();
      }
    }

    // Click handler
    toggleButton.addEventListener("click", toggleChat);

    // Optional: open chatbot automatically on first visit
    // if (!localStorage.getItem("conversia_seen")) { showChat(); localStorage.setItem("conversia_seen","1"); }

    // Listen for postMessage from iframe
    const handleMessage = (e) => {
      // accept messages from the iframe's origin (update in production)
      const expectedOrigin = "http://localhost:5173";
      // Example: close request
      if (e.data === "close-chatbot") {
        if (e.origin === expectedOrigin || e.origin === window.location.origin) {
          hideChat();
        } else {
          // dev fallback: still hide
          console.warn("close-chatbot from unexpected origin:", e.origin);
          hideChat();
        }
      }
      // Example: you may receive other messages like "minimize" or "open"
      if (e.data === "minimize-chatbot") {
        hideChat();
      }
      if (e.data === "open-chatbot") {
        showChat();
      }
    };

    window.addEventListener("message", handleMessage);
  } // end init

  // Ensure DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();`;
}