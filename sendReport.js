const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Zip a file and return the zip path
function zipFile(sourceFile, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.file(sourceFile, { name: path.basename(sourceFile) });
    archive.finalize();
  });
}

// Find the latest Excel report in reports/
function getLatestExcelReport() {
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) return null;
  const files = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.xlsx'))
    .map(f => ({ name: f, time: fs.statSync(path.join(reportsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
  return files.length ? path.join(reportsDir, files[0].name) : null;
}

async function sendMail() {
  const attachments = [];

  // ── HTML report zip ────────────────────────────────────────────────────
  const htmlZip = './playwright-report.zip';
  if (fs.existsSync(htmlZip)) {
    attachments.push({ filename: 'playwright-report.zip', path: htmlZip });
  } else {
    console.warn('⚠️  playwright-report.zip not found, skipping HTML report attachment.');
  }

  // ── Excel report zip ───────────────────────────────────────────────────
  const excelFile = getLatestExcelReport();
  if (excelFile) {
    const excelZip = path.join(__dirname, 'reports', 'excel-report.zip');
    await zipFile(excelFile, excelZip);
    attachments.push({ filename: 'excel-report.zip', path: excelZip });
    console.log(`📊 Excel report zipped: ${path.basename(excelFile)}`);
  } else {
    console.warn('⚠️  No Excel report found in reports/, skipping Excel attachment.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'sanket@bombaydc.com , arpit@bombaydc.com',
    subject: 'Weekly Playwright Execution Report of Camel login page',
    text: 'Please find attached:\n1. playwright-report.zip — HTML test report\n2. excel-report.zip — Excel test report with Summary, Test Results, Test Scenarios and Logs',
    attachments
  });

  console.log('✅ Email sent successfully');
}

sendMail();