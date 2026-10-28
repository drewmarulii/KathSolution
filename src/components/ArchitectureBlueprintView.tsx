/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SPRING_BOOT_CODEBASE, ARCHITECTURAL_RATIONALES, CodeFile } from '../data/springBootCodebase';

export const ArchitectureBlueprintView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentRationale = ARCHITECTURAL_RATIONALES.find((r) => r.topicIndex === selectedTopic) || ARCHITECTURAL_RATIONALES[0];
  const topicFiles = SPRING_BOOT_CODEBASE.filter((f) => f.topicIndex === selectedTopic);

  const [activeFileId, setActiveFileId] = useState<string>(topicFiles[0]?.id || SPRING_BOOT_CODEBASE[0].id);

  // Sync active file when topic changes
  const activeFile = SPRING_BOOT_CODEBASE.find((f) => f.id === activeFileId) || topicFiles[0] || SPRING_BOOT_CODEBASE[0];

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const topicsList = [
    { index: 1, label: '1. Arsitektur Folder & Clean Arch' },
    { index: 2, label: '2. Skema Database & JPA Entities' },
    { index: 3, label: '3. Service Double-Entry (BigDecimal)' },
    { index: 4, label: '4. Concurrency & Audit Trail' },
    { index: 5, label: '5. Unit of Work & ACID Guarantees' },
    { index: 6, label: '6. Arsitektur Modular & Modulith' },
    { index: 7, label: '7. Integrasi Pajak (PPN, PPh, e-Faktur)' },
    { index: 8, label: '8. Export Laporan Excel & PDF' },
    { index: 9, label: '9. Security, RBAC & AES-256 GCM' },
    { index: 10, label: '10. Real-Time Financial Analytics' }
  ];

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>Principal Software Architect Blueprint</span>
              <span aria-hidden="true">·</span>
              <span>Spring Boot 3.4 &amp; Java 17+</span>
              <span aria-hidden="true">·</span>
              <span>PostgreSQL ACID Invariants</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Enterprise ERP Accounting Architecture &amp; Codebase Blueprint
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Spesifikasi teknis mendalam dan source code siap produksi yang mencakup 10 pilar utama
              arsitektur akuntansi berstandar enterprise.
            </p>
          </div>
        </div>
      </div>

      {/* 10 Topic Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar">
        {topicsList.map((t) => (
          <button
            key={t.index}
            onClick={() => {
              setSelectedTopic(t.index);
              const firstFile = SPRING_BOOT_CODEBASE.find((f) => f.topicIndex === t.index);
              if (firstFile) setActiveFileId(firstFile.id);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              selectedTopic === t.index
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content: 2 Columns (Rationale & Technical Deep-Dive on Left, Code Viewer on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Architecture Rationale (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div>
              <span className="font-mono text-xs text-slate-400">TOPIK {currentRationale.topicIndex} DARI 10</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {currentRationale.title}
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentRationale.summary}
            </p>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-900 block mb-2">
                Prinsip Arsitektur Utama (Core Invariants):
              </span>
              <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
                {currentRationale.keyPrinciples.map((principle, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {principle}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-900 block mb-1">
                Tech Stack &amp; Libraries:
              </span>
              <span className="font-mono text-xs text-slate-800 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 inline-block">
                {currentRationale.javaStack}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 bg-amber-50/60 -mx-6 -mb-6 p-6 rounded-b-lg border-amber-100">
              <span className="text-xs font-bold text-amber-900 block mb-1.5">
                Pitfalls &amp; Anti-Patterns yang Harus Dihindari:
              </span>
              <ul className="space-y-1.5 text-xs text-amber-800 list-disc pl-4">
                {currentRationale.pitfallsToAvoid.map((pitfall, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {pitfall}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Topic-Specific Diagram Cards */}
          {selectedTopic === 1 && (
            <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-semibold mb-1">CLEAN ARCHITECTURE BOUNDARY:</div>
              <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                Presentation (REST, DTOs, Swagger) &rarr; Application (Use Cases, Transactions) &rarr; Domain Core (Entities, Invariants)
              </div>
              <div className="text-slate-400 text-[11px]">
                Dependensi hanya boleh mengarah ke dalam (Inward Dependency Rule).
              </div>
            </div>
          )}

          {selectedTopic === 2 && (
            <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-semibold mb-1">RELASI ENTITAS UTAMA (ERD):</div>
              <div className="p-2 bg-slate-800/80 rounded border border-slate-700 space-y-1">
                <div>accounts (1) &harr; (N) journal_entry_lines</div>
                <div>journal_entries (1) &harr; (N) journal_entry_lines</div>
                <div>invoices (1) &rarr; (1) journal_entries</div>
                <div>payments (1) &rarr; (1) invoices</div>
              </div>
            </div>
          )}

          {selectedTopic === 3 && (
            <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-semibold mb-1">DOUBLE-ENTRY ZERO TOLERANCE:</div>
              <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                totalDebit.compareTo(totalCredit) == 0<br/>
                Rollback on: UnbalancedJournalException
              </div>
            </div>
          )}

          {selectedTopic === 4 && (
            <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-semibold mb-1">CONCURRENCY SEQUENCE LOCKING:</div>
              <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                Thread A &rarr; [SELECT FOR UPDATE] document_sequences<br/>
                Thread B &rarr; [WAIT (max 5s)]<br/>
                Thread A &rarr; Inc sequence &rarr; Commit (Lock released)
              </div>
            </div>
          )}

          {selectedTopic === 7 && (
            <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-semibold mb-1">SKEMA PAJAK INDONESIA (UU HPP):</div>
              <div className="p-2 bg-slate-800/80 rounded border border-slate-700 space-y-1">
                <div>PPN 11%: DPP = Total / 1.11 (Inclusive)</div>
                <div>PPh 23: 2% (NPWP) / 4% (Non-NPWP)</div>
                <div>Akun: 2120 (Utang PPN), 1140 (PPN Masukan)</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
          {/* File Selector Tabs */}
          <div className="bg-slate-900 text-slate-300 px-4 py-2 flex items-center justify-between border-b border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Berkas:</span>
              <div className="flex items-center gap-1">
                {topicFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                      activeFile.id === file.id
                        ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {file.filename}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleCopyCode(activeFile.content, activeFile.id)}
              className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5 shrink-0 ml-2"
            >
              {copiedId === activeFile.id ? (
                <>
                  <span className="text-emerald-400">✓</span>
                  <span>Tersalin!</span>
                </>
              ) : (
                <span>Salin Kode</span>
              )}
            </button>
          </div>

          {/* File description banner */}
          <div className="bg-slate-800/50 px-4 py-2 text-xs text-slate-400 font-mono border-b border-slate-800 flex items-center justify-between">
            <span>{activeFile.description}</span>
            <span className="uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {activeFile.language}
            </span>
          </div>

          {/* Code Viewer Block */}
          <div className="p-4 bg-slate-950 text-slate-100 overflow-x-auto font-mono text-xs leading-relaxed max-h-[640px] overflow-y-auto">
            <pre>
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
