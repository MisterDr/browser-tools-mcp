# BrowserTools MCP

> Make your AI tools 10x more aware and capable of interacting with your browser

This application is a powerful browser monitoring and interaction tool that enables AI-powered applications via Anthropic's Model Context Protocol (MCP) to capture and analyze browser data through a Chrome extension.

Read our [docs](https://browsertools.agentdesk.ai/) for the full installation, quickstart and contribution guides.

## Roadmap

Check out our project roadmap here: [Github Roadmap / Project Board](https://github.com/orgs/AgentDeskAI/projects/1/views/1)

## Updates
v1.4.2 is out! Here's a comprehensive breakdown of the latest updates:

### 🚀 New Features in v1.4.2:
- **Standalone Browser Client**: Added standalone JavaScript library for direct site injection
- **Enhanced Connection Resilience**: Implemented robust retry logic and connection health monitoring
- **CSP-Safe Script Execution**: Bypassed Content Security Policy restrictions for script execution
- **Auto-Reconnection System**: Automatic reconnection on page refresh and navigation
- **Ping/Pong Heartbeat**: Server-side connection health monitoring with heartbeat system
- **Improved Error Handling**: Enhanced error reporting and graceful degradation
- **Multi-tier Screenshot Support**: Hybrid screenshot approach with fallback methods

### 🔧 Stability Improvements in v1.4.2:
**Why we added the standalone script version:**
- **Chrome Extension Reliability Issues**: Chrome extensions have inherent stability problems with DevTools context, connection drops, and lifecycle management
- **CSP Blocking**: Content Security Policy restrictions were blocking script execution in many websites
- **Connection Instability**: Frequent disconnections required constant extension reloads
- **DevTools Dependency**: Extension only worked when DevTools panel was open

**Solution - Standalone Browser Client:**
- **Direct Site Injection**: Runs as native page JavaScript, eliminating extension context issues
- **No CSP Restrictions**: Full access to page context with eval() capabilities
- **Automatic Reconnection**: Survives page refreshes, navigation, and tab changes
- **Production Ready**: Can be deployed to any website for permanent integration
- **100% Reliable**: Eliminates all Chrome extension stability issues

### 🚀 New Features in v1.4.1:
- **Base64 Image response**: Added Base64 encoded image response

v1.4.0 is out! Here's a comprehensive breakdown of the latest updates:

### 🚀 New Features in v1.4.0:
- **Dynamic JavaScript Execution**: Added `runScript` MCP tool for executing custom JavaScript code in the browser
- **Page Refresh Control**: Added `refreshPage` MCP tool for programmatic page refreshing
- **Enhanced Server Identity**: Improved server version reporting and identity validation
- **Extended MCP Capabilities**: Expanded the range of browser interactions available to AI tools

### 🚀 New Features in v1.3.0:
- **Configurable screenshot save path** – the `takeScreenshot` MCP tool now accepts an optional `path` parameter so you can store PNGs anywhere (e.g. `await tools.takeScreenshot({ path: "F:/screens/home.png" })`).
- **Works with DevTools closed** – a background WebSocket handler in the Chrome extension lets you capture screenshots even after you close or undock the BrowserTools panel.
- Misc. merge-conflict clean-ups and stability improvements.

### 🔧 Previous Features (v1.2.0):
- You can now enable "Allow Auto-Paste into Cursor" within the DevTools panel. Screenshots will be automatically pasted into Cursor (just make sure to focus/click into the Agent input field in Cursor, otherwise it won't work!)
- Integrated a suite of SEO, performance, accessibility, and best practice analysis tools via Lighthouse
- Implemented a NextJS specific prompt used to improve SEO for a NextJS application
- Added Debugger Mode as a tool which executes all debugging tools in a particular sequence, along with a prompt to improve reasoning
- Added Audit Mode as a tool to execute all auditing tools in a particular sequence
- Resolved Windows connectivity issues
- Improved networking between BrowserTools server, extension and MCP server with host/port auto-discovery, auto-reconnect, and graceful shutdown mechanisms
- Added ability to more easily exit out of the Browser Tools server with Ctrl+C

## 🚀 Detailed New Features in v1.4.0

### Dynamic JavaScript Execution (`runScript`)
Execute any custom JavaScript code directly in the browser context and get results back. Perfect for:
- **DOM Analysis**: Query elements, extract data, analyze page structure
- **Accessibility Testing**: Find elements with specific attributes (tabindex, aria-labels, etc.)
- **Data Extraction**: Extract form data, product information, user details
- **Page Interaction**: Simulate user actions, test functionality
- **Development Debugging**: Execute diagnostic scripts, check variables

**Example Usage:**
```javascript
// Find all elements with tabindex other than "0"
Array.from(document.querySelectorAll('[tabindex]')).filter(el => el.getAttribute('tabindex') !== '0')

// Get all form inputs and their values
Array.from(document.querySelectorAll('input')).map(input => ({name: input.name, value: input.value}))

// Extract all links from the page
Array.from(document.querySelectorAll('a')).map(link => ({text: link.textContent, href: link.href}))
```

### Page Refresh Control (`refreshPage`)
Programmatically refresh the current browser page without manual intervention. Useful for:
- **Automated Testing**: Refresh pages between test scenarios
- **Development Workflows**: Auto-refresh after code changes
- **State Reset**: Clear browser state and reload content
- **Cache Busting**: Force reload of updated resources

### Enhanced Architecture
- **Improved Server Identity**: Better version tracking and validation
- **Robust Error Handling**: Enhanced error reporting and recovery
- **WebSocket Reliability**: More stable communication between components
- **Extension Context Management**: Better handling of Chrome extension lifecycle

## Quickstart Guide

There are three components to run this MCP tool:

1. Install our chrome extension from here: [v1.4.2 BrowserToolsMCP Chrome Extension](https://github.com/AgentDeskAI/browser-tools-mcp/releases/download/v1.4.2/BrowserTools-1.4.2-extension.zip)
2. Install the MCP server from this command within your IDE: `npx @agentdeskai/browser-tools-mcp@latest`
3. Open a new terminal and run this command: `npx @agentdeskai/browser-tools-server@latest`

**Alternative: Standalone Browser Client (v1.4.2)**
For enhanced stability, you can use the standalone browser client instead of the Chrome extension:
1. Include the standalone script in your website: `<script src="browser-tools-client.js"></script>`
2. Or inject it dynamically: `<script src="inject-browser-tools.js"></script>`
3. This approach eliminates extension reliability issues and works on any website

* Different IDEs have different configs but this command is generally a good starting point; please reference your IDEs docs for the proper config setup

IMPORTANT TIP - there are two servers you need to install. There's...
- browser-tools-server (local nodejs server that's a middleware for gathering logs)
and
- browser-tools-mcp (MCP server that you install into your IDE that communicates w/ the extension + browser-tools-server)

`npx @agentdeskai/browser-tools-mcp@latest` is what you put into your IDE
`npx @agentdeskai/browser-tools-server@latest` is what you run in a new terminal window

After those three steps, open up your chrome dev tools and then the BrowserToolsMCP panel.

If you're still having issues try these steps:
- Quit / close down your browser. Not just the window but all of Chrome itself. 
- Restart the local node server (browser-tools-server)
- Make sure you only have ONE instance of chrome dev tools panel open

After that, it should work but if it doesn't let me know and I can share some more steps to gather logs/info about the issue!

If you have any questions or issues, feel free to open an issue ticket! And if you have any ideas to make this better, feel free to reach out or open an issue ticket with an enhancement tag or reach out to me at [@tedx_ai on x](https://x.com/tedx_ai)

## Full Update Notes:

Coding agents like Cursor can run these audits against the current page seamlessly. By leveraging Puppeteer and the Lighthouse npm library, BrowserTools MCP can now:

- Evaluate pages for WCAG compliance
- Identify performance bottlenecks
- Flag on-page SEO issues
- Check adherence to web development best practices
- Review NextJS specific issues with SEO

...all without leaving your IDE 🎉

---

## 🔑 Key Additions

| Audit Type         | Description                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Accessibility**  | WCAG-compliant checks for color contrast, missing alt text, keyboard navigation traps, ARIA attributes, and more.                        |
| **Performance**    | Lighthouse-driven analysis of render-blocking resources, excessive DOM size, unoptimized images, and other factors affecting page speed. |
| **SEO**            | Evaluates on-page SEO factors (like metadata, headings, and link structure) and suggests improvements for better search visibility.      |
| **Best Practices** | Checks for general best practices in web development.                                                                                    |
| **NextJS Audit**   | Injects a prompt used to perform a NextJS audit.                                                                                         |
| **Audit Mode**     | Runs all auditing tools in a sequence.                                                                                                   |
| **Debugger Mode**  | Runs all debugging tools in a sequence.                                                                                                  |

---

## 🛠️ Using Audit Tools

### ✅ **Before You Start**

Ensure you have:

- An **active tab** in your browser
- The **BrowserTools extension enabled**

### ▶️ **Running Audits**

**Headless Browser Automation**:  
 Puppeteer automates a headless Chrome instance to load the page and collect audit data, ensuring accurate results even for SPAs or content loaded via JavaScript.

The headless browser instance remains active for **60 seconds** after the last audit call to efficiently handle consecutive audit requests.

**Structured Results**:  
 Each audit returns results in a structured JSON format, including overall scores and detailed issue lists. This makes it easy for MCP-compatible clients to interpret the findings and present actionable insights.

The MCP server provides tools to run audits on the current page. Here are example queries you can use to trigger them:

#### Accessibility Audit (`runAccessibilityAudit`)

Ensures the page meets accessibility standards like WCAG.

> **Example Queries:**
>
> - "Are there any accessibility issues on this page?"
> - "Run an accessibility audit."
> - "Check if this page meets WCAG standards."

#### Performance Audit (`runPerformanceAudit`)

Identifies performance bottlenecks and loading issues.

> **Example Queries:**
>
> - "Why is this page loading so slowly?"
> - "Check the performance of this page."
> - "Run a performance audit."

#### SEO Audit (`runSEOAudit`)

Evaluates how well the page is optimized for search engines.

> **Example Queries:**
>
> - "How can I improve SEO for this page?"
> - "Run an SEO audit."
> - "Check SEO on this page."

#### Best Practices Audit (`runBestPracticesAudit`)

Checks for general best practices in web development.

> **Example Queries:**
>
> - "Run a best practices audit."
> - "Check best practices on this page."
> - "Are there any best practices issues on this page?"

#### Audit Mode (`runAuditMode`)

Runs all audits in a particular sequence. Will run a NextJS audit if the framework is detected.

> **Example Queries:**
>
> - "Run audit mode."
> - "Enter audit mode."

#### NextJS Audits (`runNextJSAudit`)

Checks for best practices and SEO improvements for NextJS applications

> **Example Queries:**
>
> - "Run a NextJS audit."
> - "Run a NextJS audit, I'm using app router."
> - "Run a NextJS audit, I'm using page router."

#### Debugger Mode (`runDebuggerMode`)

Runs all debugging tools in a particular sequence

> **Example Queries:**
>
> - "Enter debugger mode."

## Architecture

There are three core components all used to capture and analyze browser data:

1. **Chrome Extension**: A browser extension that captures screenshots, console logs, network activity and DOM elements.
2. **Node Server**: An intermediary server that facilitates communication between the Chrome extension and any instance of an MCP server.
3. **MCP Server**: A Model Context Protocol server that provides standardized tools for AI clients to interact with the browser.

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│  MCP Client │ ──► │  MCP Server  │ ──► │  Node Server  │ ──► │   Chrome    │
│  (e.g.      │ ◄── │  (Protocol   │ ◄── │ (Middleware)  │ ◄── │  Extension  │
│   Cursor)   │     │   Handler)   │     │               │     │             │
└─────────────┘     └──────────────┘     └───────────────┘     └─────────────┘
```

Model Context Protocol (MCP) is a capability supported by Anthropic AI models that
allow you to create custom tools for any compatible client. MCP clients like Claude
Desktop, Cursor, Cline or Zed can run an MCP server which "teaches" these clients
about a new tool that they can use.

These tools can call out to external APIs but in our case, **all logs are stored locally** on your machine and NEVER sent out to any third-party service or API. BrowserTools MCP runs a local instance of a NodeJS API server which communicates with the BrowserTools Chrome Extension.

All consumers of the BrowserTools MCP Server interface with the same NodeJS API and Chrome extension.

#### Chrome Extension

- Monitors XHR requests/responses and console logs
- Tracks selected DOM elements
- Sends all logs and current element to the BrowserTools Connector
- Connects to Websocket server to capture/send screenshots
- Allows user to configure token/truncation limits + screenshot folder path

#### Node Server

- Acts as middleware between the Chrome extension and MCP server
- Receives logs and currently selected element from Chrome extension
- Processes requests from MCP server to capture logs, screenshot or current element
- Sends Websocket command to the Chrome extension for capturing a screenshot
- Intelligently truncates strings and # of duplicate objects in logs to avoid token limits
- Removes cookies and sensitive headers to avoid sending to LLMs in MCP clients

#### MCP Server

- Implements the Model Context Protocol
- Provides standardized tools for AI clients
- Compatible with various MCP clients (Cursor, Cline, Zed, Claude Desktop, etc.)

## Installation

Installation steps can be found in our documentation:

- [BrowserTools MCP Docs](https://browsertools.agentdesk.ai/)

## Usage

Once installed and configured, the system allows any compatible MCP client to:

- Monitor browser console output
- Capture network traffic
- Take screenshots
- Analyze selected elements
- Wipe logs stored in our MCP server
- Run accessibility, performance, SEO, and best practices audits

## Compatibility

- Works with any MCP-compatible client
- Primarily designed for Cursor IDE integration
- Supports other AI editors and MCP clients
