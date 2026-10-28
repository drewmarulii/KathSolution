/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Account, JournalEntry, Invoice, Payment, UserRole, BudgetItem } from './types/accounting';
import {
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_BUDGETS
} from './services/mockEnterpriseData';
import {
  recalculateAccountBalances,
  roundTo2Decimals
} from './services/accountingEngine';
import { TopBar } from './components/TopBar';
import { FinancialHealthDashboard } from './components/FinancialHealthDashboard';
import { BudgetPlanningView } from './components/BudgetPlanningView';
import { DoubleEntrySimulator } from './components/DoubleEntrySimulator';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { GeneralLedgerView } from './components/GeneralLedgerView';
import { FinancialReportsView } from './components/FinancialReportsView';
import { ArchitectureBlueprintView } from './components/ArchitectureBlueprintView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('SUPER_ADMIN');

  // Core financial state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [accounts, setAccounts] = useState<Account[]>(() =>
    recalculateAccountBalances(INITIAL_ACCOUNTS, INITIAL_JOURNAL_ENTRIES)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [budgets, setBudgets] = useState<BudgetItem[]>(INITIAL_BUDGETS);

  // Recalculate account balances whenever journal entries change
  const handlePostJournal = (newEntry: JournalEntry) => {
    const updatedJournals = [newEntry, ...journalEntries];
    setJournalEntries(updatedJournals);
    const updatedAccounts = recalculateAccountBalances(accounts, updatedJournals);
    setAccounts(updatedAccounts);
  };

  // Reversal Storno implementation
  const handleReverseJournal = (journalId: string) => {
    const target = journalEntries.find((j) => j.id === journalId);
    if (!target || target.status !== 'POSTED') return;

    const seqNum = String(journalEntries.length + 1).padStart(5, '0');
    const reversalVoucher = `REV-JV-${seqNum}`;

    // Invert Debit and Credit lines for Storno
    const reversedLines = target.lines.map((l, idx) => ({
      ...l,
      id: `rev-line-${Date.now()}-${idx}`,
      description: `Pembalikan Storno: ${l.description}`,
      debit: roundTo2Decimals(l.credit), // Inverted
      credit: roundTo2Decimals(l.debit)  // Inverted
    }));

    const stornoEntry: JournalEntry = {
      id: `rev-${Date.now()}`,
      entryNumber: reversalVoucher,
      referenceNumber: `REV-${target.entryNumber}`,
      date: new Date().toISOString().slice(0, 10),
      description: `STORNO PEMBALIKAN JURNAL: ${target.entryNumber} - ${target.description}`,
      status: 'POSTED',
      lines: reversedLines,
      totalDebit: target.totalCredit,
      totalCredit: target.totalDebit,
      createdBy: 'auditor.controller@enterprise.co.id',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      postedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    // Mark original as REVERSED
    const updatedJournals = journalEntries.map((j) =>
      j.id === journalId ? { ...j, status: 'REVERSED' as const, reversalEntryNumber: reversalVoucher } : j
    );

    const withStorno = [stornoEntry, ...updatedJournals];
    setJournalEntries(withStorno);
    const updatedAccounts = recalculateAccountBalances(accounts, withStorno);
    setAccounts(updatedAccounts);
  };

  const handleAddAccount = (newAccount: Account) => {
    setAccounts([...accounts, newAccount]);
  };

  const handleSaveBudget = (savedBudget: BudgetItem) => {
    const exists = budgets.some((b) => b.id === savedBudget.id);
    if (exists) {
      setBudgets(budgets.map((b) => (b.id === savedBudget.id ? savedBudget : b)));
    } else {
      setBudgets([savedBudget, ...budgets]);
    }
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter((b) => b.id !== budgetId));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar with Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onNewJournalClick={() => setActiveTab('simulator')}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <FinancialHealthDashboard
            accounts={accounts}
            journals={journalEntries}
            invoices={invoices}
            budgets={budgets}
            setActiveTab={setActiveTab}
            onNewJournalClick={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanningView
            accounts={accounts}
            budgets={budgets}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
            userRole={userRole}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'simulator' && (
          <DoubleEntrySimulator
            accounts={accounts}
            journalEntries={journalEntries}
            onPostJournal={handlePostJournal}
            onReverseJournal={handleReverseJournal}
            userRole={userRole}
          />
        )}

        {activeTab === 'coa' && (
          <ChartOfAccountsView
            accounts={accounts}
            onAddAccount={handleAddAccount}
            userRole={userRole}
          />
        )}

        {activeTab === 'ledger' && (
          <GeneralLedgerView
            accounts={accounts}
            journals={journalEntries}
          />
        )}

        {activeTab === 'reports' && (
          <FinancialReportsView
            accounts={accounts}
            journals={journalEntries}
            invoices={invoices}
          />
        )}

        {activeTab === 'blueprint' && (
          <ArchitectureBlueprintView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">FinLedger Enterprise</span>
            <span aria-hidden="true">·</span>
            <span>Spring Boot 3.4 &amp; PostgreSQL ACID Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('blueprint')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Blueprint Arsitektur
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Laporan Keuangan
            </button>
            <span className="font-mono text-slate-400">v1.0.0-RELEASE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
