/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Account, AccountCategory, NormalBalance, UserRole } from '../types/accounting';
import { formatRupiah } from '../services/accountingEngine';

interface ChartOfAccountsViewProps {
  accounts: Account[];
  onAddAccount: (newAccount: Account) => void;
  userRole: UserRole;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  accounts,
  onAddAccount,
  userRole
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new account
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AccountCategory>('ASSET');
  const [newNormalBalance, setNewNormalBalance] = useState<NormalBalance>('DEBIT');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newIsHeader, setNewIsHeader] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  const canManageCoA = userRole === 'SUPER_ADMIN';

  const filteredAccounts = accounts.filter((acc) => {
    const matchesCategory = selectedCategory === 'ALL' || acc.category === selectedCategory;
    const matchesSearch =
      acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const parent = accounts.find((a) => a.id === newParentId);
    const level = parent ? parent.level + 1 : 1;

    const account: Account = {
      id: `acc-${Date.now()}`,
      code: newCode.trim(),
      name: newName.trim(),
      category: newCategory,
      normalBalance: newNormalBalance,
      parentId: newParentId || null,
      level,
      isHeader: newIsHeader,
      isActive: true,
      balance: 0,
      description: newDescription.trim()
    };

    onAddAccount(account);
    setIsModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>Modul Akuntansi 01</span>
              <span aria-hidden="true">·</span>
              <span>Master Data Keuangan</span>
              <span aria-hidden="true">·</span>
              <span>Bagan Akun Standar (PSAK)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Chart of Accounts (Bagan Akun Standar)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Struktur hirarkis akun buku besar dengan saldo normal (Debit/Kredit),
              klasifikasi akun induk (Header), serta pemisahan akun detail untuk transaksi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canManageCoA ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer shadow-xs"
              >
                + Buat Akun Baru
              </button>
            ) : (
              <span className="text-xs text-slate-500 italic">
                (Membutuhkan Super Admin untuk mengedit CoA)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {(
            [
              { id: 'ALL', label: 'Semua Akun' },
              { id: 'ASSET', label: '1. Aset (Aktiva)' },
              { id: 'LIABILITY', label: '2. Liabilitas (Utang)' },
              { id: 'EQUITY', label: '3. Ekuitas (Modal)' },
              { id: 'REVENUE', label: '4. Pendapatan' },
              { id: 'EXPENSE', label: '5. Beban / Biaya' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Cari kode atau nama akun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-3 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
          />
        </div>
      </div>

      {/* CoA Hierarchical Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-mono border-b border-slate-200 uppercase">
              <tr>
                <th className="px-4 py-2.5 w-32">Kode Akun</th>
                <th className="px-4 py-2.5">Nama Akun (Account Title)</th>
                <th className="px-4 py-2.5 w-32">Kategori</th>
                <th className="px-4 py-2.5 w-28 text-center">Saldo Normal</th>
                <th className="px-4 py-2.5 w-24 text-center">Tipe</th>
                <th className="px-4 py-2.5 w-44 text-right">Saldo Saat Ini (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredAccounts.map((account) => {
                const indent = (account.level - 1) * 20;

                return (
                  <tr
                    key={account.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      account.isHeader ? 'bg-slate-50/40 font-semibold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-slate-900 whitespace-nowrap">
                      {account.code}
                    </td>
                    <td className="px-4 py-2.5" style={{ paddingLeft: `${16 + indent}px` }}>
                      <div className="flex items-center gap-2">
                        {account.isHeader ? (
                          <span className="text-slate-400 font-mono text-xs">📁</span>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">└─</span>
                        )}
                        <span className={account.isHeader ? 'font-bold text-slate-900' : 'text-slate-800'}>
                          {account.name}
                        </span>
                      </div>
                      {account.description && (
                        <div className="text-[11px] text-slate-400 pl-6 mt-0.5">
                          {account.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                      {account.category}
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono whitespace-nowrap">
                      <span
                        className={`text-xs ${
                          account.normalBalance === 'DEBIT' ? 'text-blue-700 font-medium' : 'text-purple-700 font-medium'
                        }`}
                      >
                        {account.normalBalance}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono whitespace-nowrap">
                      {account.isHeader ? (
                        <span className="text-slate-500 font-medium">Header</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Detail</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-900 tabular-nums whitespace-nowrap font-medium">
                      {account.isHeader ? '-' : formatRupiah(account.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding new account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Akun Buku Besar Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kode Akun (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1160"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full border border-slate-200 rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori Akun</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as AccountCategory;
                      setNewCategory(cat);
                      if (cat === 'ASSET' || cat === 'EXPENSE') {
                        setNewNormalBalance('DEBIT');
                      } else {
                        setNewNormalBalance('CREDIT');
                      }
                    }}
                    className="w-full border border-slate-200 rounded px-3 py-1.5 font-mono"
                  >
                    <option value="ASSET">ASET (ASSET)</option>
                    <option value="LIABILITY">LIABILITAS (LIABILITY)</option>
                    <option value="EQUITY">EKUITAS (EQUITY)</option>
                    <option value="REVENUE">PENDAPATAN (REVENUE)</option>
                    <option value="EXPENSE">BEBAN (EXPENSE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Akun Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Piutang Karyawan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Saldo Normal</label>
                  <select
                    value={newNormalBalance}
                    onChange={(e) => setNewNormalBalance(e.target.value as NormalBalance)}
                    className="w-full border border-slate-200 rounded px-3 py-1.5 font-mono"
                  >
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Akun Induk (Parent)</label>
                  <select
                    value={newParentId}
                    onChange={(e) => setNewParentId(e.target.value)}
                    className="w-full border border-slate-200 rounded px-3 py-1.5 font-mono"
                  >
                    <option value="">(Tanpa Induk / Root)</option>
                    {accounts
                      .filter((a) => a.isHeader)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isHeaderCheck"
                  checked={newIsHeader}
                  onChange={(e) => setNewIsHeader(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isHeaderCheck" className="text-slate-700 font-medium cursor-pointer">
                  Jadikan sebagai Akun Induk (Header - tidak dapat diposting langsung)
                </label>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Deskripsi &amp; Kebijakan Akuntansi</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan fungsi akun..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-1.5"
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
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
