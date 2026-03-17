@echo off
cd /d "%~dp0"
echo =============================================
echo   X Scheduler Builder - セットアップ
echo =============================================
echo.

:: Node.js チェック
node --version >nul 2>&1
if %errorlevel% neq 0 (
  echo [エラー] Node.js が見つかりません。
  echo.
  echo Node.js 20 以上をインストールしてください:
  echo   https://nodejs.org/ja/
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo [OK] Node.js %NODE_VER% を検出しました
echo.

:: Chromium インストール
echo [1/1] Playwright 用 Chromium ブラウザをダウンロード中...
echo      （初回は数分かかります。しばらくお待ちください）
echo.
npx playwright install chromium
if %errorlevel% neq 0 (
  echo.
  echo [エラー] Chromium のインストールに失敗しました。
  echo ネットワーク接続を確認して、もう一度試してください。
  pause
  exit /b 1
)

echo.
echo =============================================
echo   セットアップ完了！
echo =============================================
echo.
echo 次のステップ:
echo   launch.vbs をダブルクリックして起動してください
echo   （GUI 画面で X にログインしてから使えるよ）
echo.
pause
