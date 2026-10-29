$root = Split-Path -Parent $PSScriptRoot
$ts = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupRoot = Join-Path $root '备份'
$target = Join-Path $backupRoot ("备份_" + $ts)
New-Item -ItemType Directory -Force -Path $target | Out-Null

$db = Join-Path $root 'prisma\dev.db'
if (Test-Path -LiteralPath $db) {
  Copy-Item -LiteralPath $db -Destination $target -Force
}
foreach ($suffix in @('-journal', '-wal', '-shm')) {
  $side = "$db$suffix"
  if (Test-Path -LiteralPath $side) {
    Copy-Item -LiteralPath $side -Destination $target -Force
  }
}

$uploads = Join-Path $root 'uploads'
if (Test-Path -LiteralPath $uploads) {
  Copy-Item -LiteralPath $uploads -Destination (Join-Path $target 'uploads') -Recurse -Force
}

Write-Host ''
Write-Host "备份完成：$target"
Write-Host '包含：数据库文件、上传的教案与题目图片。'
Write-Host '提示：建议先关闭服务再备份；恢复时把备份内容放回原位置即可。'
