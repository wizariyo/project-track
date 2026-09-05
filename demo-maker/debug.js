const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
    if(msg.type() === 'error') {
      console.log('ERROR ARG:', msg.location().url);
    }
  });
  
  const path = require('path');
  const localUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
  await page.goto(localUrl, { waitUntil: 'networkidle2' });
  console.log("Navigated");
  
  const stamp = Date.now();
  const studentEmail = `student${stamp}@test.com`;
  const pass = 'password123';
  
  await page.evaluate(() => {
    document.querySelector('#roleStudent').click();
  });
  console.log("Role clicked");
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    document.querySelector('#tabSignup').click();
  });
  console.log("Tab clicked");
  
  await new Promise(r => setTimeout(r, 1000));
  
  const signupResult = await page.evaluate(async (email, pass) => {
    try {
      const data = {
        name: 'Alex Johnson',
        email: email,
        password: pass,
        role: 'student',
        semester: 1,
        projectRole: 'Tech Lead',
        avatarColor: '#123456'
      };
      const user = await window.apiSignup(data);
      return user;
    } catch (e) {
      return { error: e.message };
    }
  }, studentEmail, pass);
  console.log("Signup Result:", signupResult);
  
  const state = await page.evaluate(() => {
    return {
      authMode: window.authMode,
      selectedRole: window.selectedRole,
      errorText: document.getElementById('authError') ? document.getElementById('authError').innerText : null,
      errorVisible: document.getElementById('authError') ? !document.getElementById('authError').classList.contains('hidden') : false,
      btnText: document.getElementById('submitAuthBtn').innerText,
      name: document.getElementById('authName').value,
      email: document.getElementById('authEmail').value
    };
  });
  console.log("State:", state);
  
  const url = page.url();
  console.log("URL after submit:", url);
  
  await browser.close();
})();
