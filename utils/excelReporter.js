// utils/excelReporter.js
// Custom Playwright reporter that generates an Excel report after test run.

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelReporter {
  constructor() {
    this.results = [];
    this.startTime = null;
  }

  onBegin(config, suite) {
    this.startTime = new Date();
    this.totalTests = suite.allTests().length;
  }

  onTestEnd(test, result) {
    const suiteName = test.parent?.title || '';
    const error = result.error
      ? (result.error.message || '').replace(/\x1B\[[0-9;]*m/g, '').split('\n')[0]
      : '';

    const steps = result.steps.map(s => {
      const stepError = s.error ? ` ❌ ${s.error.message?.split('\n')[0] || ''}` : '';
      return `${s.title}${stepError}`;
    });

    this.results.push({
      suite: suiteName,
      title: test.title,
      status: result.status,
      duration: (result.duration / 1000).toFixed(2) + 's',
      retries: result.retry,
      error,
      steps,
    });
  }

  async onEnd(result) {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const date = new Date().toISOString().slice(0, 10);
    const filePath = path.join(reportsDir, `test-report-${date}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Playwright Excel Reporter';
    workbook.created = new Date();

    this._addSummarySheet(workbook, result);
    this._addResultsSheet(workbook);
    this._addLogsSheet(workbook);

    await workbook.xlsx.writeFile(filePath);
    console.log(`\n📊 Excel report generated: ${filePath}`);
  }

  _addSummarySheet(workbook, result) {
    const sheet = workbook.addWorksheet('Summary');
    sheet.columns = [{ width: 30 }, { width: 40 }];

    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const duration = ((new Date() - this.startTime) / 1000).toFixed(2) + 's';

    const rows = [
      ['Test Run Summary', ''],
      ['Date', new Date().toLocaleString()],
      ['Total Tests', this.results.length],
      ['Passed', passed],
      ['Failed', failed],
      ['Skipped', skipped],
      ['Total Duration', duration],
      ['Overall Status', result.status.toUpperCase()],
    ];

    rows.forEach((row, i) => {
      const r = sheet.addRow(row);
      if (i === 0) {
        r.font = { bold: true, size: 14 };
        r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
        r.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      } else {
        r.getCell(1).font = { bold: true };
        const statusColors = { PASSED: 'FF70AD47', FAILED: 'FFFF0000', SKIPPED: 'FFFFC000' };
        if (row[0] === 'Overall Status') {
          r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors[row[1]] || 'FFCCCCCC' } };
          r.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        }
        if (row[0] === 'Passed') r.getCell(2).font = { color: { argb: 'FF70AD47' }, bold: true };
        if (row[0] === 'Failed') r.getCell(2).font = { color: { argb: 'FFFF0000' }, bold: true };
        if (row[0] === 'Skipped') r.getCell(2).font = { color: { argb: 'FFFFC000' }, bold: true };
      }
    });
  }

  _addResultsSheet(workbook) {
    const sheet = workbook.addWorksheet('Test Results');
    sheet.columns = [
      { header: 'Suite', key: 'suite', width: 35 },
      { header: 'Test Name', key: 'title', width: 55 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration', key: 'duration', width: 12 },
      { header: 'Retries', key: 'retries', width: 10 },
      { header: 'Steps', key: 'steps', width: 60 },
      { header: 'Error', key: 'error', width: 70 },
    ];

    // Header row styling
    sheet.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const statusColors = { passed: 'FF70AD47', failed: 'FFFF0000', skipped: 'FFFFC000', timedOut: 'FFFF6600' };

    this.results.forEach(r => {
      const row = sheet.addRow({
        suite: r.suite,
        title: r.title,
        status: r.status.toUpperCase(),
        duration: r.duration,
        retries: r.retries,
        steps: r.steps.join('\n'),
        error: r.error,
      });

      const statusCell = row.getCell('status');
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors[r.status] || 'FFCCCCCC' } };
      statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      statusCell.alignment = { horizontal: 'center', vertical: 'top' };

      row.getCell('steps').alignment = { wrapText: true, vertical: 'top' };
      row.getCell('error').font = { color: { argb: 'FFCC0000' } };
      row.getCell('error').alignment = { wrapText: true, vertical: 'top' };
      row.alignment = { vertical: 'top' };
    });

    sheet.autoFilter = { from: 'A1', to: 'G1' };
  }

  _addLogsSheet(workbook) {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) return;

    const date = new Date().toISOString().slice(0, 10);
    const logFile = path.join(logsDir, `${date}.log`);
    if (!fs.existsSync(logFile)) return;

    const sheet = workbook.addWorksheet('Logs');
    sheet.columns = [
      { header: 'Timestamp', key: 'ts', width: 22 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Message', key: 'msg', width: 100 },
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    const levelColors = { ERROR: 'FFFF0000', WARN: 'FFFFC000', INFO: 'FF70AD47' };

    const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
    lines.forEach(line => {
      // Format: "2026-04-10 12:00:00 [INFO] message"
      const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)$/);
      if (match) {
        const row = sheet.addRow({ ts: match[1], level: match[2], msg: match[3] });
        const levelCell = row.getCell('level');
        const color = levelColors[match[2]] || 'FF000000';
        levelCell.font = { bold: true, color: { argb: color } };
      } else {
        sheet.addRow({ ts: '', level: '', msg: line });
      }
    });
  }
}

module.exports = ExcelReporter;
