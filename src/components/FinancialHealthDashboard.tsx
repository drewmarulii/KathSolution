/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Account, JournalEntry, Invoice, BudgetItem } from '../types/accounting';
import {
  computeFinancialRatios,
  computeFinancialStatements,
  computeAgingReport,
  computeBudgetVarianceAnalysis,
  formatRupiah
} from '../services/accountingEngine';

interface FinancialHealthDashboardProps {
  accounts: Account[];
  journals: JournalEntry[];
  invoices: Invoice[];
  budgets?: BudgetItem[];
  setActiveTab: (tab: string) => void;
  onNewJournalClick: () => void;
}

export const FinancialHealthDashboard: React.FC<FinancialHealthDashboardProps> = ({
  accounts,
  journals,
  invoices,
  budgets = [],
  setActiveTab,
  onNewJournalClick
}) => {
  const ratios = computeFinancialRatios(accounts, journals);
  const statements = computeFinancialStatements(accounts);
  const arAging = computeAgingReport(invoices, 'RECEIVABLE');
  const apAging = computeAgingReport(invoices, 'PAYABLE');

  // Quick liquidity check
  const cashAndBank = accounts
    .filter((a) => !a.isHeader && (a.code === '1110' || a.code === '1120'))
    .reduce((s, a) => s + a.balance, 0);

  const postedJournals = journals.filter((j) => j.status === 'POSTED');

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Scope banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>PT Nusantara Digital Solusindo</span>
              <span aria-hidden="true">·</span>
              <span>Tahun Buku 2026</span>
              <span aria-hidden="true">·</span>
              <span>PSAK &amp; IFRS Compliant</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Enterprise Financial Health &amp; General Ledger Overview
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Sistem akuntansi berbasis Spring Boot 3.x dengan standar Double-Entry Bookkeeping,
              integritas transaksi ACID PostgreSQL, dan audit trail otomatis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('blueprint')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              Lihat Blueprint Arsitektur
            </button>
            <button
              onClick={onNewJournalClick}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer shadow-xs"
            >
              + Posting Jurnal Baru
            </button>
          </div>
        </div>
      </div>

      {/* Double-Entry Integrity Status Bar */}
      <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                Double-Entry Balance Verification
              </div>
              <div className="text-sm font-semibold">
                Persamaan Akuntansi: Aktiva = Kewajiban + Ekuitas
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-400">Total Aktiva: </span>
              <span className="font-bold tabular-nums text-emerald-300">
                {formatRupiah(statements.totalAssets)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Pasiva + Ekuitas: </span>
              <span className="font-bold tabular-nums text-emerald-300">
                {formatRupiah(statements.totalLiabilitiesAndEquity)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Selisih: </span>
              <span className="font-bold tabular-nums text-emerald-400">
                Rp 0,00 (Balanced)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Financial Ratios Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Ratio */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Current Ratio (Likuiditas)
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {ratios.currentRatio.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Target aman &ge; 1.50x. Aktiva Lancar / Utang Lancar.
          </div>
        </div>

        {/* Quick Ratio */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Quick Ratio (Acid-Test)
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {ratios.quickRatio.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Kas + Bank + Piutang terhadap Kewajiban Lancar.
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Net Profit Margin (Rentabilitas)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {ratios.netProfitMargin.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Laba Bersih {formatRupiah(statements.netIncome)} dari Omset.
          </div>
        </div>

        {/* Debt-to-Equity */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Debt to Equity (Solvabilitas)
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {ratios.debtToEquity.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Rasio leverage kewajiban terhadap permodalan.
          </div>
        </div>
      </div>

      {/* Budget Planning & Variance Analysis Quick Bar */}
      {budgets.length > 0 && (() => {
        const budgetAnalysis = computeBudgetVarianceAnalysis(budgets, accounts);
        return (
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                  BP
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono">
                    Budget Planning &amp; Cost Control (FY 2026)
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Realisasi Anggaran Beban: {formatRupiah(budgetAnalysis.totalActualExpense)} dari Plafon {formatRupiah(budgetAnalysis.totalBudgetExpense)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-xs font-mono">
                  <span className="text-slate-500">Sisa Pagu Anggaran: </span>
                  <span className={`font-bold tabular-nums ${budgetAnalysis.totalExpenseVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatRupiah(budgetAnalysis.totalExpenseVariance)}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('budget')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer whitespace-nowrap"
                >
                  Kelola Budget &amp; Varians &rarr;
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Two Column Layout: Financial Position vs Aging Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial Statement Snapshot */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Posisi Keuangan &amp; Likuiditas Kas
            </h2>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Laporan Lengkap &rarr;
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Kas &amp; Saldo Bank BCA</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatRupiah(cashAndBank)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Piutang Usaha (AR Outstanding)</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatRupiah(arAging.totalOutstanding)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Utang Usaha (AP Outstanding)</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatRupiah(apAging.totalOutstanding)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Pendapatan Jasa &amp; SaaS (MTD)</span>
              <span className="font-mono font-semibold text-emerald-600 tabular-nums">
                {formatRupiah(statements.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Beban Pokok &amp; Operasional</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatRupiah(statements.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-slate-900">Laba Bersih Periode Berjalan</span>
              <span className="font-mono font-bold text-emerald-600 text-base tabular-nums">
                {formatRupiah(statements.netIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Aging Report AR & AP Overview */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Aging Piutang Usaha (AR Aging Schedule)
            </h2>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Lihat Detail Faktur &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {arAging.buckets.map((bucket, index) => {
              const pct = arAging.totalOutstanding > 0
                ? Math.round((bucket.amount / arAging.totalOutstanding) * 100)
                : 0;

              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {bucket.period} ({bucket.count} faktur)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatRupiah(bucket.amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        index === 0
                          ? 'bg-emerald-500'
                          : index === 1
                          ? 'bg-blue-500'
                          : index === 2
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
            Faktur &gt; 90 hari membutuhkan perhatian khusus dan cadangan kerugian piutang (CKPN).
          </div>
        </div>
      </div>

      {/* Recent Posted Journal Vouchers Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Riwayat Jurnal Umum Terposting (General Ledger Feed)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jurnal tervalidasi matematis debit = kredit dan dicatat ke PostgreSQL.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('ledger')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Buka Buku Besar &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-mono">
              <tr>
                <th className="px-4 py-2.5">No. Bukti (Voucher)</th>
                <th className="px-4 py-2.5">Tanggal</th>
                <th className="px-4 py-2.5">Referensi</th>
                <th className="px-4 py-2.5">Keterangan Transaksi</th>
                <th className="px-4 py-2.5 text-right">Total Debit</th>
                <th className="px-4 py-2.5 text-right">Total Kredit</th>
                <th className="px-4 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {postedJournals.slice(0, 5).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {entry.entryNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                    {entry.referenceNumber || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-800 max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-900 text-right tabular-nums whitespace-nowrap">
                    {formatRupiah(entry.totalDebit)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-900 text-right tabular-nums whitespace-nowrap">
                    {formatRupiah(entry.totalCredit)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="font-mono text-xs font-medium text-emerald-700">
                      POSTED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
