$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

function Stop-WithMessage($message) {
  Write-Host $message -ForegroundColor Red
  Read-Host '按回车键退出'
  exit 1
}

function Test-App {
  foreach ($base in @('http://127.0.0.1:3000', 'http://localhost:3000')) {
    try {
      $r = Invoke-RestMethod "$base/api/health" -TimeoutSec 5
      if ($r.status -eq 'ok') {
        return $true
      }
    } catch {
    }
  }
  return $false
}

function Test-Port {
  try {
    return [bool](Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)
  } catch {
    return $false
  }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Stop-WithMessage '没有检测到 Node.js，请先安装 Node.js 22 或更高版本。'
}

if (Test-App) {
  Write-Host '服务已经在运行，正在打开浏览器...'
  Start-Process 'http://localhost:3000'
  Start-Sleep -Seconds 2
  exit 0
}

if (Test-Port) {
  Write-Host '检测到 3000 端口已被占用，但服务没有正常响应。' -ForegroundColor Yellow
  Write-Host '请先关闭旧的「家教工作台服务」窗口，或重启电脑后再试。'
  Read-Host '按回车键退出'
  exit 1
}

if (-not (Test-Path -LiteralPath (Join-Path $root 'node_modules'))) {
  Write-Host '首次运行，正在安装依赖，可能需要几分钟...'
  & npm install
  if ($LASTEXITCODE -ne 0) {
    Stop-WithMessage '依赖安装失败，请检查网络后重试。'
  }
}

Write-Host '正在初始化数据库...'
& npm run db:push
if ($LASTEXITCODE -ne 0) {
  Stop-WithMessage '数据库初始化失败。'
}

& npm run db:seed
if ($LASTEXITCODE -ne 0) {
  Stop-WithMessage '评价体系初始化失败。'
}

$nextDir = Join-Path $root '.next'
if ((Test-Path -LiteralPath $nextDir) -and $nextDir.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
  Remove-Item -LiteralPath $nextDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host '正在启动服务，请稍候...'
$serverCommand = "title 家教工作台服务 & cd /d `"$root`" & npm run dev"
Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', $serverCommand -WorkingDirectory $root -WindowStyle Normal

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  if (Test-App) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 1
}

if (-not $ready) {
  Write-Host '服务启动超时，请查看「家教工作台服务」窗口中的错误信息。' -ForegroundColor Red
  Read-Host '按回车键退出'
  exit 1
}

Start-Process 'http://localhost:3000'
Write-Host ''
Write-Host '浏览器已打开。关闭「家教工作台服务」窗口即可停止服务。'
Start-Sleep -Seconds 3
exit 0
