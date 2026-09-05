const fs = require("fs"); 
let data = fs.readFileSync("record_max_10min.js", "utf8"); 
data = data.replace(/styleElement\.innerHTML \= [\s\S]*?document\.head\.appendChild/m, `styleElement.innerHTML = \`
        puppeteer-mouse-pointer {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: 999999;
          left: 0;
          width: 28px;
          height: 28px;
          background: rgba(245, 158, 11, 0.4); 
          border: 2px solid #F59E0B;
          border-radius: 50%;
          margin: -14px 0 0 -14px;
          padding: 0;
          transition: transform 0.1s ease-out;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        puppeteer-mouse-pointer.button-1 {
          transform: scale(0.6);
          background: rgba(245, 158, 11, 0.8);
        }
\`;\n      document.head.appendChild`); 
fs.writeFileSync("record_max_10min.js", data);
