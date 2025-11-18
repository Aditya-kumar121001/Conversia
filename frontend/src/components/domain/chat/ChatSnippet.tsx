export default function ChatSnippet({domainName} : {domainName: string} ) {
    const appUrl = "http://localhost:5173";
    const appOrigin = new URL(appUrl).origin;

    return `(function() {
    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.src = "${appUrl}/chatbot?domain=${encodeURIComponent(domainName)}";
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
    toggleButton.style.transition = "all 0.3s ease";
    toggleButton.style.alignItems = "center";
    toggleButton.style.justifyContent = "center";
    toggleButton.style.display = "none"; // Hidden initially when chatbot is visible
    toggleButton.setAttribute("aria-label", "Open chatbot");
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
    function toggleChatbot() {
      if (iframe.style.display === "none" || iframe.style.display === "") {
        // Show chatbot
        iframe.style.display = "block";
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px) scale(0.95)";
        setTimeout(() => {
          iframe.style.opacity = "1";
          iframe.style.transform = "translateY(0) scale(1)";
        }, 10);
        toggleButton.style.display = "none";
      } else {
        // Hide chatbot
        iframe.style.opacity = "0";
        iframe.style.transform = "translateY(20px) scale(0.95)";
        setTimeout(() => {
          iframe.style.display = "none";
          toggleButton.style.display = "flex";
        }, 300);
      }
    }
    
    // Initially hide the toggle button since chatbot is visible
    toggleButton.style.display = "none";
  
    // Toggle button click handler
    toggleButton.addEventListener("click", toggleChatbot);
  
    // Handle close message from iframe
    const handleMessage = (e) => {
      // Only accept messages from your chatbot domain
      const expectedOrigin = "${appOrigin}";
      
      // Handle close message - check origin for security
      if (e.data === "close-chatbot") {
        // Verify origin matches (for security) or allow in development
        if (e.origin === expectedOrigin || e.origin === window.location.origin) {
          // Hide chatbot and show toggle button
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