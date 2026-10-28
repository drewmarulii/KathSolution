/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Account,
  JournalEntry,
  TrialBalanceRow,
  Invoice,
  AgingBucket,
  FinancialRatios,
  BudgetItem,
  BudgetVarianceAnalysis
} from '../types/accounting';

/**
 * Exact decimal rounding helper matching Java's MathContext.DECIMAL128 and BigDecimal.setScale(2, RoundingMode.HALF_UP)
 */
export function roundTo2Decimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absAmount);

  return isNegative ? `(${formatted})` : formatted;
}

export interface ValidationResult {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  errorMessages: string[];
}

/**
 * Validates double-entry constraint (Total Debit == Total Credit)
 */
export function validateJournalEntry(
  lines: { accountId: string; debit: number; credit: number; description?: string }[],
  accounts: Account[]
): ValidationResult {
  const errors: string[] = [];
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  if (!lines || lines.length < 2) {
    errors.push('Jurnal minimal harus memiliki 2 baris akun (prinsip berpasangan).');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  lines.forEach((line, index) => {
    const acc = accountMap.get(line.accountId);
    if (!acc) {
      errors.push(`Baris #${index + 1}: Akun tidak valid atau belum dipilih.`);
      return;
    }
    if (acc.isHeader) {
      errors.push(`Baris #${index + 1}: Akun "${acc.code} - ${acc.name}" adalah akun induk (Header) dan tidak dapat diposting langsung.`);
    }
    if (!acc.isActive) {
      errors.push(`Baris #${index + 1}: Akun "${acc.code}" berstatus non-aktif.`);
    }

    const d = Number(line.debit) || 0;
    const c = Number(line.credit) || 0;

    if (d < 0 || c < 0) {
      errors.push(`Baris #${index + 1}: Nilai debit atau kredit tidak boleh negatif.`);
    }
    if (d > 0 && c > 0) {
      errors.push(`Baris #${index + 1}: Sebuah baris tidak boleh memiliki nilai Debit dan Kredit sekaligus.`);
    }
    if (d === 0 && c === 0) {
      errors.push(`Baris #${index + 1}: Nilai baris tidak boleh nol.`);
    }

    totalDebit = roundTo2Decimals(totalDebit + d);
    totalCredit = roundTo2Decimals(totalCredit + c);
  });

  const difference = roundTo2Decimals(Math.abs(totalDebit - totalCredit));
  if (difference !== 0) {
    errors.push(
      `Jurnal tidak seimbang (Unbalanced)! Total Debit (${formatRupiah(totalDebit)}) != Total Kredit (${formatRupiah(totalCredit)}). Selisih: ${formatRupiah(difference)}.`
    );
  }

  return {
    isValid: errors.length === 0,
    totalDebit,
    totalCredit,
    difference,
    errorMessages: errors
  };
}

/**
 * Recomputes all Account balances based on posted journal entries and initial balances
 */
export function recalculateAccountBalances(accounts: Account[], journals: JournalEntry[]): Account[] {
  // Map of accountId -> { totalDebit: number, totalCredit: number }
  const movements = new Map<string, { debit: number; credit: number }>();
  accounts.forEach((acc) => movements.set(acc.id, { debit: 0, credit: 0 }));

  // Aggregate only POSTED journals
  journals.filter((j) => j.status === 'POSTED').forEach((j) => {
    j.lines.forEach((line) => {
      const current = movements.get(line.accountId) || { debit: 0, credit: 0 };
      current.debit = roundTo2Decimals(current.debit + (Number(line.debit) || 0));
      current.credit = roundTo2Decimals(current.credit + (Number(line.credit) || 0));
      movements.set(line.accountId, current);
    });
  });

  return accounts.map((acc) => {
    if (acc.isHeader) {
      return { ...acc, balance: 0 };
    }

    const mov = movements.get(acc.id) || { debit: 0, credit: 0 };
    let newBalance = 0;

    if (acc.normalBalance === 'DEBIT') {
      newBalance = roundTo2Decimals(mov.debit - mov.credit);
    } else {
      newBalance = roundTo2Decimals(mov.credit - mov.debit);
    }

    return {
      ...acc,
      balance: newBalance
    };
  });
}

/**
 * Generates Real-time Trial Balance (Neraca Saldo)
 */
export function generateTrialBalance(accounts: Account[], journals: JournalEntry[]): {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
} {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const rowMap = new Map<string, { debit: number; credit: number }>();

  accounts.filter((a) => !a.isHeader).forEach((a) => {
    rowMap.set(a.id, { debit: 0, credit: 0 });
  });

  journals.filter((j) => j.status === 'POSTED').forEach((j) => {
    j.lines.forEach((line) => {
      const entry = rowMap.get(line.accountId);
      if (entry) {
        entry.debit = roundTo2Decimals(entry.debit + (Number(line.debit) || 0));
        entry.credit = roundTo2Decimals(entry.credit + (Number(line.credit) || 0));
      }
    });
  });

  let grandDebit = 0;
  let grandCredit = 0;

  const rows: TrialBalanceRow[] = accounts
    .filter((a) => !a.isHeader)
    .map((acc) => {
      const m = rowMap.get(acc.id) || { debit: 0, credit: 0 };
      let endingDebit = 0;
      let endingCredit = 0;

      if (acc.normalBalance === 'DEBIT') {
        const net = roundTo2Decimals(m.debit - m.credit);
        if (net >= 0) {
          endingDebit = net;
        } else {
          endingCredit = Math.abs(net);
        }
      } else {
        const net = roundTo2Decimals(m.credit - m.debit);
        if (net >= 0) {
          endingCredit = net;
        } else {
          endingDebit = Math.abs(net);
        }
      }

      grandDebit = roundTo2Decimals(grandDebit + endingDebit);
      grandCredit = roundTo2Decimals(grandCredit + endingCredit);

      return {
        accountCode: acc.code,
        accountName: acc.name,
        category: acc.category,
        initialDebit: 0,
        initialCredit: 0,
        movementDebit: m.debit,
        movementCredit: m.credit,
        endingDebit,
        endingCredit
      };
    })
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  const isBalanced = roundTo2Decimals(Math.abs(grandDebit - grandCredit)) === 0;

  return {
    rows,
    totalDebit: grandDebit,
    totalCredit: grandCredit,
    isBalanced
  };
}

/**
 * Generates Real-time Balance Sheet (Neraca) & Income Statement (Laba Rugi)
 */
export function computeFinancialStatements(accounts: Account[]) {
  const currentAssets = accounts
    .filter((a) => !a.isHeader && a.category === 'ASSET' && a.code.startsWith('11'))
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const fixedAssets = accounts
    .filter((a) => !a.isHeader && a.category === 'ASSET' && a.code.startsWith('12'))
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const totalAssets = roundTo2Decimals(currentAssets + fixedAssets);

  const currentLiabilities = accounts
    .filter((a) => !a.isHeader && a.category === 'LIABILITY' && a.code.startsWith('21'))
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const longTermLiabilities = accounts
    .filter((a) => !a.isHeader && a.category === 'LIABILITY' && a.code.startsWith('22'))
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const totalLiabilities = roundTo2Decimals(currentLiabilities + longTermLiabilities);

  const totalRevenue = accounts
    .filter((a) => !a.isHeader && a.category === 'REVENUE')
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const cogs = accounts
    .filter((a) => !a.isHeader && a.category === 'EXPENSE' && a.code.startsWith('5'))
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const operatingExpenses = accounts
    .filter((a) => !a.isHeader && a.category === 'EXPENSE' && a.code.startsWith('6'))
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const totalExpenses = roundTo2Decimals(cogs + operatingExpenses);
  const netIncome = roundTo2Decimals(totalRevenue - totalExpenses);

  const paidInCapital = accounts
    .filter((a) => !a.isHeader && a.category === 'EQUITY' && a.code === '3110')
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const retainedEarnings = accounts
    .filter((a) => !a.isHeader && a.category === 'EQUITY' && a.code === '3210')
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const totalEquity = roundTo2Decimals(paidInCapital + retainedEarnings + netIncome);

  const isBalanceSheetBalanced = roundTo2Decimals(Math.abs(totalAssets - (totalLiabilities + totalEquity))) === 0;

  return {
    currentAssets,
    fixedAssets,
    totalAssets,
    currentLiabilities,
    longTermLiabilities,
    totalLiabilities,
    paidInCapital,
    retainedEarnings,
    netIncome,
    totalEquity,
    totalLiabilitiesAndEquity: roundTo2Decimals(totalLiabilities + totalEquity),
    isBalanceSheetBalanced,
    totalRevenue,
    cogs,
    grossProfit: roundTo2Decimals(totalRevenue - cogs),
    operatingExpenses,
    totalExpenses
  };
}

/**
 * Computes Aging Schedule for AR & AP
 */
export function computeAgingReport(invoices: Invoice[], type: 'RECEIVABLE' | 'PAYABLE') {
  const targetInvoices = invoices.filter((i) => i.type === type && (i.status === 'UNPAID' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID'));
  const today = new Date('2026-10-28'); // anchored to system metadata date

  const buckets: AgingBucket[] = [
    { period: '0 - 30 Hari (Current)', amount: 0, count: 0, invoices: [] },
    { period: '31 - 60 Hari', amount: 0, count: 0, invoices: [] },
    { period: '61 - 90 Hari', amount: 0, count: 0, invoices: [] },
    { period: '> 90 Hari (Macet)', amount: 0, count: 0, invoices: [] }
  ];

  targetInvoices.forEach((inv) => {
    const outstanding = roundTo2Decimals(inv.totalAmount - inv.paidAmount);
    if (outstanding <= 0) return;

    const dueDate = new Date(inv.dueDate);
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      buckets[0].amount = roundTo2Decimals(buckets[0].amount + outstanding);
      buckets[0].count += 1;
      buckets[0].invoices.push(inv);
    } else if (diffDays <= 60) {
      buckets[1].amount = roundTo2Decimals(buckets[1].amount + outstanding);
      buckets[1].count += 1;
      buckets[1].invoices.push(inv);
    } else if (diffDays <= 90) {
      buckets[2].amount = roundTo2Decimals(buckets[2].amount + outstanding);
      buckets[2].count += 1;
      buckets[2].invoices.push(inv);
    } else {
      buckets[3].amount = roundTo2Decimals(buckets[3].amount + outstanding);
      buckets[3].count += 1;
      buckets[3].invoices.push(inv);
    }
  });

  const totalOutstanding = buckets.reduce((s, b) => roundTo2Decimals(s + b.amount), 0);

  return {
    buckets,
    totalOutstanding
  };
}

/**
 * Computes Financial Ratios
 */
export function computeFinancialRatios(accounts: Account[], journals: JournalEntry[]): FinancialRatios {
  const statements = computeFinancialStatements(accounts);

  const currentRatio = statements.currentLiabilities > 0
    ? roundTo2Decimals(statements.currentAssets / statements.currentLiabilities)
    : 0;

  // Quick Ratio = (Cash + Bank + AR) / Current Liabilities
  const quickAssets = accounts
    .filter((a) => !a.isHeader && (a.code === '1110' || a.code === '1120' || a.code === '1130'))
    .reduce((sum, a) => roundTo2Decimals(sum + a.balance), 0);

  const quickRatio = statements.currentLiabilities > 0
    ? roundTo2Decimals(quickAssets / statements.currentLiabilities)
    : 0;

  const netProfitMargin = statements.totalRevenue > 0
    ? roundTo2Decimals((statements.netIncome / statements.totalRevenue) * 100)
    : 0;

  const debtToEquity = statements.totalEquity > 0
    ? roundTo2Decimals(statements.totalLiabilities / statements.totalEquity)
    : 0;

  const unbalancedCount = journals.filter((j) => {
    const diff = Math.abs(j.totalDebit - j.totalCredit);
    return roundTo2Decimals(diff) !== 0;
  }).length;

  return {
    currentRatio,
    quickRatio,
    netProfitMargin,
    debtToEquity,
    totalAssets: statements.totalAssets,
    totalLiabilities: statements.totalLiabilities,
    totalEquity: statements.totalEquity,
    totalRevenue: statements.totalRevenue,
    totalExpenses: statements.totalExpenses,
    netIncome: statements.netIncome,
    unbalancedJournalsCount: unbalancedCount
  };
}

/**
 * Helper to export data to CSV
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join(
      '\n'
    );

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Computes Fiscal Year Budget vs Actual Ledger Variance Analysis
 */
export function computeBudgetVarianceAnalysis(
  budgets: BudgetItem[],
  accounts: Account[]
): {
  items: BudgetVarianceAnalysis[];
  totalBudgetExpense: number;
  totalActualExpense: number;
  totalExpenseVariance: number;
  totalBudgetRevenue: number;
  totalActualRevenue: number;
  totalRevenueVariance: number;
  overallHealthStatus: 'HEALTHY' | 'MODERATE_OVERSPEND' | 'CRITICAL_OVERSPEND';
} {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  let totalBudgetExpense = 0;
  let totalActualExpense = 0;
  let totalBudgetRevenue = 0;
  let totalActualRevenue = 0;

  const items: BudgetVarianceAnalysis[] = budgets.map((b) => {
    const acc = accountMap.get(b.accountId) || accounts.find((a) => a.code === b.accountCode);
    const actualAmount = acc ? roundTo2Decimals(acc.balance) : 0;
    const category = b.category || acc?.category || 'EXPENSE';

    let varianceAmount = 0;
    let variancePercentage = 0;
    let utilizationRate = 0;
    let status: 'FAVORABLE' | 'UNFAVORABLE' | 'ON_TRACK' = 'ON_TRACK';
    let description = '';

    if (b.annualBudget > 0) {
      utilizationRate = roundTo2Decimals((actualAmount / b.annualBudget) * 100);
    }

    if (category === 'EXPENSE') {
      totalBudgetExpense = roundTo2Decimals(totalBudgetExpense + b.annualBudget);
      totalActualExpense = roundTo2Decimals(totalActualExpense + actualAmount);

      // In expense: Budget - Actual. Positive = Under budget (Favorable); Negative = Over budget (Unfavorable)
      varianceAmount = roundTo2Decimals(b.annualBudget - actualAmount);
      variancePercentage = b.annualBudget > 0 ? roundTo2Decimals((varianceAmount / b.annualBudget) * 100) : 0;

      if (actualAmount > b.annualBudget) {
        status = 'UNFAVORABLE';
        description = `Over budget sebesar ${formatRupiah(Math.abs(varianceAmount))} (${utilizationRate}% terpakai)`;
      } else if (utilizationRate >= 85) {
        status = 'ON_TRACK';
        description = `Mendekati limit anggaran (${utilizationRate}% terpakai)`;
      } else {
        status = 'FAVORABLE';
        description = `Sisa anggaran aman ${formatRupiah(varianceAmount)} (${utilizationRate}% terpakai)`;
      }
    } else if (category === 'REVENUE') {
      totalBudgetRevenue = roundTo2Decimals(totalBudgetRevenue + b.annualBudget);
      totalActualRevenue = roundTo2Decimals(totalActualRevenue + actualAmount);

      // In revenue: Actual - Budget. Positive = Target exceeded (Favorable); Negative = Below target (Unfavorable)
      varianceAmount = roundTo2Decimals(actualAmount - b.annualBudget);
      variancePercentage = b.annualBudget > 0 ? roundTo2Decimals((varianceAmount / b.annualBudget) * 100) : 0;

      if (actualAmount >= b.annualBudget) {
        status = 'FAVORABLE';
        description = `Target penjualan terlampaui (+${formatRupiah(varianceAmount)})`;
      } else if (utilizationRate >= 75) {
        status = 'ON_TRACK';
        description = `Progres target penjualan on-track (${utilizationRate}%)`;
      } else {
        status = 'UNFAVORABLE';
        description = `Di bawah target penjualan ${formatRupiah(Math.abs(varianceAmount))}`;
      }
    } else {
      varianceAmount = roundTo2Decimals(b.annualBudget - actualAmount);
      variancePercentage = b.annualBudget > 0 ? roundTo2Decimals((varianceAmount / b.annualBudget) * 100) : 0;
      status = 'ON_TRACK';
      description = `Realisasi akun ${utilizationRate}% dari alokasi`;
    }

    return {
      budgetItemId: b.id,
      accountId: b.accountId,
      accountCode: b.accountCode,
      accountName: b.accountName,
      category,
      fiscalYear: b.fiscalYear,
      annualBudget: b.annualBudget,
      actualAmount,
      varianceAmount,
      variancePercentage,
      utilizationRate,
      status,
      description
    };
  });

  const totalExpenseVariance = roundTo2Decimals(totalBudgetExpense - totalActualExpense);
  const totalRevenueVariance = roundTo2Decimals(totalActualRevenue - totalBudgetRevenue);

  let overallHealthStatus: 'HEALTHY' | 'MODERATE_OVERSPEND' | 'CRITICAL_OVERSPEND' = 'HEALTHY';
  if (totalExpenseVariance < 0) {
    overallHealthStatus = Math.abs(totalExpenseVariance) > totalBudgetExpense * 0.1
      ? 'CRITICAL_OVERSPEND'
      : 'MODERATE_OVERSPEND';
  }

  return {
    items,
    totalBudgetExpense,
    totalActualExpense,
    totalExpenseVariance,
    totalBudgetRevenue,
    totalActualRevenue,
    totalRevenueVariance,
    overallHealthStatus
  };
}

