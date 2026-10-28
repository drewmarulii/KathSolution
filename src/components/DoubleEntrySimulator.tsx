/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Account, JournalEntry, JournalEntryLine, UserRole } from '../types/accounting';
import {
  validateJournalEntry,
  roundTo2Decimals,
  formatRupiah
} from '../services/accountingEngine';

interface DoubleEntrySimulatorProps {
  accounts: Account[];
  journalEntries: JournalEntry[];
  onPostJournal: (newEntry: JournalEntry) => void;
  onReverseJournal: (journalId: string) => void;
  userRole: UserRole;
}

export const DoubleEntrySimulator: React.FC<DoubleEntrySimulatorProps> = ({
  accounts,
  journalEntries,
  onPostJournal,
  onReverseJournal,
  userRole
}) => {
  const [description, setDescription] = useState('Penerbitan Faktur Penjualan Lisensi ERP ke Klien BUMN');
  const [referenceNumber, setReferenceNumber] = useState('INV-2026-118');
  const [entryDate, setEntryDate] = useState('2026-10-28');
  const [lines, setLines] = useState<
    { id: string; accountId: string; description: string; debit: number; credit: number }[]
  >([
    {
      id: 'sim-1',
      accountId: 'acc-1130', // Piutang Usaha
      description: 'Piutang tagihan lisensi ERP',
      debit: 111000000,
      credit: 0
    },
    {
      id: 'sim-2',
      accountId: 'acc-4110', // Pendapatan Jasa
      description: 'Pendapatan jasa lisensi software',
      debit: 0,
      credit: 100000000
    },
    {
      id: 'sim-3',
      accountId: 'acc-2120', // Utang PPN Keluaran
      description: 'PPN Keluaran 11% Faktur Pajak',
      debit: 0,
      credit: 11000000
    }
  ]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Validate current lines
  const validation = validateJournalEntry(lines, accounts);
  const canPost = userRole === 'SUPER_ADMIN' || userRole === 'ACCOUNTANT';

  // Preset scenarios
  const applyPreset = (presetKey: string) => {
    if (presetKey === 'sales') {
      setDescription('Faktur Penjualan Jasa Implementasi Core System');
      setReferenceNumber('INV-2026-140');
      setLines([
        {
          id: 'p-1',
          accountId: 'acc-1130', // Piutang
          description: 'Piutang Termin 1 Klien Enterprise',
          debit: 55500000,
          credit: 0
        },
        {
          id: 'p-2',
          accountId: 'acc-4110', // Pendapatan
          description: 'Pengakuan Pendapatan Jasa Konsultasi',
          debit: 0,
          credit: 50000000
        },
        {
          id: 'p-3',
          accountId: 'acc-2120', // Utang PPN
          description: 'PPN Keluaran 11% UU HPP',
          debit: 0,
          credit: 5500000
        }
      ]);
    } else if (presetKey === 'payroll') {
      setDescription('Pembayaran Gaji dan Tunjangan Tim DevOps & QA');
      setReferenceNumber('PAYROLL-OCT-B');
      setLines([
        {
          id: 'p-4',
          accountId: 'acc-6110', // Beban Gaji
          description: 'Gross Salary Expense',
          debit: 60000000,
          credit: 0
        },
        {
          id: 'p-5',
          accountId: 'acc-2130', // PPh 21
          description: 'Potongan PPh 21 Terutang',
          debit: 0,
          credit: 4500000
        },
        {
          id: 'p-6',
          accountId: 'acc-1120', // Bank BCA
          description: 'Transfer Net Salary ke Rekening Payroll Karyawan',
          debit: 0,
          credit: 55500000
        }
      ]);
    } else if (presetKey === 'ap_settlement') {
      setDescription('Pelunasan Utang Tagihan Cloud Server AWS via Giro BCA');
      setReferenceNumber('TRF-BCA-7762');
      setLines([
        {
          id: 'p-7',
          accountId: 'acc-2110', // Utang Usaha
          description: 'Pelunasan Utang Usaha AWS AP-Southeast-3',
          debit: 49950000,
          credit: 0
        },
        {
          id: 'p-8',
          accountId: 'acc-1120', // Bank BCA
          description: 'Pengurangan Saldo Bank BCA Giro',
          debit: 0,
          credit: 49950000
        }
      ]);
    } else if (presetKey === 'unbalanced_test') {
      setDescription('Simulasi Error: Jurnal Tidak Seimbang (Debit != Kredit)');
      setReferenceNumber('ERR-TEST-001');
      setLines([
        {
          id: 'p-9',
          accountId: 'acc-1110', // Kas
          description: 'Penerimaan Kas Operasional',
          debit: 25000000,
          credit: 0
        },
        {
          id: 'p-10',
          accountId: 'acc-4120', // Pendapatan SaaS
          description: 'Pendapatan (Hanya mencatat 20jt, selisih 5jt)',
          debit: 0,
          credit: 20000000
        }
      ]);
    }
  };

  const handleAddLine = () => {
    const postableAccounts = accounts.filter((a) => !a.isHeader);
    const defaultAcc = postableAccounts[0]?.id || '';
    setLines([
      ...lines,
      {
        id: `line-${Date.now()}`,
        accountId: defaultAcc,
        description: 'Baris transaksi tambahan',
        debit: 0,
        credit: 0
      }
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 2) {
      setNotification({
        type: 'error',
        message: 'Jurnal minimal harus memiliki 2 baris (Debit & Kredit).'
      });
      return;
    }
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleUpdateLine = (id: string, field: string, value: any) => {
    setLines(
      lines.map((l) => {
        if (l.id !== id) return l;
        if (field === 'debit') {
          const num = Math.max(0, parseFloat(value) || 0);
          return { ...l, debit: num, credit: num > 0 ? 0 : l.credit };
        }
        if (field === 'credit') {
          const num = Math.max(0, parseFloat(value) || 0);
          return { ...l, credit: num, debit: num > 0 ? 0 : l.debit };
        }
        return { ...l, [field]: value };
      })
    );
  };

  const handlePost = () => {
    if (!validation.isValid) {
      setNotification({
        type: 'error',
        message: validation.errorMessages[0] || 'Validasi jurnal gagal.'
      });
      return;
    }

    if (!canPost) {
      setNotification({
        type: 'error',
        message: `Akses ditolak! Role '${userRole}' hanya memiliki izin read-only. Dibutuhkan role ACCOUNTANT atau SUPER_ADMIN.`
      });
      return;
    }

    // Generate new sequential entry
    const seqNum = String(journalEntries.length + 1).padStart(5, '0');
    const newEntryNumber = `JV-202610-${seqNum}`;

    const journalLines: JournalEntryLine[] = lines.map((l, idx) => {
      const acc = accounts.find((a) => a.id === l.accountId);
      return {
        id: `jl-${Date.now()}-${idx}`,
        accountId: l.accountId,
        accountCode: acc?.code || '',
        accountName: acc?.name || '',
        description: l.description,
        debit: roundTo2Decimals(l.debit),
        credit: roundTo2Decimals(l.credit)
      };
    });

    const newJournal: JournalEntry = {
      id: `jv-${Date.now()}`,
      entryNumber: newEntryNumber,
      referenceNumber,
      date: entryDate,
      description,
      status: 'POSTED',
      lines: journalLines,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      createdBy: 'user.accountant@enterprise.co.id',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      postedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    onPostJournal(newJournal);

    setNotification({
      type: 'success',
      message: `Sukses! Jurnal voucher ${newEntryNumber} berhasil diposting ke Buku Besar secara atomik.`
    });

    // Reset reference to next sequence
    setReferenceNumber(`INV-2026-${Math.floor(Math.random() * 800 + 100)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>Modul Akuntansi 02</span>
              <span aria-hidden="true">·</span>
              <span>General Ledger (GL) Engine</span>
              <span aria-hidden="true">·</span>
              <span>Double-Entry Simulator</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Interactive Double-Entry Bookkeeping Workbench
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Uji langsung logika validasi matematis akuntansi ganda (Total Debit == Total Kredit)
              dan mekanisme transaksi atomik Spring Boot 3 dengan presisi BigDecimal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Template Cepat:</span>
            <button
              onClick={() => applyPreset('sales')}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              Faktur Penjualan
            </button>
            <button
              onClick={() => applyPreset('payroll')}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              Payroll Gaji
            </button>
            <button
              onClick={() => applyPreset('ap_settlement')}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
            >
              Pelunasan Utang
            </button>
            <button
              onClick={() => applyPreset('unbalanced_test')}
              className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors cursor-pointer font-medium"
            >
              Uji Unbalanced
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div>{notification.message}</div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-semibold underline ml-4 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Journal Entry Input Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tanggal Transaksi (Date)
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full text-xs font-mono border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nomor Referensi Eksternal (Ref No.)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. INV-2026-101"
              className="w-full text-xs font-mono border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Keterangan Transaksi / Memo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uraian jurnal transaksi..."
              className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Lines Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Baris Akun Jurnal (Journal Lines)
            </span>
            <button
              onClick={handleAddLine}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 cursor-pointer"
            >
              + Tambah Baris Akun
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-mono border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 w-10 text-center">#</th>
                  <th className="px-3 py-2 w-64">Akun (CoA)</th>
                  <th className="px-3 py-2">Uraian Baris (Description)</th>
                  <th className="px-3 py-2 w-44 text-right">Debit (Rp)</th>
                  <th className="px-3 py-2 w-44 text-right">Kredit (Rp)</th>
                  <th className="px-3 py-2 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {lines.map((line, index) => {
                  return (
                    <tr key={line.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2.5 text-center font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={line.accountId}
                          onChange={(e) => handleUpdateLine(line.id, 'accountId', e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1.5 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                        >
                          {accounts.map((acc) => (
                            <option
                              key={acc.id}
                              value={acc.id}
                              disabled={acc.isHeader}
                              className={acc.isHeader ? 'font-bold bg-slate-100 text-slate-400' : ''}
                            >
                              {acc.isHeader ? `[HEADER] ${acc.code} - ${acc.name}` : `${acc.code} - ${acc.name}`}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleUpdateLine(line.id, 'description', e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          step="1000"
                          value={line.debit === 0 ? '' : line.debit}
                          onChange={(e) => handleUpdateLine(line.id, 'debit', e.target.value)}
                          placeholder="0.00"
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs text-right font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          step="1000"
                          value={line.credit === 0 ? '' : line.credit}
                          onChange={(e) => handleUpdateLine(line.id, 'credit', e.target.value)}
                          placeholder="0.00"
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs text-right font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors font-mono cursor-pointer"
                          title="Hapus baris"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Validation Indicator */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {validation.isValid ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Double-Entry Terverifikasi Seimbang (Debit == Kredit)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-100/70 border border-rose-200 px-3 py-1.5 rounded">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>Jurnal Belum Seimbang! Selisih: {formatRupiah(validation.difference)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-slate-500">Total Debit: </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatRupiah(validation.totalDebit)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Total Kredit: </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatRupiah(validation.totalCredit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500">
            {canPost ? (
              <span>
                Role aktif <strong>{userRole}</strong> memiliki izin untuk memposting ke database transaksi.
              </span>
            ) : (
              <span className="text-amber-700">
                Perhatian: Role <strong>{userRole}</strong> adalah read-only. Ganti role di bilah atas untuk posting.
              </span>
            )}
          </div>

          <button
            onClick={handlePost}
            disabled={!validation.isValid || !canPost}
            className={`px-5 py-2.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shadow-xs cursor-pointer ${
              validation.isValid && canPost
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Post ke Buku Besar (Commit Transaction)
          </button>
        </div>
      </div>

      {/* Historical Posted Journals & Storno Demonstration */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Daftar Jurnal Terposting &amp; Mekanisme Storno (Reversal)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dalam sistem akuntansi enterprise standar audit, jurnal yang telah diposting tidak pernah dihapus secara fisik.
            Pembatalan dilakukan dengan menerbitkan jurnal pembalik otomatis (Storno).
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {journalEntries.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {entry.entryNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {entry.date}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Ref: {entry.referenceNumber || '-'}
                  </span>
                  <span
                    className={`font-mono text-xs font-medium px-2 py-0.5 rounded ${
                      entry.status === 'POSTED'
                        ? 'text-emerald-700 bg-emerald-50'
                        : entry.status === 'REVERSED'
                        ? 'text-rose-700 bg-rose-50'
                        : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>

                {entry.status === 'POSTED' && canPost && (
                  <button
                    onClick={() => onReverseJournal(entry.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                  >
                    Storno (Pembalikan Jurnal) &rarr;
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 mb-2 font-medium">
                {entry.description}
              </p>

              {/* Sub-table for lines */}
              <div className="bg-slate-50 border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-mono">
                    <tr>
                      <th className="px-3 py-1.5">Kode &amp; Nama Akun</th>
                      <th className="px-3 py-1.5">Keterangan Baris</th>
                      <th className="px-3 py-1.5 text-right">Debit</th>
                      <th className="px-3 py-1.5 text-right">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {entry.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="px-3 py-1.5 font-mono text-slate-900">
                          {l.accountCode} - {l.accountName}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600">
                          {l.description || '-'}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-slate-900 tabular-nums">
                          {l.debit > 0 ? formatRupiah(l.debit) : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-slate-900 tabular-nums">
                          {l.credit > 0 ? formatRupiah(l.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100/70 font-mono font-bold text-slate-900 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="px-3 py-1.5 text-right">
                        Total
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {formatRupiah(entry.totalDebit)}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">
                        {formatRupiah(entry.totalCredit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
