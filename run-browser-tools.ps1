# Run Browser Tools MCP and Server
# This script runs both the Browser Tools MCP server and the Browser Tools Server

# Choose which method to use
$useNpx = $true  # Set to $false to use direct paths instead of NPX

# Full paths to the node executable and JavaScript files (used if $useNpx = $false)
$nodePath = "C:\Program Files\nodejs\node.exe"
$serverJsPath = "F:\Projects\MCP-Servers\browser-tools-mcp\browser-tools-server\dist\browser-connector.js"
$mcpJsPath = "F:\Projects\MCP-Servers\browser-tools-mcp\browser-tools-mcp\dist\mcp-server.js"

if ($useNpx) {
    Write-Host "Using NPX to run the servers..." -ForegroundColor Cyan
    
    Write-Host "Starting Browser Tools Server..." -ForegroundColor Green
    $serverJob = Start-Job -ScriptBlock {
        cmd /c npx @agentdeskai/browser-tools-server
    }
    
    # Wait a moment for the server to initialize
    Start-Sleep -Seconds 2
    
    Write-Host "Starting Browser Tools MCP..." -ForegroundColor Green
    $mcpJob = Start-Job -ScriptBlock {
        cmd /c npx @agentdeskai/browser-tools-mcp@1.1.0
    }
} else {
    Write-Host "Using direct paths to run the servers..." -ForegroundColor Cyan
    
    # Verify that the paths exist
    if (-not (Test-Path $nodePath)) {
        Write-Host "Error: Node.js executable not found at $nodePath" -ForegroundColor Red
        Write-Host "Please update the script with the correct path to node.exe" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $serverJsPath)) {
        Write-Host "Error: Browser Tools Server JavaScript file not found at $serverJsPath" -ForegroundColor Red
        Write-Host "Please update the script with the correct path" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $mcpJsPath)) {
        Write-Host "Error: Browser Tools MCP JavaScript file not found at $mcpJsPath" -ForegroundColor Red
        Write-Host "Please update the script with the correct path" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Starting Browser Tools Server..." -ForegroundColor Green
    $serverJob = Start-Job -ScriptBlock {
        param($nodePath, $serverJsPath)
        & "$nodePath" "$serverJsPath"
    } -ArgumentList $nodePath, $serverJsPath
    
    # Wait a moment for the server to initialize
    Start-Sleep -Seconds 2
    
    Write-Host "Starting Browser Tools MCP..." -ForegroundColor Green
    $mcpJob = Start-Job -ScriptBlock {
        param($nodePath, $mcpJsPath)
        & "$nodePath" "$mcpJsPath"
    } -ArgumentList $nodePath, $mcpJsPath
}

Write-Host "Both servers are now running!" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

try {
    # Show output from both jobs in real-time
    while ($true) {
        Receive-Job -Job $serverJob
        Receive-Job -Job $mcpJob
        Start-Sleep -Seconds 1
    }
}
finally {
    # Clean up jobs when script is terminated
    Stop-Job -Job $serverJob
    Stop-Job -Job $mcpJob
    Remove-Job -Job $serverJob
    Remove-Job -Job $mcpJob
    Write-Host "Servers stopped." -ForegroundColor Red
} 