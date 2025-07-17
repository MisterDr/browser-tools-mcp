/**
 * Browser Tools MCP Injection Script
 * Use this script to inject the browser tools client into any website
 */

(function() {
  'use strict';

  // Check if already injected
  if (window.BrowserToolsClient) {
    console.log('Browser Tools MCP Client already injected');
    return;
  }

  // Configuration - adjust these URLs as needed
  const BROWSER_TOOLS_CLIENT_URL = 'http://localhost:8080/browser-tools-client.js';
  const FALLBACK_SCRIPT_URL = './browser-tools-client.js'; // Local fallback

  function injectBrowserToolsClient() {
    console.log('Injecting Browser Tools MCP Client...');
    
    const script = document.createElement('script');
    script.src = BROWSER_TOOLS_CLIENT_URL;
    script.type = 'text/javascript';
    
    script.onload = function() {
      console.log('Browser Tools MCP Client injected successfully');
      
      // Wait for initialization
      setTimeout(() => {
        if (window.BrowserToolsClient) {
          const status = window.BrowserToolsClient.getConnectionStatus();
          console.log('Browser Tools MCP Client status:', status);
        }
      }, 1000);
    };
    
    script.onerror = function() {
      console.warn('Failed to load from server, trying local fallback...');
      
      // Try local fallback
      const fallbackScript = document.createElement('script');
      fallbackScript.src = FALLBACK_SCRIPT_URL;
      fallbackScript.type = 'text/javascript';
      
      fallbackScript.onload = function() {
        console.log('Browser Tools MCP Client loaded from fallback');
      };
      
      fallbackScript.onerror = function() {
        console.error('Failed to load Browser Tools MCP Client from both sources');
      };
      
      document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
  }

  // Inject immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBrowserToolsClient);
  } else {
    injectBrowserToolsClient();
  }

  // Expose injection status
  window.BrowserToolsInjected = true;
})();

// Console helper for manual injection
console.log('Browser Tools MCP Injection Script loaded. Use BrowserToolsInjected to check status.');