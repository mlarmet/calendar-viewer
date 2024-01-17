@echo off

echo.
echo Build frontend...

cd frontend
call npm run build

:: Go back racine
cd ..

echo.
echo Clean backend dist...
:: /s = -r (all files in folder) /q = -y (no confirm)
rmdir /s /q .\backend\dist

echo.
echo Move frontend dist to backend...
:: /e = all folders even if empty /i create source if no exist ? /q = silent
xcopy /e /i /q .\frontend\dist .\backend\dist

echo.
echo Build finish