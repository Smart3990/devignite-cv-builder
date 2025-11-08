import puppeteer from 'puppeteer';
import type { Cv } from '@shared/schema';

export interface PDFGenerationOptions {
  cvData: Cv;
  templateId: string;
  fileName: string;
}

async function launchBrowserSafe() {
  const chromiumPaths = [
    // 1️⃣ Your Render-specific Chromium
    '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    // 2️⃣ Common Linux locations
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    // 3️⃣ Optional env variable (custom setups)
    process.env.PUPPETEER_EXECUTABLE_PATH,
  ].filter(Boolean);

  for (const path of chromiumPaths) {
    try {
      console.log(`🧭 Trying Chromium at: ${path}`);
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: path,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      console.log(`✅ Browser launched successfully from ${path}`);
      return browser;
    } catch (err) {
      const error = err as Error;
      console.warn(`⚠️ Failed to launch from ${path}: ${error.message}`);
    }
  }

  // 4️⃣ Final fallback — Puppeteer’s built-in Chromium (for local dev)
  console.log('🔄 Falling back to Puppeteer default binary...');
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
}

export async function generateCVPDF(options: PDFGenerationOptions): Promise<Buffer> {
  const { cvData, templateId } = options;
  let browser;

  try {
    browser = await launchBrowserSafe();
    const page = await browser.newPage();

    // Generate HTML
    const htmlContent = await generateCVHTML(cvData, templateId);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Set media type to print for proper rendering
    await page.emulateMediaType('print');

    // Check for page overflow and log metrics
    const metrics = await page.evaluate(() => {
      const el = document.documentElement || document.body;
      return { 
        scrollHeight: el.scrollHeight, 
        clientHeight: el.clientHeight,
        // A4 is approximately 297mm = 1123px at 96dpi
        estimatedPages: Math.ceil(el.scrollHeight / 1123)
      };
    });
    
    console.log(`📄 PDF Metrics - Pages: ${metrics.estimatedPages}, Height: ${metrics.scrollHeight}px`);

    // Create PDF with proper page breaks
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) await browser.close();
  }
}

async function generateCVHTML(cvData: Cv, templateId: string): Promise<string> {
  const sanitize = (text: string | null | undefined) =>
    text
      ? text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      : '';

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 11pt; line-height: 1.5; color: #1a1a1a; background: white;
        }
        .cv-container { width: 210mm; min-height: 297mm; padding: 15mm; background: white; }
        .header { margin-bottom: 20px; border-bottom: 2px solid #ef4b23; padding-bottom: 15px; }
        .name { font-size: 28pt; font-weight: 700; margin-bottom: 8px; }
        .contact-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 10pt; color: #666; }
        .section { margin-top: 20px; page-break-inside: avoid; }
        .section-title { font-size: 14pt; font-weight: 700; color: #ef4b23; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .summary { font-size: 11pt; line-height: 1.6; color: #333; text-align: justify; }
        .experience-item, .education-item { margin-bottom: 18px; page-break-inside: avoid; }
        .item-title { font-size: 12pt; font-weight: 600; color: #1a1a1a; }
        .item-subtitle { font-size: 11pt; color: #ef4b23; font-weight: 500; }
        .item-meta { font-size: 10pt; color: #666; margin-bottom: 8px; }
        .item-description { font-size: 10.5pt; line-height: 1.6; color: #333; white-space: pre-line; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-badge { padding: 6px 14px; background: #ef4b23; color: white; border-radius: 4px; font-size: 10pt; font-weight: 500; }
        
        @media print {
          .section { page-break-inside: avoid; }
          .experience-item, .education-item { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="cv-container">
        <div class="header">
          <div class="name">${sanitize(cvData.fullName)}</div>
          <div class="contact-info">
            ${cvData.email ? `<div>${sanitize(cvData.email)}</div>` : ''}
            ${cvData.phone ? `<div>${sanitize(cvData.phone)}</div>` : ''}
            ${cvData.location ? `<div>${sanitize(cvData.location)}</div>` : ''}
            ${cvData.website ? `<div>${sanitize(cvData.website)}</div>` : ''}
            ${cvData.linkedin ? `<div>${sanitize(cvData.linkedin)}</div>` : ''}
          </div>
        </div>

        ${cvData.summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">${sanitize(cvData.summary)}</div>
          </div>` : ''}

        ${cvData.experience?.length ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${cvData.experience.map(exp => `
              <div class="experience-item">
                <div class="item-title">${sanitize(exp.title)}</div>
                <div class="item-subtitle">${sanitize(exp.company)}</div>
                <div class="item-meta">${exp.location ? sanitize(exp.location) + ' • ' : ''}${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate || '')}</div>
                <div class="item-description">${sanitize(exp.description)}</div>
              </div>`).join('')}
          </div>` : ''}

        ${cvData.education?.length ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${cvData.education.map(edu => `
              <div class="education-item">
                <div class="item-title">${sanitize(edu.degree)}</div>
                <div class="item-subtitle">${sanitize(edu.institution)}</div>
                <div class="item-meta">${edu.location ? sanitize(edu.location) + ' • ' : ''}${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate || '')}</div>
                ${edu.description ? `<div class="item-description">${sanitize(edu.description)}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}

        ${cvData.skills?.length ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-grid">
              ${cvData.skills.map(skill => `<div class="skill-badge">${sanitize(skill)}</div>`).join('')}
            </div>
          </div>` : ''}

        ${cvData.certifications?.length ? `
          <div class="section">
            <div class="section-title">Certifications</div>
            ${cvData.certifications.map(cert => `
              <div class="experience-item">
                <div class="item-title">${sanitize(cert.name)}</div>
                <div class="item-subtitle">${sanitize(cert.issuer)}</div>
                <div class="item-meta">${formatDate(cert.date)}${cert.credentialId ? ' • ID: ' + sanitize(cert.credentialId) : ''}</div>
                ${cert.url ? `<div class="item-description" style="color: #ef4b23;">${sanitize(cert.url)}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}

        ${cvData.achievements?.length ? `
          <div class="section">
            <div class="section-title">Achievements</div>
            ${cvData.achievements.map(achievement => `
              <div class="experience-item">
                <div class="item-title">${sanitize(achievement.title)}</div>
                ${achievement.date ? `<div class="item-meta">${formatDate(achievement.date)}</div>` : ''}
                <div class="item-description">${sanitize(achievement.description)}</div>
              </div>`).join('')}
          </div>` : ''}

        ${cvData.customSections?.length ? cvData.customSections.map(section => `
          <div class="section">
            <div class="section-title">${sanitize(section.title)}</div>
            <div class="item-description">${sanitize(section.content)}</div>
          </div>`).join('') : ''}

        ${cvData.references?.length ? `
          <div class="section">
            <div class="section-title">References</div>
            ${cvData.references.map(ref => `
              <div class="experience-item">
                <div class="item-title">${sanitize(ref.name)}</div>
                <div class="item-subtitle">${sanitize(ref.position)} at ${sanitize(ref.company)}</div>
                <div class="item-meta">
                  ${ref.email ? sanitize(ref.email) : ''}
                  ${ref.phone ? (ref.email ? ' • ' : '') + sanitize(ref.phone) : ''}
                </div>
              </div>`).join('')}
          </div>` : ''}
      </div>
    </body>
    </html>
  `;
}
