# Reverse Factoring — Disbursement Reconciliation & Entry

## What is Reverse Factoring?

Imagine three parties involved in a transaction:

| Party | Role |
|-------|------|
| **Supplier** | Sells goods |
| **Buyer (Large Company)** | Purchases the goods |
| **NBFC / Bank** | Provides early payment to the supplier |

### Example

- **Buyer:** Reliance
- **Supplier:** ABC Steel
- **NBFC:** Jio Finance

ABC Steel supplies steel worth ₹10,00,000 to Reliance with a **90-day payment term** — meaning Reliance will pay the invoice after 90 days.

However, ABC Steel needs money immediately instead of waiting 90 days. So the supplier approaches the NBFC.

The NBFC verifies the approved invoice and **pays the supplier immediately**. After 90 days, Reliance pays the same amount back to the NBFC.

```
Supplier → Supplies Goods → Buyer
                                ↓
                    NBFC Pays Supplier Immediately
                                ↓
                    Buyer Pays NBFC on Due Date
```

### Why Reverse Factoring?

- **Supplier** receives cash immediately.
- **Buyer** continues to enjoy the agreed credit period.
- **NBFC** earns revenue through financing charges or fees.

This arrangement is called **Reverse Factoring (Supply Chain Finance)** because the financing is based on the **buyer's creditworthiness** rather than the supplier's.

---

## What is Disbursement?

**Disbursement** means transferring money to the supplier.

### Example

A supplier raises an invoice of ₹5,00,000. After the invoice is approved, the NBFC transfers ₹5,00,000 to the supplier's bank account. This payment is called a **Disbursement**.

Every day, an NBFC processes payments for hundreds or thousands of suppliers — the total amount disbursed can run into crores of rupees.

But after making these payments, one important question remains:

> **Did every supplier actually receive the money?**

Sometimes payments can fail due to:

- Wrong bank account details
- Insufficient funds
- Technical or banking issues
- Duplicate payments
- Incorrect payment amount
- Failed or bounced transactions

If these issues are not identified in time, they can lead to financial losses, customer complaints, and reconciliation problems. That's why every disbursement must be **reconciled**.

---

## What is Reconciliation?

**Reconciliation** is the process of comparing two independent records to ensure they match.

### Example

The company's ERP records show that ₹10,00,000 has been paid to a supplier. This is compared with the bank statement to check whether the money was actually transferred.

- **If both records match** → Payment is successful.
- **If they don't match** → The transaction needs investigation.

For example, the ERP shows Supplier A has been paid ₹5,00,000, but the bank statement shows no debit for that payment. This means the money was never transferred, even though the ERP marked it as paid.

> **In simple terms:** Reconciliation = Internal Business Records (ERP) vs Bank Statement Comparison

Its main purpose is to ensure that every payment recorded by the business has actually been processed by the bank.

---

## Files Used in the Process

The reconciliation process begins with the bot downloading three important files. Each file serves a different purpose in verifying disbursement transactions.

### 1. Old Loan Report

Contains details of previously disbursed or migrated loans that already exist in the system.

| Loan ID | Amount |
|---------|--------|
| 1001 | ₹5,00,000 |
| 1002 | ₹7,00,000 |

This report helps the business identify loans that have already been processed.

### 2. New Loan Report

Contains today's newly disbursed loans that need to be reconciled.

| Loan ID | Amount |
|---------|--------|
| 2001 | ₹10,00,000 |
| 2002 | ₹15,00,000 |

These are the latest payments made to suppliers on the current business day.

### 3. Bank Statement

The actual bank statement (e.g., SBI) showing all transactions processed by the bank. It is considered the **source of truth** because it confirms whether money was actually transferred.

| Transaction | Amount | Beneficiary |
|-------------|--------|-------------|
| Debit | ₹5,00,000 | Supplier A |
| Debit | ₹15,00,000 | Supplier B |
| Debit | ₹7,00,000 | Supplier C |

### Why Are These Files Needed?

Suppose the New Loan Report says Loan ID 2001 was disbursed for ₹10,00,000. The bot then checks the Bank Statement to verify whether a ₹10,00,000 debit actually took place.

- **Amount found in bank statement** → Payment is successful.
- **Amount not found** → Payment requires investigation.

---

## Why Does the Bot Download Files from Email?

Every business day, the Operations or Finance team receives the Old Loan Report, New Loan Report, and Bank Statement through email.

### Example

> **Subject:** Reverse Factoring Daily Reports – 12 July 2026
>
> **Attachments:**
> - Old Loan Report.xlsx
> - New Loan Report.xlsx
> - SBI Bank Statement.xlsx

The bot automatically:
1. Identifies the correct email
2. Downloads all required attachments
3. Saves them in the designated project folder
4. Starts the reconciliation process

---

## Total Disbursement Calculation

Once the required files are downloaded, the bot calculates the **total amount that should have been disbursed** on that day by adding values from both reports.

| Report | Amount |
|--------|--------|
| Old Loan Report | ₹25 Crore |
| New Loan Report | ₹15 Crore |
| **Expected Total Disbursement** | **₹40 Crore** |

### What is Expected Disbursement?

**Expected Disbursement** is the total amount the NBFC believes it has paid, based on its internal business records (loan reports).

The Finance team uses this figure as a **benchmark** to verify whether the bank has actually processed all the payments.

---

## Reading the SBI Bank Statement

After calculating the expected amount, the bot reads the SBI Bank Statement and identifies all **debit transactions** related to supplier payments.

### What is a Debit Transaction?

A **Debit** means money has gone out of the NBFC's bank account — for example, when the NBFC transfers money to a supplier.

### What is ACH?

**ACH (Automated Clearing House)** is an electronic payment system used to transfer money securely between bank accounts without manual intervention. In simple terms, ACH is the banking network that processes these electronic payments.

| Bank Transaction | Amount |
|-----------------|--------|
| Debit | ₹10,00,000 |
| Debit | ₹5,00,000 |
| Debit | ₹25,00,000 |
| **Total Bank Debit** | **₹40 Crore** |

After reading the bank statement, the bot now has the **Actual Disbursement Amount** — the amount truly transferred by the bank.

---

## Amount Reconciliation

This is the most important step in the entire reconciliation process. The bot compares:

**Expected Disbursement (Business Records)** vs **Actual Disbursement (Bank Statement)**

### Example 1 — Everything Matches

| Source | Amount |
|--------|--------|
| Expected Disbursement | ₹40 Crore |
| Actual Bank Debit | ₹40 Crore |

Both amounts are the same. This means:
- All supplier payments were successfully processed.
- No payment is missing.
- **Reconciliation is successful.**

### Example 2 — Mismatch Found

| Source | Amount |
|--------|--------|
| Expected Disbursement | ₹40 Crore |
| Actual Bank Debit | ₹39 Crore |

There is a **difference of ₹1 Crore**. This immediately alerts the Finance team. Possible reasons include:

- One or more payments failed
- A transaction is still pending
- The bank rejected a payment
- An incorrect amount was transferred
- A technical issue during processing

The process then moves to the **investigation stage**, where missing transactions are identified and corrected.

### Why is Amount Reconciliation Important?

Amount reconciliation ensures that:
- Every supplier payment has actually left the bank account
- The bank statement matches the company's internal records
- Financial records remain accurate
- Payment failures are identified before they create accounting or customer issues

> **In simple terms:** Amount Reconciliation = Verifying that the money the business intended to pay is exactly the money the bank actually paid.

---

## Bounce Identification

After comparing total amounts, the bot verifies each individual payment to determine whether it was successful or failed. A failed payment is known as a **Bounce**.

### What is a Bounce?

A **Bounce** occurs when the bank is unable to transfer money to the supplier's account. Although the NBFC intended to make the payment, the transaction could not be completed.

### Example

The business records show:

| Supplier | Expected Payment |
|----------|-----------------|
| Supplier A | ₹5,00,000 |

However, the bank returns the transaction with a **Failed** status. Possible reasons:

- Incorrect bank account number
- Wrong IFSC code
- Closed or inactive bank account
- Frozen bank account
- Payment rejected by the bank
- Technical issue during processing

In this case, the ₹5,00,000 payment is marked as a **Bounce**.

### How the Bot Classifies Transactions

| Transaction Status | Meaning |
|-------------------|---------|
| **Matched** | Payment was successfully processed by the bank and matches business records |
| **Bounced** | Payment failed and was not credited to the supplier's account |

### Why is Bounce Identification Important?

Identifying bounced transactions helps the Finance team:
- Quickly identify failed supplier payments
- Reprocess payments after correcting bank details
- Prevent suppliers from facing payment delays
- Maintain accurate financial records

---

## Bounce Report Generation

Failed payments cannot be ignored — the supplier has not received the money. After identifying all bounced transactions, the bot automatically prepares a **Bounce Report**.

The report contains:

| Supplier | Amount | Reason | Status |
|----------|--------|--------|--------|
| ABC Steel | ₹5,00,000 | Account Closed | Bounced |
| XYZ Metals | ₹8,00,000 | Invalid IFSC | Bounced |
| PQR Industries | ₹12,00,000 | Beneficiary Account Frozen | Bounced |

The bot then **automatically emails this report** to the Operations/Finance team. The team reviews it, corrects bank details if required, and reprocesses the failed payments.

> **Without this report**, the business would not know which suppliers did not receive their payments.

---

## Reconciled Records

After reconciliation is complete, the bot separates successful and failed transactions. Only the **successfully reconciled** payments are carried forward for the next stage. All bounced transactions are excluded until corrected and reprocessed.

| Supplier | Amount | Status |
|----------|--------|--------|
| ABC Steel | ₹5,00,000 | ❌ Bounced |
| XYZ Metals | ₹8,00,000 | ✅ Reconciled |
| PQR Industries | ₹12,00,000 | ✅ Reconciled |

### Why Only Reconciled Records?

The business system should contain only **genuine and successfully completed disbursements**. If failed payments were also marked as successful, it would create incorrect financial records and inaccurate loan data.

---

## Upload File Preparation

Once the bot has the list of successfully reconciled transactions, it prepares an **Upload File** for the Loan Management System (VeeFin).

### What is VeeFin?

**VeeFin** is the **Loan Management System (LMS)** used by the NBFC to manage loans after they are disbursed. It stores:

- Loan details and supplier information
- Disbursement status
- Outstanding loan balance
- Repayment schedules and history
- Current loan status

> Think of VeeFin as the **central system where all loan records are maintained and tracked**.

### Why is the Upload File Needed?

The bank has already transferred the money to the suppliers. Now the Loan Management System must also be updated to reflect that these payments are complete — otherwise there will be a mismatch.

| System | Status |
|--------|--------|
| SBI Bank | ✅ Payment Completed |
| VeeFin LMS | ❌ Payment Pending |

To avoid this inconsistency, the bot prepares an upload file containing only reconciled (successful) transactions.

### Example Upload File

| Loan ID | Supplier | Disbursed Amount | Status |
|---------|----------|-----------------|--------|
| 2001 | XYZ Metals | ₹8,00,000 | Disbursed |
| 2002 | PQR Industries | ₹12,00,000 | Disbursed |

This file is uploaded into VeeFin, ensuring the Loan Management System matches the bank records.

> **In simple terms**, the upload file tells the Loan Management System: *"These payments have been successfully made by the bank. Please update these loans as disbursed."*

---

## Maker Upload into VeeFin

Once reconciliation is complete, the bot logs into VeeFin using **Maker credentials** and uploads:

- Old Migration File
- New Migration File

### What is a Maker?

In banking and NBFCs, many activities follow the **Maker–Checker principle**:

| Role | Responsibility |
|------|---------------|
| **Maker** | Creates or uploads the transaction |
| **Checker** | Reviews and approves the transaction before it becomes final |

This dual approval process helps **prevent errors and fraud**.

### Before vs After Upload

**Before Upload:**

| Loan ID | Status |
|---------|--------|
| 2001 | Pending |
| 2002 | Pending |

**After Upload:**

| Loan ID | Status |
|---------|--------|
| 2001 | Disbursed |
| 2002 | Disbursed |

Once the upload is complete, the bot verifies that every record has been successfully posted in VeeFin, ensuring the Loan Management System accurately reflects the payments already made by the bank.

---

## Charges Calculation

Apart from financing suppliers, the NBFC also calculates various **service charges and statutory charges** associated with each disbursement. These are calculated only for successfully reconciled invoices.

### 1. Exchange Fee

Fee charged for processing transactions through the exchange platform.

- Exchange Fee = ₹0.25 per invoice
- GST is charged on this fee

### 2. CERSAI Charges

**CERSAI** (Central Registry of Securitisation Asset Reconstruction and Security Interest) is a government registry in India where lenders register security interests created against loans.

Charges depend on the invoice amount:

| Invoice Amount | CERSAI Charge |
|----------------|--------------|
| Below ₹5,00,000 | ₹10 + GST |
| ₹5,00,000 or above | ₹100 + GST |

**Example:**

| Invoice Amount | CERSAI Charge |
|----------------|--------------|
| ₹4,00,000 | ₹10 + GST |
| ₹8,50,000 | ₹100 + GST |

The bot automatically calculates these charges for every reconciled transaction, ensuring accurate accounting and compliance.

---

## Report Generation

After all calculations are complete, the bot prepares financial reports for the Finance team. One of the most important is the **Monthly Fee Report**.

### Example Monthly Fee Report

| Description | Value |
|-------------|-------|
| Total Invoices Processed | 25,000 |
| Exchange Charges | ₹6,250 |
| GST | ₹1,125 |
| **Total Charges** | **₹7,375** |

These reports help the Finance team:
- Record revenue correctly
- Calculate GST
- Perform accounting entries
- Prepare customer billing and management reports

Since the bot generates these reports automatically, manual calculations and reporting errors are significantly reduced.
