@echo off
cd /d "%~dp0"
echo ?????????...
echo.

where python >nul 2>&1 && (
  echo ??: http://localhost:8080
  echo ? Ctrl+C ??
  python -m http.server 8080
  goto :done
)

where py >nul 2>&1 && (
  echo ??: http://localhost:8080
  echo ? Ctrl+C ??
  py -m http.server 8080
  goto :done
)

where node >nul 2>&1 && (
  echo ??: http://localhost:8080
  echo ? Ctrl+C ??
  npx --yes serve -p 8080 .
  goto :done
)

echo ???? Python ? Node.js?
echo ??? Python ?????? VS Code / Cursor ?? Live Server ?? index.html?
pause

:done
