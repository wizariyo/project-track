const fs = require('fs');
let data = fs.readFileSync('js/app.js', 'utf8');

const regex = /chatHTML\(\) \{[\s\S]*?return `[\s\S]*?`\s*;\s*\}/g;

const newHTML = `chatHTML() {
      if (!AI.msgs.length) AI.seed();
      return \`
        <!-- Top header bar for AI Assistant page -->
        <div class="ai-top-bar" style="height: 60px; background: var(--teal); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; color: var(--cream); border-bottom: 1px solid var(--border); border-top-left-radius: 12px; border-top-right-radius: 12px;">
          <!-- Model Selection Capsule -->
          <div style="display: flex; background: rgba(255,255,255,0.15); border-radius: 99px; padding: 2px;">
            <button class="ai-model-btn active" style="background: var(--surface); color: var(--teal); border: none; border-radius: 99px; padding: 6px 16px; font-size: 11.5px; font-weight: 700; cursor: default;">Model 1</button>
          </div>
          
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; opacity: 0.9; color: var(--cream);">✦ Live Assistant</span>
          </div>
        </div>
        
        <!-- Split Screen Workspace -->
        <div style="display: flex; height: calc(100vh - 250px); min-height: 520px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; overflow: hidden; border: 1px solid var(--border); border-top: none;">
          <!-- Left: Chat log and input column -->
          <div style="flex: 1; display: flex; flex-direction: column; position: relative; padding: 24px; background: var(--bg); min-width: 0;">
            
            <!-- Chat Log messages -->
            <div class="chatlog-container" id="chatlog" style="flex: 1; overflow-y: auto; position: relative; z-index: 2; margin-bottom: 20px; padding-right: 8px; display: flex; flex-direction: column; gap: 16px;">
              \${AI.msgs.map(AI.bubble).join('')}
            </div>
            
            <!-- Bottom prompts grid and chat entry -->
            <div style="position: relative; z-index: 2; display: flex; flex-direction: column; gap: 16px;">
              <!-- Dynamic Prompt Suggestion Cards (6 cards, 3 columns) -->
              <div class="prompts-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                \${AI.prompts().map(p => \`
                  <div class="ai-prompt-card" onclick="window.AI.ask('\${p.replace(/'/g, "\\\\'")}')" style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; cursor: pointer; display: flex; flex-direction: column; justify-content: center; min-height: 64px;">
                    <div style="font-size: 12.5px; font-weight: 700; color: var(--text); line-height:1.2;">\${escapeHtml(p)}</div>
                    <div style="font-size: 10px; color: var(--text-3); margin-top: 4px;">Tap to query assistant</div>
                  </div>
                \`).join('')}
              </div>
              
              <!-- Chat Input -->
              <div class="chat-input-row" style="display: flex; align-items: center; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px 6px 16px;">
                <input class="inp" id="aiIn" placeholder="Send a message..." onkeydown="if(event.key==='Enter'){window.AI.ask(this.value);this.value=''}" style="flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: var(--text); font-weight: 500;" />
                <button class="btn btn-primary" onclick="var i=document.getElementById('aiIn'); if(i.value.trim()){ window.AI.ask(i.value); i.value=''; }" style="width: 36px; height: 36px; border-radius: 6px; background: var(--teal); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Right: Generated Links & Documents Panel -->
          <div style="width: 320px; background: var(--surface-2); border-left: 1px solid var(--border); padding: 32px 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-align: center;">
            <div style="color: var(--text-3); max-width: 240px; display: flex; flex-direction: column; align-items: center; gap: 14px;">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6; color: var(--teal);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <div style="font-size: 12px; font-weight: 500; line-height: 1.5;">Generated Links of <strong style="color: var(--text-2);">Websites</strong> and <strong style="color: var(--text-2);">Documents</strong> will appear here</div>
            </div>
          </div>
        </div>
      \`;
    }`;

data = data.replace(regex, newHTML);

fs.writeFileSync('js/app.js', data, 'utf8');
console.log("Updated AI.chatHTML() to use CSS variables.");
