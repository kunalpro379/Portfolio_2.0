# LAS Unpledge — How Pledged Shares Get Released

## What is Unpledging?

When a customer takes a **Loan Against Securities (LAS)**, they pledge their shares as security to the NBFC instead of selling them.

**Example:**
- Shares Value = ₹20 lakh
- Loan Taken = ₹10 lakh

The customer still owns the shares, but they are **locked** and cannot be sold until the loan conditions are met.

**Unpledging** means releasing some or all of those pledged shares after the customer repays part of the loan.

**Example:**
- Loan Taken = ₹10 lakh
- Shares Pledged = ₹20 lakh
- Customer repays = ₹4 lakh
- Outstanding Loan = ₹6 lakh

Since the remaining loan is lower, the NBFC may release some shares while keeping enough security for the balance loan.

---

## Why is Unpledging Allowed?

Before releasing shares, the business checks one important question:

> "Will the remaining pledged shares still provide enough security for the outstanding loan?"

**Example 1 — Approved:**
- Outstanding Loan = ₹6 lakh
- Security After Release = ₹12 lakh

The security is still sufficient, so the business approves the unpledge.

**Example 2 — Rejected:**
- Outstanding Loan = ₹8 lakh
- Security After Release = ₹5 lakh

The security is not enough, so the business rejects the unpledge request.

This risk check is the main business logic behind the entire unpledging process.

---

## Stakeholders Involved

The unpledging process involves multiple parties working together:

| Stakeholder | Role |
|-------------|------|
| **Customer** | Requests the release of pledged shares |
| **Relationship Manager (RM) / DSA** | Sends the unpledge request to the operations team |
| **Operations Team** | Reviews and initiates the process |
| **BOT** | Validates the request and performs required system actions |
| **50Fin** | Manages pledge and unpledge of securities |
| **Epic LMS** | Stores loan details such as outstanding balance and loan status |

Together, these stakeholders ensure that shares are released only when the loan remains adequately secured.

---

## How the Process Starts

The unpledging process begins when the customer requests the release of pledged shares after repaying part of the loan.

> "I have repaid a part of my loan. Please release some of my pledged shares."

The **Relationship Manager (RM) or DSA** sends an email containing:
- Loan Account Number (LAN)
- Customer details
- Shares to be released

This email acts as the **trigger** for the automation process.

---

## What is a LAN?

**LAN (Loan Account Number)** is a unique number assigned to every loan.

Using the LAN, the BOT can identify:
- Customer details
- Loan information
- Outstanding balance
- Portfolio
- Pledged securities

**Example:** `LAN0012456`

The LAN is the key reference used throughout the entire unpledging process.

---

## Key Calculations

Before approving or rejecting an unpledge request, the BOT performs a series of calculations using data from two systems — **50Fin** (pledge details) and **Epic LMS** (loan details).

### Current Limit

The **Current Limit** is the total current market value of all pledged securities protecting the loan.

**Example:**

| Security | Value |
|----------|-------|
| Reliance | ₹5 lakh |
| TCS | ₹3 lakh |
| Infosys | ₹4 lakh |
| **Total Current Limit** | **₹12 lakh** |

This value represents the customer's total collateral at the time of the request.

### Released Current Limit

The **Released Current Limit** is the market value of the shares the customer wants to unpledge.

**Example:**
- Customer requests to release TCS shares worth ₹3 lakh
- Released Current Limit = **₹3 lakh**

### After Release Current Limit (ARCL)

The **ARCL** is the value of pledged securities that will remain after releasing the requested shares.

**Formula:**

```
ARCL = Current Limit − Released Current Limit
```

**Example:**
- Current Limit = ₹12 lakh
- Released Current Limit = ₹3 lakh
- **ARCL = ₹9 lakh**

This is the security that will continue to protect the loan after unpledging.

### Difference Calculation

This is the most important business calculation in the unpledging process.

**Formula:**

```
Difference = ARCL − Outstanding Loan
```

**Example 1 — Positive (Approved):**
- Outstanding Loan = ₹6 lakh
- ARCL = ₹9 lakh
- **Difference = +₹3 lakh**

Since enough security remains, the unpledge request can be approved.

**Example 2 — Negative (Rejected):**
- Outstanding Loan = ₹10 lakh
- ARCL = ₹8 lakh
- **Difference = −₹2 lakh**

The remaining security is not enough, so the request is rejected.

---

## Why a Positive Difference Matters

A positive difference means the value of the remaining pledged shares is **greater than the outstanding loan**, keeping the NBFC financially protected.

**Safe scenario:**
- Remaining Security = ₹9 lakh
- Outstanding Loan = ₹6 lakh
- If the customer defaults, the NBFC can fully recover by selling the pledged shares.

**Risky scenario:**
- Remaining Security = ₹5 lakh
- Outstanding Loan = ₹10 lakh
- The NBFC could face a **loss of ₹5 lakh**.

For this reason, unpledging is approved only when sufficient security remains after the shares are released.

---

## Business Exception

If the difference is zero or negative:

```
Difference ≤ 0
```

The BOT marks the request as a **Business Exception** and stops the process.

**Reason:** Releasing the shares would leave the loan under-secured, creating a direct financial risk for the NBFC.

---

## Complete Process — Step by Step

| Step | Activity |
|------|---------|
| 1 | Customer repays part of the loan and requests release of shares |
| 2 | RM/DSA sends an email with the LAN, customer details, and shares to be released |
| 3 | BOT reads the email, extracts required details, and stores them in the LAS Automation Database |
| 4 | BOT fetches pledged securities and current market value from **50Fin** using the LAN |
| 5 | BOT fetches outstanding loan amount and loan status from **Epic LMS** |
| 6 | BOT calculates Current Limit, Released Current Limit, ARCL, and Difference |
| 7 | **If Difference > 0** → proceed to unpledge in 50Fin |
| 8 | **If Difference ≤ 0** → mark as Business Exception and stop the process |
| 9 | BOT logs into 50Fin using Maker credentials, selects the requested securities, and initiates the Unpledge action |
| 10 | Maker transaction is created and moves to the approval workflow |
| 11 | BOT updates the process status in the database |
| 12 | BOT generates a summary report and emails it to relevant stakeholders |
| 13 | All reports and supporting files are stored in a structured folder using the LAN and transaction date for audit |

---

## Unpledging in 50Fin

If all business validations are successful, the BOT logs into **50Fin** using **Maker** credentials and:

1. Searches the customer using the LAN
2. Opens the customer's pledge details
3. Selects the requested securities
4. Initiates the **Unpledge** action
5. Submits the request

This creates the **Maker transaction**, which moves to the organization's approval workflow for further processing.

---

## Status Reporting

Once the process is completed, the BOT prepares a summary report containing:
- Successful unpledge requests
- Failed transactions
- Business exception cases

The BOT then:
- Sends the report to the relevant stakeholders via email
- Stores all reports and supporting files in a structured folder using the **LAN** and **transaction date** for easy tracking and audit

---

## Business Objective

The unpledge process is designed to ensure that securities are released only when the customer's loan remains adequately secured.

Its key objectives are:

- Release only the **excess collateral** after the customer's outstanding loan decreases
- Protect the NBFC from **credit risk** by ensuring sufficient security always remains
- Prevent **over-release** of pledged securities that could lead to financial loss
- Keep customer, loan, and pledge information **synchronized** between 50Fin and Epic LMS
- Maintain a complete **audit trail** through automated validations, exception handling, status reporting, and document storage
