const https = require('https');
const fs = require('fs');

const API_KEY = 'sk_V2_hgu_kdX0t36nUl8_Nqwo0ase40WAJuReoaoQmK9xbfZb218Z';

function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.heygen.com',
      path,
      method,
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  const voiceId = "1bd001e7e50f421d891986aad5158bc8"; // Sara

  console.log('Generating Video...');
  const generateRes = await request('/v2/video/generate', 'POST', {
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: "a98d4fddcdb4442c9f66eaf8f6a46988",
          avatar_style: "normal"
        },
        voice: {
          type: "text",
          input_text: "Managing college projects used to be a nightmare of scattered files and missed deadlines. Not anymore. Meet ProjectTrack. Track milestones, manage peer reviews anonymously, and organize your team's deliverables—all in one beautiful dashboard. Say goodbye to the chaos. Try ProjectTrack today and manage your projects like a pro.",
          voice_id: voiceId
        },
        background: {
          type: "color",
          value: "#00FF00"
        }
      }
    ],
    dimension: { width: 1280, height: 720 }
  });

  if (!generateRes.data || !generateRes.data.video_id) {
    console.error('Failed to generate:', generateRes);
    return;
  }

  const videoId = generateRes.data.video_id;
  console.log('Video ID:', videoId);

  // Poll status
  let url = null;
  while (!url) {
    console.log('Polling status...');
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await request(`/v1/video_status.get?video_id=${videoId}`);
    if (statusRes.data.status === 'completed') {
      url = statusRes.data.video_url;
      console.log('Video ready at:', url);
    } else if (statusRes.data.status === 'failed' || statusRes.data.status === 'error') {
      console.error('Failed:', statusRes);
      return;
    }
  }

  // Download
  console.log('Downloading AI_Pitch.mp4...');
  const file = fs.createWriteStream('AI_Pitch.mp4');
  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded!');
    });
  });
}

run().catch(console.error);
