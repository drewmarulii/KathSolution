/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Account, JournalEntry, Invoice, Payment, BudgetItem } from '../types/accounting';

export const INITIAL_ACCOUNTS: Account[] = [
  // ASSETS (1000 - 1999)
  {
    id: 'acc-1000',
    code: '1000',
    name: 'ASET (ASSETS)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: null,
    level: 1,
    isHeader: true,
    isActive: true,
    balance: 0,
    description: 'Header Akun Aktiva Perusahaan'
  },
  {
    id: 'acc-1100',
    code: '1100',
    name: 'Aset Lancar (Current Assets)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1000',
    level: 2,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-1110',
    code: '1110',
    name: 'Kas Operasional (Petty Cash)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 45000000, // Rp 45.000.000
    description: 'Kas kecil di brankas kantor'
  },
  {
    id: 'acc-1120',
    code: '1120',
    name: 'Bank BCA Giro Operasional',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 685000000, // Rp 685.000.000
    description: 'Rekening Giro Utama PT Bank Central Asia Tbk'
  },
  {
    id: 'acc-1130',
    code: '1130',
    name: 'Piutang Usaha (Accounts Receivable)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 245000000, // Rp 245.000.000
    description: 'Tagihan kepada klien / pelanggan'
  },
  {
    id: 'acc-1140',
    code: '1140',
    name: 'PPN Masukan (Prepaid VAT / Input Tax)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 18500000, // Rp 18.500.000
    description: 'Pajak Pertambahan Nilai dibayar di muka dari vendor'
  },
  {
    id: 'acc-1150',
    code: '1150',
    name: 'Persediaan Barang Dagang (Inventory)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 130000000, // Rp 130.000.000
  },
  {
    id: 'acc-1200',
    code: '1200',
    name: 'Aset Tetap (Fixed Assets)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1000',
    level: 2,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-1210',
    code: '1210',
    name: 'Peralatan & Server IT (Computer Equipment)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    parentId: 'acc-1200',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 380000000,
  },
  {
    id: 'acc-1290',
    code: '1290',
    name: 'Akumulasi Penyusutan Aset Tetap',
    category: 'ASSET',
    normalBalance: 'CREDIT', // Contra-asset
    parentId: 'acc-1200',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: -75000000,
  },

  // LIABILITIES (2000 - 2999)
  {
    id: 'acc-2000',
    code: '2000',
    name: 'KEWAJIBAN / LIABILITAS (LIABILITIES)',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    parentId: null,
    level: 1,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-2100',
    code: '2100',
    name: 'Kewajiban Jangka Pendek (Current Liabilities)',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    parentId: 'acc-2000',
    level: 2,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-2110',
    code: '2110',
    name: 'Utang Usaha (Accounts Payable)',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    parentId: 'acc-2100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 142000000,
    description: 'Utang dagang ke vendor supplier'
  },
  {
    id: 'acc-2120',
    code: '2120',
    name: 'Utang PPN Keluaran (Output VAT Payable)',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    parentId: 'acc-2100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 32500000,
    description: 'Pajak Pertambahan Nilai 11% yang harus disetor ke kas negara'
  },
  {
    id: 'acc-2130',
    code: '2130',
    name: 'Utang PPh Pasal 21/23 (Tax Payable)',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    parentId: 'acc-2100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 14200000,
  },
  {
    id: 'acc-2140',
    code: '2140',
    name: 'Utang Gaji & Tunjangan (Accrued Payroll)',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    parentId: 'acc-2100',
    level: 3,
    isHeader: false,
    isActive: true,
    balance: 65000000,
  },

  // EQUITY (3000 - 3999)
  {
    id: 'acc-3000',
    code: '3000',
    name: 'EKUITAS (EQUITY)',
    category: 'EQUITY',
    normalBalance: 'CREDIT',
    parentId: null,
    level: 1,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-3110',
    code: '3110',
    name: 'Modal Disetor (Paid-in Capital)',
    category: 'EQUITY',
    normalBalance: 'CREDIT',
    parentId: 'acc-3000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 800000000,
  },
  {
    id: 'acc-3210',
    code: '3210',
    name: 'Laba Ditahan (Retained Earnings)',
    category: 'EQUITY',
    normalBalance: 'CREDIT',
    parentId: 'acc-3000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 215000000,
  },

  // REVENUE (4000 - 4999)
  {
    id: 'acc-4000',
    code: '4000',
    name: 'PENDAPATAN (REVENUE)',
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    parentId: null,
    level: 1,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-4110',
    code: '4110',
    name: 'Pendapatan Jasa Konsultasi ERP & Software',
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    parentId: 'acc-4000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 420000000,
  },
  {
    id: 'acc-4120',
    code: '4120',
    name: 'Pendapatan Langganan SaaS Cloud',
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    parentId: 'acc-4000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 195000000,
  },

  // EXPENSES (5000 - 6999)
  {
    id: 'acc-5000',
    code: '5000',
    name: 'BEBAN POKOK PENDAPATAN (COST OF SALES)',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    parentId: null,
    level: 1,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-5110',
    code: '5110',
    name: 'Beban Cloud Infrastructure & Server AWS/GCP',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    parentId: 'acc-5000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 86000000,
  },
  {
    id: 'acc-6000',
    code: '6000',
    name: 'BEBAN OPERASIONAL (OPERATING EXPENSES)',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    parentId: null,
    level: 1,
    isHeader: true,
    isActive: true,
    balance: 0,
  },
  {
    id: 'acc-6110',
    code: '6110',
    name: 'Beban Gaji & Kompensasi Engineering',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    parentId: 'acc-6000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 210000000,
  },
  {
    id: 'acc-6120',
    code: '6120',
    name: 'Beban Sewa Kantor & Co-Working Space',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    parentId: 'acc-6000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 65000000,
  },
  {
    id: 'acc-6130',
    code: '6130',
    name: 'Beban Penyusutan Peralatan IT',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    parentId: 'acc-6000',
    level: 2,
    isHeader: false,
    isActive: true,
    balance: 24700000,
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'jv-101',
    entryNumber: 'JV-202610-00001',
    referenceNumber: 'INV-2026-101',
    date: '2026-10-02',
    description: 'Penerbitan Faktur Penjualan Jasa ERP ke PT Bank Mandiri Syariah (Term 30 hari)',
    status: 'POSTED',
    lines: [
      {
        id: 'line-1',
        accountId: 'acc-1130',
        accountCode: '1130',
        accountName: 'Piutang Usaha (Accounts Receivable)',
        description: 'Piutang tagihan jasa ERP tahap 1',
        debit: 111000000,
        credit: 0
      },
      {
        id: 'line-2',
        accountId: 'acc-4110',
        accountCode: '4110',
        accountName: 'Pendapatan Jasa Konsultasi ERP & Software',
        description: 'Pengakuan pendapatan termin implementasi',
        debit: 0,
        credit: 100000000
      },
      {
        id: 'line-3',
        accountId: 'acc-2120',
        accountCode: '2120',
        accountName: 'Utang PPN Keluaran (Output VAT Payable)',
        description: 'PPN Keluaran 11% Faktur Pajak 010.000-26.00001234',
        debit: 0,
        credit: 11000000
      }
    ],
    totalDebit: 111000000,
    totalCredit: 111000000,
    createdBy: 'budi.santoso@enterprise.co.id',
    createdAt: '2026-10-02 09:15:22',
    postedAt: '2026-10-02 09:15:23'
  },
  {
    id: 'jv-102',
    entryNumber: 'JV-202610-00002',
    referenceNumber: 'BILL-AWS-2610',
    date: '2026-10-08',
    description: 'Beban Layanan Server Cloud AWS Asia Pacific (Jakarta) Periode September',
    status: 'POSTED',
    lines: [
      {
        id: 'line-4',
        accountId: 'acc-5110',
        accountCode: '5110',
        accountName: 'Beban Cloud Infrastructure & Server AWS/GCP',
        description: 'EC2 & RDS PostgreSQL cluster compute expense',
        debit: 45000000,
        credit: 0
      },
      {
        id: 'line-5',
        accountId: 'acc-1140',
        accountCode: '1140',
        accountName: 'PPN Masukan (Prepaid VAT / Input Tax)',
        description: 'PPN Masukan 11% PMSE Amazon Web Services',
        debit: 4950000,
        credit: 0
      },
      {
        id: 'line-6',
        accountId: 'acc-2110',
        accountCode: '2110',
        accountName: 'Utang Usaha (Accounts Payable)',
        description: 'Invoice AWS tagihan jatuh tempo 30 Oktober',
        debit: 0,
        credit: 49950000
      }
    ],
    totalDebit: 49950000,
    totalCredit: 49950000,
    createdBy: 'dewi.lestari@enterprise.co.id',
    createdAt: '2026-10-08 14:20:11',
    postedAt: '2026-10-08 14:20:12'
  },
  {
    id: 'jv-103',
    entryNumber: 'JV-202610-00003',
    referenceNumber: 'PAY-BCA-8891',
    date: '2026-10-15',
    description: 'Penerimaan Pembayaran Pelunasan Piutang PT Astra Graphia Tbk via Transfer BCA',
    status: 'POSTED',
    lines: [
      {
        id: 'line-7',
        accountId: 'acc-1120',
        accountCode: '1120',
        accountName: 'Bank BCA Giro Operasional',
        description: 'Penerimaan dana rekening koran 889100234',
        debit: 88800000,
        credit: 0
      },
      {
        id: 'line-8',
        accountId: 'acc-1130',
        accountCode: '1130',
        accountName: 'Piutang Usaha (Accounts Receivable)',
        description: 'Pelunasan faktur INV-2026-074',
        debit: 0,
        credit: 88800000
      }
    ],
    totalDebit: 88800000,
    totalCredit: 88800000,
    createdBy: 'budi.santoso@enterprise.co.id',
    createdAt: '2026-10-15 11:05:00',
    postedAt: '2026-10-15 11:05:01'
  },
  {
    id: 'jv-104',
    entryNumber: 'JV-202610-00004',
    referenceNumber: 'PAYROLL-202610',
    date: '2026-10-25',
    description: 'Pencatatan & Pembayaran Gaji Karyawan Divisi R&D dan Engineering Oktober 2026',
    status: 'POSTED',
    lines: [
      {
        id: 'line-9',
        accountId: 'acc-6110',
        accountCode: '6110',
        accountName: 'Beban Gaji & Kompensasi Engineering',
        description: 'Gross payroll 18 Senior Software Engineers & Architects',
        debit: 95000000,
        credit: 0
      },
      {
        id: 'line-10',
        accountId: 'acc-2130',
        accountCode: '2130',
        accountName: 'Utang PPh Pasal 21/23 (Tax Payable)',
        description: 'Pemotongan PPh 21 tarif progresif karyawan',
        debit: 0,
        credit: 7500000
      },
      {
        id: 'line-11',
        accountId: 'acc-1120',
        accountCode: '1120',
        accountName: 'Bank BCA Giro Operasional',
        description: 'Payroll transfer batch via BCA KlikBCA Bisnis',
        debit: 0,
        credit: 87500000
      }
    ],
    totalDebit: 95000000,
    totalCredit: 95000000,
    createdBy: 'budi.santoso@enterprise.co.id',
    createdAt: '2026-10-25 16:45:10',
    postedAt: '2026-10-25 16:45:11'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-101',
    type: 'RECEIVABLE',
    partyName: 'PT Telekomunikasi Selular Tbk (Telkomsel)',
    partyTaxId: '01.000.123.4-051.000',
    issueDate: '2026-10-02',
    dueDate: '2026-11-01',
    subtotal: 100000000,
    taxRate: 0.11,
    taxAmount: 11000000,
    totalAmount: 111000000,
    paidAmount: 0,
    status: 'UNPAID',
    notes: 'Implementasi Core Microservices Settlement Phase 1'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-092',
    type: 'RECEIVABLE',
    partyName: 'PT Bank Central Asia Tbk',
    partyTaxId: '01.000.999.8-062.000',
    issueDate: '2026-09-10',
    dueDate: '2026-10-10',
    subtotal: 80000000,
    taxRate: 0.11,
    taxAmount: 8800000,
    totalAmount: 88800000,
    paidAmount: 88800000,
    status: 'PAID',
    notes: 'Lisensi Modul High-Throughput Reconciliation'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-088',
    type: 'RECEIVABLE',
    partyName: 'PT Kalbe Farma Tbk',
    partyTaxId: '01.234.567.8-012.000',
    issueDate: '2026-08-20',
    dueDate: '2026-09-19',
    subtotal: 45000000,
    taxRate: 0.11,
    taxAmount: 4950000,
    totalAmount: 49950000,
    paidAmount: 0,
    status: 'OVERDUE',
    notes: 'Jatuh tempo 39 hari yang lalu. Sedang follow up ke Finance Manager.'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'BILL-AWS-2610',
    type: 'PAYABLE',
    partyName: 'Amazon Web Services Inc.',
    partyTaxId: '00.998.776.5-099.000',
    issueDate: '2026-10-08',
    dueDate: '2026-10-30',
    subtotal: 45000000,
    taxRate: 0.11,
    taxAmount: 4950000,
    totalAmount: 49950000,
    paidAmount: 0,
    status: 'UNPAID',
    notes: 'Dedicated DB Cluster Production & Multi-AZ RDS'
  },
  {
    id: 'inv-5',
    invoiceNumber: 'BILL-ORACLE-04',
    type: 'PAYABLE',
    partyName: 'PT Oracle Indonesia',
    partyTaxId: '01.111.222.3-044.000',
    issueDate: '2026-09-01',
    dueDate: '2026-10-01',
    subtotal: 92050000,
    taxRate: 0.11,
    taxAmount: 10125500,
    totalAmount: 102175500,
    paidAmount: 0,
    status: 'OVERDUE',
    notes: 'Lisensi Enterprise Support Suite'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-01',
    paymentNumber: 'PAY-202610-001',
    invoiceId: 'inv-2',
    invoiceNumber: 'INV-2026-092',
    paymentDate: '2026-10-15',
    amount: 88800000,
    paymentMethod: 'BANK_TRANSFER',
    bankAccountId: 'acc-1120',
    referenceNo: 'BCA-TRF-90214',
    notes: 'Full payment via Kliring BI-FAST'
  }
];

export const INITIAL_BUDGETS: BudgetItem[] = [
  {
    id: 'b-5110',
    accountId: 'acc-5110',
    accountCode: '5110',
    accountName: 'Beban Cloud Infrastructure & Server AWS/GCP',
    category: 'EXPENSE',
    fiscalYear: 2026,
    annualBudget: 120000000, // Rp 120.000.000
    notes: 'Alokasi komputasi cloud AWS RDS PostgreSQL multi-AZ dan container cluster',
    updatedAt: '2026-01-05 10:00:00',
    updatedBy: 'finance.lead@enterprise.co.id'
  },
  {
    id: 'b-6110',
    accountId: 'acc-6110',
    accountCode: '6110',
    accountName: 'Beban Gaji & Kompensasi Engineering',
    category: 'EXPENSE',
    fiscalYear: 2026,
    annualBudget: 280000000, // Rp 280.000.000
    notes: 'Budget gaji pokok, BPJS Ketenagakerjaan, dan tunjangan tim backend',
    updatedAt: '2026-01-05 10:00:00',
    updatedBy: 'finance.lead@enterprise.co.id'
  },
  {
    id: 'b-6120',
    accountId: 'acc-6120',
    accountCode: '6120',
    accountName: 'Beban Sewa Kantor & Co-Working Space',
    category: 'EXPENSE',
    fiscalYear: 2026,
    annualBudget: 70000000, // Rp 70.000.000 (Actual: Rp 65.000.000 => 92.9% > 90% Threshold Alert)
    notes: 'Sewa ruang kerja Cyber 2 Tower Kuningan',
    updatedAt: '2026-01-05 10:00:00',
    updatedBy: 'finance.lead@enterprise.co.id'
  },
  {
    id: 'b-6130',
    accountId: 'acc-6130',
    accountCode: '6130',
    accountName: 'Beban Penyusutan Peralatan IT',
    category: 'EXPENSE',
    fiscalYear: 2026,
    annualBudget: 26000000, // Rp 26.000.000 (Actual: Rp 24.700.000 => 95.0% > 90% Threshold Alert)
    notes: 'Depresiasi workstation MacBook Pro & monitor ultra-wide',
    updatedAt: '2026-01-05 10:00:00',
    updatedBy: 'finance.lead@enterprise.co.id'
  },
  {
    id: 'b-4110',
    accountId: 'acc-4110',
    accountCode: '4110',
    accountName: 'Pendapatan Jasa Konsultasi ERP & Software',
    category: 'REVENUE',
    fiscalYear: 2026,
    annualBudget: 500000000, // Rp 500.000.000
    notes: 'Target pendapatan implementasi sistem akuntansi klien korporasi',
    updatedAt: '2026-01-05 10:00:00',
    updatedBy: 'finance.lead@enterprise.co.id'
  },
  {
    id: 'b-4120',
    accountId: 'acc-4120',
    accountCode: '4120',
    accountName: 'Pendapatan Langganan SaaS Cloud',
    category: 'REVENUE',
    fiscalYear: 2026,
    annualBudget: 240000000, // Rp 240.000.000
    notes: 'Target recurring revenue subscription tahun 2026',
    updatedAt: '2026-01-05 10:00:00',
    updatedBy: 'finance.lead@enterprise.co.id'
  }
];

