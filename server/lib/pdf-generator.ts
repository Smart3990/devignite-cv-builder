import puppeteer from 'puppeteer';
import type { Cv } from '@shared/schema';

export interface PDFGenerationOptions {
  cvData: Cv;
  templateId: string;
  fileName: string;
}

export async function generateCVPDF(options: PDFGenerationOptions): Promise<Buffer> {
  const { cvData, templateId, fileName } = options;

  let browser;
  try {
    // Launch browser with system chromium
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Generate the CV HTML content
    const htmlContent = await generateCVHTML(cvData, templateId);

    // Set content and wait for it to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF with A4 size
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function generateCVHTML(cvData: Cv, templateId: string): Promise<string> {
  // Import the CV template component rendering logic
  // For now, we'll create a simple HTML structure
  // In production, this should render the actual React component to HTML
  
  const sanitize = (text: string | null | undefined) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Basic template structure - this should be enhanced to match actual templates
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1a1a1a;
          background: white;
        }
        
        .cv-container {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          background: white;
        }
        
        .header {
          margin-bottom: 20px;
          border-bottom: 2px solid #ef4b23;
          padding-bottom: 15px;
        }
        
        .name {
          font-size: 28pt;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 10pt;
          color: #666;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .section {
          margin-top: 20px;
        }
        
        .section-title {
          font-size: 14pt;
          font-weight: 700;
          color: #ef4b23;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .summary {
          font-size: 11pt;
          line-height: 1.6;
          color: #333;
          text-align: justify;
        }
        
        .experience-item, .education-item {
          margin-bottom: 18px;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }
        
        .item-title {
          font-size: 12pt;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .item-subtitle {
          font-size: 11pt;
          color: #ef4b23;
          font-weight: 500;
        }
        
        .item-meta {
          font-size: 10pt;
          color: #666;
          margin-bottom: 8px;
        }
        
        .item-description {
          font-size: 10.5pt;
          line-height: 1.6;
          color: #333;
          white-space: pre-line;
        }
        
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .skill-badge {
          padding: 6px 14px;
          background: #ef4b23;
          color: white;
          border-radius: 4px;
          font-size: 10pt;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="cv-container">
        <div class="header">
          <div class="name">${sanitize(cvData.fullName)}</div>
          <div class="contact-info">
            ${cvData.email ? `<div class="contact-item">${sanitize(cvData.email)}</div>` : ''}
            ${cvData.phone ? `<div class="contact-item">${sanitize(cvData.phone)}</div>` : ''}
            ${cvData.location ? `<div class="contact-item">${sanitize(cvData.location)}</div>` : ''}
            ${cvData.website ? `<div class="contact-item">${sanitize(cvData.website)}</div>` : ''}
            ${cvData.linkedin ? `<div class="contact-item">${sanitize(cvData.linkedin)}</div>` : ''}
          </div>
        </div>
        
        ${cvData.summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">${sanitize(cvData.summary)}</div>
          </div>
        ` : ''}
        
        ${cvData.experience && cvData.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${cvData.experience.map(exp => `
              <div class="experience-item">
                <div class="item-header">
                  <div class="item-title">${sanitize(exp.title)}</div>
                </div>
                <div class="item-subtitle">${sanitize(exp.company)}</div>
                <div class="item-meta">
                  ${exp.location ? sanitize(exp.location) + ' • ' : ''}
                  ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate || '')}
                </div>
                <div class="item-description">${sanitize(exp.description)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${cvData.education && cvData.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${cvData.education.map(edu => `
              <div class="education-item">
                <div class="item-header">
                  <div class="item-title">${sanitize(edu.degree)}</div>
                </div>
                <div class="item-subtitle">${sanitize(edu.institution)}</div>
                <div class="item-meta">
                  ${edu.location ? sanitize(edu.location) + ' • ' : ''}
                  ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate || '')}
                </div>
                ${edu.description ? `<div class="item-description">${sanitize(edu.description)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${cvData.skills && cvData.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-grid">
              ${cvData.skills.map(skill => `
                <div class="skill-badge">${sanitize(skill)}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}
