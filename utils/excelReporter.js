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
      suite:    suiteName,
      title:    test.title,
      status:   result.status,
      duration: (result.duration / 1000).toFixed(2) + 's',
      retries:  result.retry,
      error,
      steps,
      scenario: this._buildScenario(test.title, result.status),
    });
  }

  // ── Build human-readable scenario info from test title ──────────────────
  _buildScenario(title, status) {
    const t = title.toLowerCase();

    // ── Input Data ──────────────────────────────────────────────────────────
    let inputData = 'N/A';
    if (t.includes('full') || t.includes('complete') || t.includes('happy'))         inputData = 'Valid data (name, email, mobile, city, business unit, category, message, file)';
    else if (t.includes('empty') && t.includes('name'))                               inputData = 'Name: (empty)';
    else if (t.includes('short') && t.includes('name'))                               inputData = 'Name: "J" (1 char - below min 2)';
    else if (t.includes('empty') && t.includes('email'))                              inputData = 'Email: (empty)';
    else if (t.includes('short') && t.includes('email'))                              inputData = 'Email: "ab@c" (4 chars - below min 5)';
    else if (t.includes('missing domain'))                                            inputData = 'Email: "johndoe@" (missing domain)';
    else if (t.includes('missing @'))                                                 inputData = 'Email: "johndoe.com" (missing @)';
    else if (t.includes('missing username'))                                          inputData = 'Email: "@example.com" (missing username)';
    else if (t.includes('empty') && t.includes('mobile'))                             inputData = 'Mobile: (empty)';
    else if (t.includes('short') && t.includes('mobile'))                             inputData = 'Mobile: "12345" (5 digits - below min 10)';
    else if (t.includes('long') && t.includes('mobile'))                              inputData = 'Mobile: "12345678901234567890" (20 digits - above max)';
    else if (t.includes('empty') && t.includes('city'))                               inputData = 'City: (empty)';
    else if (t.includes('invalid characters') && t.includes('message'))              inputData = 'Message: "Test <script>alert(1)</script>" (invalid chars)';
    else if (t.includes('without message') || t.includes('optional'))                inputData = 'Valid mandatory fields only (message & file skipped)';
    else if (t.includes('all required') || t.includes('empty'))                      inputData = 'All fields: (empty)';
    else if (t.includes('auto-suggestion') || t.includes('city'))                    inputData = 'City partial text: "Aur"';
    else if (t.includes('business unit') && t.includes('options'))                   inputData = 'Business Unit dropdown opened';
    else if (t.includes('business category') && t.includes('select'))                inputData = 'Business Category: "Refrigerators"';
    else if (t.includes('aerospace') && t.includes('hidden'))                        inputData = 'Business Unit: "Aerospace"';
    else if (t.includes('file'))                                                      inputData = 'File: down.jpg';

    // ── Expected Outcome ────────────────────────────────────────────────────
    let expected = 'N/A';
    if (t.includes('full') || t.includes('complete') || t.includes('happy'))         expected = 'Form submitted successfully — success message displayed';
    else if (t.includes('empty') && t.includes('name'))                               expected = 'Form NOT submitted — error: "Enter your full name."';
    else if (t.includes('short') && t.includes('name'))                               expected = 'Form NOT submitted — error: "Name must be between 2-100 characters."';
    else if (t.includes('empty') && t.includes('email'))                              expected = 'Form NOT submitted — error: "Enter your email address."';
    else if (t.includes('short') && t.includes('email'))                              expected = 'Form NOT submitted — error: "Email address must be between 5-300 characters."';
    else if (t.includes('invalid') && t.includes('email'))                            expected = 'Form NOT submitted — error: "Enter a valid email address."';
    else if (t.includes('empty') && t.includes('mobile'))                             expected = 'Form NOT submitted — error: "Enter your mobile number."';
    else if (t.includes('short') && t.includes('mobile'))                             expected = 'Form NOT submitted — error: "Number must be 10 numbers"';
    else if (t.includes('long') && t.includes('mobile'))                              expected = 'Form NOT submitted — error: "Number must be 10 digits."';
    else if (t.includes('empty') && t.includes('city'))                               expected = 'Form NOT submitted — error: "Enter the name of your city."';
    else if (t.includes('invalid characters') && t.includes('message'))              expected = 'Form NOT submitted — error: "Message must be letters, numbers, spaces..."';
    else if (t.includes('without message') || t.includes('optional'))                expected = 'Form submitted successfully without optional fields';
    else if (t.includes('all required') || (t.includes('empty') && t.includes('submit'))) expected = 'Form NOT submitted — all required field errors shown';
    else if (t.includes('auto-suggestion') || t.includes('city'))                    expected = 'Suggestions appear — first result matches typed text';
    else if (t.includes('business unit') && t.includes('options'))                   expected = 'All 9 Business Unit options visible and selectable';
    else if (t.includes('business category') && t.includes('select'))                expected = 'Business Category selected and input value updated';
    else if (t.includes('aerospace') && t.includes('hidden'))                        expected = 'Business Category dropdown hidden (not visible)';
    else if (t.includes('file'))                                                      expected = 'File attached — files.length > 0';

    // ── Actual Result ───────────────────────────────────────────────────────
    const actual = status === 'passed' ? '✅ Behaved as expected' : '❌ Did not behave as expected';

    return { inputData, expected, actual };
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
    this._addScenariosSheet(workbook);
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

  _addScenariosSheet(workbook) {
    const sheet = workbook.addWorksheet('Test Scenarios');
    sheet.columns = [
      { header: 'TC#',              key: 'tc',       width: 10  },
      { header: 'Test Suite',       key: 'suite',    width: 35  },
      { header: 'Scenario',         key: 'scenario', width: 55  },
      { header: 'Input Data Used',  key: 'input',    width: 55  },
      { header: 'Expected Outcome', key: 'expected', width: 60  },
      { header: 'Actual Result',    key: 'actual',   width: 30  },
      { header: 'Status',           key: 'status',   width: 12  },
    ];

    // Header styling
    sheet.getRow(1).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
    sheet.getRow(1).height = 30;

    const statusColors = { passed: 'FF70AD47', failed: 'FFFF0000', skipped: 'FFFFC000' };

    this.results.forEach((r, index) => {
      // Extract TC number from title e.g. "TC01 - ..."
      const tcMatch = r.title.match(/TC(\d+)/i);
      const tcNum   = tcMatch ? `TC${tcMatch[1].padStart(2, '0')}` : `TC${String(index + 1).padStart(2, '0')}`;

      const row = sheet.addRow({
        tc:       tcNum,
        suite:    r.suite,
        scenario: r.title.replace(/TC\d+\s*-\s*/i, '').trim(),
        input:    r.scenario.inputData,
        expected: r.scenario.expected,
        actual:   r.scenario.actual,
        status:   r.status.toUpperCase(),
      });

      // Status cell colour
      const statusCell = row.getCell('status');
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors[r.status] || 'FFCCCCCC' } };
      statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      statusCell.alignment = { horizontal: 'center', vertical: 'top' };

      // Actual result colour — green if passed, red if failed
      const actualCell = row.getCell('actual');
      actualCell.font = { bold: true, color: { argb: r.status === 'passed' ? 'FF70AD47' : 'FFCC0000' } };

      // Alternate row background for readability
      if (index % 2 === 1) {
        ['tc', 'suite', 'scenario', 'input', 'expected', 'actual'].forEach(key => {
          row.getCell(key).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        });
      }

      row.eachCell(cell => {
        cell.alignment = { wrapText: true, vertical: 'top' };
      });
      row.height = 50;
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
