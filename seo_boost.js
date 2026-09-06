const fs = require('fs');

function addSEO(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Check if Schema already exists to avoid duplicates
  if (html.includes('application/ld+json')) return;

  const schemaMarkup = `
  <!-- Advanced Google SEO Schema Markup -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ProjectTrack",
    "operatingSystem": "Web Browser",
    "applicationCategory": "EducationalApplication",
    "creator": {
      "@type": "Person",
      "name": "Yathaarth Bhardwaj"
    },
    "description": "ProjectTrack is the ultimate academic project management and Kanban tracking software for university students and teachers.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "INR"
    }
  }
  </script>
  </head>
  `;

  // Inject right before </head>
  html = html.replace('</head>', schemaMarkup);
  fs.writeFileSync(filePath, html);
}

addSEO('index.html');
addSEO('student-dashboard.html');
addSEO('teacher-dashboard.html');
