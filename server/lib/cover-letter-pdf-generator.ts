import puppeteer from "puppeteer";

interface CoverLetterData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  companyName: string;
  jobTitle: string;
  content: string;
}

/**
 * Generate a professional, ATS-optimized cover letter PDF
 */
export async function generateCoverLetterPDF(data: CoverLetterData): Promise<Buffer> {
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
    const paragraphs = data.content.split('\n\n').filter(p => p.trim());

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cover Letter - ${data.fullName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0.75in 1in;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      background: white;
    }
    
    .header {
      margin-bottom: 24pt;
      text-align: left;
    }
    
    .applicant-name {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 6pt;
      color: #1a1a1a;
    }
    
    .contact-info {
      font-size: 10pt;
      color: #333;
      line-height: 1.4;
    }
    
    .contact-info div {
      margin-bottom: 2pt;
    }
    
    .date {
      margin: 24pt 0 12pt 0;
      font-size: 11pt;
    }
    
    .recipient {
      margin-bottom: 16pt;
      font-size: 12pt;
      line-height: 1.5;
    }
    
    .recipient-company {
      font-weight: bold;
    }
    
    .subject-line {
      margin-bottom: 20pt;
      font-size: 12pt;
      font-weight: bold;
      text-decoration: underline;
    }
    
    .salutation {
      margin-bottom: 16pt;
      font-size: 12pt;
    }
    
    .content {
      text-align: justify;
      margin-bottom: 24pt;
    }
    
    .content p {
      margin-bottom: 14pt;
      text-indent: 0;
    }
    
    .closing {
      margin-top: 24pt;
    }
    
    .signature {
      margin-top: 40pt;
    }
    
    .signature-name {
      font-weight: bold;
    }
    
    /* ATS-friendly: avoid complex formatting */
    strong {
      font-weight: bold;
    }
    
    em {
      font-style: italic;
    }
  </style>
</head>
<body>
  <!-- Applicant Header -->
  <div class="header">
    <div class="applicant-name">${data.fullName}</div>
    <div class="contact-info">
      ${data.email ? `<div>${data.email}</div>` : ''}
      ${data.phone ? `<div>${data.phone}</div>` : ''}
      ${data.location ? `<div>${data.location}</div>` : ''}
    </div>
  </div>
  
  <!-- Date -->
  <div class="date">${data.date}</div>
  
  <!-- Recipient -->
  <div class="recipient">
    <div>Hiring Manager</div>
    <div class="recipient-company">${data.companyName}</div>
    <div>${data.jobTitle} Position</div>
  </div>
  
  <!-- Subject/Application Line -->
  <div class="subject-line">RE: Application for ${data.jobTitle}</div>
  
  <!-- Salutation -->
  <div class="salutation">Dear Hiring Manager,</div>
  
  <!-- Cover Letter Content -->
  <div class="content">
    ${paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n    ')}
  </div>
  
  <!-- Closing -->
  <div class="closing">
    <p>Sincerely,</p>
    <div class="signature">
      <div class="signature-name">${data.fullName}</div>
    </div>
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
        left: "1in",
        right: "1in",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
