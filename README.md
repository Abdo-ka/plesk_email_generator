# Plesk Email Account Generator

Production-ready Node.js CLI tool for automated bulk creation of student email accounts in Plesk from CSV data.

## Requirements

- Node.js v14.0.0 or higher
- Linux server with Plesk installed
- CLI access via SSH
- Ability to execute plesk bin mail commands
- Domain alepuniv.edu.sy must exist in Plesk

## Installation

### Upload to Plesk Server

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

# Now you can run:
plesk-email-gen
```

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
{degree}{graduationYear}{universityCode}{last4CardDigits}@alepuniv.edu.sy
```

Example:
- Student: John Doe
- Degree: B (Bachelor)
- Graduation Year: 2024
- University Code: ALEP
- Card Number: 123456789012
- Generated Email: B2024ALEP9012@alepuniv.edu.sy

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
[2026-01-03T21:39:41+03:00] Student: John Doe | Email: B2024ALEP9012@alepuniv.edu.sy | Status: SUCCESS
[2026-01-03T21:39:42+03:00] Student: Jane Smith | Email: M2025ALEP1098@alepuniv.edu.sy | Status: FAILED | Reason: Mailbox already exists
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
      "email": "M2025ALEP1098@alepuniv.edu.sy",
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

## License

MIT License - See LICENSE file for details
