# Plesk Email Account Generator

Production-ready Node.js CLI tool for automated bulk creation and deletion of student email accounts in Plesk from CSV data.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [CSV Format](#csv-format)
- [Usage](#usage)
  - [Create Mode](#create-mode)
  - [Delete Mode](#delete-mode)
- [Email Generation Rules](#email-generation-rules)
- [Security Features](#security-features)
- [Logging and Reports](#logging-and-reports)
- [Troubleshooting](#troubleshooting)
- [Additional Documentation](#additional-documentation)
- [License](#license)

## Features

- **Dual Operation Modes** - Create or Delete email accounts
- **Automated Bulk Email Creation** - Process hundreds of student accounts in minutes
- **Automated Bulk Email Deletion** - Delete emails by Faculty Code and graduation date
- **CSV-Based Input** - Simple CSV format for student data with registration date and graduation calculation
- **Validation** - Comprehensive input validation with detailed error messages
- **Duplicate Detection** - Automatically identifies duplicate email addresses
- **Logging & Reporting** - Detailed success/error logs and JSON reports
- **Progress Tracking** - Real-time progress updates during processing
- **Error Handling** - Robust error handling with meaningful error messages
- **Flexible Quota Management** - Degree-based mailbox quota assignment (B:5MB, M:15MB, P:20MB)
- **Built-in Security** - Automatic antivirus and antispam activation
- **Production Ready** - Used in live production environments

## Requirements

- Node.js v14.0.0 or higher
- Linux server with Plesk installed (for production use)
- CLI access via SSH (for production use)
- Ability to execute plesk bin mail commands
- Domain student.alepuniv.edu.sy must exist in Plesk

## Quick Start

```bash
# Quick install and run
npm install
npm start
# Follow the prompts to choose Create or Delete mode
```

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                      (CLI with prompts)                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │      prompts.js          │
              │  Collect inputs from     │
              │  user & mode selection   │
              └────────────┬─────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    [CREATE MODE]                   [DELETE MODE]
           │                               │
           ▼                               │
┌─────────────────────┐                   │
│   csv-parser.js     │                   │
│ Parse & validate    │                   │
│ CSV files           │                   │
└──────────┬──────────┘                   │
           │                               │
           ▼                               │
┌─────────────────────┐                   │
│ email-generator.js  │                   │
│ Generate emails &   │                   │
│ passwords           │                   │
└──────────┬──────────┘                   │
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │   plesk-client.js        │
              │  Create/Delete mailboxes │
              │  in Plesk                │
              │  + Enable Security       │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │      logger.js           │
              │   Log results &          │
              │   generate reports       │
              └──────────────────────────┘
```

### Module Responsibilities

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| **prompts.js** | User interaction | Mode selection, input collection, validation |
| **csv-parser.js** | Data processing | CSV parsing, field validation, graduation calculation |
| **email-generator.js** | Email creation | Email/password generation, quota assignment |
| **plesk-client.js** | Plesk integration | Mailbox creation/deletion, security configuration |
| **logger.js** | Reporting | Success/error logging, JSON reports, statistics |

### Project Structure

```
plesk-email-generator/
│
├── src/                          📁 Source code
│   ├── index.js                  🚀 Main entry point & orchestration
│   ├── prompts.js                💬 User input & mode selection
│   ├── csv-parser.js             📊 CSV processing & validation
│   ├── email-generator.js        📧 Email & password generation
│   ├── plesk-client.js           🔧 Plesk CLI commands & integration
│   └── logger.js                 📝 Logging & statistics
│
├── logs/                         📁 Generated logs (runtime)
│   ├── success.log               ✅ Successful operations
│   ├── error.log                 ❌ Failed operations
│   └── report.json               📊 Summary statistics
│
├── examples/                     📁 Example files
│   └── sample.csv                📄 CSV format example
│
├── package.json                  ⚙️ Dependencies & scripts
├── README.md                     📖 This documentation
├── CHANGELOG.md                  📋 Version history
├── MIGRATION.md                  🔄 Upgrade guide
├── QUICK_REFERENCE.md            🎯 Quick commands
└── LICENSE                       📜 MIT License
```

## Installation

### Server Installation

```bash
# SSH into your Plesk server
ssh user@your-server.com

# Clone or upload the project
git clone https://github.com/Abdo-ka/plesk_email_generator.git
cd plesk-email-generator

# Install dependencies
npm install

# Make script executable
chmod +x src/index.js

# Run the script
npm start
```

## CSV Format

Your CSV file must contain the following columns:

| Column Name          | Description                      | Example          | Required |
|---------------------|----------------------------------|------------------|----------|
| full_name           | Student's full name              | John Doe         | Yes      |
| degree              | Degree code (B/M/P)              | B                | Yes      |
| registration_date   | 4-digit registration year        | 2020             | Yes      |
| years_to_graduate   | Expected years to graduation     | 4                | Yes      |
| student_card_number | Student card number (numeric, 4+ digits) | 123456789012 | Yes      |

### Example CSV

```csv
full_name,degree,registration_date,years_to_graduate,student_card_number
John Doe,B,2020,4,123456789012
Jane Smith,M,2021,2,987654321098
Alice Johnson,P,2019,5,456789123456
```

### Data Processing Flow

```
Step 1: CSV Input          Step 2: Validation       Step 3: Calculation      Step 4: Generation
───────────────────        ──────────────────       ───────────────────      ──────────────────

John Doe            →      ✓ Name valid      →      Reg: 2020        →      Email generated
B                   →      ✓ Degree valid    →      Years: 4         →      B20IT9012@...
2020                →      ✓ Year valid      →      Grad: 2024       →      
4                   →      ✓ Duration valid  →      Year short: 20   →      Password: ...
123456789012        →      ✓ Card valid      →      Last 4: 9012     →      Quota: 5 MB

                                                                              Description:
                                                                              "Student: John Doe
                                                                              Registration: 2020
                                                                              Graduation: 2024
                                                                              Bachelor"
```

### Important Notes

- **registration_date**: Year the student registered (YYYY format)
- **years_to_graduate**: Number of years to complete the degree (1-10)
- **Graduation year** is calculated automatically: `registration_date + years_to_graduate`
  - Example: Registered in 2020 + 4 years = Graduates in 2024

## Usage

### Run the Script

```bash
npm start
```

### Operation Mode Selection

When you run the script, you'll first be asked to choose an operation mode:

```
Operation Mode Selection

  1. Create email accounts
  2. Delete email accounts

Select operation mode (1 or 2):
```

### Create Mode

Creates new email accounts from a CSV file.

**Interactive Prompts:**

1. **Faculty Code** - Used in email generation (e.g., "IT", "ENG", "MED")
2. **CSV File Path** - Path to your CSV file (e.g., ./data/students.csv)

**Example Session:**

```
Select operation mode (1 or 2): 1

Create Mode Configuration

Enter Faculty Code (e.g., IT, ENG): IT
Enter CSV file path: ./data/students.csv

Configuration Summary:

  Operation:        CREATE
  Faculty Code:     IT
  CSV File:         ./data/students.csv

Email accounts will be created in Plesk.

✓ Testing Plesk CLI availability
✓ CSV validated successfully - 3 students found

Creating 3 email accounts...

✓ John Doe - B20IT9012@student.alepuniv.edu.sy
✓ Jane Smith - M21IT1098@student.alepuniv.edu.sy
✓ Alice Johnson - P19IT3456@student.alepuniv.edu.sy

All operations completed successfully!
```

### Operation Mode Comparison

| Feature | Create Mode | Delete Mode |
|---------|-------------|-------------|
| **Purpose** | Create new email accounts | Remove existing email accounts |
| **Input Source** | CSV file | User input (Faculty + Date) |
| **Processing** | Sequential creation | Pattern-based filtering |
| **Validation** | Full CSV validation | Email pattern matching |
| **Safety** | Duplicate detection | Filter preview before delete |
| **Output** | New mailboxes + security | Deleted mailboxes |
| **Use Case** | New student enrollment | Graduation cleanup |

### Delete Mode

Deletes email accounts matching Faculty Code and graduation date.

**Interactive Prompts:**

1. **Faculty Code** - Filter emails by this code (e.g., "IT", "ENG")
2. **Graduation Date** - Filter emails by graduation year (YYYY format, e.g., "2024")

**Example Session:**

```
Select operation mode (1 or 2): 2

Delete Mode Configuration

Enter Faculty Code to delete (e.g., IT, ENG): IT
Enter Graduation Date (YYYY format, e.g., 2024): 2024

Configuration Summary:

  Operation:        DELETE
  Faculty Code:     IT
  Graduation Date:  2024

WARNING: Email accounts matching these criteria will be DELETED!

✓ Testing Plesk CLI availability

Searching for emails to delete...

Deletion Summary:
  Total found:      5
  Deleted:          5
  Failed:           0

✓ Deleted: B24IT9012@student.alepuniv.edu.sy
✓ Deleted: B24IT9013@student.alepuniv.edu.sy

All deletions completed successfully!
```

**How Delete Filtering Works:**

The delete function searches for emails matching the pattern:
```
{degree}{YY}{facultyCode}{digits}@student.alepuniv.edu.sy
```

Where:
- `{degree}` = B, M, or P
- `{YY}` = Last 2 digits of graduation year (e.g., 2024 → 24)
- `{facultyCode}` = Your specified faculty code

Example: To delete all IT faculty emails graduating in 2024:
- Matches: `B24IT####@student.alepuniv.edu.sy`
- Matches: `M24IT####@student.alepuniv.edu.sy`
- Matches: `P24IT####@student.alepuniv.edu.sy`

## Email Generation Rules

### Email Address Format

```
{degree}{registrationYearLast2Digits}{facultyCode}{last4CardDigits}@student.alepuniv.edu.sy
```

**Visual Breakdown:**
```
   B      20      IT      9012     @student.alepuniv.edu.sy
   │      │       │       │        │
   │      │       │       │        └─ Fixed domain
   │      │       │       └────────── Last 4 digits of student card
   │      │       └────────────────── Faculty Code (from user input)
   │      └────────────────────────── Registration year (2-digit)
   └───────────────────────────────── Degree: B=Bachelor, M=Master, P=PhD
```

**Real Example:**
```
Input Data:                          Generated Email:
──────────                           ────────────────
Student: John Doe                    B20IT9012@student.alepuniv.edu.sy
Degree: Bachelor (B)            →    │││││
Registration: 2020              →    │││└─ 9012 (last 4 of card)
Faculty: IT                     →    ││└── IT (faculty)
Card: 123456789012             →    │└─── 20 (reg year)
                                     └──── B (Bachelor)
```

### Degree Codes

| Code | Degree Name | Quota | Typical Duration |
|------|-------------|-------|------------------|
| B    | Bachelor    | 5 MB  | 4 years         |
| M    | Master      | 15 MB | 2 years         |
| P    | PhD         | 20 MB | 4-6 years       |

### Password Format

```
{fullStudentCardNumber}@ale&.com
```

**Example:** Card `123456789012` → Password `123456789012@ale&.com`

### Email Description

All email accounts include a detailed description:

```
Student: {full_name} Registration: {registration_date} Graduation: {graduation_year} {degree_name}
```

**Example:** 
```
Student: John Doe Registration: 2020 Graduation: 2024 Bachelor
```

This description appears in Plesk and helps administrators identify accounts.

## Security Features

All created email accounts are automatically configured with:

### Security Configuration Flow

```
Email Created
     │
     ▼
┌─────────────────────┐
│ Set Password        │
│ Set Quota           │
│ Set Description     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Enable Antivirus    │──→  plesk bin mail -u email -antivirus in
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Enable Spam Filter  │──→  plesk bin mail -u email -spam_filter on
└──────────┬──────────┘
           │
           ▼
     Email Ready
   🛡️ Protected
```

### Antivirus Protection ✓

- **Status:** Enabled by default
- **Scope:** Incoming email messages
- **Purpose:** Blocks email messages containing viruses
- **Configuration:** Activated during account creation
- **Command:** `plesk bin mail -u {email} -antivirus in`

### Spam Filter ✓

- **Status:** Enabled by default
- **Action:** Move spam to Spam folder
- **Purpose:** Detects and filters spam messages
- **Access:** Spam folder accessible via IMAP/webmail
- **Configuration:** Activated during account creation
- **Command:** `plesk bin mail -u {email} -spam_filter on`

### Security Benefits

| Feature | Benefit | User Impact |
|---------|---------|-------------|
| Antivirus | Prevents virus infections | ✓ Safer inbox |
| Spam Filter | Reduces unwanted emails | ✓ Cleaner inbox |
| Auto-Enable | No manual setup needed | ✓ Instant protection |
| Plesk Integration | Centralized management | ✓ Easy administration |

These security features protect all student mailboxes from the moment they're created.

## Logging and Reports

### Logging System Overview

```
    Operation
       │
       ▼
   Success? ──Yes──→  ┌──────────────┐
       │              │ success.log  │
       │              └──────────────┘
       No
       │
       ▼
   ┌──────────────┐
   │  error.log   │
   └──────┬───────┘
          │
          ▼
   Both logs feed into
          │
          ▼
   ┌──────────────┐
   │ report.json  │
   │  (Summary)   │
   └──────────────┘
```

### Log Files

Location: `logs/` directory

| File | Purpose | Content |
|------|---------|---------|
| **success.log** | Successful operations | Created/deleted emails with timestamps |
| **error.log** | Failed operations | Errors with reasons and student details |
| **report.json** | Summary statistics | Total, successful, failed counts |

### Log Entry Examples

```
[2026-01-13T10:30:45+03:00] Student: John Doe | Email: B20IT9012@student.alepuniv.edu.sy | Status: SUCCESS
[2026-01-13T10:30:46+03:00] Student: Jane Smith | Email: M21IT1098@student.alepuniv.edu.sy | Status: FAILED | Reason: Mailbox already exists
[2026-01-13T10:31:00+03:00] Deleted | Email: B24IT9012@student.alepuniv.edu.sy | Status: SUCCESS
```

### JSON Report

A summary report is saved to `report.json`:

```json
{
  "timestamp": "2026-01-13T10:30:45+03:00",
  "total_processed": 5,
  "successful": 4,
  "failed": 1,
  "failed_students": [
    {
      "name": "Jane Smith",
      "email": "M21IT1098@student.alepuniv.edu.sy",
      "reason": "Mailbox already exists"
    }
  ]
}
```

## Troubleshooting

### Common Issues & Solutions

```
Problem                         Quick Check                    Solution
────────────────────────────────────────────────────────────────────────────
❌ Plesk CLI not available     plesk version                  Run on Plesk server
                                                               Check permissions

❌ CSV validation failed       Check column names             Fix CSV headers
                               Check data types               Validate field values

❌ Mailbox already exists      Search in Plesk                Use delete mode first
                               Check duplicates               Review CSV for dupes

❌ Delete finds no emails      Verify faculty code            Check case sensitivity
                               Check graduation year          List all mailboxes

❌ Permission denied           Check user permissions         Use sudo or root
                               Verify Plesk access            Check file permissions
```

### Error: "Plesk CLI not available"

**Solutions:**
1. Verify Plesk installation: `plesk version`
2. Check permissions: `plesk bin mail --help`
3. Run with sudo if needed: `sudo npm start`

### Error: "CSV validation failed"

**Common Issues:**
- Missing columns: Ensure all 5 required columns exist
- Invalid degree: Must be B, M, or P
- Invalid registration_date: Must be 4 digits (YYYY)
- Invalid years_to_graduate: Must be 1-10
- Invalid card number: Must be numeric, 4+ digits

**Validation Checklist:**
```
✓ CSV has header row
✓ All 5 columns present: full_name, degree, registration_date, years_to_graduate, student_card_number
✓ No empty fields
✓ Degree codes are B, M, or P (uppercase)
✓ Registration dates are 4-digit years
✓ Years to graduate between 1-10
✓ Card numbers are numeric, at least 4 digits
```

### Error: "Mailbox already exists"

**Solutions:**
1. Check for duplicate CSV entries
2. Verify if student already has an account
3. Use Delete mode to remove old accounts first

### Delete Mode - No Emails Found

**Check:**
1. Faculty Code matches exactly (case-sensitive)
2. Graduation year is correct
3. Emails exist in Plesk: `plesk bin mail --list student.alepuniv.edu.sy`

## Complete Workflow Example

### Scenario: Creating 100 Student Email Accounts

```
Timeline: Start to Finish
═════════════════════════════════════════════════════════════════════

00:00 ─┐ Prepare CSV file with 100 student records
       │ • Verify all 5 columns present
       │ • Check data accuracy
       └─→ ✓ students.csv ready

00:02 ─┐ Start program: npm start
       └─→ Select Mode: 1 (Create)

00:02 ─┐ Enter configuration
       │ • Faculty Code: IT
       │ • CSV Path: ./data/students.csv
       └─→ ✓ Configuration accepted

00:03 ─┐ Validation phase
       │ • Plesk CLI: ✓ Available
       │ • CSV Parse: ✓ 100 records found
       │ • Validation: ✓ All records valid
       │ • Duplicates: ✓ None found
       └─→ Ready to create

00:03 ─┐ Creation phase (100 emails)
       │ Progress: ▓▓▓▓▓▓▓▓▓▓░░░░░ 1/100
       │ Progress: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 50/100
       │ Progress: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100/100
       │
       │ For each email:
       │ 1. Generate email & password
       │ 2. Create mailbox in Plesk
       │ 3. Set quota & description
       │ 4. Enable antivirus
       │ 5. Enable spam filter
       │ 6. Log result
       └─→ ✓ 100 mailboxes created

00:10 ─┐ Completion
       │ • Success: 100
       │ • Failed: 0
       │ • Logs generated
       │ • Report saved
       └─→ ✓ All done!

Total Time: ~10 minutes for 100 accounts
═════════════════════════════════════════════════════════════════════
```

### What Gets Created for Each Student

```
Student Input                        Generated Output
─────────────────────────────────────────────────────────────────────
John Doe                             📧 Email Account:
Bachelor (B)                            B20IT9012@student.alepuniv.edu.sy
Registered: 2020                     
Years: 4                             🔑 Password:
Card: 123456789012                      123456789012@ale&.com
Faculty: IT                          
                                     💾 Quota: 5 MB

                                     📝 Description:
                                        Student: John Doe
                                        Registration: 2020
                                        Graduation: 2024
                                        Bachelor

                                     🛡️ Security:
                                        ✓ Antivirus enabled
                                        ✓ Spam filter enabled

                                     📊 Logged:
                                        ✓ success.log
                                        ✓ report.json
```

## Additional Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture details
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[MIGRATION.md](MIGRATION.md)** - Upgrade guide from v6 to v7
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command reference card

## License

MIT License - See LICENSE file for details

---

**Version:** 7.0.0  
**Last Updated:** January 2026  
**Author:** Abdo Ka  
**Repository:** https://github.com/Abdo-ka/plesk_email_generator
