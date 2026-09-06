const fs = require('fs');

function fixLayout(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Extract the notification wrapper completely
  const notifRegex = /(<div style="position: relative; display: flex; align-items: center; justify-content: flex-end; flex: 1;">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
  
  const match = html.match(notifRegex);
  if (!match) return;

  const notifHTML = match[0];

  // Remove it from its current wrong position
  html = html.replace(notifRegex, '');

  // The previous replacement left an extra </div> or missed it. 
  // Let's reconstruct the global-search-bar cleanly.
  // We know it ends with a </div>. Let's find the group banner to use as a marker.
  const bannerMarker = '<!-- Group Banner -->';
  
  // Actually, we can just find the end of the search bar div.
  // Search bar starts with <div class="global-search-bar"...
  // Then <div style="position: relative; width: 340px;">
  // Then SVG, input, and globalSearchResults.
  // Then </div> for the width 340px div.
  // Then we want to put the notifHTML here.
  // Then </div> for the global-search-bar.

  // Let's just find the globalSearchResults div and insert the closing div and notifHTML after it.
  const resultsRegex = /(<div id="globalSearchResults".*?><\/div>)/;
  
  if (html.match(resultsRegex)) {
    // Current structure:
    // ...
    // <div id="globalSearchResults"...></div>
    // </div> (this closes the search input wrapper)
    // </div> (this closes the global-search-bar)
    // We want to make sure there are exactly two </div>s after globalSearchResults before the banner, and insert notifHTML between them.
    
    // So let's replace:
    // <div id="globalSearchResults" ...></div>
    //     </div>
    //   </div>
    
    // Instead of regex hacking, let's just do a clean string replacement.
    html = html.replace(/(<div id="globalSearchResults"[\s\S]*?><\/div>\s*<\/div>)/, `$1\n${notifHTML}\n`);
  }

  fs.writeFileSync(filePath, html);
}

fixLayout('student-dashboard.html');
fixLayout('teacher-dashboard.html');
