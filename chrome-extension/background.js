// Listen for messages from the devtools panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_SCREENSHOT" && message.tabId) {
    // Get the inspected window's tab
    chrome.tabs.get(message.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting tab:", chrome.runtime.lastError);
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }

      // Get all windows to find the one containing our tab
      chrome.windows.getAll({ populate: true }, (windows) => {
        const targetWindow = windows.find(w =>
          w.tabs.some(t => t.id === message.tabId)
        );

        if (!targetWindow) {
          console.error("Could not find window containing the inspected tab");
          sendResponse({
            success: false,
            error: "Could not find window containing the inspected tab"
          });
          return;
        }

        // Capture screenshot of the window containing our tab
        chrome.tabs.captureVisibleTab(targetWindow.id, { format: "png" }, (dataUrl) => {
          // Ignore DevTools panel capture error if it occurs
          if (chrome.runtime.lastError &&
              !chrome.runtime.lastError.message.includes("devtools://")) {
            console.error("Error capturing screenshot:", chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          // Send screenshot data to browser connector
          fetch("http://127.0.0.1:3025/screenshot", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: dataUrl,
              path: message.screenshotPath,
            }),
          })
            .then((response) => response.json())
            .then((result) => {
              if (result.error) {
                console.error("Error from server:", result.error);
                sendResponse({ success: false, error: result.error });
              } else {
                console.log("Screenshot saved successfully:", result.path);
                // Send success response even if DevTools capture failed
                sendResponse({
                  success: true,
                  path: result.path,
                  title: tab.title || "Current Tab"
                });
              }
            })
            .catch((error) => {
              console.error("Error sending screenshot data:", error);
              sendResponse({
                success: false,
                error: error.message || "Failed to save screenshot",
              });
            });
        });
      });
    });
    return true; // Required to use sendResponse asynchronously
  }
});

// ----------------------------
// New: WebSocket handler to accept remote screenshot commands even when DevTools is closed
// ----------------------------

const WS_URL = "ws://localhost:3025/extension-ws";
let bgWs = null;
let bgWsReconnectTimeout = null;
const BG_WS_RECONNECT_DELAY = 5000; // 5 seconds

function setupBackgroundWebSocket() {
  if (bgWs) {
    try {
      bgWs.close();
    } catch (e) {
      // ignore
    }
  }

  bgWs = new WebSocket(WS_URL);

  bgWs.onopen = () => {
    console.log("Background WS connected");
    if (bgWsReconnectTimeout) {
      clearTimeout(bgWsReconnectTimeout);
      bgWsReconnectTimeout = null;
    }
  };

  bgWs.onmessage = (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (e) {
      console.error("Background WS received invalid JSON", e);
      return;
    }

    if (message.type === "take-screenshot") {
      handleBackgroundScreenshot(message);
    }
  };

  bgWs.onclose = () => {
    console.log("Background WS disconnected, retrying in 5s...");
    bgWsReconnectTimeout = setTimeout(setupBackgroundWebSocket, BG_WS_RECONNECT_DELAY);
  };

  bgWs.onerror = (err) => {
    console.error("Background WS error", err);
  };
}

function handleBackgroundScreenshot(message) {
  // Step 1: find the real page tab (ignore devtools://, chrome://, etc.)
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      bgWs.send(
        JSON.stringify({
          type: "screenshot-error",
          error: chrome.runtime.lastError.message,
          requestId: message.requestId,
        })
      );
      return;
    }

    const targetTab = tabs.find((t) => /^(https?|file):\/\//.test(t.url));

    if (!targetTab) {
      bgWs.send(
        JSON.stringify({
          type: "screenshot-error",
          error: "No suitable tab found for screenshot",
          requestId: message.requestId,
        })
      );
      return;
    }

    chrome.tabs.captureVisibleTab(
      targetTab.windowId,
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          bgWs.send(
            JSON.stringify({
              type: "screenshot-error",
              error: chrome.runtime.lastError.message,
              requestId: message.requestId,
            })
          );
          return;
        }

        bgWs.send(
          JSON.stringify({
            type: "screenshot-data",
            data: dataUrl,
            requestId: message.requestId,
          })
        );
      }
    );
  });
}

// Initialize WebSocket connection when the service worker starts
setupBackgroundWebSocket();
