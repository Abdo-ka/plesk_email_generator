# Plesk Email Account Generator

Production-ready Node.js CLI tool for automated bulk creation of student email accounts in Plesk from CSV data.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Installation](#installation)
  - [Local Development Setup](#local-development-setup)
  - [Server Installation](#server-installation)
  - [Global Installation](#global-installation)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Code Documentation](#code-documentation)
- [CSV Format](#csv-format)
- [Usage](#usage)
- [Email Generation Rules](#email-generation-rules)
- [Logging and Reports](#logging-and-reports)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Additional Documentation](#additional-documentation)
- [License](#license)

## Features

- **Automated Bulk Email Creation** - Process hundreds of student accounts in minutes
- **CSV-Based Input** - Simple CSV format for student data
- **Validation** - Comprehensive input validation with detailed error messages
- **Duplicate Detection** - Automatically identifies duplicate email addresses
- **Logging & Reporting** - Detailed success/error logs and JSON reports
- **Progress Tracking** - Real-time progress updates during processing
- **Error Handling** - Robust error handling with meaningful error messages
- **Dry-Run Mode** - Test mode for safe trial runs
- **Flexible Quota Management** - Degree-based mailbox quota assignment
- **Production Ready** - Used in live production environments

## Requirements

- Node.js v14.0.0 or higher
- Linux server with Plesk installed (for production use)
- CLI access via SSH (for production use)
- Ability to execute plesk bin mail commands
- Domain alepuniv.edu.sy must exist in Plesk

## Quick Start

New to this project? Check out [QUICKSTART.md](QUICKSTART.md) for a fast 5-minute setup guide.

```bash
# Quick install and run
npm install
npm start
# Follow the prompts
```

## Installation

### Local Development Setup

For developing and testing on your local machine:

```bash
# Clone the repository
git clone https://github.com/Abdo-ka/plesk_email_generator.git
cd plesk-email-generator

# Install dependencies
npm install

# Verify installation
npm test

# Run the script in test mode
npm start
```

**Note**: On local machines, you can test CSV parsing and email generation logic, but you won't be able to actually create mailboxes without a Plesk server.

### Server Installation

#### Upload to Plesk Server

Via SCP:
```bash
scp -r plesk-email-generator user@your-server.com:/home/user/
```

Via SFTP:
```bash
sftp user@your-server.com
put -r plesk-email-generator
exit
```

Via Git:
```bash
ssh user@your-server.com
git clone https://github.com/yourusername/plesk-email-generator.git
cd plesk-email-generator
```

### Install Dependencies

```bash
# SSH into your Plesk server
ssh user@your-server.com

# Navigate to the script directory
cd plesk-email-generator

# Install dependencies
npm install

# Make script executable
chmod +x src/index.js
```

### Global Installation (Optional)

You can install the package globally to run it as a command from anywhere:

```bash
# From within the directory
npm install -g .

# Now you can run from anywhere:
plesk-email-gen
```

## Project Structure

```
plesk-email-generator/
├── src/
│   ├── index.js              # Main CLI entry point and orchestration
│   ├── csv-parser.js         # CSV reading, parsing, and validation logic
│   ├── email-generator.js    # Email & password generation engine
│   ├── plesk-client.js       # Plesk CLI interaction and mailbox creation
│   ├── logger.js             # Logging system and statistics tracking
│   └── prompts.js            # Interactive CLI prompts and input collection
├── logs/                      # Generated log files (created at runtime)
│   ├── success.log
│   └── error.log
├── examples/                  # Example CSV files
├── package.json              # Node.js project dependencies
├── README.md                 # This file
└── LICENSE                   # MIT License
```

## Architecture Overview

The application follows a modular, single-responsibility architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    index.js (CLI Entry)                      │
│              Orchestrates workflow & user feedback            │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
        ┌────────▼──────────┐        ┌────────▼──────────┐
        │  prompts.js       │        │  csv-parser.js    │
        │  Collect inputs   │        │  Parse & validate │
        │  from user        │        │  CSV files        │
        └───────────────────┘        └────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │ email-generator.js  │
                                    │ Generate emails &   │
                                    │ passwords           │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │ plesk-client.js     │
                                    │ Create mailboxes    │
                                    │ in Plesk            │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   logger.js         │
                                    │ Log results &       │
                                    │ generate reports    │
                                    └─────────────────────┘
```

### Module Interactions

1. **prompts.js** → Collects user configuration (university code, CSV file path)
2. **csv-parser.js** → Validates CSV structure and student data
3. **email-generator.js** → Generates email accounts with credentials
4. **plesk-client.js** → Creates mailboxes in Plesk system
5. **logger.js** → Records all operations and generates reports
6. **index.js** → Ties everything together and manages CLI experience

## Code Documentation

### Module Overview

#### **index.js** - Main CLI Entry Point
- **Purpose**: Orchestrates the entire workflow from user input to completion
- **Key Functions**:
  - `displayBanner()` - Shows welcome message
  - `displayConfig()` - Shows configuration summary
  - `main()` - Main execution function that coordinates all modules
- **Responsibilities**: 
  - User interaction and feedback
  - Error handling and validation flow
  - Progress tracking and reporting

#### **prompts.js** - Interactive Input Collection
- **Purpose**: Handles all CLI prompts and user input
- **Key Functions**:
  - `ask(question, defaultValue)` - Prompts for text input
  - `askPassword(question)` - Prompts for password with masked input
  - `askYesNo(question, defaultValue)` - Yes/No prompts
  - `collectInputs()` - Gathers all required configuration
  - `validateFilePath(filePath)` - Validates file existence
- **Responsibilities**: 
  - Input validation
  - Default value handling
  - User guidance and prompts

#### **csv-parser.js** - CSV File Processing
- **Purpose**: Reads, parses, validates, and processes CSV files
- **Key Functions**:
  - `parseCSV(filePath)` - Reads CSV file into student objects
  - `validateStudent(student, lineNumber)` - Validates individual student record
  - `normalizeStudent(student)` - Cleans and standardizes student data
  - `detectDuplicates(emailAccounts)` - Finds duplicate email addresses
  - `parseAndValidate(filePath, universityCode)` - Complete validation pipeline
- **Validation Rules**:
  - All required fields present
  - Degree must be B, M, or P
  - Graduation year must be 4 digits
  - Student card number must be numeric and ≥4 digits
- **Responsibilities**: 
  - CSV file parsing
  - Data validation
  - Duplicate detection
  - Error reporting with line numbers

#### **email-generator.js** - Email & Password Generation
- **Purpose**: Generates email addresses and passwords based on business rules
- **Key Functions**:
  - `generateEmail(student, universityCode)` - Generates email address
  - `generatePassword(studentCardNumber)` - Generates password
  - `getQuota(degree)` - Returns mailbox quota based on degree
  - `generateDescription(student)` - Creates account description
  - `generateEmailAccount(student, universityCode)` - Complete account generation
  - `isValidDegree(degree)` - Validates degree code
- **Business Rules**:
  - Email format: `{degree}{year}{code}{last4digits}@student.alepuniv.edu.sy`
  - Password format: `{cardNumber}@ale&.com`
  - Quotas: Bachelor & PhD = 5MB, Master = 25MB
- **Responsibilities**: 
  - Email generation logic
  - Password creation
  - Quota assignment
  - Account description generation

#### **plesk-client.js** - Plesk CLI Integration
- **Purpose**: Interfaces with Plesk CLI to create mailboxes
- **Key Functions**:
  - `executeCommand(command)` - Executes shell commands
  - `checkMailboxExists(email)` - Checks if mailbox already exists
  - `createMailbox(email, password, quota, description, dryRun)` - Creates single mailbox
  - `createMailboxes(accounts, dryRun, onProgress)` - Creates multiple mailboxes
  - `testPleskCLI()` - Verifies Plesk CLI availability
- **Responsibilities**: 
  - Plesk CLI communication
  - Mailbox creation
  - Duplicate mailbox detection
  - Error handling for Plesk operations

#### **logger.js** - Logging & Reporting
- **Purpose**: Tracks all operations and generates reports
- **Key Classes/Functions**:
  - `logSuccess(studentName, email)` - Logs successful creation
  - `logError(studentName, email, reason)` - Logs failed creation
  - `clearLogs()` - Clears previous logs
  - `class Statistics` - Tracks metrics and generates reports
- **Log Files Generated**:
  - `logs/success.log` - Successful email creations
  - `logs/error.log` - Failed email creations
  - `report.json` - JSON summary report
- **Responsibilities**: 
  - File logging
  - Statistics tracking
  - Report generation
  - Progress feedback

## CSV Format

Your CSV file must contain the following columns:

| Column Name          | Description                      | Example          | Required |
|---------------------|----------------------------------|------------------|----------|
| full_name           | Student's full name              | John Doe         | Yes      |
| degree              | Degree code (B/M/P)              | B                | Yes      |
| graduation_year     | 4-digit graduation year          | 2024             | Yes      |
| student_card_number | Student card number (numeric, 4+ digits) | 123456789012 | Yes      |

### Example CSV

```csv
full_name,degree,graduation_year,student_card_number
John Doe,B,2024,123456789012
Jane Smith,M,2025,987654321098
Alice Johnson,P,2023,456789123456
```

See examples/sample.csv for a complete example.

## Usage

### Run the Script

```bash
npm start
```

Or directly with node:

```bash
node src/index.js
```

### Interactive Prompts

The script will prompt you for:

1. University Code - Used in email generation (e.g., "ALEP")
2. CSV File Path - Path to your CSV file (e.g., ./data/students.csv)

### Example Session

```
Configuration Setup

Enter university code (e.g., UNI): ALEP
Enter CSV file path: ./examples/sample.csv

Configuration Summary:

  University Code:  ALEP
  CSV File:         ./examples/sample.csv
  Mode:             PRODUCTION

Email accounts will be created in Plesk.
```

## Email Generation Rules

### Email Address Format

```
{degree}{graduationYear}{universityCode}{last4CardDigits}@student.alepuniv.edu.sy
```

Example:
- Student: John Doe
- Degree: B (Bachelor)
- Graduation Year: 2024
- University Code: ALEP
- Card Number: 123456789012
- Generated Email: B2024ALEP9012@student.alepuniv.edu.sy

### Degree Codes

| Code | Degree Name |
|------|-------------|
| B    | Bachelor    |
| M    | Master      |
| P    | PhD         |

### Password Format

```
{fullStudentCardNumber}@ale&.com
```

Example:
- Card Number: 123456789012
- Generated Password: 123456789012@ale&.com

### Mailbox Quotas

| Degree | Quota |
|--------|-------|
| B      | 5 MB  |
| M      | 25 MB |
| P      | 5 MB  |

### Email Description

```
Student: {full_name} {graduation_year} {degree_name}
```

Example: Student: John Doe 2024 Bachelor

## Logging and Reports

### Log Files

The script creates the following log files in the logs/ directory:

- success.log - Successfully created email accounts with student names
- error.log - Failed email creations with student names and reasons

### Log Entry Format

```
[2026-01-03T21:39:41+03:00] Student: John Doe | Email: B2024ALEP9012@student.alepuniv.edu.sy | Status: SUCCESS
[2026-01-03T21:39:42+03:00] Student: Jane Smith | Email: M2025ALEP1098@student.alepuniv.edu.sy | Status: FAILED | Reason: Mailbox already exists
```

### Final Report

A JSON report is generated at report.json:

```json
{
  "timestamp": "2026-01-03T21:39:41+03:00",
  "total_processed": 5,
  "successful": 4,
  "failed": 1,
  "failed_students": [
    {
      "name": "Jane Smith",
      "email": "M2025ALEP1098@student.alepuniv.edu.sy",
      "reason": "Mailbox already exists"
    }
  ]
}
```

## Troubleshooting

### Error: "Plesk CLI not available"

Cause: Script cannot access Plesk CLI commands

Solutions:
1. Verify you're on a server with Plesk installed:
   ```bash
   plesk version
   ```
2. Check you have permissions:
   ```bash
   plesk bin mail --help
   ```
3. Try running with sudo (if appropriate):
   ```bash
   sudo node src/index.js
   ```

### Error: "CSV validation failed"

Cause: CSV file has invalid or missing data

Solutions:
1. Check all required columns exist
2. Verify degree codes are B, M, or P
3. Ensure graduation years are 4 digits
4. Confirm card numbers are numeric and 4+ digits
5. Check for empty fields

### Error: "Mailbox already exists"

Cause: Email address already exists in Plesk

Solutions:
1. Check if student was already processed
2. Verify for duplicate entries in CSV
3. Manually check Plesk for existing mailbox
4. Remove duplicates from CSV and re-run

### Error: "Failed to create mailbox"

Cause: Plesk command execution failed

Solutions:
1. Verify domain exists in Plesk
2. Check disk quota on server
3. Review Plesk error logs:
   ```bash
   tail -f /var/log/plesk/panel.log
   ```

### CSV Parsing Issues

Problem: Special characters in names

Solution: Ensure CSV is UTF-8 encoded:
```bash
file -i your-file.csv
# Should show: charset=utf-8
```

## API Reference

### csv-parser.js

#### `parseCSV(filePath: string): Promise<Object>`
Reads and parses a CSV file into student records.

**Parameters:**
- `filePath` (string) - Path to CSV file

**Returns:**
```javascript
{
  students: Array<Object>,  // Array of student records
  errors: Array<string>     // Array of validation errors
}
```

**Example:**
```javascript
const { parseCSV } = require('./csv-parser');
const result = await parseCSV('./data/students.csv');
console.log(result.students);
```

---

#### `parseAndValidate(filePath: string, universityCode: string): Promise<Object>`
Complete validation pipeline that parses CSV, validates data, and generates email accounts.

**Parameters:**
- `filePath` (string) - Path to CSV file
- `universityCode` (string) - University code for email generation

**Returns:**
```javascript
{
  success: boolean,
  students: Array<Object>,   // Email account objects
  errors: Array<string>,     // Validation errors
  duplicates: Array<string>  // Duplicate emails
}
```

---

#### `validateStudent(student: Object, lineNumber: number): Object`
Validates a single student record.

**Parameters:**
- `student` (Object) - Student data
- `lineNumber` (number) - Line number for error reporting

**Returns:**
```javascript
{
  valid: boolean,
  errors: Array<string>
}
```

---

#### `detectDuplicates(emailAccounts: Array): Array<string>`
Finds duplicate email addresses.

**Parameters:**
- `emailAccounts` (Array) - Array of email account objects

**Returns:**
- Array of duplicate email addresses

---

### email-generator.js

#### `generateEmailAccount(student: Object, universityCode: string): Object`
Generates complete email account data for a student.

**Parameters:**
- `student` (Object) - Student record with properties: `full_name`, `degree`, `graduation_year`, `student_card_number`
- `universityCode` (string) - University code

**Returns:**
```javascript
{
  email: string,           // Generated email address
  password: string,        // Generated password
  quota: number,           // Quota in MB
  description: string,     // Account description
  student: Object          // Student info
}
```

**Example:**
```javascript
const { generateEmailAccount } = require('./email-generator');

const student = {
  full_name: 'John Doe',
  degree: 'B',
  graduation_year: '2024',
  student_card_number: '123456789012'
};

const account = generateEmailAccount(student, 'ALEP');
console.log(account.email);  // B2024ALEP9012@student.alepuniv.edu.sy
console.log(account.password); // 123456789012@ale&.com
console.log(account.quota);  // 5
```

---

#### `generateEmail(student: Object, universityCode: string): string`
Generates email address only.

**Returns:** Email address string

---

#### `generatePassword(studentCardNumber: string): string`
Generates password from student card number.

**Returns:** Password string

---

#### `getQuota(degree: string): number`
Gets mailbox quota based on degree.

**Parameters:**
- `degree` (string) - Degree code (B, M, or P)

**Returns:** Quota in MB

---

#### `isValidDegree(degree: string): boolean`
Validates degree code.

**Returns:** true if degree is valid (B, M, or P)

---

### plesk-client.js

#### `createMailbox(email: string, password: string, quota: number, description: string, dryRun: boolean): Promise<Object>`
Creates a single mailbox in Plesk.

**Parameters:**
- `email` (string) - Email address
- `password` (string) - Mailbox password
- `quota` (number) - Quota in MB
- `description` (string) - Account description
- `dryRun` (boolean, optional) - If true, don't actually create

**Returns:**
```javascript
{
  success: boolean,
  email: string,
  error?: string,    // Present if failed
  message?: string   // Present if successful
}
```

---

#### `createMailboxes(accounts: Array, dryRun: boolean, onProgress: Function): Promise<Array>`
Creates multiple mailboxes with progress tracking.

**Parameters:**
- `accounts` (Array) - Array of account objects
- `dryRun` (boolean, optional) - If true, don't actually create
- `onProgress` (Function, optional) - Callback: `(current, total, account) => {}`

**Returns:** Array of result objects for each account

---

#### `testPleskCLI(): Promise<boolean>`
Tests if Plesk CLI is available.

**Returns:** true if Plesk CLI is accessible

---

### logger.js

#### `class Statistics`
Tracks processing statistics.

**Methods:**
- `recordSuccess()` - Records successful creation
- `recordFailure(name: string, email: string, reason: string)` - Records failed creation
- `getSummary(): Object` - Returns statistics summary
- `saveReport(): string|null` - Saves report to JSON file
- `printSummary(chalk: Object)` - Prints formatted summary to console

**Example:**
```javascript
const { Statistics } = require('./logger');
const stats = new Statistics();

stats.recordSuccess();
stats.recordFailure('John Doe', 'B2024ALEP9012@student.alepuniv.edu.sy', 'Mailbox exists');

const summary = stats.getSummary();
console.log(summary.successful);  // 1
console.log(summary.failed);      // 1
```

---

#### `logSuccess(studentName: string, email: string): void`
Logs successful email creation.

---

#### `logError(studentName: string, email: string, reason: string): void`
Logs failed email creation.

---

#### `clearLogs(): void`
Clears all log files and reports.

---

### prompts.js

#### `collectInputs(): Promise<Object>`
Collects all required user inputs.

**Returns:**
```javascript
{
  universityCode: string,
  csvPath: string,
  dryRun: boolean
}
```

---

#### `ask(question: string, defaultValue: string): Promise<string>`
Prompts user for text input.

**Parameters:**
- `question` (string) - Question to ask
- `defaultValue` (string, optional) - Default value

**Returns:** User's answer

---

#### `askYesNo(question: string, defaultValue: boolean): Promise<boolean>`
Prompts for yes/no answer.

**Returns:** boolean

---

## Development & Testing

### Running Tests

```bash
# Test all modules
npm test

# Test individual modules
node src/csv-parser.js --test
node src/email-generator.js --test
```

### Code Structure Tips

1. **Each module is independent** - Can be imported and used separately
2. **Error handling** - All async operations have try-catch or error returns
3. **Logging** - All operations are logged for audit trail
4. **Validation** - Input validated at entry points
5. **Progress tracking** - Long operations report progress

### Running Locally Without Plesk

```javascript
// You can test the entire pipeline without a Plesk server:
// 1. CSV parsing and validation works locally
// 2. Email generation works locally
// 3. Only mailbox creation requires Plesk (can be dry-run tested)

// Example local test:
const { parseAndValidate } = require('./src/csv-parser');
const result = await parseAndValidate('./data/students.csv', 'ALEP');
console.log(result.students); // See generated email accounts
```

## Additional Documentation

This project includes comprehensive documentation for different audiences:

- **[QUICKSTART.md](QUICKSTART.md)** - Fast 5-minute setup guide for first-time users
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed system architecture and design documentation
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Complete development guide for contributors
- **README.md (this file)** - User guide and API reference

### Documentation Overview

| Document | Audience | Purpose |
|----------|----------|---------|
| QUICKSTART.md | New Users | Get started in 5 minutes |
| README.md | End Users | Complete user guide and reference |
| ARCHITECTURE.md | Developers/Architects | Understand system design |
| DEVELOPMENT.md | Contributors | Development workflow and standards |

## License

MIT License - See LICENSE file for details
