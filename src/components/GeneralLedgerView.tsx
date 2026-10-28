/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Account, JournalEntry } from '../types/accounting';
import { formatRupiah, roundTo2Decimals } from '../services/accountingEngine';

interface GeneralLedgerViewProps {
  accounts: Account[];
  journals: JournalEntry[];
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({ accounts, journals }) => {
  const postableAccounts = accounts.filter((a) => !a.isHeader);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    postableAccounts.find((a) => a.code === '1120')?.id || postableAccounts[0]?.id || ''
  );

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Extract all lines posted to the selected account across all POSTED journals
  const ledgerLines: {
    journalId: string;
    entryNumber: string;
    referenceNumber: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    runningBalance: number;
  }[] = [];

  let currentBalance = 0;

  const sortedJournals = [...journals]
    .filter((j) => j.status === 'POSTED')
    .sort((a, b) => a.date.localeCompare(b.date));

  sortedJournals.forEach((j) => {
    j.lines.forEach((line) => {
      if (line.accountId === selectedAccountId) {
        const d = Number(line.debit) || 0;
        const c = Number(line.credit) || 0;

        if (selectedAccount?.normalBalance === 'DEBIT') {
          currentBalance = roundTo2Decimals(currentBalance + d - c);
        } else {
          currentBalance = roundTo2Decimals(currentBalance + c - d);
        }

        ledgerLines.push({
          journalId: j.id,
          entryNumber: j.entryNumber,
          referenceNumber: j.referenceNumber,
          date: j.date,
          description: line.description || j.description,
          debit: d,
          credit: c,
          runningBalance: currentBalance
        });
      }
    });
  });

  const totalDebit = ledgerLines.reduce((s, l) => roundTo2Decimals(s + l.debit), 0);
  const totalCredit = ledgerLines.reduce((s, l) => roundTo2Decimals(s + l.credit), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>Modul Akuntansi 02</span>
              <span aria-hidden="true">·</span>
              <span>Buku Besar (General Ledger)</span>
              <span aria-hidden="true">·</span>
              <span>Audit Trail Mutasi Akun</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Buku Besar Akun (General Ledger Detail)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Telusuri setiap mutasi debit dan kredit per akun dengan pelacakan nomor voucher,
              referensi dokumen sumber, serta kalkulasi saldo berjalan secara real-time.
            </p>
          </div>

          {/* Account Selector */}
          <div className="w-full md:w-80">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Pilih Akun Buku Besar:
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs font-mono font-medium border border-slate-200 rounded px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {postableAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Account Profile Card */}
      {selectedAccount && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Kode &amp; Nama Akun:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {selectedAccount.code} - {selectedAccount.name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Klasifikasi Akun:</span>
              <span className="font-mono font-semibold text-slate-800">
                {selectedAccount.category} (Level {selectedAccount.level})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Saldo Normal:</span>
              <span
                className={`font-mono font-semibold ${
                  selectedAccount.normalBalance === 'DEBIT' ? 'text-blue-700' : 'text-purple-700'
                }`}
              >
                {selectedAccount.normalBalance}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Saldo Akhir Buku Besar:</span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {formatRupiah(selectedAccount.balance)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Riwayat Mutasi Transaksi (Transaction Ledger)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {ledgerLines.length} Mutasi Ditemukan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200 uppercase">
              <tr>
                <th className="px-4 py-2.5 w-28">Tanggal</th>
                <th className="px-4 py-2.5 w-36">No. Voucher</th>
                <th className="px-4 py-2.5 w-32">Referensi</th>
                <th className="px-4 py-2.5">Keterangan Mutasi</th>
                <th className="px-4 py-2.5 w-36 text-right">Debit (Rp)</th>
                <th className="px-4 py-2.5 w-36 text-right">Kredit (Rp)</th>
                <th className="px-4 py-2.5 w-40 text-right">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {ledgerLines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                    Belum ada transaksi mutasi yang diposting ke akun ini.
                  </td>
                </tr>
              ) : (
                ledgerLines.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {row.entryNumber}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                      {row.referenceNumber || '-'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">
                      {row.description}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-900 tabular-nums whitespace-nowrap">
                      {row.debit > 0 ? formatRupiah(row.debit) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-900 tabular-nums whitespace-nowrap">
                      {row.credit > 0 ? formatRupiah(row.credit) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatRupiah(row.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {ledgerLines.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono font-bold text-slate-900">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right">
                    Total Mutasi Periode
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRupiah(totalDebit)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRupiah(totalCredit)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatRupiah(currentBalance)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
