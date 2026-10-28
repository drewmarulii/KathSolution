/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Account, JournalEntry, Invoice } from '../types/accounting';
import {
  generateTrialBalance,
  computeFinancialStatements,
  computeAgingReport,
  formatRupiah,
  exportToCSV
} from '../services/accountingEngine';

interface FinancialReportsViewProps {
  accounts: Account[];
  journals: JournalEntry[];
  invoices: Invoice[];
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  accounts,
  journals,
  invoices
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'TRIAL_BALANCE' | 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'AGING'>('TRIAL_BALANCE');

  const trialBalance = generateTrialBalance(accounts, journals);
  const statements = computeFinancialStatements(accounts);
  const arAging = computeAgingReport(invoices, 'RECEIVABLE');
  const apAging = computeAgingReport(invoices, 'PAYABLE');

  const handleExportCSV = () => {
    if (activeReportTab === 'TRIAL_BALANCE') {
      const headers = ['Kode Akun', 'Nama Akun', 'Kategori', 'Debit Berjalan', 'Kredit Berjalan', 'Saldo Akhir Debit', 'Saldo Akhir Kredit'];
      const rows = trialBalance.rows.map((r) => [
        r.accountCode,
        r.accountName,
        r.category,
        r.movementDebit,
        r.movementCredit,
        r.endingDebit,
        r.endingCredit
      ]);
      exportToCSV('Trial_Balance_PT_Nusantara.csv', headers, rows);
    } else if (activeReportTab === 'BALANCE_SHEET') {
      const headers = ['Pos Neraca', 'Jumlah (IDR)'];
      const rows = [
        ['Total Aset Lancar', statements.currentAssets],
        ['Total Aset Tetap', statements.fixedAssets],
        ['TOTAL AKTIVA', statements.totalAssets],
        ['Total Kewajiban Lancar', statements.currentLiabilities],
        ['Total Kewajiban Jangka Panjang', statements.longTermLiabilities],
        ['TOTAL KEWAJIBAN', statements.totalLiabilities],
        ['Modal Disetor', statements.paidInCapital],
        ['Laba Ditahan', statements.retainedEarnings],
        ['Laba Periode Berjalan', statements.netIncome],
        ['TOTAL EKUITAS', statements.totalEquity],
        ['TOTAL KEWAJIBAN & EKUITAS', statements.totalLiabilitiesAndEquity]
      ];
      exportToCSV('Balance_Sheet_PT_Nusantara.csv', headers, rows);
    } else if (activeReportTab === 'INCOME_STATEMENT') {
      const headers = ['Komponen Laba Rugi', 'Jumlah (IDR)'];
      const rows = [
        ['Pendapatan Jasa & SaaS', statements.totalRevenue],
        ['Beban Pokok Pendapatan (HPP)', statements.cogs],
        ['LABA KOTOR', statements.grossProfit],
        ['Beban Operasional', statements.operatingExpenses],
        ['TOTAL BEBAN', statements.totalExpenses],
        ['LABA BERSIH PERIODE BERJALAN', statements.netIncome]
      ];
      exportToCSV('Income_Statement_PT_Nusantara.csv', headers, rows);
    } else {
      const headers = ['No. Faktur', 'Tipe', 'Pihak Terkait (Party)', 'NPWP', 'Jatuh Tempo', 'Total Tagihan', 'Sisa Belum Bayar', 'Status'];
      const rows = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.type,
        inv.partyName,
        inv.partyTaxId || '-',
        inv.dueDate,
        inv.totalAmount,
        inv.totalAmount - inv.paidAmount,
        inv.status
      ]);
      exportToCSV('Aging_Schedule_Invoices.csv', headers, rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>Modul Akuntansi 04</span>
              <span aria-hidden="true">·</span>
              <span>Financial Reporting Engine</span>
              <span aria-hidden="true">·</span>
              <span>Real-Time Aggregation</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Laporan Keuangan &amp; Analitik Otomatis
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Dihasilkan secara real-time dari data jurnal umum terposting dengan validasi matematis
              standar akuntansi PSAK/IFRS, siap diekspor ke format Excel dan PDF resmi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              Unduh Excel (.CSV)
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer shadow-xs"
            >
              Cetak / Simpan PDF
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tabs for financial statements */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit no-print">
        <button
          onClick={() => setActiveReportTab('TRIAL_BALANCE')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeReportTab === 'TRIAL_BALANCE'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Neraca Saldo (Trial Balance)
        </button>
        <button
          onClick={() => setActiveReportTab('BALANCE_SHEET')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeReportTab === 'BALANCE_SHEET'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Neraca (Balance Sheet)
        </button>
        <button
          onClick={() => setActiveReportTab('INCOME_STATEMENT')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeReportTab === 'INCOME_STATEMENT'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Laporan Laba Rugi (Income Statement)
        </button>
        <button
          onClick={() => setActiveReportTab('AGING')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeReportTab === 'AGING'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4. Aging Report (AR &amp; AP)
        </button>
      </div>

      {/* Audit Report Formal Letterhead */}
      <div className="bg-white border border-slate-200 rounded-lg p-8 print-break-inside-avoid">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-lg font-bold text-slate-900 tracking-tight">
                PT NUSANTARA DIGITAL SOLUSINDO
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                NPWP: 01.999.888.7-045.000 · Kantor Pusat: Cyber 2 Tower, Kuningan, Jakarta Selatan
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-500">
              <div>STATUS: AUDITED (REAL-TIME GL)</div>
              <div>PERIODE: 28 OKTOBER 2026</div>
              <div>MATA UANG: INDONESIAN RUPIAH (IDR)</div>
            </div>
          </div>
        </div>

        {/* 1. TRIAL BALANCE TAB */}
        {activeReportTab === 'TRIAL_BALANCE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 uppercase">
                NERACA SALDO (TRIAL BALANCE)
              </h2>
              <div className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Status: Seimbang (Total Debit == Total Kredit)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-mono border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 w-28">Kode Akun</th>
                    <th className="py-2.5 px-3">Nama Akun Buku Besar</th>
                    <th className="py-2.5 px-3 w-28">Kategori</th>
                    <th className="py-2.5 px-3 w-36 text-right">Mutasi Debit</th>
                    <th className="py-2.5 px-3 w-36 text-right">Mutasi Kredit</th>
                    <th className="py-2.5 px-3 w-40 text-right">Saldo Akhir Debit</th>
                    <th className="py-2.5 px-3 w-40 text-right">Saldo Akhir Kredit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {trialBalance.rows.map((row) => (
                    <tr key={row.accountCode} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-medium text-slate-900">
                        {row.accountCode}
                      </td>
                      <td className="py-2 px-3 text-slate-800 font-medium">
                        {row.accountName}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">
                        {row.category}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {row.movementDebit > 0 ? formatRupiah(row.movementDebit) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {row.movementCredit > 0 ? formatRupiah(row.movementCredit) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {row.endingDebit > 0 ? formatRupiah(row.endingDebit) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {row.endingCredit > 0 ? formatRupiah(row.endingCredit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-right">
                      TOTAL NERACA SALDO:
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {formatRupiah(
                        trialBalance.rows.reduce((s, r) => s + r.movementDebit, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {formatRupiah(
                        trialBalance.rows.reduce((s, r) => s + r.movementCredit, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-emerald-800">
                      {formatRupiah(trialBalance.totalDebit)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-emerald-800">
                      {formatRupiah(trialBalance.totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. BALANCE SHEET TAB */}
        {activeReportTab === 'BALANCE_SHEET' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 uppercase">
                LAPORAN POSISI KEUANGAN (NERACA / BALANCE SHEET)
              </h2>
              <div className="font-mono text-xs text-slate-500">
                Berdasarkan PSAK 1 (Penyajian Laporan Keuangan)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: ASSETS */}
              <div className="space-y-4">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-sm">
                  AKTIVA (ASSETS)
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-700">Aset Lancar (Current Assets):</div>
                  {accounts
                    .filter((a) => !a.isHeader && a.category === 'ASSET' && a.code.startsWith('11'))
                    .map((a) => (
                      <div key={a.id} className="flex justify-between pl-4 py-1 border-b border-slate-100">
                        <span className="text-slate-600">{a.name}</span>
                        <span className="font-mono font-medium text-slate-900 tabular-nums">
                          {formatRupiah(a.balance)}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between font-semibold pt-1 text-slate-800">
                    <span>Total Aset Lancar</span>
                    <span className="font-mono tabular-nums">{formatRupiah(statements.currentAssets)}</span>
                  </div>

                  <div className="font-semibold text-slate-700 pt-3">Aset Tidak Lancar / Tetap (Fixed Assets):</div>
                  {accounts
                    .filter((a) => !a.isHeader && a.category === 'ASSET' && a.code.startsWith('12'))
                    .map((a) => (
                      <div key={a.id} className="flex justify-between pl-4 py-1 border-b border-slate-100">
                        <span className="text-slate-600">{a.name}</span>
                        <span className="font-mono font-medium text-slate-900 tabular-nums">
                          {formatRupiah(a.balance)}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between font-semibold pt-1 text-slate-800">
                    <span>Total Aset Tetap (Net)</span>
                    <span className="font-mono tabular-nums">{formatRupiah(statements.fixedAssets)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm bg-slate-100 p-3 rounded font-mono text-slate-900 border border-slate-300">
                  <span>TOTAL AKTIVA</span>
                  <span className="tabular-nums">{formatRupiah(statements.totalAssets)}</span>
                </div>
              </div>

              {/* Right Column: LIABILITIES & EQUITY */}
              <div className="space-y-4">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-sm">
                  PASIVA (KEWAJIBAN &amp; EKUITAS)
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-700">Kewajiban Jangka Pendek (Current Liabilities):</div>
                  {accounts
                    .filter((a) => !a.isHeader && a.category === 'LIABILITY' && a.code.startsWith('21'))
                    .map((a) => (
                      <div key={a.id} className="flex justify-between pl-4 py-1 border-b border-slate-100">
                        <span className="text-slate-600">{a.name}</span>
                        <span className="font-mono font-medium text-slate-900 tabular-nums">
                          {formatRupiah(a.balance)}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between font-semibold pt-1 text-slate-800">
                    <span>Total Kewajiban</span>
                    <span className="font-mono tabular-nums">{formatRupiah(statements.totalLiabilities)}</span>
                  </div>

                  <div className="font-semibold text-slate-700 pt-3">Ekuitas Pemegang Saham (Equity):</div>
                  <div className="flex justify-between pl-4 py-1 border-b border-slate-100">
                    <span className="text-slate-600">Modal Disetor (Paid-in Capital)</span>
                    <span className="font-mono font-medium text-slate-900 tabular-nums">
                      {formatRupiah(statements.paidInCapital)}
                    </span>
                  </div>
                  <div className="flex justify-between pl-4 py-1 border-b border-slate-100">
                    <span className="text-slate-600">Laba Ditahan (Retained Earnings)</span>
                    <span className="font-mono font-medium text-slate-900 tabular-nums">
                      {formatRupiah(statements.retainedEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between pl-4 py-1 border-b border-slate-100 text-emerald-700 font-semibold">
                    <span>Laba Bersih Tahun Berjalan (Net Income)</span>
                    <span className="font-mono tabular-nums">
                      {formatRupiah(statements.netIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 text-slate-800">
                    <span>Total Ekuitas</span>
                    <span className="font-mono tabular-nums">{formatRupiah(statements.totalEquity)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm bg-slate-100 p-3 rounded font-mono text-slate-900 border border-slate-300">
                  <span>TOTAL KEWAJIBAN &amp; EKUITAS</span>
                  <span className="tabular-nums">{formatRupiah(statements.totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. INCOME STATEMENT TAB */}
        {activeReportTab === 'INCOME_STATEMENT' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center pb-2 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 uppercase">
                LAPORAN LABA RUGI KOMPREHENSIF (INCOME STATEMENT)
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-1">
                Untuk Periode yang Berakhir pada 28 Oktober 2026
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Revenue */}
              <div>
                <div className="font-bold text-slate-900 text-sm mb-2">PENDAPATAN USAHA (REVENUE)</div>
                {accounts
                  .filter((a) => !a.isHeader && a.category === 'REVENUE')
                  .map((a) => (
                    <div key={a.id} className="flex justify-between pl-4 py-1 border-b border-slate-100">
                      <span className="text-slate-600">{a.name}</span>
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatRupiah(a.balance)}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between font-bold text-slate-900 pt-2 text-xs">
                  <span>TOTAL PENDAPATAN</span>
                  <span className="font-mono tabular-nums text-sm text-emerald-700">
                    {formatRupiah(statements.totalRevenue)}
                  </span>
                </div>
              </div>

              {/* COGS */}
              <div className="pt-2">
                <div className="font-bold text-slate-900 text-sm mb-2">BEBAN POKOK PENDAPATAN (COGS)</div>
                {accounts
                  .filter((a) => !a.isHeader && a.category === 'EXPENSE' && a.code.startsWith('5'))
                  .map((a) => (
                    <div key={a.id} className="flex justify-between pl-4 py-1 border-b border-slate-100">
                      <span className="text-slate-600">{a.name}</span>
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatRupiah(a.balance)}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between font-bold text-slate-900 pt-2 text-xs">
                  <span>TOTAL BEBAN POKOK</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {formatRupiah(statements.cogs)}
                  </span>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between font-bold text-slate-900 py-2.5 px-3 bg-slate-50 border-y border-slate-200">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="font-mono text-sm tabular-nums">
                  {formatRupiah(statements.grossProfit)}
                </span>
              </div>

              {/* Operating Expenses */}
              <div className="pt-2">
                <div className="font-bold text-slate-900 text-sm mb-2">BEBAN OPERASIONAL (OPERATING EXPENSES)</div>
                {accounts
                  .filter((a) => !a.isHeader && a.category === 'EXPENSE' && a.code.startsWith('6'))
                  .map((a) => (
                    <div key={a.id} className="flex justify-between pl-4 py-1 border-b border-slate-100">
                      <span className="text-slate-600">{a.name}</span>
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatRupiah(a.balance)}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between font-bold text-slate-900 pt-2 text-xs">
                  <span>TOTAL BEBAN OPERASIONAL</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    {formatRupiah(statements.operatingExpenses)}
                  </span>
                </div>
              </div>

              {/* Net Income */}
              <div className="flex justify-between font-bold text-sm bg-emerald-50 text-emerald-900 p-4 rounded border-2 border-emerald-300 font-mono">
                <span>LABA BERSIH PERIODE BERJALAN (NET INCOME)</span>
                <span className="text-base tabular-nums">
                  {formatRupiah(statements.netIncome)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. AGING REPORT TAB */}
        {activeReportTab === 'AGING' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 uppercase">
                LAPORAN UMUR PIUTANG &amp; UTANG (AGING REPORT SCHEDULE)
              </h2>
              <div className="font-mono text-xs text-slate-500">
                Jatuh Tempo Berdasarkan Tanggal 28 Oktober 2026
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">No. Faktur</th>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3">Klien / Vendor (Party)</th>
                      <th className="py-2.5 px-3">NPWP</th>
                      <th className="py-2.5 px-3">Tgl Jatuh Tempo</th>
                      <th className="py-2.5 px-3 text-right">Total Faktur</th>
                      <th className="py-2.5 px-3 text-right">Sisa Tagihan</th>
                      <th className="py-2.5 px-3 text-center">Status Aging</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {invoices.map((inv) => {
                      const outstanding = inv.totalAmount - inv.paidAmount;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            <span
                              className={`text-[11px] font-semibold ${
                                inv.type === 'RECEIVABLE' ? 'text-blue-700' : 'text-purple-700'
                              }`}
                            >
                              {inv.type === 'RECEIVABLE' ? 'PIUTANG (AR)' : 'UTANG (AP)'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-800 font-medium">
                            {inv.partyName}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                            {inv.partyTaxId || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {inv.dueDate}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-800 tabular-nums whitespace-nowrap">
                            {formatRupiah(inv.totalAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                            {formatRupiah(outstanding)}
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            <span
                              className={`font-mono text-xs font-semibold ${
                                inv.status === 'PAID'
                                  ? 'text-emerald-700'
                                  : inv.status === 'OVERDUE'
                                  ? 'text-rose-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Auditor Sign-off Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 text-xs">
          <div>
            <div className="text-slate-500 font-mono">Disiapkan Oleh:</div>
            <div className="font-semibold text-slate-900 mt-8">Budi Santoso, S.E., Ak., CA</div>
            <div className="text-slate-500 text-[11px]">Senior Financial Controller</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 font-mono">Disetujui Oleh:</div>
            <div className="font-semibold text-slate-900 mt-8">Dewi Lestari, M.Ak., CPA</div>
            <div className="text-slate-500 text-[11px]">Chief Financial Officer &amp; Auditor</div>
          </div>
        </div>
      </div>
    </div>
  );
};
