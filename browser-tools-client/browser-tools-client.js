/**
 * Browser Tools MCP Client Library
 * Standalone script for direct site injection
 * Provides WebSocket connection to browser-tools-server with auto-reconnection
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    WS_URL: 'ws://localhost:3025/extension-ws',
    HEARTBEAT_INTERVAL: 20000,
    MAX_HEARTBEAT_FAILURES: 3,
    WS_RECONNECT_DELAY: 2000,
    MAX_RECONNECT_ATTEMPTS: 10,
    SCRIPT_TIMEOUT: 15000
  };

  // Global state
  let ws = null;
  let heartbeatInterval = null;
  let heartbeatFailures = 0;
  let reconnectAttempts = 0;
  let isConnecting = false;
  let pendingScriptCallbacks = new Map();

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBrowserTools);
  } else {
    initializeBrowserTools();
  }

  function initializeBrowserTools() {
    console.log('Browser Tools MCP Client: Initializing...');
    setupWebSocket();
    setupPageHandlers();
  }

  function setupWebSocket() {
    if (isConnecting) {
      console.log('Browser Tools: Connection attempt already in progress');
      return;
    }

    isConnecting = true;
    console.log(`Browser Tools: Connecting to ${CONFIG.WS_URL}...`);

    try {
      ws = new WebSocket(CONFIG.WS_URL);
      
      ws.onopen = function(event) {
        console.log('Browser Tools: WebSocket connected');
        isConnecting = false;
        reconnectAttempts = 0;
        heartbeatFailures = 0;
        startHeartbeat();
        
        // Send initial page info
        sendPageInfo();
      };

      ws.onmessage = function(event) {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Browser Tools: Error parsing message:', error);
        }
      };

      ws.onclose = function(event) {
        console.log('Browser Tools: WebSocket closed:', event.code, event.reason);
        isConnecting = false;
        stopHeartbeat();
        
        // Auto-reconnect if not intentional
        if (event.code !== 1000 && reconnectAttempts < CONFIG.MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Browser Tools: Reconnecting... (${reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS})`);
          setTimeout(setupWebSocket, CONFIG.WS_RECONNECT_DELAY);
        }
      };

      ws.onerror = function(error) {
        console.error('Browser Tools: WebSocket error:', error);
        isConnecting = false;
      };

    } catch (error) {
      console.error('Browser Tools: Failed to create WebSocket:', error);
      isConnecting = false;
    }
  }

  function handleMessage(message) {
    console.log('Browser Tools: Received message:', message.type);

    switch (message.type) {
      case 'heartbeat-response':
        heartbeatFailures = 0;
        break;

      case 'ping':
        sendPong();
        break;

      case 'take-screenshot':
        handleScreenshot(message);
        break;

      case 'refresh-page':
        handleRefreshPage(message);
        break;

      case 'run-script':
        handleRunScript(message);
        break;

      case 'get-current-url':
        handleGetCurrentUrl(message);
        break;

      case 'server-shutdown':
        console.log('Browser Tools: Server shutting down');
        if (ws) {
          ws.close(1000, 'Server shutdown');
        }
        break;

      default:
        console.log('Browser Tools: Unknown message type:', message.type);
    }
  }

  function sendPong() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: Date.now()
      }));
    }
  }

  function startHeartbeat() {
    stopHeartbeat();
    
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }));
        
        heartbeatFailures++;
        if (heartbeatFailures >= CONFIG.MAX_HEARTBEAT_FAILURES) {
          console.log('Browser Tools: Too many heartbeat failures, reconnecting...');
          ws.close();
        }
      }
    }, CONFIG.HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  function sendPageInfo() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'page-navigated',
        url: window.location.href,
        title: document.title,
        timestamp: Date.now()
      }));
    }
  }

  function handleScreenshot(message) {
    console.log('Browser Tools: Screenshot request received');
    
    // Try to use Chrome extension if available
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
      console.log('Browser Tools: Attempting to use Chrome extension for screenshot');
      
      try {
        window.chrome.runtime.sendMessage(
          'browser-tools-extension-id', // Would need actual extension ID
          {
            type: 'take-screenshot',
            requestId: message.requestId
          },
          function(response) {
            if (chrome.runtime.lastError) {
              console.log('Browser Tools: Chrome extension not available, trying canvas method');
              tryCanvasScreenshot(message);
            } else {
              console.log('Browser Tools: Screenshot handled by extension', response);
            }
          }
        );
      } catch (error) {
        console.log('Browser Tools: Chrome extension communication failed, trying canvas method');
        tryCanvasScreenshot(message);
      }
    } else {
      console.log('Browser Tools: Chrome extension not available, trying canvas method');
      tryCanvasScreenshot(message);
    }
  }

  function tryCanvasScreenshot(message) {
    // Attempt canvas-based screenshot (limited to visible viewport)
    try {
      console.log('Browser Tools: Attempting canvas screenshot');
      
      // Use html2canvas library if available
      if (typeof html2canvas !== 'undefined') {
        html2canvas(document.body).then(canvas => {
          const dataURL = canvas.toDataURL('image/png');
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'screenshot-data',
              data: dataURL.split(',')[1], // Remove data:image/png;base64, prefix
              requestId: message.requestId
            }));
          }
        }).catch(error => {
          sendScreenshotError(message.requestId, `Canvas screenshot failed: ${error.message}`);
        });
      } else {
        // Fallback: Try basic canvas capture of visible area
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // This is very limited - just captures a white rectangle
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('Screenshot capture limited in page context', 50, 50);
        ctx.fillText('Consider using Chrome extension for full screenshots', 50, 80);
        
        const dataURL = canvas.toDataURL('image/png');
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'screenshot-data',
            data: dataURL.split(',')[1],
            requestId: message.requestId
          }));
        }
      }
    } catch (error) {
      sendScreenshotError(message.requestId, `Canvas screenshot failed: ${error.message}`);
    }
  }

  function sendScreenshotError(requestId, errorMessage) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'screenshot-error',
        error: errorMessage,
        requestId: requestId
      }));
    }
  }

  function handleRefreshPage(message) {
    console.log('Browser Tools: Refresh page request');
    
    // Send response before refresh
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'refresh-page-response',
        success: true,
        requestId: message.requestId
      }));
    }
    
    // Refresh after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  function handleRunScript(message) {
    console.log('Browser Tools: Run script request:', message.script);
    
    const requestId = message.requestId;
    
    // Set timeout for script execution
    const timeoutId = setTimeout(() => {
      if (pendingScriptCallbacks.has(requestId)) {
        pendingScriptCallbacks.delete(requestId);
        sendScriptError(requestId, 'Script execution timed out');
      }
    }, CONFIG.SCRIPT_TIMEOUT);
    
    // Store callback info
    pendingScriptCallbacks.set(requestId, { timeoutId });
    
    try {
      // Execute script directly in page context (no CSP issues)
      const result = executeScriptSafely(message.script);
      
      // Clear timeout
      clearTimeout(timeoutId);
      pendingScriptCallbacks.delete(requestId);
      
      // Send success response
      sendScriptSuccess(requestId, result);
      
    } catch (error) {
      console.error('Browser Tools: Script execution error:', error);
      
      // Clear timeout
      clearTimeout(timeoutId);
      pendingScriptCallbacks.delete(requestId);
      
      // Send error response
      sendScriptError(requestId, error.message);
    }
  }

  function executeScriptSafely(scriptCode) {
    // Direct execution in page context - no CSP restrictions
    try {
      // Use eval in page context (not blocked since we're in the page)
      return eval(scriptCode);
    } catch (error) {
      // Try Function constructor as fallback
      try {
        const fn = new Function('return (' + scriptCode + ')');
        return fn();
      } catch (fnError) {
        throw new Error(`Script execution failed: ${fnError.message}`);
      }
    }
  }

  function sendScriptSuccess(requestId, result) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'script-result',
        result: result,
        requestId: requestId
      }));
    }
  }

  function sendScriptError(requestId, errorMessage) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'script-error',
        error: errorMessage,
        requestId: requestId
      }));
    }
  }

  function handleGetCurrentUrl(message) {
    console.log('Browser Tools: Get current URL request');
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'current-url-response',
        url: window.location.href,
        requestId: message.requestId
      }));
    }
  }

  function setupPageHandlers() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        // Reconnect if needed when page becomes visible
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          console.log('Browser Tools: Page visible, checking connection...');
          setupWebSocket();
        }
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', function() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Page unloading');
      }
    });

    // Handle page navigation (for SPAs)
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function() {
        originalPushState.apply(window.history, arguments);
        setTimeout(sendPageInfo, 100);
      };
      
      window.history.replaceState = function() {
        originalReplaceState.apply(window.history, arguments);
        setTimeout(sendPageInfo, 100);
      };
    }

    // Handle popstate for back/forward navigation
    window.addEventListener('popstate', function() {
      setTimeout(sendPageInfo, 100);
    });
  }

  // Expose global interface for debugging
  window.BrowserToolsClient = {
    getConnectionStatus: function() {
      return {
        connected: ws && ws.readyState === WebSocket.OPEN,
        reconnectAttempts: reconnectAttempts,
        heartbeatFailures: heartbeatFailures
      };
    },
    
    reconnect: function() {
      if (ws) {
        ws.close();
      }
      setupWebSocket();
    },
    
    executeScript: function(script) {
      return executeScriptSafely(script);
    }
  };

  console.log('Browser Tools MCP Client: Initialized');
})();