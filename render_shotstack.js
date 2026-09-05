const https = require('https');
const fs = require('fs');

const API_KEY = 'CoZKCpNYBEYhMIfSzRMUdOVwjO89d2UOlvSRHvRJ';
const ENDPOINT = 'api.shotstack.io';

const payload = {
  "timeline": {
    "background": "#17433f",
    "tracks": [
      {
        "clips": [
          // 1. Text Overlay on Login
          {
            "asset": {
              "type": "html",
              "html": "<div style='font-family:sans-serif; background:#f2ede4; padding:20px; border-radius:10px; color:#17433f; font-size:40px; font-weight:bold; text-align:center;'>Meet ProjectTrack</div>",
              "width": 600,
              "height": 100
            },
            "start": 4,
            "length": 4,
            "transition": { "in": "fade", "out": "fade" },
            "position": "center",
            "offset": { "x": 0, "y": -0.3 }
          },
          // 2. Text Overlay on Teacher Dashboard
          {
            "asset": {
              "type": "html",
              "html": "<div style='font-family:sans-serif; background:#17433f; padding:20px; border-radius:10px; color:#f2ede4; font-size:36px; font-weight:bold; text-align:center;'>Powerful Teacher Dashboard</div>",
              "width": 600,
              "height": 100
            },
            "start": 8,
            "length": 6,
            "transition": { "in": "fade", "out": "fade" },
            "position": "bottom",
            "offset": { "x": 0, "y": 0.1 }
          },
          // 3. Text Overlay on Student Dashboard
          {
            "asset": {
              "type": "html",
              "html": "<div style='font-family:sans-serif; background:#d5e6e3; padding:20px; border-radius:10px; color:#17433f; font-size:36px; font-weight:bold; text-align:center;'>Zero-Latency Student Workspace</div>",
              "width": 650,
              "height": 100
            },
            "start": 14,
            "length": 6,
            "transition": { "in": "fade", "out": "fade" },
            "position": "bottom",
            "offset": { "x": 0, "y": 0.1 }
          }
        ]
      },
      {
        "clips": [
          // Scene 1: Intro Text
          {
            "asset": {
              "type": "html",
              "html": "<div style='font-family:sans-serif; color:#f2ede4; font-size:60px; font-weight:bold; text-align:center; padding: 50px;'>Managing college projects<br>doesn't have to be a nightmare.</div>",
              "width": 1280,
              "height": 720
            },
            "start": 0,
            "length": 4,
            "transition": { "in": "fade", "out": "fade" }
          },
          // Scene 2: Login Image
          {
            "asset": {
              "type": "image",
              "src": "https://raw.githubusercontent.com/wizariyo/project-track/main/img/promo/shot1_login.png"
            },
            "start": 4,
            "length": 4,
            "effect": "zoomInSlow",
            "transition": { "in": "fade", "out": "fade" }
          },
          // Scene 3: Teacher Image
          {
            "asset": {
              "type": "image",
              "src": "https://raw.githubusercontent.com/wizariyo/project-track/main/img/promo/shot2_teacher.png"
            },
            "start": 8,
            "length": 6,
            "effect": "slideLeftSlow",
            "transition": { "in": "fade", "out": "fade" }
          },
          // Scene 4: Student Image
          {
            "asset": {
              "type": "image",
              "src": "https://raw.githubusercontent.com/wizariyo/project-track/main/img/promo/shot3_student.png"
            },
            "start": 14,
            "length": 6,
            "effect": "slideRightSlow",
            "transition": { "in": "fade", "out": "fade" }
          },
          // Scene 5: Outro
          {
            "asset": {
              "type": "html",
              "html": "<div style='font-family:sans-serif; background:#f2ede4; width: 1280px; height: 720px; display:flex; flex-direction:column; justify-content:center; align-items:center;'><div style='color:#17433f; font-size:70px; font-weight:bold; margin-bottom:20px;'>Try ProjectTrack Today</div><div style='color:#17433f; font-size:40px;'>wizariyo.github.io/project-track</div></div>",
              "width": 1280,
              "height": 720
            },
            "start": 20,
            "length": 5,
            "transition": { "in": "fade", "out": "fade" }
          }
        ]
      },
      {
        "clips": [
          // Audio Track
          {
            "asset": {
              "type": "audio",
              "src": "https://templates.shotstack.io/real-estate-slideshow-sd-overlays-merge/261da4cc-57a8-4757-88d2-33d51e8f47bc/source.mp3",
              "volume": 1,
              "effect": "fadeOut"
            },
            "start": 0,
            "length": 25
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "resolution": "hd",
    "fps": 25
  }
};

const options = {
  hostname: ENDPOINT,
  path: '/edit/v1/render',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    if(response.success) {
      console.log('Render queued! ID:', response.response.id);
      pollStatus(response.response.id);
    } else {
      console.error('Error queuing render:', response);
    }
  });
});

req.on('error', e => console.error(e));
req.write(JSON.stringify(payload));
req.end();

function pollStatus(id) {
  const pollOpts = {
    hostname: ENDPOINT,
    path: `/edit/v1/render/${id}`,
    method: 'GET',
    headers: { 'x-api-key': API_KEY }
  };

  setTimeout(() => {
    https.get(pollOpts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        const status = response.response.status;
        console.log('Status:', status);
        if(status === 'done') {
          console.log('Video ready at:', response.response.url);
          downloadVideo(response.response.url, 'ProjectTrack_Shotstack_Promo.mp4');
        } else if(status === 'failed') {
          console.error('Render failed', response);
        } else {
          pollStatus(id);
        }
      });
    });
  }, 5000);
}

function downloadVideo(url, filename) {
  const file = fs.createWriteStream(filename);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(() => {
        console.log('Video downloaded to ' + filename + '!');
      });
    });
  });
}
