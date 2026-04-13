const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Accept --suite camel or --suite geg from command line
const suiteArg = process.argv.find(a => a.startsWith('--suite='));
const suite    = suiteArg ? suiteArg.split('=')[1].toLowerCase() : 'all';

const SUITE_CONFIG = {
  camel: {
    subject:  'Playwright Execution Report — Camel Login',
    htmlZip:  './camel-report.zip',
    excelDir: './reports/camel',
    text:     'Please find attached the Camel login test execution report:\n1. camel-report.zip — HTML report\n2. camel-excel-report.zip — Excel report',
  },
  geg: {
    subject:  'Playwright Execution Report — GEG Enquiry Form',
    htmlZip:  './geg-report.zip',
    excelDir: './reports/geg',
    text:     'Please find attached the GEG Enquiry Form test execution report:\n1. geg-report.zip — HTML report\n2. geg-excel-report.zip — Excel report',
  },
};

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

function getLatestExcelReport(dir) {
  const reportsDir = path.join(__dirname, dir);
  if (!fs.existsSync(reportsDir)) return null;
  const files = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.xlsx'))
    .map(f => ({ name: f, time: fs.statSync(path.join(reportsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
  return files.length ? path.join(reportsDir, files[0].name) : null;
}

async function sendMail() {
  const config = SUITE_CONFIG[suite];
  if (!config) {
    console.error(`❌ Unknown suite "${suite}". Use --suite=camel or --suite=geg`);
    process.exit(1);
  }

  console.log(`📧 Sending report for suite: ${suite.toUpperCase()}`);
  const attachments = [];

  // ── HTML report zip ────────────────────────────────────────────────────
  if (fs.existsSync(config.htmlZip)) {
    attachments.push({ filename: path.basename(config.htmlZip), path: config.htmlZip });
  } else {
    console.warn(`⚠️  ${config.htmlZip} not found, skipping HTML attachment.`);
  }

  // ── Excel report zip ───────────────────────────────────────────────────
  const excelFile = getLatestExcelReport(config.excelDir);
  if (excelFile) {
    const excelZip = path.join(__dirname, config.excelDir, `${suite}-excel-report.zip`);
    await zipFile(excelFile, excelZip);
    attachments.push({ filename: path.basename(excelZip), path: excelZip });
    console.log(`📊 Excel report zipped: ${path.basename(excelFile)}`);
  } else {
    console.warn(`⚠️  No Excel report found in ${config.excelDir}, skipping Excel attachment.`);
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
    to:          'sanket@bombaydc.com, arpit@bombaydc.com',
    subject:     config.subject,
    text:        config.text,
    attachments,
  });

  console.log(`✅ Email sent successfully for ${suite.toUpperCase()}`);
}

sendMail();