# Quick Start Guide

## For First-Time Users

### 1. Installation (5 minutes)

**On Plesk Server:**
```bash
# Upload files to server
scp -r plesk-email-generator user@your-server.com:/home/user/

# SSH into server
ssh user@your-server.com

# Navigate to directory
cd plesk-email-generator

# Install dependencies
npm install
```

**On Local Machine (for testing):**
```bash
# Clone repository
git clone https://github.com/Abdo-ka/plesk_email_generator.git
cd plesk-email-generator

# Install dependencies
npm install

# Test installation
npm test
```

### 2. Prepare Your CSV File (2 minutes)

Create a CSV file with these columns:

```csv
full_name,degree,graduation_year,student_card_number
John Doe,B,2024,123456789012
Jane Smith,M,2025,987654321098
Bob Johnson,P,2023,456789123456
```

**Requirements:**
- `full_name`: Any text
- `degree`: B (Bachelor), M (Master), or P (PhD)
- `graduation_year`: 4-digit year
- `student_card_number`: Numeric, at least 4 digits

Save as `students.csv` in your project directory.

### 3. Run the Script (1 minute)

```bash
npm start
```

**You will be prompted for:**
1. **University Code**: Enter your code (e.g., `ALEP`, `UNI`)
2. **CSV File Path**: Enter path (e.g., `./students.csv`)

### 4. Review Results (1 minute)

The script will:
1. Validate your CSV
2. Generate email addresses
3. Create mailboxes in Plesk
4. Display summary

**Check outputs:**
```bash
# View successful creations
cat logs/success.log

# View failures (if any)
cat logs/error.log

# View JSON report
cat report.json
```

## Example Session

```
$ npm start

===================================================
      PLESK EMAIL ACCOUNT GENERATOR v6.0.0         
   Automated bulk email creation for students      
===================================================

Configuration Setup

Enter university code (e.g., UNI): ALEP
Enter CSV file path: ./students.csv

Configuration Summary:

  University Code:  ALEP
  CSV File:         ./students.csv
  Mode:             PRODUCTION

Email accounts will be created in Plesk.

✓ Plesk CLI is available
✓ CSV validated successfully - 3 students found

Creating 3 email accounts...

✓ John Doe - B2024ALEP9012@student.alepuniv.edu.sy
✓ Jane Smith - M2025ALEP1098@student.alepuniv.edu.sy
✓ Bob Johnson - P2023ALEP3456@student.alepuniv.edu.sy

═══════════════════════════════════════
           FINAL STATISTICS
═══════════════════════════════════════

Total Processed:     3
Successfully Created: 3
Failed:              0

═══════════════════════════════════════

Report saved to: report.json

Log files:
  - Success: logs/success.log
  - Errors:  logs/error.log

All operations completed successfully!
```

## Generated Email Format

Each student gets:
- **Email**: `{degree}{year}{code}{last4digits}@student.alepuniv.edu.sy`
- **Password**: `{fullCardNumber}@ale&.com`

Example:
- Student: John Doe
- Degree: Bachelor (B)
- Year: 2024
- University: ALEP
- Card: 123456789012
- **Email**: `B2024ALEP9012@student.alepuniv.edu.sy`
- **Password**: `123456789012@ale&.com`

## Common Issues & Solutions

### "Plesk CLI not available"
**Problem**: Running on machine without Plesk
**Solution**: Must run on Plesk server

### "CSV validation failed"
**Problem**: Invalid data in CSV
**Solution**: Check error messages and fix CSV data

### "Mailbox already exists"
**Problem**: Email already created
**Solution**: Normal - account exists from previous run

### "Permission denied"
**Problem**: No permission to execute Plesk commands
**Solution**: Run with `sudo npm start`

## What's Next?

### For Development
- Read [DEVELOPMENT.md](DEVELOPMENT.md) for development setup
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for design details

### For Production Use
- Start with small CSV file (5-10 students) to test
- Review logs after each run
- Backup before processing large batches
- Keep CSV files organized

### Understanding the Code
- **[src/index.js](src/index.js)** - Main entry point
- **[src/csv-parser.js](src/csv-parser.js)** - CSV validation
- **[src/email-generator.js](src/email-generator.js)** - Email generation
- **[src/plesk-client.js](src/plesk-client.js)** - Plesk commands
- **[src/logger.js](src/logger.js)** - Logging system

### Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Review error logs for specific issues
3. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - CSV sample (anonymized)

## Tips for Success

1. **Test First**: Run with 1-2 students before bulk processing
2. **Backup CSV**: Keep original CSV file safe
3. **Check Logs**: Review logs after each run
4. **Small Batches**: Process in batches of 50-100 for better control
5. **Verify Domain**: Ensure `student.alepuniv.edu.sy` exists in Plesk

## File Structure Reference

```
plesk-email-generator/
├── src/                      # Source code
├── logs/                     # Generated logs
│   ├── success.log          # Created accounts
│   └── error.log            # Failed accounts
├── examples/                # Sample CSV files
├── report.json              # JSON summary (generated)
├── README.md                # Full documentation
├── ARCHITECTURE.md          # Technical details
├── DEVELOPMENT.md           # Development guide
└── QUICKSTART.md           # This file
```

## Keyboard Shortcuts

- `Ctrl+C` - Stop the script (safe to use)
- `Ctrl+D` - End input (when prompted)

## Next Steps

Ready to process your students? Run:
```bash
npm start
```

Need more details? Read:
- [README.md](README.md) - Complete user guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - How it works
- [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide
