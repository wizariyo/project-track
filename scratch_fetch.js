const https = require('https');

https.get('https://wizariyo.github.io/project-track/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data.substring(data.length - 2000));
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
