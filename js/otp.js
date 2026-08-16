/* ============================================================
   ProjectTrack – Email OTP Service
   ============================================================ */
(function() {
  // EmailJS Configuration (Optional - Paste your keys here to send real emails!)
  const EMAILJS_PUBLIC_KEY = ""; // e.g. "user_xxxxxxxx"
  const EMAILJS_SERVICE_ID = ""; // e.g. "service_xxxxxxx"
  const EMAILJS_TEMPLATE_ID = ""; // e.g. "template_xxxxxxx"

  let currentOTP = null;

  function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async function sendEmailOTP(email, name, otp) {
    console.log(`[OTP SERVICE] Generated OTP for ${email}: ${otp}`);
    
    // If EmailJS is configured, send a real email
    if (EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
      try {
        // Load EmailJS SDK dynamically if not loaded
        if (!window.emailjs) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
            script.onload = () => {
              window.emailjs.init(EMAILJS_PUBLIC_KEY);
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_email: email,
          to_name: name || "User",
          otp_code: otp
        });
        return true;
      } catch (err) {
        console.error("EmailJS Error:", err);
        throw new Error("Failed to send real OTP email. Falling back to simulation.");
      }
    } else {
      // Simulation mode
      alert(`[SIMULATION] OTP code sent to ${email} is: ${otp}\n(To send real emails, configure your EmailJS keys in js/otp.js)`);
      return true;
    }
  }

  window.OTP = {
    generate: generateOTP,
    send: sendEmailOTP
  };
})();
