# =============================================
# X Scheduler Builder - 配布用 ZIP 作成スクリプト
# 使い方: PowerShell から .\build_zip.ps1 を実行
# =============================================

$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$version = "1.0.0"
$outZip  = Join-Path $root "x-scheduler-v$version.zip"
$tmpDir  = Join-Path $env:TEMP "x-scheduler-dist-$version"

Set-Location $root

# ── Step 1: TypeScript ビルド ──────────────────────────────────────────────
Write-Host ""
Write-Host "[1/4] TypeScript をビルド中..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "[エラー] ビルドに失敗しました" -ForegroundColor Red
  exit 1
}

# ── Step 2: 一時ディレクトリ準備 ──────────────────────────────────────────
Write-Host "[2/4] 一時ディレクトリを準備中..." -ForegroundColor Cyan
if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }
New-Item -ItemType Directory -Path $tmpDir | Out-Null

# コピーするファイル・フォルダ
$items = @(
  "dist",
  "launch.bat",
  "launch.vbs",
  "setup.bat",
  "README.md",
  "DISCLAIMER.md",
  "LICENSE",
  "posts.md",
  "schedule_config.example.json",
  "package.json",
  "package-lock.json"
)
foreach ($item in $items) {
  $src = Join-Path $root $item
  $dst = Join-Path $tmpDir $item
  if (Test-Path $src -PathType Container) {
    Copy-Item -Path $src -Destination $dst -Recurse
  } elseif (Test-Path $src) {
    Copy-Item -Path $src -Destination $dst
  } else {
    Write-Host "  [スキップ] $item (見つかりません)" -ForegroundColor Yellow
  }
}

# ── Step 3: runtime 依存のみインストール ──────────────────────────────────
Write-Host "[3/4] runtime 依存パッケージをインストール中..." -ForegroundColor Cyan
Set-Location $tmpDir
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) {
  Write-Host "[エラー] npm ci に失敗しました" -ForegroundColor Red
  Set-Location $root
  exit 1
}
# 配布に不要なファイルを削除
Remove-Item (Join-Path $tmpDir "package.json")    -ErrorAction SilentlyContinue
Remove-Item (Join-Path $tmpDir "package-lock.json") -ErrorAction SilentlyContinue

# ── Step 4: ZIP 作成 ───────────────────────────────────────────────────────
Set-Location $root
Write-Host "[4/4] ZIP ファイルを作成中..." -ForegroundColor Cyan
if (Test-Path $outZip) { Remove-Item $outZip }
Compress-Archive -Path "$tmpDir\*" -DestinationPath $outZip -CompressionLevel Optimal

# 後片付け
Remove-Item $tmpDir -Recurse -Force

# ── 完了 ──────────────────────────────────────────────────────────────────
$sizeMB = [math]::Round((Get-Item $outZip).Length / 1MB, 1)
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  完了！" -ForegroundColor Green
Write-Host "  出力: $outZip" -ForegroundColor Green
Write-Host "  サイズ: $sizeMB MB" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
