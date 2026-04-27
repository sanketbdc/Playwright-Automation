const nodemailer = require('nodemailer');
const fs         = require('fs');
const path       = require('path');

// Usage: node sendReport.js --suite=camel  OR  node sendReport.js --suite=geg
const suiteArg = process.argv.find(a => a.startsWith('--suite='));
const suite    = suiteArg ? suiteArg.split('=')[1].toLowerCase() : null;

const SUITE_CONFIG = {
  camel: {
    subject:  'Playwright Execution Report — Camel Login',
    htmlZip:  path.join(__dirname, 'camel-report.zip'),
    excelDir: path.join(__dirname, 'reports', 'camel'),
    text:     'Please find attached the Camel login test execution report:\n1. camel-report.zip — HTML report\n2. Excel report (.xlsx) — Summary, Test Results, Test Scenarios, Logs',
  },
  geg: {
    subject:  'Playwright Execution Report — GEG Enquiry Form',
    htmlZip:  path.join(__dirname, 'geg-report.zip'),
    excelDir: path.join(__dirname, 'reports', 'geg'),
    text:     'Please find attached the GEG Enquiry Form test execution report:\n1. geg-report.zip — HTML report\n2. Excel report (.xlsx) — Summary, Test Results, Test Scenarios, Logs',
  },
};

function getLatestExcelReport(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.xlsx'))
    .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
  return files.length ? path.join(dir, files[0].name) : null;
}

async function sendMail() {
  if (!suite || !SUITE_CONFIG[suite]) {
    console.error(`❌ Unknown or missing suite. Use --suite=camel or --suite=geg`);
    process.exit(1);
  }

  const config      = SUITE_CONFIG[suite];
  const attachments = [];

  // ── HTML report zip ──────────────────────────────────────────────────────
  if (fs.existsSync(config.htmlZip)) {
    attachments.push({ filename: path.basename(config.htmlZip), path: config.htmlZip });
    console.log(`📄 HTML report attached: ${path.basename(config.htmlZip)}`);
  } else {
    console.warn(`⚠️  HTML zip not found: ${config.htmlZip}`);
  }

  // ── Excel report (.xlsx) ─────────────────────────────────────────────────
  const excelFile = getLatestExcelReport(config.excelDir);
  if (excelFile) {
    attachments.push({ filename: path.basename(excelFile), path: excelFile });
    console.log(`📊 Excel report attached: ${path.basename(excelFile)}`);
  } else {
    console.warn(`⚠️  No Excel report found in: ${config.excelDir}`);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from:        process.env.EMAIL_USER,
    to:          'sanket@bombaydc.com',
    subject:     config.subject,
    text:        config.text,
    attachments,
  });

  console.log(`✅ Email sent successfully for: ${suite.toUpperCase()}`);
}

sendMail().catch(err => {
  console.error(`❌ Failed to send email: ${err.message}`);
  process.exit(1);
});
