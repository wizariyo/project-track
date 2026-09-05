$font = "C\:\\Windows\\Fonts\\arialbd.ttf" # Fallback font

# Delete old files if they exist
Remove-Item -ErrorAction SilentlyContinue part*.mp4
Remove-Item -ErrorAction SilentlyContinue projecttrack_animated_demo.mp4
Remove-Item -ErrorAction SilentlyContinue list2.txt

# 1. Title Sequence (Teal)
ffmpeg -y -f lavfi -i color=c=0x17433f:s=1920x1080:d=4 -vf "drawtext=fontfile='$font':text='Manage College Projects like a Pro.':fontcolor=0xf2ede4:fontsize=80:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,0.5),0,if(lt(t,3.5),1,0))'" -c:v libx264 -pix_fmt yuv420p -t 4 part1.mp4

# 2. Login Screen (Pan Down effect)
ffmpeg -y -loop 1 -i shot1_login.png -t 4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -c:v libx264 -pix_fmt yuv420p -t 4 part2.mp4

# 3. Title Sequence (Mint)
ffmpeg -y -f lavfi -i color=c=0xd5e6e3:s=1920x1080:d=4 -vf "drawtext=fontfile='$font':text='Powerful Teacher Dashboard.':fontcolor=0x17433f:fontsize=90:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,0.5),0,if(lt(t,3.5),1,0))'" -c:v libx264 -pix_fmt yuv420p -t 4 part3.mp4

# 4. Teacher Dashboard (Zoom in effect)
ffmpeg -y -loop 1 -i shot2_teacher.png -t 4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -c:v libx264 -pix_fmt yuv420p -t 4 part4.mp4

# 5. Title Sequence (Cream)
ffmpeg -y -f lavfi -i color=c=0xf2ede4:s=1920x1080:d=4 -vf "drawtext=fontfile='$font':text='Zero-Latency Student Workspace.':fontcolor=0x17433f:fontsize=90:x='(w-text_w)/2':y='(h-text_h)/2':alpha='if(lt(t,0.5),0,if(lt(t,3.5),1,0))'" -c:v libx264 -pix_fmt yuv420p -t 4 part5.mp4

# 6. Student Dashboard
ffmpeg -y -loop 1 -i shot3_student.png -t 4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -c:v libx264 -pix_fmt yuv420p -t 4 part6.mp4

# 7. Outro (Teal)
ffmpeg -y -f lavfi -i color=c=0x17433f:s=1920x1080:d=4 -vf "drawtext=fontfile='$font':text='Try ProjectTrack Today':fontcolor=0xf2ede4:fontsize=100:x='(w-text_w)/2':y='(h-text_h)/2'-50,drawtext=fontfile='$font':text='wizariyo.github.io/project-track':fontcolor=0xd5e6e3:fontsize=60:x='(w-text_w)/2':y='(h-text_h)/2'+50" -c:v libx264 -pix_fmt yuv420p -t 4 part7.mp4

# Concatenate all parts safely
"file 'part1.mp4'`nfile 'part2.mp4'`nfile 'part3.mp4'`nfile 'part4.mp4'`nfile 'part5.mp4'`nfile 'part6.mp4'`nfile 'part7.mp4'" | Out-File list2.txt -Encoding ascii
ffmpeg -y -f concat -safe 0 -i list2.txt -c copy projecttrack_animated_demo.mp4

Write-Host "Animated UI Video successfully created with fixed encoding!"
