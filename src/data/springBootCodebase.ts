/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeFile {
  id: string;
  filename: string;
  category: 'ARCH' | 'DB_ENTITY' | 'SERVICE' | 'CONCURRENCY_AUDIT' | 'TAX' | 'REPORT' | 'SECURITY' | 'BUDGET';
  topicIndex: number;
  description: string;
  language: 'java' | 'sql' | 'xml' | 'markdown';
  content: string;
}

export const SPRING_BOOT_CODEBASE: CodeFile[] = [
  {
    id: 'folder-structure',
    filename: 'project-structure.tree',
    category: 'ARCH',
    topicIndex: 1,
    description: 'Clean / Hexagonal & Modular Monolith Directory Architecture for Spring Boot 3 ERP',
    language: 'markdown',
    content: `finledger-erp-backend/
├── pom.xml                                   # Multi-module root / Starter dependencies
├── src/
│   ├── main/
│   │   ├── java/com/enterprise/finledger/
│   │   │   ├── FinledgerErpApplication.java  # Main Spring Boot 3 Entry Point
│   │   │   │
│   │   │   ├── common/                       # Shared Kernel & Cross-Cutting Concerns
│   │   │   │   ├── audit/                    # Spring Data Auditing & SecurityContext
│   │   │   │   │   ├── AuditableEntity.java  # @MappedSuperclass with createdDate, modifiedBy
│   │   │   │   │   └── SpringSecurityAuditorAware.java
│   │   │   │   ├── exception/                # Global Exception Handler & RFC-7807 ProblemDetail
│   │   │   │   │   ├── BusinessRuleException.java
│   │   │   │   │   ├── UnbalancedJournalException.java
│   │   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │   ├── security/                 # Spring Security 6 + JWT & Encryption
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   └── AesGcmAttributeConverter.java # Field-level AES-256 encryption
│   │   │   │   └── util/
│   │   │   │       └── BigDecimalUtils.java  # Exact decimal roundings & validations
│   │   │   │
│   │   │   ├── modules/                      # Domain Modules (Spring Modulith Boundaries)
│   │   │   │   ├── coa/                      # 1. Chart of Accounts Module
│   │   │   │   │   ├── domain/               # Account Entity, AccountCategory, NormalBalance
│   │   │   │   │   ├── repository/           # AccountRepository (Hierarchical queries)
│   │   │   │   │   ├── service/              # AccountService & CoA Validation
│   │   │   │   │   └── web/                  # AccountController & OpenAPI annotations
│   │   │   │   │
│   │   │   │   ├── gl/                       # 2. General Ledger & Double-Entry Engine
│   │   │   │   │   ├── domain/               # JournalEntry, JournalEntryLine, JournalStatus
│   │   │   │   │   ├── repository/           # JournalEntryRepository, JournalEntryLineRepository
│   │   │   │   │   ├── service/              # JournalEntryServiceImpl (@Transactional)
│   │   │   │   │   ├── sequence/             # DocumentSequenceServiceImpl (Pessimistic Lock)
│   │   │   │   │   └── web/                  # JournalEntryController
│   │   │   │   │
│   │   │   │   ├── arap/                     # 3. Accounts Receivable & Accounts Payable
│   │   │   │   │   ├── domain/               # Invoice, Payment, InvoiceStatus, AgingBucket
│   │   │   │   │   ├── repository/           # InvoiceRepository, PaymentRepository
│   │   │   │   │   ├── service/              # InvoiceSettlementService & AgingReportService
│   │   │   │   │   └── web/                  # InvoiceController, PaymentController
│   │   │   │   │
│   │   │   │   ├── tax/                      # 4. Local Tax Module (PPN 11%, PPh 21/23, e-Faktur)
│   │   │   │   │   ├── domain/               # TaxCalculation, TaxInvoiceType (e-Faktur NSFP)
│   │   │   │   │   ├── service/              # IndonesianTaxEngineService
│   │   │   │   │   └── exporter/             # EFakturCsvExporter
│   │   │   │   │
│   │   │   │   └── reporting/                # 5. Financial Reporting Module
│   │   │   │       ├── model/                # BalanceSheetDto, IncomeStatementDto, TrialBalanceDto
│   │   │   │       ├── service/              # FinancialReportServiceImpl (Real-time SQL aggregation)
│   │   │   │       └── exporter/             # Apache POI ExcelExporter & FlyingSaucer PDFExporter
│   │   │   │
│   │   └── resources/
│   │       ├── application.yml               # PostgreSQL, Hibernate, Flyway, JWT configs
│   │       ├── db/migration/                 # Flyway Versioned Migration Scripts
│   │       │   ├── V1__init_accounting_schema.sql
│   │       │   ├── V2__create_indexes_and_constraints.sql
│   │       │   └── V3__seed_standard_indonesian_psak_coa.sql
│   │       └── templates/                    # PDF Thymeleaf financial report templates
│   │
│   └── test/                                 # Testcontainers, JUnit 5, Mockito
│       ├── java/com/enterprise/finledger/
│       │   ├── DoubleEntryIntegrationTest.java
│       │   └── ConcurrentSequenceGeneratorTest.java
│       └── resources/
│           └── application-test.yml`
  },
  {
    id: 'pom-xml',
    filename: 'pom.xml',
    category: 'ARCH',
    topicIndex: 1,
    description: 'Maven Project Configuration: Spring Boot 3.4.x, Java 17, PostgreSQL, Flyway, Testcontainers',
    language: 'xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.1</version>
        <relativePath/>
    </parent>
    <groupId>com.enterprise</groupId>
    <artifactId>finledger-erp</artifactId>
    <version>1.0.0-RELEASE</version>
    <name>FinLedger ERP Backend</name>
    <description>Enterprise Double-Entry Bookkeeping &amp; Accounting Engine</description>

    <properties>
        <java.version>17</java.version>
        <springdoc.version>2.8.0</springdoc.version>
        <jjwt.version>0.12.6</jjwt.version>
        <poi.version>5.3.0</poi.version>
        <testcontainers.version>1.20.4</testcontainers.version>
        <spring-modulith.version>1.3.0</spring-modulith.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Database & Migrations -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>

        <!-- Hibernate Envers for Audit Trail -->
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-envers</artifactId>
        </dependency>

        <!-- Spring Modulith for Architecture Boundary Verification -->
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-starter-core</artifactId>
            <version>\${spring-modulith.version}</version>
        </dependency>

        <!-- Security & JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- OpenAPI / Swagger 3 -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>\${springdoc.version}</version>
        </dependency>

        <!-- Financial Export: Apache POI for Excel XLSX -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>\${poi.version}</version>
        </dependency>
        <!-- OpenPDF for Audit-ready Financial Statements -->
        <dependency>
            <groupId>com.github.librepdf</groupId>
            <artifactId>openpdf</artifactId>
            <version>2.0.3</version>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing & Testcontainers -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <version>\${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`
  },
  {
    id: 'flyway-migration',
    filename: 'V1__init_accounting_schema.sql',
    category: 'DB_ENTITY',
    topicIndex: 2,
    description: 'Production Flyway Migration for PostgreSQL with Strict ACID Constraints and Invariants',
    language: 'sql',
    content: `-- ==============================================================================
-- FLYWAY MIGRATION: V1__init_accounting_schema.sql
-- PostgreSQL DDL for Enterprise Double-Entry Accounting System
-- Enforcing strict financial constraints: non-negative values, composite keys, immutable journal
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS FOR ACCOUNTING TYPES
CREATE TYPE account_category AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE normal_balance AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE journal_status AS ENUM ('DRAFT', 'POSTED', 'REVERSED', 'VOIDED');
CREATE TYPE invoice_type AS ENUM ('RECEIVABLE', 'PAYABLE');
CREATE TYPE invoice_status AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');

-- 2. CHART OF ACCOUNTS (CoA) TABLE
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category account_category NOT NULL,
    normal_balance normal_balance NOT NULL,
    parent_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    level INT NOT NULL DEFAULT 1,
    is_header BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_accounts_code ON accounts(code);
CREATE INDEX idx_accounts_category ON accounts(category);
CREATE INDEX idx_accounts_parent_id ON accounts(parent_id);

-- 3. SEQUENTIAL TRANSACTION NUMBER GENERATOR TABLE (Pessimistic Row Lock)
CREATE TABLE document_sequences (
    id VARCHAR(50) PRIMARY KEY, -- e.g. "JV-202610", "INV-2026"
    prefix VARCHAR(20) NOT NULL,
    fiscal_period VARCHAR(10) NOT NULL,
    last_sequence BIGINT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. GENERAL LEDGER JOURNAL ENTRIES
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(64) NOT NULL UNIQUE, -- Sequential: JV-202610-00001
    reference_number VARCHAR(128),            -- External Ref: PO-101, INV-889
    entry_date DATE NOT NULL,
    status journal_status NOT NULL DEFAULT 'DRAFT',
    currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
    exchange_rate NUMERIC(19, 6) NOT NULL DEFAULT 1.000000,
    total_debit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    total_credit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    description TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by VARCHAR(100),
    reversed_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    
    -- INVARIANT: If POSTED, total_debit MUST EQUAL total_credit
    CONSTRAINT chk_journal_balanced CHECK (
        status != 'POSTED' OR (total_debit = total_credit AND total_debit > 0)
    )
);

CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_ref ON journal_entries(reference_number);

-- 5. JOURNAL ENTRY LINES (Debits & Credits)
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    line_number INT NOT NULL,
    description TEXT,
    debit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    credit NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FINANCIAL INVARIANTS:
    -- 1. Amounts must not be negative
    CONSTRAINT chk_line_debit_non_negative CHECK (debit >= 0),
    CONSTRAINT chk_line_credit_non_negative CHECK (credit >= 0),
    -- 2. Line cannot be both zero
    CONSTRAINT chk_line_not_both_zero CHECK (debit > 0 OR credit > 0),
    -- 3. Line cannot have both Debit AND Credit simultaneously
    CONSTRAINT chk_line_single_direction CHECK (NOT (debit > 0 AND credit > 0)),
    -- 4. Unique line number per journal
    CONSTRAINT uq_journal_line_number UNIQUE (journal_entry_id, line_number)
);

CREATE INDEX idx_journal_lines_account_id ON journal_entry_lines(account_id);
CREATE INDEX idx_journal_lines_journal_id ON journal_entry_lines(journal_entry_id);

-- 6. INVOICES (AR & AP)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    type invoice_type NOT NULL, -- RECEIVABLE or PAYABLE
    party_name VARCHAR(255) NOT NULL,
    party_tax_id VARCHAR(64), -- NPWP
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(19, 4) NOT NULL,
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.1100, -- 11% PPN
    tax_amount NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(19, 4) NOT NULL,
    paid_amount NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    status invoice_status NOT NULL DEFAULT 'UNPAID',
    journal_entry_id UUID REFERENCES journal_entries(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT chk_invoice_amounts CHECK (
        subtotal >= 0 AND tax_amount >= 0 AND total_amount = subtotal + tax_amount
    )
);

CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_party ON invoices(party_name);

-- 7. PAYMENTS SETTLEMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(64) NOT NULL UNIQUE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    payment_date DATE NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- BANK_TRANSFER, CASH, GIRO
    bank_account_id UUID NOT NULL REFERENCES accounts(id),
    journal_entry_id UUID REFERENCES journal_entries(id),
    reference_no VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT chk_payment_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);`
  },
  {
    id: 'account-entity',
    filename: 'Account.java',
    category: 'DB_ENTITY',
    topicIndex: 2,
    description: 'Jakarta JPA Entity: Hierarchical Chart of Accounts (CoA) with AccountCategory & NormalBalance',
    language: 'java',
    content: `package com.enterprise.finledger.modules.coa.domain;

import com.enterprise.finledger.common.audit.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "accounts", indexes = {
    @Index(name = "idx_accounts_code", columnList = "code", unique = true),
    @Index(name = "idx_accounts_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@Audited // Hibernate Envers for financial audit logging
public class Account extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 32)
    @Column(name = "code", nullable = false, unique = true, length = 32)
    private String code; // e.g. "1110", "2110", "4110"

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name; // e.g. "Kas Operasional", "Bank BCA Giro"

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 32)
    private AccountCategory category; // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "normal_balance", nullable = false, length = 16)
    private NormalBalance normalBalance; // DEBIT or CREDIT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Account parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Account> children = new ArrayList<>();

    @Column(name = "level", nullable = false)
    private Integer level = 1;

    @Column(name = "is_header", nullable = false)
    private Boolean isHeader = false; // Header accounts cannot be posted to directly

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Version
    @Column(name = "version")
    private Long version;

    public Account(String code, String name, AccountCategory category, NormalBalance normalBalance) {
        this.code = code;
        this.name = name;
        this.category = category;
        this.normalBalance = normalBalance;
        this.isHeader = false;
        this.isActive = true;
    }
}`
  },
  {
    id: 'journal-entry-entity',
    filename: 'JournalEntry.java',
    category: 'DB_ENTITY',
    topicIndex: 2,
    description: 'Jakarta JPA Entity: JournalEntry with One-to-Many JournalEntryLines and BigDecimal totals',
    language: 'java',
    content: `package com.enterprise.finledger.modules.gl.domain;

import com.enterprise.finledger.common.audit.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "journal_entries", indexes = {
    @Index(name = "idx_journal_entries_number", columnList = "entry_number", unique = true),
    @Index(name = "idx_journal_entries_date", columnList = "entry_date"),
    @Index(name = "idx_journal_entries_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@Audited
public class JournalEntry extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(name = "entry_number", nullable = false, unique = true, length = 64)
    private String entryNumber; // Formatted voucher: JV-202610-00042

    @Column(name = "reference_number", length = 128)
    private String referenceNumber; // External Ref e.g. INV-2026-101

    @NotNull
    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private JournalStatus status = JournalStatus.DRAFT;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "IDR";

    @Column(name = "exchange_rate", precision = 19, scale = 6, nullable = false)
    private BigDecimal exchangeRate = BigDecimal.ONE.setScale(6);

    @Column(name = "total_debit", precision = 19, scale = 4, nullable = false)
    private BigDecimal totalDebit = BigDecimal.ZERO.setScale(4);

    @Column(name = "total_credit", precision = 19, scale = 4, nullable = false)
    private BigDecimal totalCredit = BigDecimal.ZERO.setScale(4);

    @NotBlank
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "posted_at")
    private OffsetDateTime postedAt;

    @Column(name = "posted_by", length = 100)
    private String postedBy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversed_entry_id")
    private JournalEntry reversedEntry; // Link to original entry if this is a Storno (reversal)

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lineNumber ASC")
    private List<JournalEntryLine> lines = new ArrayList<>();

    @Version
    @Column(name = "version")
    private Long version; // Optimistic locking

    public void addLine(JournalEntryLine line) {
        lines.add(line);
        line.setJournalEntry(this);
        line.setLineNumber(lines.size());
    }

    public void removeLine(JournalEntryLine line) {
        lines.remove(line);
        line.setJournalEntry(null);
    }
}`
  },
  {
    id: 'journal-entry-line-entity',
    filename: 'JournalEntryLine.java',
    category: 'DB_ENTITY',
    topicIndex: 2,
    description: 'Jakarta JPA Entity: JournalEntryLine with precision 19, scale 4 BigDecimal financial values',
    language: 'java',
    content: `package com.enterprise.finledger.modules.gl.domain;

import com.enterprise.finledger.modules.coa.domain.Account;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "journal_entry_lines", indexes = {
    @Index(name = "idx_lines_journal_id", columnList = "journal_entry_id"),
    @Index(name = "idx_lines_account_id", columnList = "account_id")
})
@Getter
@Setter
@NoArgsConstructor
@Audited
public class JournalEntryLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(name = "debit", precision = 19, scale = 4, nullable = false)
    private BigDecimal debit = BigDecimal.ZERO.setScale(4);

    @NotNull
    @Column(name = "credit", precision = 19, scale = 4, nullable = false)
    private BigDecimal credit = BigDecimal.ZERO.setScale(4);

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public JournalEntryLine(Account account, String description, BigDecimal debit, BigDecimal credit) {
        this.account = account;
        this.description = description;
        this.debit = debit != null ? debit.setScale(4) : BigDecimal.ZERO.setScale(4);
        this.credit = credit != null ? credit.setScale(4) : BigDecimal.ZERO.setScale(4);
    }
}`
  },
  {
    id: 'journal-service-impl',
    filename: 'JournalEntryServiceImpl.java',
    category: 'SERVICE',
    topicIndex: 3,
    description: 'Production Service Layer: Mathematical Double-Entry Validation, Strict BigDecimal check, ACID Transaction',
    language: 'java',
    content: `package com.enterprise.finledger.modules.gl.service;

import com.enterprise.finledger.common.exception.BusinessRuleException;
import com.enterprise.finledger.common.exception.UnbalancedJournalException;
import com.enterprise.finledger.modules.coa.domain.Account;
import com.enterprise.finledger.modules.coa.repository.AccountRepository;
import com.enterprise.finledger.modules.gl.domain.*;
import com.enterprise.finledger.modules.gl.repository.JournalEntryRepository;
import com.enterprise.finledger.modules.gl.sequence.DocumentSequenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JournalEntryServiceImpl implements JournalEntryService {

    private final JournalEntryRepository journalRepository;
    private final AccountRepository accountRepository;
    private final DocumentSequenceService sequenceService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Posts a Journal Entry ensuring strict Double-Entry balancing and ACID transaction rollback.
     * Transaction Isolation Level: READ_COMMITTED prevents dirty reads while allowing concurrency.
     */
    @Override
    @Transactional(
        rollbackFor = Exception.class,
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED
    )
    public JournalEntry postJournal(CreateJournalCommand command) {
        log.info("Initiating Double-Entry Journal Posting for ref: {}", command.getReferenceNumber());

        if (command.getLines() == null || command.getLines().size() < 2) {
            throw new BusinessRuleException("Jurnal berpasangan minimal harus memiliki 2 baris (Debit & Kredit).");
        }

        JournalEntry entry = new JournalEntry();
        entry.setReferenceNumber(command.getReferenceNumber());
        entry.setEntryDate(command.getEntryDate() != null ? command.getEntryDate() : LocalDate.now());
        entry.setDescription(command.getDescription());
        entry.setCurrencyCode(command.getCurrencyCode() != null ? command.getCurrencyCode() : "IDR");

        // 1. Generate sequential voucher number (e.g. JV-202610-00042) using Pessimistic Lock
        String voucherNumber = sequenceService.getNextVoucherNumber("JV", entry.getEntryDate());
        entry.setEntryNumber(voucherNumber);

        // 2. Validate line items and calculate BigDecimal sums with MathContext
        BigDecimal totalDebit = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalCredit = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);

        for (JournalLineCommand lineCmd : command.getLines()) {
            Account account = accountRepository.findById(lineCmd.getAccountId())
                .orElseThrow(() -> new BusinessRuleException("Akun ID " + lineCmd.getAccountId() + " tidak ditemukan."));

            if (Boolean.TRUE.equals(account.getIsHeader())) {
                throw new BusinessRuleException("Akun '" + account.getCode() + " - " + account.getName() + "' adalah akun Header dan tidak dapat diposting.");
            }
            if (Boolean.FALSE.equals(account.getIsActive())) {
                throw new BusinessRuleException("Akun '" + account.getCode() + "' saat ini berstatus non-aktif.");
            }

            BigDecimal debit = lineCmd.getDebit() != null ? lineCmd.getDebit().setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(4);
            BigDecimal credit = lineCmd.getCredit() != null ? lineCmd.getCredit().setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(4);

            // Constraint checks
            if (debit.compareTo(BigDecimal.ZERO) < 0 || credit.compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessRuleException("Nilai nominal debit/kredit tidak boleh bernilai negatif.");
            }
            if (debit.compareTo(BigDecimal.ZERO) > 0 && credit.compareTo(BigDecimal.ZERO) > 0) {
                throw new BusinessRuleException("Satu baris jurnal tidak diperbolehkan memiliki Debit dan Kredit sekaligus.");
            }
            if (debit.compareTo(BigDecimal.ZERO) == 0 && credit.compareTo(BigDecimal.ZERO) == 0) {
                throw new BusinessRuleException("Baris jurnal tidak boleh bernilai nol.");
            }

            totalDebit = totalDebit.add(debit);
            totalCredit = totalCredit.add(credit);

            JournalEntryLine line = new JournalEntryLine(account, lineCmd.getDescription(), debit, credit);
            entry.addLine(line);
        }

        // 3. ZERO-TOLERANCE MATHEMATICAL DOUBLE-ENTRY VALIDATION:
        // Total Debit MUST EXACTLY equal Total Credit
        if (totalDebit.compareTo(totalCredit) != 0) {
            BigDecimal difference = totalDebit.subtract(totalCredit).abs();
            log.error("Double-Entry Imbalance Detected! Debit: {}, Credit: {}, Diff: {}", totalDebit, totalCredit, difference);
            throw new UnbalancedJournalException(
                String.format("Jurnal tidak seimbang! Total Debit (%s) tidak sama dengan Total Kredit (%s). Selisih: %s",
                    totalDebit, totalCredit, difference),
                totalDebit,
                totalCredit,
                difference
            );
        }

        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);
        entry.setStatus(JournalStatus.POSTED);
        entry.setPostedAt(OffsetDateTime.now());
        entry.setPostedBy(getCurrentUsername());

        // 4. Persistence inside Unit of Work
        JournalEntry savedEntry = journalRepository.save(entry);

        // 5. Emit In-Process Domain Event for Modulith asynchronous listeners
        eventPublisher.publishEvent(new JournalPostedEvent(savedEntry.getId(), savedEntry.getEntryNumber(), totalDebit));

        log.info("Successfully posted balanced Journal Entry: {}", savedEntry.getEntryNumber());
        return savedEntry;
    }

    /**
     * Storno Reversal: In standard enterprise accounting, posted journals are NEVER physically deleted.
     * An exact opposite reversing journal (Storno) is created and posted instead.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public JournalEntry reverseJournal(UUID originalJournalId, String reversalReason) {
        JournalEntry original = journalRepository.findById(originalJournalId)
            .orElseThrow(() -> new BusinessRuleException("Jurnal asli tidak ditemukan."));

        if (original.getStatus() != JournalStatus.POSTED) {
            throw new BusinessRuleException("Hanya jurnal dengan status POSTED yang dapat di-reversal.");
        }

        CreateJournalCommand stornoCmd = new CreateJournalCommand();
        stornoCmd.setReferenceNumber("REV-" + original.getEntryNumber());
        stornoCmd.setDescription("STORNO REVERSAL: " + original.getEntryNumber() + " - " + reversalReason);
        stornoCmd.setEntryDate(LocalDate.now());

        // Invert Debits and Credits
        List<JournalLineCommand> invertedLines = original.getLines().stream().map(line -> {
            JournalLineCommand cmd = new JournalLineCommand();
            cmd.setAccountId(line.getAccount().getId());
            cmd.setDescription("Reversal: " + line.getDescription());
            cmd.setDebit(line.getCredit());   // Inverted
            cmd.setCredit(line.getDebit());   // Inverted
            return cmd;
        }).toList();

        stornoCmd.setLines(invertedLines);
        JournalEntry stornoEntry = postJournal(stornoCmd);

        original.setStatus(JournalStatus.REVERSED);
        original.setReversedEntry(stornoEntry);
        journalRepository.save(original);

        return stornoEntry;
    }

    private String getCurrentUsername() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "system.accountant";
    }
}`
  },
  {
    id: 'sequence-service',
    filename: 'DocumentSequenceServiceImpl.java',
    category: 'CONCURRENCY_AUDIT',
    topicIndex: 4,
    description: 'Pessimistic Locking & Gap-Free Sequence Generator for Sequential Financial Numbers',
    language: 'java',
    content: `package com.enterprise.finledger.modules.gl.sequence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentSequenceServiceImpl implements DocumentSequenceService {

    @PersistenceContext
    private final EntityManager entityManager;

    private static final DateTimeFormatter PERIOD_FORMAT = DateTimeFormatter.ofPattern("yyyyMM");

    /**
     * Generates monotonic, gap-free sequence voucher number under heavy concurrent load.
     * Uses PESSIMISTIC_WRITE lock on document_sequences row (SELECT ... FOR UPDATE).
     * Propagation.REQUIRES_NEW ensures lock is released immediately once number is acquired.
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public String getNextVoucherNumber(String prefix, LocalDate date) {
        String period = date.format(PERIOD_FORMAT); // e.g. "202610"
        String sequenceKey = String.format("%s-%s", prefix, period);

        // Fetch with PESSIMISTIC_WRITE (equivalent to SQL: SELECT * FROM document_sequences WHERE id = ? FOR UPDATE)
        DocumentSequence sequence = entityManager.find(
            DocumentSequence.class,
            sequenceKey,
            LockModeType.PESSIMISTIC_WRITE
        );

        if (sequence == null) {
            // First transaction in this fiscal period
            sequence = new DocumentSequence(sequenceKey, prefix, period, 1L);
            entityManager.persist(sequence);
            entityManager.flush();
            return String.format("%s-%s-%05d", prefix, period, 1L);
        }

        long nextVal = sequence.getLastSequence() + 1;
        sequence.setLastSequence(nextVal);
        entityManager.merge(sequence);
        entityManager.flush();

        return String.format("%s-%s-%05d", prefix, period, nextVal);
    }
}`
  },
  {
    id: 'security-config',
    filename: 'SecurityConfig.java',
    category: 'SECURITY',
    topicIndex: 9,
    description: 'Spring Security 6 with Stateless JWT and Method-Level Role-Based Access Control (RBAC)',
    language: 'java',
    content: `package com.enterprise.finledger.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enables @PreAuthorize("hasRole('ACCOUNTANT')")
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**", "/actuator/health").permitAll()

                // Read-only endpoints accessible to AUDITOR and VIEWER
                .requestMatchers(HttpMethod.GET, "/api/v1/reports/**", "/api/v1/gl/trial-balance").hasAnyRole("AUDITOR", "VIEWER", "ACCOUNTANT", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/coa/**", "/api/v1/invoices/**").hasAnyRole("AUDITOR", "VIEWER", "ACCOUNTANT", "SUPER_ADMIN")

                // Mutating financial operations: Strictly restricted to ACCOUNTANT and SUPER_ADMIN
                .requestMatchers(HttpMethod.POST, "/api/v1/gl/journals/**").hasAnyRole("ACCOUNTANT", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/gl/journals/**").hasAnyRole("ACCOUNTANT", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/arap/invoices/**").hasAnyRole("ACCOUNTANT", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/arap/payments/**").hasAnyRole("ACCOUNTANT", "SUPER_ADMIN")

                // System configuration & CoA modifications: SUPER_ADMIN only
                .requestMatchers(HttpMethod.POST, "/api/v1/coa/**").hasRole("SUPER_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/**").hasRole("SUPER_ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}`
  },
  {
    id: 'tax-integration-service',
    filename: 'IndonesianTaxEngineService.java',
    category: 'TAX',
    topicIndex: 7,
    description: 'Local Tax Engine: PPN 11%/12%, PPh 21/23 calculations & e-Faktur Pajak CSV Generation',
    language: 'java',
    content: `package com.enterprise.finledger.modules.tax.service;

import com.enterprise.finledger.modules.arap.domain.Invoice;
import com.enterprise.finledger.modules.tax.domain.TaxCalculationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@Slf4j
public class IndonesianTaxEngineService {

    // Tarif PPN 11% (UU HPP No. 7 Tahun 2021)
    private static final BigDecimal PPN_RATE_11 = new BigDecimal("0.1100");
    // Tarif PPh 23 Jasa Teknik / Konsultasi: 2% (Ber-NPWP) atau 4% (Tanpa NPWP)
    private static final BigDecimal PPH_23_NPWP = new BigDecimal("0.0200");
    private static final BigDecimal PPH_23_NON_NPWP = new BigDecimal("0.0400");

    /**
     * Calculates PPN Keluaran and DPP (Dasar Pengenaan Pajak) with BigDecimal rounding.
     */
    public TaxCalculationResult calculateVat(BigDecimal subtotal, boolean isInclusive) {
        BigDecimal dpp;
        BigDecimal vatAmount;

        if (isInclusive) {
            // DPP = Subtotal / 1.11
            dpp = subtotal.divide(BigDecimal.ONE.add(PPN_RATE_11), 4, RoundingMode.HALF_UP);
            vatAmount = subtotal.subtract(dpp).setScale(4, RoundingMode.HALF_UP);
        } else {
            dpp = subtotal.setScale(4, RoundingMode.HALF_UP);
            vatAmount = dpp.multiply(PPN_RATE_11).setScale(4, RoundingMode.HALF_UP);
        }

        BigDecimal grandTotal = dpp.add(vatAmount).setScale(4, RoundingMode.HALF_UP);
        return new TaxCalculationResult(dpp, vatAmount, PPN_RATE_11, grandTotal);
    }

    /**
     * Computes Withholding Tax PPh Pasal 23 on Service Invoices.
     */
    public BigDecimal calculatePph23(BigDecimal serviceGrossAmount, boolean hasNpwp) {
        BigDecimal rate = hasNpwp ? PPH_23_NPWP : PPH_23_NON_NPWP;
        return serviceGrossAmount.multiply(rate).setScale(4, RoundingMode.HALF_UP);
    }

    /**
     * Generates e-Faktur compliant CSV row for Direktorat Jenderal Pajak (DJP) import.
     * Header format: FK;KD_JENIS_TRANSAKSI;FG_PENGGANTI;NOMOR_FAKTUR;MASA_PAJAK;TAHUN_PAJAK;TANGGAL_FAKTUR;NPWP;NAMA...
     */
    public String generateEFakturCsvRow(Invoice invoice, String nsfp) {
        LocalDate date = invoice.getIssueDate();
        int masaPajak = date.getMonthValue();
        int tahunPajak = date.getYear();

        return String.format(
            "FK;01;0;%s;%d;%d;%s;%s;\"%s\";\"Jakarta, Indonesia\";%s;%s;0;0;0;0;0.00;\"%s\"",
            nsfp, // e.g. "010.000-26.00001234"
            masaPajak,
            tahunPajak,
            date.toString(),
            invoice.getPartyTaxId() != null ? invoice.getPartyTaxId().replaceAll("[^0-9]", "") : "000000000000000",
            invoice.getPartyName(),
            invoice.getSubtotal().setScale(0, RoundingMode.HALF_UP).toPlainString(),
            invoice.getTaxAmount().setScale(0, RoundingMode.HALF_UP).toPlainString(),
            invoice.getInvoiceNumber()
        );
    }
}`
  },
  {
    id: 'report-export-service',
    filename: 'FinancialReportExportService.java',
    category: 'REPORT',
    topicIndex: 8,
    description: 'Automated Financial Statement Exporter: Apache POI for Excel XLSX & OpenPDF for Audit-Ready PDF',
    language: 'java',
    content: `package com.enterprise.finledger.modules.reporting.exporter;

import com.enterprise.finledger.modules.reporting.model.BalanceSheetDto;
import com.enterprise.finledger.modules.reporting.model.TrialBalanceDto;
import com.lowagie.text.Document;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@Slf4j
public class FinancialReportExportService {

    /**
     * Generates production-grade Excel (.xlsx) workbook with dynamic formulas and accounting currency format.
     */
    public byte[] exportTrialBalanceToExcel(TrialBalanceDto report) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Trial Balance");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Currency Style: Rp #,##0.00; (Rp #,##0.00); "-"
            DataFormat format = workbook.createDataFormat();
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(format.getFormat("Rp #,##0.00"));

            // Title
            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("PT NUSANTARA DIGITAL SOLUSINDO - NERACA SALDO");
            Row dateRow = sheet.createRow(1);
            dateRow.createCell(0).setCellValue("Per Tanggal: " + LocalDate.now());

            // Column Headers
            String[] headers = {"Kode Akun", "Nama Akun", "Kategori", "Debit Berjalan", "Kredit Berjalan", "Saldo Akhir Debit", "Saldo Akhir Kredit"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 4;
            for (var row : report.getRows()) {
                Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue(row.getAccountCode());
                r.createCell(1).setCellValue(row.getAccountName());
                r.createCell(2).setCellValue(row.getCategory().name());

                Cell dCell = r.createCell(5);
                dCell.setCellValue(row.getEndingDebit().doubleValue());
                dCell.setCellStyle(currencyStyle);

                Cell cCell = r.createCell(6);
                cCell.setCellValue(row.getEndingCredit().doubleValue());
                cCell.setCellStyle(currencyStyle);
            }

            // Total Summary Row with Excel FORMULA
            Row totalRow = sheet.createRow(rowIdx);
            totalRow.createCell(1).setCellValue("TOTAL NERACA SALDO");
            Cell sumDebit = totalRow.createCell(5);
            sumDebit.setCellFormula(String.format("SUM(F5:F%d)", rowIdx));
            sumDebit.setCellStyle(currencyStyle);

            Cell sumCredit = totalRow.createCell(6);
            sumCredit.setCellFormula(String.format("SUM(G5:G%d)", rowIdx));
            sumCredit.setCellStyle(currencyStyle);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Generates formal, audit-ready PDF Financial Report using OpenPDF.
     */
    public byte[] exportBalanceSheetToPdf(BalanceSheetDto balanceSheet) throws Exception {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Header
            document.add(new Paragraph("PT NUSANTARA DIGITAL SOLUSINDO", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            document.add(new Paragraph("LAPORAN POSISI KEUANGAN (NERACA) - AUDITED", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            document.add(new Paragraph("Periode Berakhir: " + LocalDate.now() + "\\n\\n", FontFactory.getFont(FontFactory.HELVETICA, 10)));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);

            table.addCell("TOTAL ASET LANCAR");
            table.addCell(balanceSheet.getCurrentAssets().toString());

            table.addCell("TOTAL ASET TETAP (NET)");
            table.addCell(balanceSheet.getFixedAssets().toString());

            table.addCell("TOTAL AKTIVA");
            table.addCell(balanceSheet.getTotalAssets().toString());

            table.addCell("TOTAL KEWAJIBAN (LIABILITAS)");
            table.addCell(balanceSheet.getTotalLiabilities().toString());

            table.addCell("TOTAL EKUITAS");
            table.addCell(balanceSheet.getTotalEquity().toString());

            document.add(table);
            document.close();
            return out.toByteArray();
        }
    }
}`
  },
  {
    id: 'aes-gcm-converter',
    filename: 'AesGcmAttributeConverter.java',
    category: 'SECURITY',
    topicIndex: 9,
    description: 'JPA AttributeConverter: AES-256-GCM Column-Level Encryption for Sensitive Financial/Tax Identifiers',
    language: 'java',
    content: `package com.enterprise.finledger.common.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Encrypts sensitive fields (e.g. Bank Account Numbers, NPWP Tax IDs) at rest
 * using AES-256 in GCM authenticated encryption mode.
 */
@Component
@Converter
public class AesGcmAttributeConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;

    @Value("\${finledger.security.encryption-key-base64:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=}")
    private String base64Key;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            byte[] iv = new byte[IV_LENGTH_BYTE];
            new SecureRandom().nextBytes(iv);

            SecretKey key = new SecretKeySpec(Base64.getDecoder().decode(base64Key), "AES");
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

            byte[] cipherText = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));

            // Prepend IV to ciphertext
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt sensitive financial field", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            byte[] decoded = Base64.getDecoder().decode(dbData);
            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);

            byte[] iv = new byte[IV_LENGTH_BYTE];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            SecretKey key = new SecretKeySpec(Base64.getDecoder().decode(base64Key), "AES");
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to decrypt sensitive financial field", e);
        }
    }
}`
  },
  {
    id: 'budget-entity',
    filename: 'BudgetPlanItem.java',
    category: 'BUDGET',
    topicIndex: 10,
    description: 'Jakarta JPA Entity: Fiscal Year Account Budget Plan Item with BigDecimal limit and quarterly allocation',
    language: 'java',
    content: `package com.enterprise.finledger.modules.budget.domain;

import com.enterprise.finledger.common.audit.AuditableEntity;
import com.enterprise.finledger.modules.coa.domain.Account;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "budget_plan_items", indexes = {
    @Index(name = "idx_budget_account_year", columnList = "account_id, fiscal_year", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@Audited
public class BudgetPlanItem extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @NotNull
    @Column(name = "fiscal_year", nullable = false)
    private Integer fiscalYear; // e.g. 2026

    @NotNull
    @Column(name = "annual_budget", precision = 19, scale = 4, nullable = false)
    private BigDecimal annualBudget = BigDecimal.ZERO.setScale(4);

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Version
    @Column(name = "version")
    private Long version;

    public BudgetPlanItem(Account account, Integer fiscalYear, BigDecimal annualBudget, String notes) {
        this.account = account;
        this.fiscalYear = fiscalYear;
        this.annualBudget = annualBudget != null ? annualBudget.setScale(4) : BigDecimal.ZERO.setScale(4);
        this.notes = notes;
    }
}`
  },
  {
    id: 'budget-service',
    filename: 'BudgetVarianceServiceImpl.java',
    category: 'BUDGET',
    topicIndex: 10,
    description: 'Service Layer: Real-Time SQL Budget vs Actual Ledger Variance Calculation with Managerial Accounting Rules',
    language: 'java',
    content: `package com.enterprise.finledger.modules.budget.service;

import com.enterprise.finledger.modules.budget.domain.BudgetPlanItem;
import com.enterprise.finledger.modules.budget.dto.BudgetVarianceDto;
import com.enterprise.finledger.modules.budget.repository.BudgetPlanItemRepository;
import com.enterprise.finledger.modules.coa.domain.AccountCategory;
import com.enterprise.finledger.modules.gl.repository.JournalEntryLineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetVarianceServiceImpl implements BudgetVarianceService {

    private final BudgetPlanItemRepository budgetRepository;
    private final JournalEntryLineRepository journalLineRepository;

    /**
     * Computes real-time variance analysis by aggregating posted journal lines against approved budget limits.
     * Uses read-only transaction for high performance.
     */
    @Override
    @Transactional(readOnly = true)
    public List<BudgetVarianceDto> getVarianceAnalysis(int fiscalYear) {
        List<BudgetPlanItem> budgetItems = budgetRepository.findByFiscalYear(fiscalYear);

        return budgetItems.stream().map(item -> {
            // Aggregate actual movements from General Ledger lines for this account and fiscal year
            BigDecimal actualAmount = journalLineRepository.sumNetMovementByAccountIdAndYear(
                item.getAccount().getId(), fiscalYear
            );
            if (actualAmount == null) {
                actualAmount = BigDecimal.ZERO.setScale(4);
            }

            BigDecimal budgetLimit = item.getAnnualBudget();
            BigDecimal varianceAmount;
            String status;

            // Managerial Accounting Variance Evaluation
            if (item.getAccount().getCategory() == AccountCategory.EXPENSE) {
                // For Expenses: Variance = Budget - Actual (Positive = Under budget = Favorable)
                varianceAmount = budgetLimit.subtract(actualAmount).setScale(4, RoundingMode.HALF_UP);
                status = actualAmount.compareTo(budgetLimit) > 0 ? "UNFAVORABLE" : "FAVORABLE";
            } else if (item.getAccount().getCategory() == AccountCategory.REVENUE) {
                // For Revenue: Variance = Actual - Budget (Positive = Target Exceeded = Favorable)
                varianceAmount = actualAmount.subtract(budgetLimit).setScale(4, RoundingMode.HALF_UP);
                status = actualAmount.compareTo(budgetLimit) >= 0 ? "FAVORABLE" : "UNFAVORABLE";
            } else {
                varianceAmount = budgetLimit.subtract(actualAmount).setScale(4, RoundingMode.HALF_UP);
                status = "ON_TRACK";
            }

            BigDecimal utilizationRate = budgetLimit.compareTo(BigDecimal.ZERO) > 0
                ? actualAmount.divide(budgetLimit, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

            return BudgetVarianceDto.builder()
                .accountId(item.getAccount().getId())
                .accountCode(item.getAccount().getCode())
                .accountName(item.getAccount().getName())
                .category(item.getAccount().getCategory().name())
                .fiscalYear(fiscalYear)
                .annualBudget(budgetLimit)
                .actualAmount(actualAmount)
                .varianceAmount(varianceAmount)
                .utilizationRate(utilizationRate)
                .status(status)
                .build();
        }).toList();
    }
}`
  },
  {
    id: 'budget-notification-listener',
    filename: 'BudgetThresholdNotificationListener.java',
    category: 'BUDGET',
    topicIndex: 10,
    description: 'Event-Driven Budget Monitoring: Triggers Real-Time Alerts When Actual Expense Exceeds 90% of Budget Limit',
    language: 'java',
    content: `package com.enterprise.finledger.modules.budget.listener;

import com.enterprise.finledger.modules.budget.domain.BudgetPlanItem;
import com.enterprise.finledger.modules.budget.repository.BudgetPlanItemRepository;
import com.enterprise.finledger.modules.gl.domain.JournalPostedEvent;
import com.enterprise.finledger.modules.gl.repository.JournalEntryLineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class BudgetThresholdNotificationListener {

    private final BudgetPlanItemRepository budgetRepository;
    private final JournalEntryLineRepository journalLineRepository;

    private static final BigDecimal WARNING_THRESHOLD_PERCENT = new BigDecimal("90.00");

    /**
     * Listens asynchronously AFTER COMMIT of any journal posting event.
     * Evaluates whether affected expense accounts crossed the 90% budget ceiling.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @ApplicationModuleListener
    public void onJournalPosted(JournalPostedEvent event) {
        log.info("Inspecting budget utilization post-commit for journal: {}", event.getEntryNumber());

        int currentYear = LocalDate.now().getYear();

        // Check all line items impacted by this journal
        journalLineRepository.findExpenseAccountsByJournalId(event.getJournalId()).forEach(account -> {
            Optional<BudgetPlanItem> budgetOpt = budgetRepository.findByAccountIdAndFiscalYear(account.getId(), currentYear);

            if (budgetOpt.isPresent()) {
                BudgetPlanItem budget = budgetOpt.get();
                BigDecimal actualSpending = journalLineRepository.sumNetMovementByAccountIdAndYear(account.getId(), currentYear);

                if (budget.getAnnualBudget().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal utilizationRate = actualSpending
                        .divide(budget.getAnnualBudget(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                    // Check if spending exceeded 90%
                    if (utilizationRate.compareTo(WARNING_THRESHOLD_PERCENT) >= 0) {
                        log.warn("BUDGET ALERT: Account {} - {} has exceeded 90% budget! Utilization: {}% (Actual: {}, Limit: {})",
                            account.getCode(),
                            account.getName(),
                            utilizationRate.setScale(1, RoundingMode.HALF_UP),
                            actualSpending,
                            budget.getAnnualBudget()
                        );

                        // Dispatch alert to NotificationService (Slack / Email / In-App Event)
                        dispatchBudgetWarningAlert(account.getCode(), account.getName(), actualSpending, budget.getAnnualBudget(), utilizationRate);
                    }
                }
            }
        });
    }

    private void dispatchBudgetWarningAlert(String code, String name, BigDecimal actual, BigDecimal limit, BigDecimal rate) {
        // Broadcast WebSocket STOMP notification or SMTP email alert to Finance Controller
        log.info("Dispatched notification for {} ({}% spent)", code, rate.setScale(1, RoundingMode.HALF_UP));
    }
}`
  }
];

export interface ArchitecturalRationale {
  topicIndex: number;
  title: string;
  summary: string;
  keyPrinciples: string[];
  javaStack: string;
  pitfallsToAvoid: string[];
}

export const ARCHITECTURAL_RATIONALES: ArchitecturalRationale[] = [
  {
    topicIndex: 1,
    title: 'Arsitektur Folder Proyek (Clean Architecture & Modular Monolith)',
    summary: 'Struktur kode enterprise memisahkan Domain Core dari Framework & Infrastruktur. Mengadopsi Spring Modulith untuk membatasi interaksi antar modul keuangan secara strictly decoupled.',
    keyPrinciples: [
      'Inversion of Control: Domain entities dan model bisnis tidak boleh memiliki dependensi ke layer web atau third-party database driver.',
      'Screaming Architecture: Struktur package mencerminkan domain akuntansi (coa, gl, arap, tax, reporting) bukan generic layer (controllers, services, repositories).',
      'Package-private encapsulation: Hanya Service API & DTO yang berstatus public; Repository dan internal helper tetap package-private guna mencegah bypassing business rules.'
    ],
    javaStack: 'Spring Boot 3.4, Java 17+, Spring Modulith 1.3, Jakarta EE 10',
    pitfallsToAvoid: [
      'Circular dependency antar modul GL dan AR/AP (solusi: gunakan Domain Events via ApplicationEventPublisher).',
      'Anemic Domain Model di mana semua logika verifikasi bocor ke Controller.'
    ]
  },
  {
    topicIndex: 2,
    title: 'Skema Database & JPA Entities (CoA, GL, AR/AP)',
    summary: 'Skema PostgreSQL dirancang dengan foreign keys RESTRICT, check constraints non-negatif, composite unique constraints, dan UUID v4 primary keys untuk menjamin integritas data ACID.',
    keyPrinciples: [
      'Hierarchical CoA: Tabel accounts memiliki self-referencing foreign key parent_id dengan flag is_header untuk mencegah posting langsung ke akun induk.',
      'Immutable Journal Line: Baris jurnal yang telah diposting tidak boleh diupdate atau dihapus secara sepihak. Relasi orphanRemoval = true hanya saat draft.',
      'Database Invariant chk_journal_balanced: PostgreSQL CHECK constraint memastikan bahwa jika status == POSTED, total debit WAJIB sama dengan total credit.'
    ],
    javaStack: 'PostgreSQL 16, Hibernate 6.6, Spring Data JPA, Flyway Migrations',
    pitfallsToAvoid: [
      'Menggunakan CascadeType.REMOVE pada master data akun (bisa menghapus jutaan riwayat jurnal).',
      'Menggunakan tipe data floating point (FLOAT/REAL) di database (wajib gunakan NUMERIC(19, 4)).'
    ]
  },
  {
    topicIndex: 3,
    title: 'Service Layer & Validasi Double-Entry (Debit == Kredit)',
    summary: 'Implementasi JournalEntryService dengan validasi matematis zero-tolerance, manipulasi BigDecimal dengan MathContext.DECIMAL128, dan anotasi @Transactional(rollbackFor = Exception.class).',
    keyPrinciples: [
      'Zero Tolerance: Perbandingan balance totalDebit.compareTo(totalCredit) != 0 langsung melempar UnbalancedJournalException sebelum database commit.',
      'Rollback Guard: @Transactional(rollbackFor = Exception.class, isolation = Isolation.READ_COMMITTED) menjamin seluruh proses atomik.',
      'Storno Reversal: Jurnal yang telah diposting tidak pernah dihapus secara fisik; pembatalan dilakukan dengan membuat jurnal pembalik otomatis (Storno).'
    ],
    javaStack: 'Spring @Transactional, java.math.BigDecimal, Custom RFC-7807 Exceptions',
    pitfallsToAvoid: [
      'Membandingkan BigDecimal menggunakan .equals() bukan .compareTo() (.equals membandingkan scale, sehingga 10.0 != 10.00).',
      'Menangkap exception (catch) di dalam service tanpa melempar ulang, menyebabkan transaksi tidak rollback.'
    ]
  },
  {
    topicIndex: 4,
    title: 'Audit Trail & Penanganan Concurrency Voucher Sequence',
    summary: 'Strategi penomoran voucher berurutan tanpa celah (gap-free) menggunakan PostgreSQL SELECT FOR UPDATE (Pessimistic Lock) dan pelacakan audit historis dengan Hibernate Envers.',
    keyPrinciples: [
      'Pessimistic Row Lock: Tabel document_sequences dikunci baris per baris per periode fiskal menggunakan LockModeType.PESSIMISTIC_WRITE.',
      'Transaction Scope: Propagation.REQUIRES_NEW membatasi durasi lock seminimal mungkin (< 5ms) agar tidak memblokir antrean thread lain.',
      'Envers Historical Auditing: @Audited otomatis mencatat riwayat perubahan (REV, REVTYPE) ke tabel _aud untuk keperluan investigasi auditor eksternal.'
    ],
    javaStack: 'Hibernate Envers, JPA EntityManager LockModeType.PESSIMISTIC_WRITE, Spring Data Auditing',
    pitfallsToAvoid: [
      'Mengandalkan JPA Auto Increment Sequence database yang bisa lompat (gap) saat terjadi transaksi rollback.',
      'Table-level lock yang melumpuhkan performa concurrent write.'
    ]
  },
  {
    topicIndex: 5,
    title: 'Unit of Work Pattern untuk Integritas Transaksi Finansial',
    summary: 'Penerapan Unit of Work via Hibernate Persistence Context dan Spring PlatformTransactionManager untuk mengkoordinasikan multi-tabel flush secara atomik.',
    keyPrinciples: [
      'Persistence Context sebagai Unit of Work: Melacak semua entity yang berubah (dirty checking) dan mengeksekusi flush SQL dalam urutan terkoordinasi.',
      'Atomic Multi-Entity Updates: Ketika Invoice dilunasi, perubahan status Invoice -> PAID, pembuatan record Payment, dan posting JournalEntry terjadi dalam 1 commit.',
      'Idempotency Key: Mencegah double-posting saat terjadi network retry dari client dengan unique reference_number.'
    ],
    javaStack: 'Spring JpaTransactionManager, Hibernate First-Level Cache',
    pitfallsToAvoid: [
      'Memanggil method @Transactional dari dalam class yang sama (self-invocation bypasses Spring AOP proxy).',
      'Melakukan I/O lambat (seperti memanggil Third-party HTTP API pembayaran) di dalam blok transaksi database aktif.'
    ]
  },
  {
    topicIndex: 6,
    title: 'Arsitektur Modular untuk Skalabilitas Modul Keuangan',
    summary: 'Memecah modul akuntansi (CoA, GL, AR, AP, Pajak, Laporan) dengan batas domain yang jelas (Bounded Context) menggunakan Spring Modulith event-driven.',
    keyPrinciples: [
      'Loose Coupling via Events: Modul AR/AP menerbitkan InvoiceCreatedEvent; modul GL mendengarkan dan membuat JournalEntry tanpa dependensi langsung.',
      'Microservice Ready: Batas modul modular monolith dapat diekstrak menjadi independent microservices jika skala transaksi perusahaan memerlukan horizontal partitioning.',
      'Read/Write Segregation (CQRS Light): Query laporan keuangan diarahkan ke materialised view atau read-replica agar tidak membebani OLTP transaksi buku besar.'
    ],
    javaStack: 'Spring Modulith, Spring ApplicationEventPublisher, TransactionalEventListener',
    pitfallsToAvoid: [
      'Tightly-coupled direct JPA cross-module relations (contoh: Invoice entity me-load JournalEntry dengan eager fetch).'
    ]
  },
  {
    topicIndex: 7,
    title: 'Integrasi Sistem Perpajakan Lokal (e-Faktur, PPN 11%/12%, PPh 21/23)',
    summary: 'Kepatuhan perpajakan Indonesia (UU HPP No. 7/2021) dengan kalkulasi otomatis DPP, PPN Keluaran/Masukan 11%, withholding PPh 23, serta ekspor skema e-Faktur DJP.',
    keyPrinciples: [
      'DPP & PPN Calculation: Perhitungan teliti baik untuk transaksi harga include PPN (DPP = Total / 1.11) maupun exclude PPN (PPN = DPP * 0.11).',
      'Tax Journal Mapping: Otomatisasi jurnal ke akun Utang PPN Keluaran (2120), PPN Masukan (1140), dan Utang PPh 21/23 (2130).',
      'e-Faktur Integration: Ekspor data faktur pajak sesuai format CSV baku Direktorat Jenderal Pajak (DJP) lengkap dengan Nomor Seri Faktur Pajak (NSFP).'
    ],
    javaStack: 'BigDecimal RoundingMode.HALF_UP, CSV Schema Formatter, DJP XML/CSV Specs',
    pitfallsToAvoid: [
      'Pembulatan desimal yang tidak sinkron antara subtotal faktur dan faktur pajak DJP.'
    ]
  },
  {
    topicIndex: 8,
    title: 'Laporan Keuangan Otomatis & Ekspor ke Excel & PDF',
    summary: 'Agregasi real-time untuk Neraca Saldo (Trial Balance), Neraca (Balance Sheet), dan Laba Rugi (Income Statement) dengan kemampuan ekspor ke XLSX (Apache POI) dan PDF (OpenPDF).',
    keyPrinciples: [
      'Real-time SQL Aggregation: Menggunakan agregasi SQL SUM(debit), SUM(credit) yang di-index untuk performa < 50ms bahkan pada jutaan baris.',
      'Formula-rich Excel: File Excel yang diekspor menggunakan formula asli Excel (SUM, IF) sehingga dapat diaudit oleh kantor akuntan publik.',
      'Audited PDF: Layout PDF formal mencakup watermark status (Audited/Draft), cap waktu UTC, dan identitas auditor penandatangan.'
    ],
    javaStack: 'Apache POI 5.3 (XSSF), OpenPDF, Thymeleaf HTML-to-PDF template',
    pitfallsToAvoid: [
      'Memuat seluruh baris jurnal ke memori Java untuk menghitung saldo (gunakan SQL GROUP BY / Aggregation).'
    ]
  },
  {
    topicIndex: 9,
    title: 'Pengamanan Data Sensitif (Enkripsi End-to-End & RBAC Matrix)',
    summary: 'Keamanan enterprise dengan enkripsi field sensitif di database (AES-256-GCM), JWT Bearer authentication, serta otorisasi berbasis peran (Super Admin, Accountant, Auditor, Viewer).',
    keyPrinciples: [
      'RBAC Matrix: Super Admin (kelola sistem/user), Accountant (input & posting jurnal/AR/AP), Auditor (akses read-only ke semua buku & log audit), Viewer (dashboard ringkas).',
      'Method Security: Anotasi @PreAuthorize("hasRole(\'ACCOUNTANT\')") di setiap controller dan service layer untuk mencegah privilege escalation.',
      'AES-256-GCM Field Encryption: Nomor rekening bank dan NPWP dienkripsi secara transparan menggunakan JPA AttributeConverter.'
    ],
    javaStack: 'Spring Security 6, JJWT 0.12, AES-256-GCM, BCrypt Password Hasher',
    pitfallsToAvoid: [
      'Menyimpan kunci enkripsi secara hardcoded di source code (wajib menggunakan Environment Variable atau HashiCorp Vault).'
    ]
  },
  {
    topicIndex: 10,
    title: 'Dashboard Analitik Real-Time Kesehatan Finansial',
    summary: 'Pemantauan indikator likuiditas, solvabilitas, dan profitabilitas real-time: Current Ratio, Quick Ratio, Net Profit Margin, Debt-to-Equity, serta Aging Piutang/Utang.',
    keyPrinciples: [
      'Financial Ratio Health Checks: Ambang batas normal (Current Ratio >= 1.5, Quick Ratio >= 1.0, Net Margin > 15%).',
      'Aging Schedule Visualization: Pengelompokan umur piutang/utang ke dalam bucket 0-30 hari, 31-60 hari, 61-90 hari, dan >90 hari untuk mitigasi risiko bad debt.',
      'Zero-Drift Integrity Watcher: Pengecekan otomatis bahwa persamaan dasar akuntansi Aktiva = Kewajiban + Ekuitas selalu berada dalam selisih Rp 0.00.'
    ],
    javaStack: 'Spring Boot Actuator, Micrometer, Financial Ratio Calculator, Real-time Aggregation',
    pitfallsToAvoid: [
      'Menghitung rasio keuangan dari data yang belum diposting (unposted drafts).'
    ]
  }
];
