@echo off
echo ===================================================
echo 1. Extracting best clips from raw demo...
echo ===================================================
cd /d "C:\Users\yathaarth bhardwaj\Desktop\project\demo-maker"
ffmpeg -y -i ProjectTrack_Epic_Demo.mp4 -ss 00:00:46 -t 00:00:10 -c:v copy clip_teacher.mp4 -loglevel error
ffmpeg -y -i ProjectTrack_Epic_Demo.mp4 -ss 00:01:10 -t 00:00:10 -c:v copy clip_student.mp4 -loglevel error

echo.
echo ===================================================
echo 2. Recording Apple-Style Promo Ad...
echo ===================================================
node auto_apple_ad.js

echo.
echo ===================================================
echo DONE! Check 'ProjectTrack_Apple_Promo.mp4' in demo-maker folder!
pause
