export interface SalaryStructureInput {
  basic_salary: number;
  hra?: number;
  da?: number;
  special_allowance?: number;
  other_allowances?: number;
  bonus?: number;
  pf_deduction?: number;
  esi_deduction?: number;
  professional_tax?: number;
  tds_deduction?: number;
  other_deductions?: number;
}

export interface AttendanceInput {
  total_days: number;
  present_days: number;
  half_days?: number;
  paid_leave_days?: number;
  holidays?: number;
  unpaid_leave_days?: number;
}

export interface PayrollResult {
  total_days: number;
  worked_days: number;
  paid_leave_days: number;
  loss_of_pay_days: number;
  payable_days: number;
  basic_salary: number;
  hra: number;
  da: number;
  special_allowance: number;
  other_allowances: number;
  total_allowances: number;
  bonus: number;
  gross_salary: number;
  pf_deduction: number;
  esi_deduction: number;
  professional_tax: number;
  tds_deduction: number;
  other_deductions: number;
  loss_of_pay_amount: number;
  total_deductions: number;
  net_salary: number;
  earnings_breakdown: Array<{ name: string; amount: number }>;
  deductions_breakdown: Array<{ name: string; amount: number }>;
}

/**
 * Calculates payable days based on attendance and approved leaves.
 */
export function calculatePayableDays(att: AttendanceInput): {
  payable_days: number;
  loss_of_pay_days: number;
} {
  const totalDays = Math.max(1, att.total_days);
  const present = Math.max(0, att.present_days);
  const halfDays = Math.max(0, att.half_days || 0);
  const paidLeave = Math.max(0, att.paid_leave_days || 0);
  const holidays = Math.max(0, att.holidays || 0);

  // Each half day counts as 0.5 worked day
  const effectiveWorked = present + halfDays * 0.5;
  const payableDays = Math.min(totalDays, effectiveWorked + paidLeave + holidays);
  const lossOfPayDays = Math.max(0, totalDays - payableDays);

  return {
    payable_days: Number(payableDays.toFixed(1)),
    loss_of_pay_days: Number(lossOfPayDays.toFixed(1)),
  };
}

/**
 * Main Payroll Calculation Engine
 * Formula:
 * Gross Salary = Basic Salary + Total Allowances + Bonus
 * Net Salary = Gross Salary - Total Deductions
 */
export function calculateMonthlyPayroll(
  structure: SalaryStructureInput,
  attendance: AttendanceInput
): PayrollResult {
  const basic = Math.max(0, Number(structure.basic_salary) || 0);
  const hra = Math.max(0, Number(structure.hra) || 0);
  const da = Math.max(0, Number(structure.da) || 0);
  const special = Math.max(0, Number(structure.special_allowance) || 0);
  const otherAllowances = Math.max(0, Number(structure.other_allowances) || 0);
  const bonus = Math.max(0, Number(structure.bonus) || 0);

  const totalAllowances = Number((hra + da + special + otherAllowances).toFixed(2));
  const fullGrossSalary = Number((basic + totalAllowances + bonus).toFixed(2));

  // Attendance & Payable days
  const { payable_days, loss_of_pay_days } = calculatePayableDays(attendance);

  // If there is Loss of Pay, calculate proration
  const totalDays = Math.max(1, attendance.total_days);
  const dailyRate = fullGrossSalary / totalDays;
  const lossOfPayAmount = Number((dailyRate * loss_of_pay_days).toFixed(2));

  // Deductions
  const pf = Math.max(0, Number(structure.pf_deduction) || 0);
  const esi = Math.max(0, Number(structure.esi_deduction) || 0);
  const pt = Math.max(0, Number(structure.professional_tax) || 0);
  const tds = Math.max(0, Number(structure.tds_deduction) || 0);
  const otherDeductions = Math.max(0, Number(structure.other_deductions) || 0);

  const totalDeductions = Number(
    (pf + esi + pt + tds + otherDeductions + lossOfPayAmount).toFixed(2)
  );

  const netSalary = Math.max(0, Number((fullGrossSalary - totalDeductions).toFixed(2)));

  const earnings_breakdown = [
    { name: 'Basic Salary', amount: basic },
    { name: 'House Rent Allowance (HRA)', amount: hra },
    { name: 'Dearness Allowance (DA)', amount: da },
    { name: 'Special Allowance', amount: special },
    { name: 'Other Allowances', amount: otherAllowances },
  ];
  if (bonus > 0) {
    earnings_breakdown.push({ name: 'Performance Bonus', amount: bonus });
  }

  const deductions_breakdown = [
    { name: 'Provident Fund (PF)', amount: pf },
    { name: 'Employee State Insurance (ESI)', amount: esi },
    { name: 'Professional Tax (PT)', amount: pt },
    { name: 'Tax Deducted at Source (TDS)', amount: tds },
  ];
  if (otherDeductions > 0) {
    deductions_breakdown.push({ name: 'Other Deductions', amount: otherDeductions });
  }
  if (lossOfPayAmount > 0) {
    deductions_breakdown.push({ name: `Loss of Pay (${loss_of_pay_days} days)`, amount: lossOfPayAmount });
  }

  return {
    total_days: totalDays,
    worked_days: attendance.present_days + (attendance.half_days || 0) * 0.5,
    paid_leave_days: attendance.paid_leave_days || 0,
    loss_of_pay_days,
    payable_days,
    basic_salary: basic,
    hra,
    da,
    special_allowance: special,
    other_allowances: otherAllowances,
    total_allowances: totalAllowances,
    bonus,
    gross_salary: fullGrossSalary,
    pf_deduction: pf,
    esi_deduction: esi,
    professional_tax: pt,
    tds_deduction: tds,
    other_deductions: otherDeductions,
    loss_of_pay_amount: lossOfPayAmount,
    total_deductions: totalDeductions,
    net_salary: netSalary,
    earnings_breakdown,
    deductions_breakdown,
  };
}

/**
 * Format currency amount for Indian Rupee / standard financial reports
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}
