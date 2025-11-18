export default function VoiceSnippet({domainName} : {domainName: string}) {
    const appUrl = "http://localhost:5173";
    const appOrigin = new URL(appUrl).origin;

    return `(function() {
    // Create iframe for voice bot
    const iframe = document.createElement("iframe");
    iframe.src = "${appUrl}/voice-bot?domain=${encodeURIComponent(domainName)}";
    iframe.className = "conversia-voice-iframe";
    iframe.style.position = "fixed";
    iframe.style.bottom = "40px";
    iframe.style.right = "40px";
    // Compact widget like a small card
    iframe.style.width = "320px";
    iframe.style.height = "150px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
    iframe.style.zIndex = "999999";
    iframe.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    document.body.appendChild(iframe);
  
    // Create floating toggle button
    const toggleButton = document.createElement("button");
    toggleButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
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
    toggleButton.style.transition = "all 0.3s ease";
    toggleButton.style.alignItems = "center";
    toggleButton.style.justifyContent = "center";
    toggleButton.style.display = "none";
    toggleButton.setAttribute("aria-label", "Open voice bot");
    // Add hover effect
    toggleButton.addEventListener("mouseenter", function() {
      this.style.transform = "scale(1.1)";
      this.style.backgroundColor = "#333333";
    });
    toggleButton.addEventListener("mouseleave", function() {
      this.style.transform = "scale(1)";
      this.style.backgroundColor = "#000000";
    });
    document.body.appendChild(toggleButton);
  
    // Toggle function
    function toggleVoiceBot() {
      if (iframe.style.display === "none" || iframe.style.display === "") {
        // Show voice bot
        iframe.style.display = "block";
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px) scale(0.95)";
        setTimeout(() => {
          iframe.style.opacity = "1";
          iframe.style.transform = "translateY(0) scale(1)";
        }, 10);
        toggleButton.style.display = "none";
      } else {
        // Hide voice bot
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px) scale(0.95)";
        setTimeout(() => {
          iframe.style.display = "none";
          toggleButton.style.display = "flex";
        }, 300);
      }
    }
    
    // Initially hide the toggle button since voice bot is visible
    toggleButton.style.display = "none";
  
    // Toggle button click handler
    toggleButton.addEventListener("click", toggleVoiceBot);
  
    // Handle close message from iframe
    const handleMessage = (e) => {
      const expectedOrigin = "${appOrigin}";
      
      // Handle close message
      if (e.data === "close-voicebot") {
        if (e.origin === expectedOrigin || e.origin === window.location.origin) {
          // Hide voice bot and show toggle button
          iframe.style.opacity = "0";
          iframe.style.transform = "translateY(20px)";
          setTimeout(() => {
            iframe.style.display = "none";
            toggleButton.style.display = "flex";
          }, 300);
        } else {
          console.warn("Close message origin mismatch:", e.origin);
          // Still allow close for development
          iframe.style.opacity = "0";
          iframe.style.transform = "translateY(20px)";
          setTimeout(() => {
            iframe.style.display = "none";
            toggleButton.style.display = "flex";
          }, 300);
        }
      }
    };
    
    window.addEventListener("message", handleMessage);
  })();`;
}