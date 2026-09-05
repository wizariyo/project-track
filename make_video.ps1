$font = "C\:\\Windows\\Fonts\\arialbd.ttf" # Using Arial Bold as fallback for Inter

# Generate Scene 1 (Dark Teal, Cream Text)
ffmpeg -y -f lavfi -i color=c=0x17433f:s=1920x1080:d=5 -vf "drawtext=fontfile='$font':text='Tracking college projects is a nightmare.':fontcolor=0xf2ede4:fontsize=80:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,1),0,if(lt(t,4),1,0))'" -c:v libx264 -t 5 scene1.mp4

# Generate Scene 2 (Dark Teal, Cream Text)
ffmpeg -y -f lavfi -i color=c=0x17433f:s=1920x1080:d=5 -vf "drawtext=fontfile='$font':text='Missed deadlines. Lost files. Free-riders.':fontcolor=0xf2ede4:fontsize=80:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,1),0,if(lt(t,4),1,0))'" -c:v libx264 -t 5 scene2.mp4

# Generate Scene 3 (Light Mint, Dark Teal Text)
ffmpeg -y -f lavfi -i color=c=0xd5e6e3:s=1920x1080:d=5 -vf "drawtext=fontfile='$font':text='Meet ProjectTrack.':fontcolor=0x17433f:fontsize=120:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,1),0,if(lt(t,4),1,0))'" -c:v libx264 -t 5 scene3.mp4

# Generate Scene 4 (Light Mint, Dark Teal Text)
ffmpeg -y -f lavfi -i color=c=0xd5e6e3:s=1920x1080:d=5 -vf "drawtext=fontfile='$font':text='Zero-latency Kanban & Deliverable Tracking.':fontcolor=0x17433f:fontsize=75:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,1),0,if(lt(t,4),1,0))'" -c:v libx264 -t 5 scene4.mp4

# Generate Scene 5 (Cream, Dark Teal Text)
ffmpeg -y -f lavfi -i color=c=0xf2ede4:s=1920x1080:d=5 -vf "drawtext=fontfile='$font':text='Anonymous Peer Reviews. No more free-riders.':fontcolor=0x17433f:fontsize=75:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,1),0,if(lt(t,4),1,0))'" -c:v libx264 -t 5 scene5.mp4

# Generate Scene 6 (Cream, Dark Teal Text)
ffmpeg -y -f lavfi -i color=c=0xf2ede4:s=1920x1080:d=5 -vf "drawtext=fontfile='$font':text='wizariyo.github.io/project-track':fontcolor=0x17433f:fontsize=90:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,1),0,if(lt(t,4),1,0))'" -c:v libx264 -t 5 scene6.mp4

# Create concat list
"file 'scene1.mp4'`nfile 'scene2.mp4'`nfile 'scene3.mp4'`nfile 'scene4.mp4'`nfile 'scene5.mp4'`nfile 'scene6.mp4'" | Out-File list.txt -Encoding ascii

# Concatenate all scenes
ffmpeg -y -f concat -safe 0 -i list.txt -c copy projecttrack_promo.mp4

# Clean up
Remove-Item scene1.mp4, scene2.mp4, scene3.mp4, scene4.mp4, scene5.mp4, scene6.mp4, list.txt
Write-Host "Video generated successfully at projecttrack_promo.mp4"
