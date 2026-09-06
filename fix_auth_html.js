const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the OTP Modal from HTML
html = html.replace(/<!-- Email OTP Verification Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// 2. Remove otp.js inclusion
html = html.replace(/<script src="js\/otp\.js\?v=1\.2\.5"><\/script>/, '');

// 3. Update handleAuth logic
const handleAuthRegex = /const user = await window\.apiSignup\(data\);[\s\S]*?setTimeout\(\(\) => redirectUser\(user\.role\), 500\);/m;
const handleAuthReplacement = `const user = await window.apiSignup(data);
          if (!user) throw new Error("Signup failed.");
          
          if (user.requiresVerification) {
            if (window.showToast) window.showToast('Account created! A verification link has been sent to your email.', 'success');
            errorDiv.innerHTML = '<span style="color:var(--teal)">Registration successful! Please check your email to verify your account before signing in.</span>';
            errorDiv.classList.remove('hidden');
            document.getElementById('authEmail').value = '';
            document.getElementById('authPassword').value = '';
            submitBtn.textContent = 'Sign In';
            submitBtn.disabled = false;
            setAuthMode('login');
            return;
          }
          
          if (window.showToast) window.showToast('Account created successfully!', 'success');
          setTimeout(() => redirectUser(user.role), 500);`;

html = html.replace(handleAuthRegex, handleAuthReplacement);

// 4. Remove leftover OTP functions
html = html.replace(/\/\/ OTP Verification helper functions[\s\S]*?\/\/ Verify OTP button click[\s\S]*?\}\);/m, '');

fs.writeFileSync('index.html', html);
