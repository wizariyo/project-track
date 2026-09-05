$inputFile = "C:\Users\yathaarth bhardwaj\Desktop\Recording 2026-08-26 113138.mp4"
$frame = "mac_frame.png"
$outputFile = "ProjectTrack_Ultimate_Promo.mp4"
$font = "C\:\\Windows\\Fonts\\arialbd.ttf"

Remove-Item -ErrorAction SilentlyContinue $outputFile

$filter = "[0:v]trim=0:35,setpts=PTS-STARTPTS[vid];" +
          "[vid]scale=1920:1080,boxblur=60:10,eq=brightness=-0.15[bg];" +
          "[vid]scale=1600:900[screen];" +
          "[bg][screen]overlay=160:115[withscreen];" +
          "[1:v]format=rgba[frame];" +
          "[withscreen][frame]overlay=0:0[withmac];" +
          "[withmac]drawtext=fontfile='$font':text='Meet ProjectTrack':fontcolor=white:fontsize=85:x=(w-text_w)/2:y=80:alpha='if(lt(t,1),0,if(lt(t,5),1,if(lt(t,6),6-t,0)))'[txt1];" +
          "[txt1]drawtext=fontfile='$font':text='A Powerful Space for Teachers':fontcolor=white:fontsize=85:x=(w-text_w)/2:y=80:alpha='if(lt(t,7),0,if(lt(t,12),1,if(lt(t,13),13-t,0)))'[txt2];" +
          "[txt2]drawtext=fontfile='$font':text='Zero-Latency Workspaces':fontcolor=white:fontsize=85:x=(w-text_w)/2:y=80:alpha='if(lt(t,14),0,if(lt(t,19),1,if(lt(t,20),20-t,0)))'[txt3];" +
          "[txt3]drawtext=fontfile='$font':text='wizariyo.github.io/project-track':fontcolor=white:fontsize=85:x=(w-text_w)/2:y=80:alpha='if(lt(t,21),0,if(lt(t,33),1,if(lt(t,34),34-t,0)))'[txt4];" +
          "[txt4]fade=t=in:st=0:d=1,fade=t=out:st=34:d=1[outv]"

Write-Host "Rendering Ultimate Safari Frame Video..."
ffmpeg -y -i $inputFile -loop 1 -i $frame -filter_complex $filter -map "[outv]" -t 35 -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 -an $outputFile
Write-Host "Done!"
