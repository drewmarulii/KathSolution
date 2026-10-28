/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole } from '../types/accounting';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onNewJournalClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onNewJournalClick
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'budget', label: 'Budget Planning' },
    { id: 'simulator', label: 'Double-Entry Simulator' },
    { id: 'coa', label: 'Chart of Accounts' },
    { id: 'ledger', label: 'Buku Besar & Jurnal' },
    { id: 'reports', label: 'Laporan Keuangan' },
    { id: 'blueprint', label: 'Blueprint & Kode Java' }
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                  FL
                </span>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  FinLedger ERP
                </span>
              </div>
            </button>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
              Spring Boot 3
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
                    isActive
                      ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Role selector & 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <label htmlFor="role-select" className="text-slate-400">Role:</label>
              <select
                id="role-select"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="AUDITOR">Auditor</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <button
              onClick={onNewJournalClick}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              + Posting Jurnal
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs font-medium no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded transition-colors ${
              activeTab === item.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
