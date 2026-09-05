$inputFile = "C:\Users\yathaarth bhardwaj\Desktop\Recording 2026-08-26 113138.mp4"
$outputFile = "C:\Users\yathaarth bhardwaj\Desktop\project\ProjectTrack_Premium_Promo.mp4"
$font = "C\:\\Windows\\Fonts\\arialbd.ttf"

Remove-Item -ErrorAction SilentlyContinue $outputFile

# Create a highly polished SaaS style video:
# 1. Take the first 40 seconds of the recording.
# 2. Create a blurred, darkened background using the video itself (glassmorphism style).
# 3. Center the original video at 80% scale (1536x864).
# 4. Add dynamic fade-in/fade-out title typography at the top.
$filter = "[0:v]trim=0:40,setpts=PTS-STARTPTS,scale=1920:1080,boxblur=50:5,eq=brightness=-0.15[bg];" +
          "[0:v]trim=0:40,setpts=PTS-STARTPTS,scale=1536:864[fg];" +
          "[bg][fg]overlay=(W-w)/2:(H-h)/2[vid1];" +
          "[vid1]drawtext=fontfile='$font':text='Manage College Projects like a Pro':fontcolor=white:fontsize=70:x=(w-text_w)/2:y=80:alpha='if(lt(t,1),0,if(lt(t,4),1,if(lt(t,5),5-t,0)))'[vid2];" +
          "[vid2]drawtext=fontfile='$font':text='Zero-Latency Workspace':fontcolor=white:fontsize=70:x=(w-text_w)/2:y=80:alpha='if(lt(t,6),0,if(lt(t,10),1,if(lt(t,11),11-t,0)))'[vid3];" +
          "[vid3]drawtext=fontfile='$font':text='Anonymous Peer Reviews':fontcolor=white:fontsize=70:x=(w-text_w)/2:y=80:alpha='if(lt(t,12),0,if(lt(t,16),1,if(lt(t,17),17-t,0)))'[vid4];" +
          "[vid4]drawtext=fontfile='$font':text='wizariyo.github.io/project-track':fontcolor=white:fontsize=75:x=(w-text_w)/2:y=80:alpha='if(lt(t,18),0,if(lt(t,19),t-18,1))'[outv]"

Write-Host "Rendering High-Level Premium Video..."
ffmpeg -y -i $inputFile -filter_complex $filter -map "[outv]" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -an $outputFile
Write-Host "Done!"
