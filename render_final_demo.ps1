$inputFile = "C:\Users\yathaarth bhardwaj\Desktop\project\demo-maker\ProjectTrack_Epic_Demo.mp4"
$frame = "mac_frame.png"
$outputFile = "ProjectTrack_Cinematic_Auto_Demo.mp4"
$font = "C\:\\Windows\\Fonts\\arialbd.ttf"

Remove-Item -ErrorAction SilentlyContinue $outputFile

# Get the exact duration of the input video to prevent infinite loop
$durationStr = (ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $inputFile)
# Parse string to double
$duration = [math]::Round([double]$durationStr, 2)

$filter = "[0:v]scale=1920:1080,boxblur=60:10,eq=brightness=-0.15[bg];" +
          "[0:v]scale=1600:900[screen];" +
          "[bg][screen]overlay=160:115[withscreen];" +
          "[1:v]format=rgba[frame];" +
          "[withscreen][frame]overlay=0:0[withmac];" +
          "[withmac]drawtext=fontfile='$font':text='Meet ProjectTrack':fontcolor=white:fontsize=85:x=(w-text_w)/2:y=80:alpha='if(lt(t,0.5),0,if(lt(t,3),1,if(lt(t,4),4-t,0)))'[txt1];" +
          "[txt1]drawtext=fontfile='$font':text='Everything in one place':fontcolor=white:fontsize=85:x=(w-text_w)/2:y=80:alpha='if(lt(t,4.5),0,if(lt(t,7),1,if(lt(t,8),8-t,0)))'[txt2];" +
          "[txt2]drawtext=fontfile='$font':text='wizariyo.github.io/project-track':fontcolor=white:fontsize=85:x=(w-text_w)/2:y=80:alpha='if(lt(t,8.5),0,1)'[outv]"

Write-Host "Rendering Cinematic Auto Demo (Duration: $duration seconds)..."
ffmpeg -y -i $inputFile -loop 1 -i $frame -filter_complex $filter -map "[outv]" -t $duration -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -an $outputFile
Write-Host "Done!"
