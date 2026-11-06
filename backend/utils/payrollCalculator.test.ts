import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePayableDays,
  calculateMonthlyPayroll,
  formatCurrency,
} from './payrollCalculator';

test('calculatePayableDays calculates correct payable and LOP days', () => {
  const res1 = calculatePayableDays({
    total_days: 30,
    present_days: 26,
    half_days: 2, // 1 full day
    paid_leave_days: 2,
    holidays: 1,
  });
  // 26 + 1 + 2 + 1 = 30
  assert.equal(res1.payable_days, 30);
  assert.equal(res1.loss_of_pay_days, 0);

  const res2 = calculatePayableDays({
    total_days: 30,
    present_days: 20,
    half_days: 0,
    paid_leave_days: 2,
    holidays: 4,
  });
  // 20 + 2 + 4 = 26 payable, 4 LOP
  assert.equal(res2.payable_days, 26);
  assert.equal(res2.loss_of_pay_days, 4);
});

test('calculateMonthlyPayroll computes gross, deductions, and net salary correctly', () => {
  const structure = {
    basic_salary: 50000,
    hra: 20000,
    da: 7500,
    special_allowance: 10000,
    other_allowances: 2500,
    bonus: 5000,
    pf_deduction: 6000,
    esi_deduction: 0,
    professional_tax: 200,
    tds_deduction: 4000,
    other_deductions: 0,
  };

  // Full attendance
  const attFull = {
    total_days: 30,
    present_days: 26,
    paid_leave_days: 0,
    holidays: 4,
  };

  const result = calculateMonthlyPayroll(structure, attFull);

  // Total Allowances = 20000 + 7500 + 10000 + 2500 = 40000
  assert.equal(result.total_allowances, 40000);
  // Gross = 50000 (basic) + 40000 (allowances) + 5000 (bonus) = 95000
  assert.equal(result.gross_salary, 95000);
  // Deductions = 6000 (PF) + 200 (PT) + 4000 (TDS) = 10200
  assert.equal(result.total_deductions, 10200);
  // Net = 95000 - 10200 = 84800
  assert.equal(result.net_salary, 84800);
  assert.equal(result.loss_of_pay_days, 0);
  assert.equal(result.loss_of_pay_amount, 0);
});

test('calculateMonthlyPayroll accounts for Loss of Pay (LOP) correctly', () => {
  const structure = {
    basic_salary: 30000,
    hra: 12000,
    da: 4500,
    special_allowance: 3500,
    other_allowances: 0,
    bonus: 0,
    pf_deduction: 3600,
    esi_deduction: 0,
    professional_tax: 200,
    tds_deduction: 1000,
  };

  // 3 days absent without leave
  const attWithLop = {
    total_days: 30,
    present_days: 23,
    half_days: 0,
    paid_leave_days: 0,
    holidays: 4, // 27 total payable, 3 LOP
  };

  const result = calculateMonthlyPayroll(structure, attWithLop);
  assert.equal(result.gross_salary, 50000);
  assert.equal(result.loss_of_pay_days, 3);
  // daily rate = 50000 / 30 = 1666.67 * 3 = 5000
  assert.equal(result.loss_of_pay_amount, 5000);
  // Total deductions = 3600 + 200 + 1000 + 5000 = 9800
  assert.equal(result.total_deductions, 9800);
  // Net = 50000 - 9800 = 40200
  assert.equal(result.net_salary, 40200);
});

test('formatCurrency outputs valid currency string', () => {
  const formatted = formatCurrency(50000);
  assert.match(formatted, /50,000/);
});
