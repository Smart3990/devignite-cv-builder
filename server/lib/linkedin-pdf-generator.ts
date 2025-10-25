import puppeteer from "puppeteer";

interface LinkedInProfileData {
  fullName: string;
  headline: string;
  about: string;
  experience: string;
  skills: string;
  accomplishments: string;
  suggestions: string[];
}

/**
 * Generate a professional LinkedIn profile optimization PDF
 */
export async function generateLinkedInPDF(data: LinkedInProfileData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium-browser",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // Split content into paragraphs
    const aboutParagraphs = data.about.split('\n\n').filter(p => p.trim());
    const experienceParagraphs = data.experience.split('\n\n').filter(p => p.trim());
    const skillsParagraphs = data.skills.split('\n\n').filter(p => p.trim());
    const accomplishmentsParagraphs = data.accomplishments.split('\n\n').filter(p => p.trim());

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Profile Optimization - ${data.fullName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0.75in;
    }
    
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 24pt;
      padding-bottom: 12pt;
      border-bottom: 2pt solid #0a66c2;
    }
    
    .profile-name {
      font-size: 20pt;
      font-weight: bold;
      color: #0a66c2;
      margin-bottom: 8pt;
    }
    
    .doc-title {
      font-size: 14pt;
      color: #666;
      font-style: italic;
    }
    
    .section {
      margin-bottom: 20pt;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #0a66c2;
      margin-bottom: 10pt;
      padding-bottom: 4pt;
      border-bottom: 1pt solid #ddd;
    }
    
    .headline-box {
      background: #f3f6f8;
      padding: 12pt;
      border-left: 4pt solid #0a66c2;
      margin-bottom: 12pt;
      font-size: 11pt;
      line-height: 1.4;
    }
    
    .content-text {
      text-align: justify;
      margin-bottom: 12pt;
    }
    
    .content-text p {
      margin-bottom: 10pt;
    }
    
    .subsection {
      margin-bottom: 14pt;
    }
    
    .subsection-title {
      font-size: 12pt;
      font-weight: bold;
      color: #333;
      margin-bottom: 8pt;
    }
    
    .suggestions-list {
      list-style-type: none;
      padding-left: 0;
    }
    
    .suggestions-list li {
      margin-bottom: 8pt;
      padding-left: 24pt;
      position: relative;
    }
    
    .suggestions-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #0a66c2;
      font-weight: bold;
      font-size: 12pt;
    }
    
    .footer {
      margin-top: 30pt;
      padding-top: 12pt;
      border-top: 1pt solid #ddd;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
    
    strong {
      font-weight: bold;
      color: #000;
    }
    
    .highlight {
      background: #fff4cc;
      padding: 2pt 4pt;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="profile-name">${data.fullName}</div>
    <div class="doc-title">LinkedIn Profile Optimization Guide</div>
  </div>
  
  <!-- Headline Section -->
  <div class="section">
    <div class="section-title">Optimized Headline</div>
    <div class="headline-box">
      ${data.headline}
    </div>
    <p style="font-size: 9pt; color: #666; font-style: italic;">
      Use this as your LinkedIn headline to maximize visibility and showcase your professional value proposition.
    </p>
  </div>
  
  <!-- About Section -->
  <div class="section">
    <div class="section-title">About Section</div>
    <div class="content-text">
      ${aboutParagraphs.map(p => `<p>${p.trim()}</p>`).join('\n      ')}
    </div>
  </div>
  
  <!-- Experience Summary -->
  ${data.experience ? `
  <div class="section">
    <div class="section-title">Experience Summary</div>
    <div class="content-text">
      ${experienceParagraphs.map(p => `<p>${p.trim()}</p>`).join('\n      ')}
    </div>
  </div>
  ` : ''}
  
  <!-- Skills Optimization -->
  ${data.skills ? `
  <div class="section">
    <div class="section-title">Skills Optimization</div>
    <div class="content-text">
      ${skillsParagraphs.map(p => `<p>${p.trim()}</p>`).join('\n      ')}
    </div>
  </div>
  ` : ''}
  
  <!-- Accomplishments -->
  ${data.accomplishments ? `
  <div class="section">
    <div class="section-title">Accomplishments to Highlight</div>
    <div class="content-text">
      ${accomplishmentsParagraphs.map(p => `<p>${p.trim()}</p>`).join('\n      ')}
    </div>
  </div>
  ` : ''}
  
  <!-- Profile Improvement Suggestions -->
  <div class="section">
    <div class="section-title">Action Steps for Profile Enhancement</div>
    <ul class="suggestions-list">
      ${data.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('\n      ')}
    </ul>
  </div>
  
  <!-- Footer -->
  <div class="footer">
    LinkedIn Profile Optimization for ${data.fullName} | Generated by DevIgnite
  </div>
</body>
</html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.75in",
        bottom: "0.75in",
        left: "0.75in",
        right: "0.75in",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
