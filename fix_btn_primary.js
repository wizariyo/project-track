const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

const regex = /\.btn-secondary \{ background: var\(--surface-2\); color: var\(--text\); border: 1px solid var\(--border\); box-shadow: var\(--shadow-sm\); \} \.btn-secondary:hover \{ background: var\(--border\); transform: translateY\(-1px\); \} \.btn-primary \{[\s\S]*?\[data-theme="dark"\] \.btn-primary:hover \{/m;

const replacement = `.btn-secondary {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.btn-secondary:hover {
  background: var(--border);
  transform: translateY(-1px);
}
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--teal-light));
  color: var(--surface);
  box-shadow: 0 4px 12px rgba(23, 67, 63, 0.2);
}
.btn-primary:hover { 
  background: linear-gradient(135deg, var(--primary-hover), var(--teal));
  transform: translateY(-2px); 
  box-shadow: 0 8px 16px rgba(23, 67, 63, 0.3); 
}
[data-theme="dark"] .btn-primary { 
  background: linear-gradient(135deg, var(--primary), var(--teal-light)); 
  color: #101C1A; 
  box-shadow: 0 4px 12px rgba(82, 189, 178, 0.25);
}
[data-theme="dark"] .btn-primary:hover {`;

css = css.replace(regex, replacement);
fs.writeFileSync('css/style.css', css);
