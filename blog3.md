# Voucher Entry in Systems Automation
## Complete Business Understanding (Simple Language)

---

## What Happens in a Finance Company?

Think of a finance company like **Tata Capital, Bajaj Finance, or Aditya Birla Finance**.

Every day, thousands of financial transactions take place, such as:

- Customer pays an EMI
- Company disburses a loan
- Customer pays a processing fee
- Bank deducts service charges
- Money is transferred between company accounts
- Interest is credited
- Refunds are issued

These transactions happen in the **bank account** of the company.

### Example Bank Statement

| Date | Description | Amount |
|------|-------------|--------|
| 10 Jul | Loan Disbursement | ₹5,00,000 |
| 10 Jul | EMI Received | ₹12,500 |
| 10 Jul | NEFT Transfer | ₹1,00,000 |
| 10 Jul | Bank Charges | -₹295 |

---

## The Main Problem

The **bank knows** that money has come in or gone out.

But the **company's ERP (Enterprise Resource Planning) system does not know** why that transaction happened.

This is because the **Bank** and the **ERP** are two separate systems.

**The bank only records:**
- Money Received
- Money Paid

**The ERP needs to know:**
- Why did the money come?
- Which customer made the payment?
- Which loan was paid?
- Which accounting accounts should be updated?

This information is recorded through a **Voucher Entry**.

---

## What is a Voucher?

A **Voucher** is simply an **accounting record** of a financial transaction.

It tells the accounting system:

- What happened?
- Which accounts are affected?
- How much money is involved?

Without a voucher, the ERP cannot update its financial records correctly.

---

## Example of a Voucher

Suppose a customer pays an EMI of **₹10,000**.

The bank only shows: *₹10,000 received.*

But the ERP records it as:

| Account | Entry | Amount |
|---------|-------|--------|
| Bank Account | Debit | ₹10,000 |
| Customer Loan Account | Credit | ₹10,000 |

This accounting record is called a **Voucher**.

---

## Why is a Voucher Important?

Every company maintains proper accounting records. All voucher entries are stored in the **General Ledger (GL)**.

If vouchers are not created:

- Customer balances become incorrect
- Loan records become incorrect
- Financial reports become inaccurate
- Company accounts no longer match the bank

That is why every financial transaction must have a corresponding voucher.

---

## Understanding Important Terms

### 1. ERP (Enterprise Resource Planning)

ERP is the company's main software used to manage business operations.

It stores information like:
- Customer details
- Loan details
- Payments
- Accounting records
- Reports
- Financial statements

Examples: SAP, Oracle ERP, Microsoft Dynamics.

---

### 2. Bank Statement

A Bank Statement is a report provided by the bank showing all money that has entered or left the bank account.

It contains: Date, Description, Amount, Transaction Type.

The bank only tracks the movement of money, not the business reason behind it.

---

### 3. Accounting Entry

An Accounting Entry records the financial impact of a transaction. Every transaction affects at least two accounts.

**Example:** Customer pays ₹10,000.
- Bank Account increases.
- Customer Loan Balance decreases.

These changes are recorded using accounting entries.

---

### 4. Debit

**Debit (Dr.)** means an increase in assets or expenses, or a decrease in liabilities.

Examples:
- Money received in the bank
- Cash received
- Office equipment purchased

> Debit usually means **something the company owns has increased**.

---

### 5. Credit

**Credit (Cr.)** means an increase in liabilities or income, or a decrease in assets.

Examples:
- Customer loan balance decreases after payment
- Revenue earned
- Loan liability created

> Credit usually means **where the money came from or what obligation changed**.

---

### 6. Bank Account (Accounting)

This is the company's account recorded inside the ERP. Whenever money is received or paid, this account is updated.

**Example:** Customer pays ₹10,000 → the Bank Account in the ERP increases by ₹10,000.

---

### 7. Customer Loan Account

This account stores how much money the customer still owes.

**Example:**
- Loan Outstanding = ₹5,00,000
- Customer pays ₹10,000
- New Outstanding = ₹4,90,000

The voucher updates this automatically.

---

### 8. General Ledger (GL)

The General Ledger (GL) is the **main accounting book** of the company. Every voucher created in the ERP is stored here. It contains all financial transactions and is used to prepare financial reports.

Think of the GL as the **master database of all accounting entries**.

---

### 9. Financial Statements

Financial statements show the financial health of the company. They are generated using data from the General Ledger.

The three main financial statements are:
- Balance Sheet
- Profit & Loss Statement
- Cash Flow Statement

---

### 10. Balance Sheet

The Balance Sheet shows:
- What the company owns (**Assets**)
- What the company owes (**Liabilities**)
- Owner's investment (**Equity**)

It represents the company's financial position on a particular date.

---

### 11. Profit & Loss Statement (P&L)

The P&L Statement shows:
- Income earned
- Expenses incurred
- Profit or Loss

It tells whether the company made money or lost money during a period.

---

### 12. Cash Flow Statement

The Cash Flow Statement tracks the movement of cash.

It shows:
- Cash received
- Cash paid
- Cash available

It helps understand the company's liquidity.

---

### 13. Trial Balance

A Trial Balance is a report used to verify that accounting entries are balanced.

It compares Total Debits vs Total Credits. If both totals are equal, the books are generally considered balanced.

---

## Business Understanding of Voucher Entry Automation (Steps 1–4)

---

## Step 1: Banks Send Statements

### What happens in the business?

Every bank where the company has an account sends a **Bank Statement** every day.

For example:
- ICICI Bank
- SBI
- HDFC Bank
- Axis Bank

Each statement contains all the transactions that happened in that bank account during the day.

### Example — Daily Transaction Volume

| Statement Type | Transactions |
|----------------|-------------|
| ICICI Statement | 1,000 |
| SBI Statement | 600 |
| Collection Statement | 3,500 |
| Disbursement Statement | 450 |
| Repayment Statement | 1,200 |

A finance company may receive **thousands of transactions every day**.

### Why are these statements important?

The bank statement is the **starting point** of accounting.

It tells the company:
- How much money came in
- How much money went out
- When it happened
- Which bank account was involved

However, the statement **does not explain the business reason** behind each transaction.

For example, a bank statement may show *₹50,000 received* — but it doesn't tell whether it was:
- A customer EMI
- A loan repayment
- Interest income
- A refund
- An internal transfer

The finance team has to identify the purpose before recording it in the ERP.

### How was it done earlier?

Earlier, finance executives manually:

1. Downloaded the bank statement
2. Opened it in Excel
3. Read each transaction description (Narration)
4. Understood why the transaction happened
5. Checked supporting records in the ERP
6. Created the correct accounting voucher
7. Repeated the process for every transaction

When there are **thousands of transactions daily**, this becomes slow, repetitive, and prone to human error.

---

## Step 2: Standardizing Bank Statements

### What is the business challenge?

Every bank provides statement files in a **different format and with different file names**.

Example:
- `Statement_July_Final.xlsx`
- `ICICI_Account_20260712.xls`
- `BankReport_New.csv`

There is no common naming convention.

### Why is standardization important?

Business processes become easier when every file follows the same naming standard. Instead of identifying files manually every day, the organization follows one standard format.

Example:
```
Disbursement_ICICI_348726.xlsx
Collection_SBI_567890.xlsx
Repayment_HDFC_112233.xlsx
```

From the file name itself, anyone can immediately understand:
- Which bank it belongs to
- What type of transaction it contains
- Which account it relates to

This creates consistency across the finance process.

### Business Benefit

Standardized file names:
- Reduce confusion
- Avoid selecting the wrong statement
- Make processes consistent across all banks
- Help downstream accounting processes work uniformly

---

## Step 3: Understanding Internal Fund Transfers

### What is an Internal Fund Transfer?

Sometimes a company transfers money **between its own bank accounts**.

**Example:**
- ICICI Account sends ₹10 Crore to SBI Account
- Both bank accounts belong to the **same company**

### Why does this happen?

Companies maintain multiple bank accounts for different purposes, such as:
- Collections
- Loan disbursements
- Vendor payments
- Salary payments
- Investments

Money is often moved between these accounts for operational reasons.

### Business Meaning

Although money moves from one account to another, **the company has neither earned nor spent money**.

There is:
- No customer payment
- No new loan
- No expense
- No income

Only the location of the money has changed.

### Why is identifying internal transfers important?

If an internal transfer is mistakenly treated as customer income or an expense, the company's financial reports become incorrect.

Therefore, these transactions are identified separately and handled differently from normal business transactions.

---

## Step 4: Understanding Every Transaction (Business Mapping)

### What is the biggest challenge?

A bank statement only contains a short **Narration** or **Description**.

Example narrations:
- `NEFT ABC INDUSTRIES`
- `EMI COLLECTION`
- `LOAN DISB`
- `INT PAID`
- `GST`

These descriptions do not clearly explain the business purpose.

### What is Business Mapping?

Business Mapping is the process of converting a bank transaction into a meaningful business activity.

| Bank Narration | Business Meaning |
|----------------|-----------------|
| EMI COLLECTION | Customer has paid an EMI |
| LOAN DISB | Loan has been disbursed |
| INT PAID | Interest payment |
| GST | Tax-related transaction |

This helps the finance team understand what actually happened.

### What is an Account Master?

The **Account Master** is a reference maintained by the business. It contains:
- Customer accounts
- Vendor accounts
- Bank accounts
- General Ledger (GL) accounts
- Transaction categories

It acts as the company's official reference for identifying transactions correctly.

### What are Keywords?

Over time, businesses observe that certain words appear repeatedly in bank narrations.

Examples: `EMI`, `DISB`, `INTEREST`, `GST`, `REFUND`, `NEFT`

These keywords help identify the type of transaction.

### What are Narration Rules?

Narration Rules are business-defined guidelines that explain how to interpret bank descriptions.

| If narration contains | Treat as |
|-----------------------|---------|
| **EMI** | Customer repayment |
| **DISB** | Loan disbursement |
| **GST** | Tax transaction |
| **INT** | Interest |

These rules ensure that every similar transaction is classified consistently.

### Why is Business Mapping important?

Correct business mapping ensures that:
- Every transaction is understood correctly
- The correct accounting voucher is created
- Financial reports remain accurate
- Regulatory and audit requirements are met
- Business decisions are based on reliable financial data

Without proper mapping, the company may record transactions under the wrong category, leading to incorrect accounting and financial reporting.

### Business Flow Summary (Steps 1–4)

| Step | Activity |
|------|---------|
| 1 | Banks perform transactions |
| 2 | Daily Bank Statements are received |
| 3 | Statements are organized in a standard format |
| 4 | Internal transfers are identified separately |
| 5 | Each bank narration is interpreted using business rules |
| 6 | Every transaction is assigned its correct business purpose |
| 7 | The finance team (or automation) creates accurate accounting vouchers |

---

## Business Understanding (Steps 5–6)

---

## Why is an Account Master Important?

### What is an Account Master?

An **Account Master** is a reference maintained by the finance team that contains details about all the company's bank accounts and their business purpose.

It tells the company **what each bank account is used for**.

### Why is it needed?

A company usually has **multiple bank accounts**, and each account serves a different business function.

| Bank Account | Business Purpose |
|-------------|----------------|
| 12345 | Loan Collection |
| 67890 | Loan Disbursement |
| 54321 | Vendor Payments |
| 98765 | Salary Payments |

Even though all of them are bank accounts, **they cannot be treated the same in accounting**.

### Business Understanding

Imagine two transactions of ₹1,00,000:
- One is received in the **Loan Collection Account**
- Another is paid from the **Loan Disbursement Account**

Both involve the same amount, but they represent **completely different business activities**:
- The first means a customer has repaid money
- The second means the company has given a new loan

Because the business purpose is different, the accounting entry (voucher) will also be different. This is why the Account Master is essential — it helps identify the correct business context for each transaction.

---

## Why is Narration Important?

### What is Narration?

A **Narration** is the description provided by the bank for every transaction. It gives clues about **why the money moved**.

| Bank Narration | Business Meaning |
|----------------|----------------|
| NEFT EMI | Customer EMI Payment |
| IMPS Vendor | Vendor Payment |
| LOAN DISB | Loan Disbursement |
| INT PAID | Interest Payment |

### Why is it important?

The bank only records that money moved — it does not explicitly state the business purpose.

The narration helps the finance team understand:
- Who made the payment?
- Why was the payment made?
- What type of transaction is it?

Without narration, it would be difficult to classify transactions correctly and create the right accounting voucher.

---

## Step 5: Keyword Matching

### What is Keyword Matching?

Many bank narrations contain common words that indicate the type of transaction. The finance team creates a **Keyword Table**, which acts like a business dictionary.

| Keyword | Business Meaning |
|---------|----------------|
| EMI | Loan Repayment |
| INT | Interest |
| GST | Tax Transaction |
| DISB | Loan Disbursement |

### Why is it important?

Whenever a transaction is received, the narration is compared with the Keyword Table. If a matching keyword is found, the business purpose of the transaction can be identified immediately.

For example:
- Narration contains **EMI** → Customer Loan Repayment
- Narration contains **DISB** → Loan Disbursement
- Narration contains **GST** → Tax Payment

This ensures that similar transactions are always classified in the same way.

### Business Benefit

Using a Keyword Table:
- Ensures consistency in transaction classification
- Reduces manual effort for the finance team
- Improves accounting accuracy
- Speeds up voucher creation

Instead of analyzing every narration manually, the business relies on predefined keywords.

---

## Step 6: Handling Unknown Narrations

### What happens when the narration is unknown?

Sometimes a bank transaction contains a description that the business has never seen before.

Example: `ABC XYZ 76543 REF9988`

There are no familiar keywords, so its business purpose cannot be identified.

### Why doesn't the business guess?

Financial accounting must always be accurate. Guessing the purpose of a transaction could result in:
- Incorrect accounting entries
- Wrong customer balances
- Inaccurate financial reports
- Audit and compliance issues

Therefore, unknown transactions are **never classified automatically**.

### What happens instead?

Unknown narrations are placed in an **Unidentified Narration** list for review by the finance team.

The finance team:
1. Examines the transaction
2. Identifies its actual business purpose
3. Adds a new keyword or rule if needed

This helps the system recognize similar transactions correctly in the future.

### Business Understanding

This is a process of **continuous business improvement**.

As new transaction types appear:
- Business knowledge increases
- New keywords are added
- Classification rules become stronger
- Fewer transactions remain unidentified over time

The system becomes more accurate because it learns from the finance team's expertise — not by guessing, but by continuously updating business rules.

### Overall Transaction Identification Flow (Steps 5–6)

| Step | Activity |
|------|---------|
| 1 | Bank transaction received |
| 2 | Bank account identified using Account Master |
| 3 | Transaction narration is read |
| 4 | Narration matched against the Keyword Table |
| 5a | **Known keyword found** → Business purpose identified → Voucher created |
| 5b | **Unknown narration** → Sent to Finance team for review → New keyword added → Future transactions identified automatically |

---

## Business Understanding (Steps 7–10)

---

## Step 7: BOT Working Table (Staging Area)

### What is a BOT Working Table?

Before creating accounting vouchers, the bot stores all processed transactions in a temporary table called the **BOT Working Table**.

Think of it as a **waiting area** where every transaction is kept until it is successfully posted into the ERP.

### What information is stored?

| Field | Description |
|-------|------------|
| Transaction ID | Unique identifier for each transaction |
| GL Code | General Ledger account code |
| Bank Account Number | Source bank account |
| Transaction Type | Type of financial transaction |
| Amount | Transaction value |
| Transaction Date | Date the transaction occurred |
| Reference Number | Bank reference number |
| System Name | Target finance system (Sensai / VeeFin) |
| Processing Status | Current processing status |

### Why is it important?

This table acts as a checkpoint in the business process. Instead of sending transactions directly to the ERP, they are first stored safely.

If there is a system issue, network failure, or ERP crash:
- No transaction is lost
- The bot knows which transactions are already completed
- The bot resumes from the remaining transactions instead of starting from the beginning

### Business Benefit

- Prevents data loss
- Avoids duplicate processing
- Makes the process reliable and recoverable
- Improves audit tracking

---

## Step 8: Routing Transactions to the Correct Finance System

### Why are multiple finance systems used?

Large organizations often have different business units, and each unit may use a different Finance or Loan Management System.

| Bank | Finance System |
|------|--------------|
| ICICI | Sensai |
| SBI | VeeFin |

### Business Understanding

A transaction cannot be posted into just any system. It must be sent to the system responsible for managing that particular business unit or bank account.

For example:
- Transactions related to ICICI accounts are processed in **Sensai**
- Transactions related to SBI accounts are processed in **VeeFin**

This ensures that every business unit maintains its own accurate financial records.

### Business Benefit

Routing transactions correctly:
- Keeps data organized
- Prevents posting into the wrong system
- Ensures each department works with the correct records

---

## Step 9: Voucher Creation

### What happens during Voucher Creation?

Once the transaction has been identified and validated, the accounting voucher is created in the ERP.

The voucher contains:
- GL Account
- Amount
- Bank Account
- Reference Number
- Transaction Date

This is the same work that a finance executive would normally perform manually.

---

## Understanding Contra Entry

### What is a Contra Entry?

A **Contra Entry** records the movement of money between two related accounts within the same accounting transaction.

Every financial transaction affects at least **two accounts**.

**Example:** A customer pays an EMI of ₹50,000.

| Account | Entry | Amount |
|---------|-------|--------|
| Bank Account | Debit | ₹50,000 |
| Customer Loan Account | Credit | ₹50,000 |

Both entries together form **one complete accounting transaction**.

### Why is duplicate posting a problem?

Imagine the same voucher is created twice. Instead of recording the transaction once, the ERP records both entries again.

As a result:
- Customer balances become incorrect
- Bank balances become incorrect
- Financial reports become inaccurate
- Auditors will identify duplicate accounting entries

### How does the business prevent this?

After a voucher is successfully created:
- The transaction is marked as **completed or closed** in the BOT Working Table
- The bot ignores completed transactions during future runs

This ensures that the same transaction is never posted twice.

### Business Goal

The objective is to maintain:
- Accurate accounting records
- No duplicate vouchers
- Reliable financial reporting
- Compliance with accounting standards

---

## Step 10: MIS (Management Information System) Report

### What is an MIS Report?

An **MIS (Management Information System) Report** is a summary report generated after all transactions have been processed. It provides management with an overview of the day's processing.

### What does the report include?

| Field | Description |
|-------|------------|
| Total transactions processed | All transactions received and handled |
| Number of vouchers created | Successfully posted accounting entries |
| Successful transactions | Transactions completed without issues |
| Failed transactions | Transactions that could not be processed |
| Pending transactions | Transactions still awaiting action |
| Unknown narrations | Narrations requiring manual review |
| Finance system used | Sensai or VeeFin |
| Processing status | Overall status for the day |

### Why is an MIS Report important?

Management does not review every individual transaction. Instead, they use the MIS report to understand:
- Whether all transactions were processed successfully
- If any transactions require manual attention
- Whether there were system failures
- Overall operational performance for the day

### Business Benefit

An MIS Report helps:
- Monitor daily operations
- Track automation performance
- Identify processing issues quickly
- Support audits and compliance
- Improve business decision-making

---

## Business Departments Involved

Different departments work together to complete the Voucher Entry process.

| Department | Responsibility |
|-----------|--------------|
| **Treasury** | Manages the company's bank accounts, cash flow, and movement of funds between banks |
| **Finance** | Ensures all financial transactions are recorded accurately and prepares financial reports |
| **Accounts** | Creates and verifies accounting vouchers and maintains the General Ledger (GL) |
| **Operations** | Reviews bank statements, validates transactions, and resolves operational issues |
| **IT** | Maintains ERP systems, databases, and technical infrastructure used for finance operations |
| **RPA Team** | Develops, manages, and monitors automation bots that perform voucher processing |
| **Audit** | Verifies that transactions follow company policies, accounting standards, and regulatory requirements |
| **Management** | Reviews MIS reports, monitors business performance, and makes strategic decisions |

---

## Overall Business Flow (Steps 1–10)

| Step | Activity |
|------|---------|
| 1 | Bank Statements received |
| 2 | Statements standardized to a common format |
| 3 | Internal fund transfers identified separately |
| 4 | Each transaction narration interpreted using business rules |
| 5 | Keywords matched to identify business purpose |
| 6 | Unknown narrations sent for manual review and keyword update |
| 7 | All transactions stored in the BOT Working Table |
| 8 | Transactions routed to the correct Finance System (Sensai / VeeFin) |
| 9 | Accounting vouchers created in ERP; duplicates prevented via contra entry control |
| 10 | MIS Report generated and reviewed by management |

---

## Final Business Understanding

The Voucher Entry process is not just about recording transactions — it is about ensuring that every movement of money is **correctly identified, accurately recorded, safely processed, and properly reported**.

By using a BOT Working Table, routing transactions to the correct finance system, preventing duplicate voucher creation through contra entry control, and generating MIS reports, the organization maintains **accurate financial records, operational efficiency, and regulatory compliance**.
