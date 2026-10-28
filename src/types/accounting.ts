/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type NormalBalance = 'DEBIT' | 'CREDIT';

export interface Account {
  id: string;
  code: string;           // e.g., "1110", "1120", "2110", "4110"
  name: string;           // e.g., "Kas & Setara Kas", "Piutang Usaha"
  category: AccountCategory;
  normalBalance: NormalBalance;
  parentId: string | null;
  level: number;
  isHeader: boolean;      // True if header account (cannot be directly posted to)
  isActive: boolean;
  balance: number;        // Running balance
  description?: string;
}

export type JournalStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'VOIDED';

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;    // e.g., "JV-202610-00042"
  referenceNumber: string;// e.g., "INV-2026-089"
  date: string;           // YYYY-MM-DD
  description: string;
  status: JournalStatus;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  createdAt: string;
  postedAt?: string;
  reversedBy?: string;
  reversalEntryNumber?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'RECEIVABLE' | 'PAYABLE';
  partyName: string;       // Customer or Vendor
  partyTaxId: string;     // NPWP
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;        // e.g. 0.11 for 11% PPN
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  notes?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'GIRO';
  bankAccountId: string;
  referenceNo: string;
  notes?: string;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  initialDebit: number;
  initialCredit: number;
  movementDebit: number;
  movementCredit: number;
  endingDebit: number;
  endingCredit: number;
}

export interface FinancialRatios {
  currentRatio: number;
  quickRatio: number;
  netProfitMargin: number;
  debtToEquity: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  unbalancedJournalsCount: number;
}

export interface AgingBucket {
  period: string; // "0-30 Hari", "31-60 Hari", "61-90 Hari", ">90 Hari"
  amount: number;
  count: number;
  invoices: Invoice[];
}

export type UserRole = 'SUPER_ADMIN' | 'ACCOUNTANT' | 'AUDITOR' | 'VIEWER';

export interface UserSession {
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface BudgetItem {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  fiscalYear: number;
  annualBudget: number;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface BudgetVarianceAnalysis {
  budgetItemId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  fiscalYear: number;
  annualBudget: number;
  actualAmount: number;
  varianceAmount: number;       // Difference in absolute IDR
  variancePercentage: number;   // Percentage variance
  utilizationRate: number;      // % of budget consumed
  status: 'FAVORABLE' | 'UNFAVORABLE' | 'ON_TRACK';
  description: string;
}

