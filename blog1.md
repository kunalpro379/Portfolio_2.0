# LAS Pledge & Unpledge

## What is LAS (Loan Against Securities)?

Suppose you own shares, mutual funds, or bonds worth ₹20 lakh, but you need ₹10 lakh urgently.

Instead of selling your investments, you can **pledge them as collateral** to a bank or NBFC. The lender keeps these securities as security and gives you a loan based on their value. This is called **Loan Against Securities (LAS)**.

| Loan Type | Security |
|-----------|----------|
| Home Loan | House |
| Gold Loan | Gold |
| Vehicle Loan | Vehicle |
| **LAS** | **Shares, Mutual Funds, Bonds, and other securities** |

The biggest advantage is that you **continue to own your investments** while getting the required funds. Once the loan is repaid, your securities are unpledged and returned to you.

---

## Why is Pledging Required?

When a customer applies for LAS, the bank cannot simply trust that the customer will keep the shares as security — the customer could sell the shares after receiving the loan.

To avoid this, the bank locks the customer's securities through a process called **Pledging**.

**Before Pledge:**
- The customer owns the shares and can sell them at any time.

**After Pledge:**
- The customer still owns the shares, but they are **locked by the depository (NSDL/CDSL)**.
- The customer **cannot sell or transfer** the pledged securities.
- The bank gets a **legal right** over the securities until the loan is repaid.
- Once the customer repays the loan, the securities are **unpledged** and become freely tradable again.

---

## Main Business Players in the LAS Pledge Process

### 1. Customer
The customer needs a loan and offers eligible securities (shares, mutual funds, etc.) as collateral. They submit the loan request along with the required documents.

### 2. DSA / RM (Direct Selling Agent / Relationship Manager)
The DSA/RM acts as the link between the customer and the bank. They collect all required documents — PAN, loan request, agreement details, PMR, and CML — and send them to the Operations Team.

### 3. Operations Team
The Operations Team verifies that all required documents and information have been received. If anything is missing, they request it from the DSA/RM. Once everything is complete, they initiate the pledge process.

### 4. Maker
The Maker creates the pledge transaction in the system (e.g., 50Fin). They enter and prepare all transaction details but **cannot approve** the transaction.

### 5. Checker
The Checker reviews the transaction created by the Maker. They verify all details, check for errors, and ensure the information is accurate before it moves forward.

### 6. Approver
The Approver is the final authority in the workflow. After confirming that all details are correct, they **approve the transaction**, making the pledge officially valid.

### 7. Depository (NSDL/CDSL)
After approval, the pledge request is sent to the depository (NSDL or CDSL). The depository **locks the customer's securities**, preventing them from being sold or transferred until the loan is repaid. This completes the pledge process.

---

## Example: LAS Pledge Process End-to-End

> Rahul owns 200 Reliance shares worth ₹20 lakh and needs a loan of ₹10 lakh.

### Step 1 — Customer Requests a Loan
Rahul contacts the Relationship Manager (RM) and requests a Loan Against Securities by offering his shares as collateral.

### Step 2 — RM Prepares the Loan Request
The RM collects the required documents and creates a unique **Agreement Number** (e.g., `AGR12345`), which serves as the unique identifier for the loan application.

### Step 3 — RM Sends Request to Operations
The RM emails the Operations Team with all the necessary details:

- Agreement Number
- Customer Name
- PMR
- CML
- Customer details and supporting documents

This email acts as the **starting point (trigger)** for the LAS pledge process.

### Step 4 — Bot Processes the Request
The automation bot monitors the mailbox, detects the new loan request email, and extracts the required information. It then:

- Creates a new **Case ID**
- Sets the **Status = New**
- Stores all details in the database

From this point onward, the Operations Team can track and process the loan request until the pledge is completed.

---

## Key Documents

### PMR (Pledge Master Report)

The PMR is a document that contains the **complete details of the securities** the customer wants to pledge. It acts as the official list of securities that will be locked as collateral.

Without the PMR, the bank cannot determine:
- Which securities the customer wants to pledge
- How many units/shares are being pledged
- Whether those securities are eligible for LAS

**Information Available in PMR:**

| Field | Description |
|-------|-------------|
| ISIN | Unique identification number of each security |
| Security Name | Name of the share, mutual fund, or bond |
| Quantity | Number of units/shares to be pledged |
| Pledge Status | Current status of the pledge |
| Sequence Number | Serial number to uniquely identify each entry |

**Example:**

| Security | ISIN | Quantity |
|----------|------|----------|
| Reliance Industries | INE002A01018 | 100 |

---

### ISIN (International Securities Identification Number)

ISIN is a **globally unique 12-character code** assigned to every financial security — shares, mutual funds, bonds, ETFs.

> Just as every person has a unique Aadhaar number, every security has a unique ISIN.

**Examples:**

| Security | ISIN |
|----------|------|
| Reliance Industries | INE002A01018 |
| TCS | Different ISIN |
| Infosys | Another unique ISIN |

Banks and depositories use the ISIN — not just the company name — because company names can change or be similar, whereas the ISIN **always uniquely identifies** the security.

---

### CML (Client Master List)

The CML is a document that contains the customer's **Demat account and identity details**. It is used by the bank to verify that the securities actually belong to the customer and are held in the correct Demat account.

> Think of it as the customer's identity and Demat profile.

**Information Available in CML:**

| Field | Description |
|-------|-------------|
| Client ID | Unique number identifying the customer's Demat account |
| DP ID | Identifies the broker/bank where the Demat account is maintained |
| PAN Number | Used for customer identity verification |
| Customer Name | Name of the account holder |
| Address | Registered communication address |
| Mobile Number | Registered contact number |
| Demat Account Details | Details of the account holding the securities |

**Business Purpose of CML:**
- Verify the customer's identity
- Verify ownership of the Demat account
- Ensure the pledged securities belong to the correct customer
- Match customer details with the loan application

If the CML is missing, the Operations Team requests it from the RM. The LAS pledge process **cannot continue** until the CML is received and verified.

---

## Customer Validation

Before processing the pledge, the bank must ensure that all customer details **match exactly** across documents. This is called **CML Validation**.

The following are matched across the Loan Request Email, PMR, CML, and Customer Portfolio:

- Customer Name
- PAN Number
- Demat Account Details
- Securities
- Quantity of Securities

### Example — Name Mismatch

| Document | Name |
|----------|------|
| Loan Request Email | Kunal Deepak Patil |
| CML | Kunal D. Patil |

Even a small mismatch is flagged. The bot marks it as a **Business Exception** because pledging the wrong person's securities is a major operational and compliance risk.

**If all details match** → the process continues.  
**If any detail does not match** → the case moves to the **Exception Queue** for manual verification.

---

### Existing Customer
If the customer already has an LAS account, there is no need to create a new profile. The bot retrieves the existing customer record from **50Fin** and continues.

### New Customer
If the customer is applying for LAS for the first time, the bot creates a **Customer Profile in 50Fin** using the verified details from the CML.

> **Note:** At this stage, only the customer profile is created. The **Loan Account (LAN)** is generated later, after the loan is sanctioned and disbursed.

---

## Bulk Upload

In a real banking environment, hundreds of customers may apply for LAS on the same day. Creating each pledge manually would be time-consuming and error-prone.

Instead, the bot prepares a standardized **Excel Bulk Upload file** containing all validated pledge requests and uploads them to the system in one go.

**Business Benefits:**
- Faster processing of multiple requests
- Reduces manual effort
- Standardized data format
- Minimizes human errors
- Automatically excludes invalid or duplicate records before upload

---

## Why is 50Fin Used?

**50Fin** is the **Loan Management System (LMS)** used by the bank to manage the complete LAS process.

It stores and manages:
- Customer details
- Loan information
- Securities portfolio
- Pledge transactions
- Portfolio details
- Case and pledge status

After validating all documents, the Maker logs into 50Fin and uploads the bulk file to initiate the pledge process.

---

## What Happens After the Bulk Upload?

Once the bulk file is uploaded in 50Fin, the system sends the pledge request to the Depository (NSDL/CDSL). The depository verifies the request and **locks the customer's securities**.

**Pledge Request Statuses:**

| Status | Description |
|--------|-------------|
| Initiated | Request has been submitted |
| Confirmed | Securities have been successfully pledged |
| Pending | Waiting for processing or customer/depository action |
| Failed | Pledge could not be completed due to validation or processing issues |

These statuses help the Operations Team track the progress of every pledge request.

---

## Final Report

After all requests are processed, the bot automatically generates a **Final Report** for the Operations Team and Management.

**The report provides a summary of:**

| Metric | Description |
|--------|-------------|
| Total requests received | All pledge requests for the day |
| Successfully processed | Requests completed without issues |
| Failed requests | Requests that could not be completed |
| Pending requests | Requests still awaiting action |

**It also identifies:**
- Cases requiring rework
- Requests failed due to missing documents (e.g., CML not received)
- Cases waiting for customer or business inputs

This report helps the bank **monitor daily operations**, quickly resolve exceptions, and ensure smooth processing of all LAS pledge requests.
