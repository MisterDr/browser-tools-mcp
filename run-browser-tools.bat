@echo off
setlocal

REM Choose which method to use (1 for NPX, 0 for direct paths)
set USE_NPX=1

if %USE_NPX%==1 (
    echo Using NPX to run the servers...
    
    echo Starting Browser Tools Server...
    start "Browser Tools Server" cmd /c npx @agentdeskai/browser-tools-server
    
    echo Waiting for server to initialize...
    timeout /t 2 /nobreak > nul
    
    echo Starting Browser Tools MCP...
    start "Browser Tools MCP" cmd /c npx @agentdeskai/browser-tools-mcp@1.1.0
) else (
    echo Using direct paths to run the servers...
    
    set NODE_PATH="C:\Program Files\nodejs\node.exe"
    set SERVER_JS_PATH="F:\Projects\MCP-Servers\browser-tools-mcp\browser-tools-server\dist\browser-connector.js"
    set MCP_JS_PATH="F:\Projects\MCP-Servers\browser-tools-mcp\browser-tools-mcp\dist\mcp-server.js"
    
    REM Verify that the paths exist
    if not exist %NODE_PATH% (
        echo Error: Node.js executable not found at %NODE_PATH%
        echo Please update the script with the correct path to node.exe
        pause
        exit /b 1
    )
    
    if not exist %SERVER_JS_PATH% (
        echo Error: Browser Tools Server JavaScript file not found at %SERVER_JS_PATH%
        echo Please update the script with the correct path
        pause
        exit /b 1
    )
    
    if not exist %MCP_JS_PATH% (
        echo Error: Browser Tools MCP JavaScript file not found at %MCP_JS_PATH%
        echo Please update the script with the correct path
        pause
        exit /b 1
    )
    
    echo Starting Browser Tools Server...
    start "Browser Tools Server" cmd /c %NODE_PATH% %SERVER_JS_PATH%
    
    echo Waiting for server to initialize...
    timeout /t 2 /nobreak > nul
    
    echo Starting Browser Tools MCP...
    start "Browser Tools MCP" cmd /c %NODE_PATH% %MCP_JS_PATH%
)

echo Both servers are now running!
echo Close the command windows to stop the servers.
echo.
echo Press any key to exit this window...
pause > nul 