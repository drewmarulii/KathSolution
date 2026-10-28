/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Account, BudgetItem, UserRole } from '../types/accounting';
import {
  computeBudgetVarianceAnalysis,
  formatRupiah,
  roundTo2Decimals,
  exportToCSV
} from '../services/accountingEngine';

interface BudgetPlanningViewProps {
  accounts: Account[];
  budgets: BudgetItem[];
  onSaveBudget: (budget: BudgetItem) => void;
  onDeleteBudget: (budgetId: string) => void;
  userRole: UserRole;
  setActiveTab: (tab: string) => void;
}

export const BudgetPlanningView: React.FC<BudgetPlanningViewProps> = ({
  accounts,
  budgets,
  onSaveBudget,
  onDeleteBudget,
  userRole,
  setActiveTab
}) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(2026);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'EXPENSE' | 'REVENUE' | 'CRITICAL_90'>('ALL');
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);

  // Form states
  const [formAccountId, setFormAccountId] = useState('');
  const [formAnnualBudget, setFormAnnualBudget] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  const canManageBudget = userRole === 'SUPER_ADMIN' || userRole === 'ACCOUNTANT';

  // 1. All budget items for selected fiscal year
  const allFiscalYearBudgets = budgets.filter((b) => b.fiscalYear === selectedFiscalYear);
  const fullAnalysis = computeBudgetVarianceAnalysis(allFiscalYearBudgets, accounts);

  // 2. Identify accounts where actual spending has reached or exceeded 90% of set budget limit
  const criticalAccounts = fullAnalysis.items.filter(
    (item) => item.category === 'EXPENSE' && item.annualBudget > 0 && item.utilizationRate >= 90
  );

  // 3. Filtered items for display
  const displayedItems = fullAnalysis.items.filter((item) => {
    if (categoryFilter === 'CRITICAL_90') {
      return item.category === 'EXPENSE' && item.annualBudget > 0 && item.utilizationRate >= 90;
    }
    if (categoryFilter === 'ALL') return true;
    return item.category === categoryFilter;
  });

  const analysis = fullAnalysis;
  const postableAccounts = accounts.filter((a) => !a.isHeader);

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    const defaultAcc = postableAccounts.find((a) => a.category === 'EXPENSE') || postableAccounts[0];
    setFormAccountId(defaultAcc?.id || '');
    setFormAnnualBudget(100000000);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BudgetItem) => {
    setEditingBudget(item);
    setFormAccountId(item.accountId);
    setFormAnnualBudget(item.annualBudget);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = accounts.find((a) => a.id === formAccountId);
    if (!acc) return;

    const budgetItem: BudgetItem = {
      id: editingBudget ? editingBudget.id : `b-${acc.code}-${Date.now()}`,
      accountId: acc.id,
      accountCode: acc.code,
      accountName: acc.name,
      category: acc.category,
      fiscalYear: selectedFiscalYear,
      annualBudget: roundTo2Decimals(formAnnualBudget),
      notes: formNotes.trim(),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: 'finance.lead@enterprise.co.id'
    };

    onSaveBudget(budgetItem);
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Kode Akun',
      'Nama Akun',
      'Kategori',
      'Tahun Fiskal',
      'Plafon Anggaran (Budget)',
      'Realisasi Buku Besar (Actual)',
      'Varians Nominal',
      'Varians %',
      'Tingkat Penyerapan %',
      'Status Kinerja'
    ];
    const rows = analysis.items.map((it) => [
      it.accountCode,
      it.accountName,
      it.category,
      it.fiscalYear,
      it.annualBudget,
      it.actualAmount,
      it.varianceAmount,
      it.variancePercentage,
      it.utilizationRate,
      it.status
    ]);
    exportToCSV(`Budget_Variance_Analysis_FY${selectedFiscalYear}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>Modul Akuntansi Manajerial</span>
              <span aria-hidden="true">·</span>
              <span>Budget Planning &amp; Cost Control</span>
              <span aria-hidden="true">·</span>
              <span>Tahun Anggaran {selectedFiscalYear}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Budget Planning &amp; Variance Analysis vs Actual Ledger
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Tetapkan batas limit pagu anggaran tahunan per akun buku besar dan pantau analisis varians
              (*Favorable / Unfavorable*) secara real-time terhadap saldo aktual mutasi transaksi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              Unduh Analisis (.CSV)
            </button>
            {canManageBudget && (
              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer shadow-xs"
              >
                + Tetapkan Pagu Anggaran
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 90% Threshold Budget Alert Notification Feature */}
      {criticalAccounts.length > 0 && (
        <div className="space-y-2">
          {!isAlertDismissed ? (
            <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-5 text-slate-900 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-amber-500 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">
                    !
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-sm font-bold text-amber-950">
                        Peringatan Plafon Anggaran: {criticalAccounts.length} Akun Beban Telah Melampaui 90% Limit
                      </h2>
                      <span className="text-[11px] font-mono text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded font-semibold">
                        Ambang Kritis &ge; 90%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-900/80 font-mono mb-2">
                      <span>Tahun Fiskal {selectedFiscalYear}</span>
                      <span aria-hidden="true">·</span>
                      <span>Sistem Pengawasan Keuangan</span>
                      <span aria-hidden="true">·</span>
                      <span>{criticalAccounts.length} Akun Membutuhkan Evaluasi</span>
                    </div>
                    <p className="text-xs text-amber-900/90 leading-relaxed max-w-3xl">
                      Realisasi aktual pada buku besar telah menyerap lebih dari 90% alokasi plafon belanja tahunan.
                      Manajer keuangan disarankan meninjau efisiensi pengeluaran atau mengajukan adendum plafon anggaran (*budget revision*).
                    </p>

                    {/* Critical Accounts Cards Grid */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {criticalAccounts.map((item) => {
                        const rawBudget = budgets.find((b) => b.id === item.budgetItemId);
                        const isOver = item.actualAmount > item.annualBudget;

                        return (
                          <div
                            key={item.budgetItemId}
                            className="bg-white border border-amber-300 rounded-lg p-3.5 flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {item.accountCode}
                                </span>
                                <span className="text-xs font-semibold text-slate-800 ml-1.5">
                                  {item.accountName}
                                </span>
                              </div>
                              <span
                                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                                  isOver
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {item.utilizationRate}% Terpakai
                              </span>
                            </div>

                            <div className="mt-2 text-xs font-mono text-slate-600 flex justify-between">
                              <span>Realisasi: <strong className="text-slate-900">{formatRupiah(item.actualAmount)}</strong></span>
                              <span>Plafon: {formatRupiah(item.annualBudget)}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 mb-2">
                              <div
                                className={`h-full ${isOver ? 'bg-rose-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span className={`font-mono text-[11px] font-medium ${isOver ? 'text-rose-700' : 'text-amber-800'}`}>
                                {isOver
                                  ? `Over Budget: ${formatRupiah(Math.abs(item.varianceAmount))}`
                                  : `Sisa Pagu: ${formatRupiah(item.varianceAmount)}`}
                              </span>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setActiveTab('ledger')}
                                  className="text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
                                >
                                  Buku Besar
                                </button>
                                {canManageBudget && rawBudget && (
                                  <button
                                    onClick={() => handleOpenEditModal(rawBudget)}
                                    className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                                  >
                                    Sesuaikan Pagu &rarr;
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => setCategoryFilter('CRITICAL_90')}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded transition-colors cursor-pointer"
                  >
                    Filter di Tabel &rarr;
                  </button>
                  <button
                    onClick={() => setIsAlertDismissed(true)}
                    className="text-amber-800 hover:text-amber-950 text-xs px-2.5 py-1.5 cursor-pointer font-medium"
                    title="Tutup notifikasi sementara"
                  >
                    Sembunyikan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <span className="font-bold">⚠️ Perhatian:</span>
                <span>{criticalAccounts.length} akun beban telah menyerap &gt;90% pagu anggaran.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCategoryFilter('CRITICAL_90')}
                  className="text-amber-900 hover:text-amber-950 font-semibold underline cursor-pointer"
                >
                  Lihat Akun Kritis
                </button>
                <button
                  onClick={() => setIsAlertDismissed(false)}
                  className="text-amber-800 hover:text-amber-950 font-medium cursor-pointer"
                >
                  Tampilkan Notifikasi Lengkap &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards: Budget vs Actual Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Expense Budget vs Actual */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">
              Total Pagu Beban Operasional (Expense)
            </span>
            <span
              className={`text-[11px] font-mono font-semibold ${
                analysis.totalExpenseVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {analysis.totalExpenseVariance >= 0 ? 'FAVORABLE (HEMAT)' : 'UNFAVORABLE (OVER)'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatRupiah(analysis.totalActualExpense)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {formatRupiah(analysis.totalBudgetExpense)}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Penyerapan Anggaran</span>
              <span className="font-mono font-semibold tabular-nums">
                {analysis.totalBudgetExpense > 0
                  ? Math.round((analysis.totalActualExpense / analysis.totalBudgetExpense) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  analysis.totalActualExpense > analysis.totalBudgetExpense
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    analysis.totalBudgetExpense > 0
                      ? (analysis.totalActualExpense / analysis.totalBudgetExpense) * 100
                      : 0
                  )}%`
                }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Sisa pagu anggaran tersedia: <strong>{formatRupiah(Math.max(0, analysis.totalExpenseVariance))}</strong>
          </div>
        </div>

        {/* Revenue Target vs Actual */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">
              Target Pendapatan (Revenue Target)
            </span>
            <span
              className={`text-[11px] font-mono font-semibold ${
                analysis.totalActualRevenue >= analysis.totalBudgetRevenue
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            >
              {analysis.totalActualRevenue >= analysis.totalBudgetRevenue ? 'TERCAPAI' : 'ON TRACK'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {formatRupiah(analysis.totalActualRevenue)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {formatRupiah(analysis.totalBudgetRevenue)}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Pencapaian Omset</span>
              <span className="font-mono font-semibold tabular-nums">
                {analysis.totalBudgetRevenue > 0
                  ? Math.round((analysis.totalActualRevenue / analysis.totalBudgetRevenue) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{
                  width: `${Math.min(
                    100,
                    analysis.totalBudgetRevenue > 0
                      ? (analysis.totalActualRevenue / analysis.totalBudgetRevenue) * 100
                      : 0
                  )}%`
                }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Selisih pencapaian target: <strong>{formatRupiah(analysis.totalRevenueVariance)}</strong>
          </div>
        </div>

        {/* Financial Discipline & Health Indicator */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Status Disiplin Fiskal Perusahaan
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {analysis.overallHealthStatus === 'HEALTHY'
              ? 'Disiplin Optimal'
              : analysis.overallHealthStatus === 'MODERATE_OVERSPEND'
              ? 'Peringatan Anggaran'
              : 'Overspend Kritis'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Semua pengeluaran beban terkontrol di bawah limit pagu dengan cadangan likuiditas kas aman.
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tahun Buku Fiskal:</span>
            <div className="flex items-center gap-1 font-mono font-semibold">
              <button
                onClick={() => setSelectedFiscalYear(2026)}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedFiscalYear === 2026 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                FY 2026
              </button>
              <button
                onClick={() => setSelectedFiscalYear(2027)}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedFiscalYear === 2027 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                FY 2027
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Pagu Anggaran ({allFiscalYearBudgets.length})
        </button>
        <button
          onClick={() => setCategoryFilter('EXPENSE')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            categoryFilter === 'EXPENSE' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Beban &amp; Operasional (Expense)
        </button>
        <button
          onClick={() => setCategoryFilter('REVENUE')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            categoryFilter === 'REVENUE' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Target Pendapatan (Revenue)
        </button>
        <button
          onClick={() => setCategoryFilter('CRITICAL_90')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'CRITICAL_90'
              ? 'bg-amber-600 text-white shadow-xs font-semibold'
              : criticalAccounts.length > 0
              ? 'bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Peringatan Limit &gt;90%</span>
          {criticalAccounts.length > 0 && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                categoryFilter === 'CRITICAL_90'
                  ? 'bg-amber-900 text-white'
                  : 'bg-amber-200 text-amber-950'
              }`}
            >
              {criticalAccounts.length}
            </span>
          )}
        </button>
      </div>

      {/* Variance Analysis Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Analisis Varians Anggaran vs Buku Besar (Variance Ledger Sheet)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Varians = Pagu Anggaran - Realisasi Aktual untuk Beban; Realisasi - Target untuk Pendapatan. Baris berwarna menandakan penyerapan &gt;90%.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500">
            {displayedItems.length} Akun Ditampilkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200 uppercase">
              <tr>
                <th className="px-4 py-2.5 w-28">Kode Akun</th>
                <th className="px-4 py-2.5">Nama Akun Buku Besar</th>
                <th className="px-4 py-2.5 w-24">Kategori</th>
                <th className="px-4 py-2.5 w-36 text-right">Pagu Budget (IDR)</th>
                <th className="px-4 py-2.5 w-36 text-right">Aktual Mutasi (IDR)</th>
                <th className="px-4 py-2.5 w-36 text-right">Varians (IDR)</th>
                <th className="px-4 py-2.5 w-44">Penyerapan Anggaran</th>
                <th className="px-4 py-2.5 w-32 text-center">Status</th>
                <th className="px-4 py-2.5 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 italic">
                    Tidak ada akun untuk filter ini. Silakan pilih tab filter lain atau tetapkan pagu anggaran baru.
                  </td>
                </tr>
              ) : (
                displayedItems.map((row) => {
                  const rawBudget = budgets.find((b) => b.id === row.budgetItemId);
                  const isCritical = row.category === 'EXPENSE' && row.annualBudget > 0 && row.utilizationRate >= 90;
                  const isOver = row.category === 'EXPENSE' && row.annualBudget > 0 && row.actualAmount > row.annualBudget;

                  return (
                    <tr
                      key={row.budgetItemId}
                      className={`transition-colors ${
                        isOver
                          ? 'bg-rose-50/70 hover:bg-rose-100/70 border-l-4 border-rose-500'
                          : isCritical
                          ? 'bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-amber-500'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {row.accountCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900">{row.accountName}</span>
                          {isOver ? (
                            <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded whitespace-nowrap">
                              OVER BUDGET ({row.utilizationRate}%)
                            </span>
                          ) : isCritical ? (
                            <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded whitespace-nowrap">
                              &gt;90% TERPAKAI ({row.utilizationRate}%)
                            </span>
                          ) : null}
                        </div>
                        {rawBudget?.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 max-w-sm truncate">
                            {rawBudget.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {row.category}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {formatRupiah(row.annualBudget)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatRupiah(row.actualAmount)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          row.status === 'FAVORABLE'
                            ? 'text-emerald-700'
                            : row.status === 'UNFAVORABLE'
                            ? 'text-rose-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {formatRupiah(row.varianceAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                          <span className={`font-semibold ${isOver ? 'text-rose-700' : isCritical ? 'text-amber-800' : ''}`}>
                            {row.utilizationRate}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {row.category === 'EXPENSE' ? 'Terpakai' : 'Tercapai'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isOver
                                ? 'bg-rose-500'
                                : isCritical
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, row.utilizationRate))}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {isOver ? (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded text-rose-800 bg-rose-100 border border-rose-200">
                            OVER LIMIT
                          </span>
                        ) : isCritical ? (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded text-amber-900 bg-amber-100 border border-amber-200">
                            KRITIS (&gt;90%)
                          </span>
                        ) : (
                          <span
                            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                              row.status === 'FAVORABLE'
                                ? 'text-emerald-800 bg-emerald-50'
                                : row.status === 'UNFAVORABLE'
                                ? 'text-rose-800 bg-rose-50'
                                : 'text-blue-800 bg-blue-50'
                            }`}
                          >
                            {row.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {canManageBudget && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => rawBudget && handleOpenEditModal(rawBudget)}
                              className="text-slate-700 hover:text-slate-950 text-xs font-semibold underline cursor-pointer"
                              title="Sesuaikan pagu"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteBudget(row.budgetItemId)}
                              className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                              title="Hapus"
                            >
                              &times;
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {analysis.items.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono font-bold text-slate-900">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right">
                    TOTAL EXPENSE BUDGET:
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRupiah(analysis.totalBudgetExpense)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRupiah(analysis.totalActualExpense)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums ${
                      analysis.totalExpenseVariance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatRupiah(analysis.totalExpenseVariance)}
                  </td>
                  <td colSpan={3} className="px-4 py-3 text-slate-500 text-[11px] font-normal">
                    {analysis.totalExpenseVariance >= 0
                      ? 'Realisasi beban hemat dan terkontrol dengan baik'
                      : 'Terjadi pelampauan beban pada pos tertentu'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Spring Boot Architectural Implementation Box */}
      <div className="bg-slate-900 text-slate-100 rounded-lg p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Spring Boot 3 Implementation: Budget Planning Module
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pola arsitektur enterprise untuk pengelolaan anggaran, kontrol transaksi, dan agregasi varians.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('blueprint')}
            className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
          >
            Buka Source Code Lengkap &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-semibold">1. JPA ENTITY SCHEMA</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              Tabel <code>budget_plans</code> (fiscal_year, status APPROVED) dan <code>budget_plan_items</code> (account_id, annual_limit, quarterly_limit).
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-semibold">2. PRE-COMMIT BUDGET CHECK</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              Intersepsi transaksi di <code>JournalEntryService</code>: jika posting beban melebihi limit anggaran, sistem memicu notifikasi peringatan atau approval workflow.
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-semibold">3. REAL-TIME SQL VARIANCE</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              Query agregasi SQL performa tinggi: menggabungkan saldo akun aktual (SUM journal lines) dengan tabel plafon anggaran tanpa bottleneck N+1.
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingBudget ? 'Ubah Pagu Anggaran Akun' : 'Tetapkan Pagu Anggaran Akun Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih Akun Buku Besar (CoA)
                </label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  disabled={!!editingBudget}
                  className="w-full border border-slate-200 rounded px-3 py-2 bg-slate-50 font-mono text-slate-900"
                >
                  {postableAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.category})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Pilih akun beban (Expense) atau pendapatan (Revenue) yang akan ditetapkan pagunya.
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Plafon Anggaran Tahunan (Annual Budget Limit IDR)
                </label>
                <input
                  type="number"
                  step="1000000"
                  required
                  value={formAnnualBudget}
                  onChange={(e) => setFormAnnualBudget(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-200 rounded px-3 py-2 font-mono text-slate-900 text-base"
                />
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                  {formatRupiah(formAnnualBudget)}
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Catatan Kebijakan &amp; Justifikasi Anggaran
                </label>
                <textarea
                  rows={3}
                  placeholder="Misal: Pagu server compute AWS RDS PostgreSQL Multi-AZ dan backup off-site..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer shadow-xs"
                >
                  Simpan Anggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
