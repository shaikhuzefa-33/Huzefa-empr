import PDFDocument from 'pdfkit';
import { PayrollResult } from '../utils/payrollCalculator';

export interface PayslipPdfData {
  company: {
    name: string;
    address: string;
    taxId: string;
    email: string;
    phone: string;
  };
  employee: {
    code: string;
    name: string;
    designation: string;
    department: string;
    dateOfJoining: string;
    bankName: string;
    bankAccountNumber: string;
    bankIfsc: string;
    pan: string;
    profilePicture?: string;
  };
  period: {
    monthName: string;
    year: number;
    totalDays: number;
    workedDays: number;
    paidLeaveDays: number;
    lossOfPayDays: number;
  };
  payroll: {
    basicSalary: number;
    totalAllowances: number;
    bonus: number;
    grossSalary: number;
    totalDeductions: number;
    netSalary: number;
    earnings: Array<{ name: string; amount: number }>;
    deductions: Array<{ name: string; amount: number }>;
  };
  payment?: {
    method: string;
    reference: string;
    date: string;
    status: string;
  };
  payslipNumber: string;
}

function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return 'Zero';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  const intPart = Math.floor(num);
  return inWords(intPart).trim() + ' Rupees Only';
}

/**
 * Generates a clean, professional PDF payslip with PDFKit
 */
export function generatePayslipPdf(data: PayslipPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const primaryColor = '#1e3a8a'; // Deep Navy
    const secondaryColor = '#2563eb'; // Blue
    const darkGray = '#1f2937';
    const lightGray = '#f3f4f6';
    const borderGray = '#e5e7eb';

    // 1. Header Box
    doc.rect(40, 40, 515, 75).fill('#f8fafc');
    doc.rect(40, 40, 515, 75).stroke(borderGray);

    doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold');
    doc.text(data.company.name, 55, 52);

    doc.fillColor(darkGray).fontSize(9).font('Helvetica');
    doc.text(data.company.address, 55, 74);
    doc.text(`Tax ID/GSTIN: ${data.company.taxId}  |  Email: ${data.company.email}  |  Tel: ${data.company.phone}`, 55, 88);

    doc.fillColor(secondaryColor).fontSize(14).font('Helvetica-Bold');
    doc.text('PAYSLIP', 420, 52, { align: 'right' });
    doc.fillColor(darkGray).fontSize(8).font('Helvetica');
    doc.text(`Ref: ${data.payslipNumber}`, 350, 72, { align: 'right' });
    doc.text(`Period: ${data.period.monthName} ${data.period.year}`, 350, 85, { align: 'right' });

    // 2. Employee & Attendance Info Matrix
    let y = 125;
    doc.rect(40, y, 515, 95).fill('#ffffff').stroke(borderGray);

    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
    doc.text('EMPLOYEE SUMMARY', 55, y + 10);
    doc.text('ATTENDANCE & BANK DETAILS', 305, y + 10);
    doc.strokeColor(borderGray).moveTo(40, y + 26).lineTo(555, y + 26).stroke();
    doc.strokeColor(borderGray).moveTo(295, y + 26).lineTo(295, y + 95).stroke();

    doc.fillColor(darkGray).fontSize(8.5).font('Helvetica');
    const leftX = 55;
    const rightX = 305;
    let rowY = y + 33;

    doc.font('Helvetica-Bold').text('Employee ID:', leftX, rowY);
    doc.font('Helvetica').text(data.employee.code, leftX + 80, rowY);
    doc.font('Helvetica-Bold').text('Total Days in Month:', rightX, rowY);
    doc.font('Helvetica').text(`${data.period.totalDays}`, rightX + 110, rowY);

    rowY += 14;
    doc.font('Helvetica-Bold').text('Employee Name:', leftX, rowY);
    doc.font('Helvetica').text(data.employee.name, leftX + 80, rowY);
    doc.font('Helvetica-Bold').text('Payable Days:', rightX, rowY);
    doc.font('Helvetica').text(`${data.period.workedDays + data.period.paidLeaveDays}`, rightX + 110, rowY);

    rowY += 14;
    doc.font('Helvetica-Bold').text('Designation:', leftX, rowY);
    doc.font('Helvetica').text(data.employee.designation, leftX + 80, rowY);
    doc.font('Helvetica-Bold').text('Loss of Pay (LOP):', rightX, rowY);
    doc.font('Helvetica').text(`${data.period.lossOfPayDays} days`, rightX + 110, rowY);

    rowY += 14;
    doc.font('Helvetica-Bold').text('Department:', leftX, rowY);
    doc.font('Helvetica').text(data.employee.department, leftX + 80, rowY);
    doc.font('Helvetica-Bold').text('Bank & A/C:', rightX, rowY);
    doc.font('Helvetica').text(`${data.employee.bankName} - ${data.employee.bankAccountNumber}`, rightX + 110, rowY);

    // 3. Earnings & Deductions Breakdown Tables
    y = 230;
    const colWidth = 252;
    const tableHeight = 220;

    // Earnings Header
    doc.rect(40, y, colWidth, 22).fill(primaryColor);
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('EARNINGS', 50, y + 6);
    doc.text('AMOUNT (INR)', 220, y + 6, { align: 'right' });

    // Deductions Header
    doc.rect(303, y, colWidth, 22).fill(primaryColor);
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('DEDUCTIONS', 313, y + 6);
    doc.text('AMOUNT (INR)', 480, y + 6, { align: 'right' });

    // Table Containers
    doc.rect(40, y + 22, colWidth, tableHeight).fill('#ffffff').stroke(borderGray);
    doc.rect(303, y + 22, colWidth, tableHeight).fill('#ffffff').stroke(borderGray);

    // Render Earnings Lines
    let earnY = y + 32;
    data.payroll.earnings.forEach((item) => {
      doc.fillColor(darkGray).fontSize(8.5).font('Helvetica');
      doc.text(item.name, 50, earnY);
      doc.text(item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 220, earnY, { align: 'right' });
      earnY += 18;
    });

    // Render Deductions Lines
    let dedY = y + 32;
    data.payroll.deductions.forEach((item) => {
      doc.fillColor(darkGray).fontSize(8.5).font('Helvetica');
      doc.text(item.name, 313, dedY);
      doc.text(item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 480, dedY, { align: 'right' });
      dedY += 18;
    });

    // Subtotal Row inside Table
    const subtotalY = y + 22 + tableHeight - 26;
    doc.rect(40, subtotalY, colWidth, 26).fill(lightGray).stroke(borderGray);
    doc.rect(303, subtotalY, colWidth, 26).fill(lightGray).stroke(borderGray);

    doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold');
    doc.text('GROSS EARNINGS', 50, subtotalY + 7);
    doc.text(`₹ ${data.payroll.grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 220, subtotalY + 7, { align: 'right' });

    doc.text('TOTAL DEDUCTIONS', 313, subtotalY + 7);
    doc.text(`₹ ${data.payroll.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, subtotalY + 7, { align: 'right' });

    // 4. Net Salary Highlight Banner
    y = 485;
    doc.rect(40, y, 515, 55).fill('#ecfdf5'); // Mint green soft background
    doc.rect(40, y, 515, 55).stroke('#059669');

    doc.fillColor('#065f46').fontSize(11).font('Helvetica-Bold');
    doc.text('NET SALARY PAYABLE (TAKE HOME)', 55, y + 12);
    doc.fontSize(16).text(`₹ ${data.payroll.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 380, y + 10, { align: 'right' });

    doc.fillColor(darkGray).fontSize(8.5).font('Helvetica-Oblique');
    doc.text(`Amount in Words: ${numberToWords(data.payroll.netSalary)}`, 55, y + 34);

    // 5. Payment details & Signatures
    y = 555;
    doc.rect(40, y, 515, 90).fill('#ffffff').stroke(borderGray);

    doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold');
    doc.text('PAYMENT DISBURSEMENT RECORD', 55, y + 10);
    doc.fillColor(darkGray).fontSize(8).font('Helvetica');
    if (data.payment) {
      doc.text(`Payment Method: ${data.payment.method}`, 55, y + 26);
      doc.text(`Transaction Reference: ${data.payment.reference}`, 55, y + 38);
      doc.text(`Disbursement Date: ${data.payment.date}  |  Status: ${data.payment.status}`, 55, y + 50);
    } else {
      doc.text('Status: Payroll approved. Electronic disbursement queued.', 55, y + 26);
    }

    // Signature boxes
    doc.strokeColor(borderGray).moveTo(380, y + 60).lineTo(520, y + 60).stroke();
    doc.fillColor(darkGray).fontSize(7.5).font('Helvetica-Bold');
    doc.text('Authorized HR Signatory', 380, y + 64, { align: 'center', width: 140 });
    doc.font('Helvetica').fontSize(6.5).fillColor('#6b7280');
    doc.text('This is a system generated document with official seal.', 55, y + 74);

    doc.end();
  });
}
