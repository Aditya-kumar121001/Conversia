export default function ChatSnippet({domainName} : {domainName: string} ) {
    const appUrl = "http://localhost:5173";
    const imageOrigin = "Image/URL"
  
    return `  
      <script 
        src=${appUrl} 
        data-domain=${domainName} 
        avatar=${imageOrigin} 
      defer>
      </script>
    `;
}