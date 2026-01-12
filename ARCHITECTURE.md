# Architecture Documentation

## Overview

Plesk Email Account Generator is a modular Node.js CLI application designed for automated bulk creation of student email accounts in Plesk. The architecture follows the Single Responsibility Principle with clear separation of concerns.

## System Architecture

### High-Level Flow

```
User Input → CSV Parsing → Email Generation → Plesk Creation → Logging/Reporting
```

### Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                       CLI Interface (index.js)                │
│  - User interaction                                           │
│  - Workflow orchestration                                     │
│  - Error handling                                             │
└────────────┬─────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌──────────────┐
│ prompts │      │  csv-parser  │
│         │      │              │
│ Collect │      │ Parse & Val  │
│ Config  │      │ idate CSV    │
└─────────┘      └──────┬───────┘
                        │
                        ▼
                ┌───────────────────┐
                │ email-generator   │
                │                   │
                │ Generate emails & │
                │ passwords         │
                └────────┬──────────┘
                         │
                         ▼
                ┌────────────────────┐
                │  plesk-client      │
                │                    │
                │  Create mailboxes  │
                │  in Plesk          │
                └─────────┬──────────┘
                          │
                          ▼
                ┌─────────────────┐
                │    logger       │
                │                 │
                │ Log & Report    │
                └─────────────────┘
```

## Module Descriptions

### 1. index.js - Main Orchestrator

**Purpose**: Entry point and workflow coordinator

**Responsibilities**:
- Display user interface
- Coordinate module interactions
- Handle errors and exit codes
- Provide user feedback

**Key Dependencies**:
- prompts.js (input collection)
- csv-parser.js (data validation)
- plesk-client.js (mailbox creation)
- logger.js (logging operations)
- chalk (colored output)
- ora (spinners)

**Flow**:
```
Start
  → Display Banner
  → Collect Inputs (prompts)
  → Test Plesk CLI (plesk-client)
  → Parse CSV (csv-parser)
  → Create Mailboxes (plesk-client)
  → Log Results (logger)
  → Display Summary
End
```

### 2. prompts.js - Input Collection

**Purpose**: Interactive CLI prompts and validation

**Key Functions**:
- `ask()` - General text input
- `askPassword()` - Masked password input
- `askYesNo()` - Boolean confirmation
- `collectInputs()` - Complete configuration collection
- `validateFilePath()` - File existence validation

**Input Validation**:
- University code: Required, non-empty
- CSV file path: Must exist and be readable

**Output**: Configuration object

### 3. csv-parser.js - Data Processing

**Purpose**: CSV parsing, validation, and normalization

**Data Flow**:
```
CSV File
  → Read Stream
  → csv-parser library
  → Row-by-row validation
  → Normalization
  → Email generation (via email-generator)
  → Duplicate detection
  → Return validated accounts
```

**Validation Rules**:
| Field                  | Rule                              |
|------------------------|-----------------------------------|
| full_name              | Required, non-empty               |
| degree                 | Must be B, M, or P                |
| graduation_year        | Exactly 4 digits                  |
| student_card_number    | Numeric, minimum 4 digits         |

**Key Functions**:
- `parseCSV()` - Stream and parse CSV
- `validateStudent()` - Validate single record
- `normalizeStudent()` - Clean and standardize data
- `detectDuplicates()` - Find duplicate emails
- `parseAndValidate()` - Complete pipeline

### 4. email-generator.js - Business Logic

**Purpose**: Generate email accounts according to business rules

**Email Format**:
```
{degree}{graduationYear}{universityCode}{last4CardDigits}@student.alepuniv.edu.sy

Example:
  Degree: B
  Year: 2024
  University: ALEP
  Card: 123456789012
  Result: B2024ALEP9012@student.alepuniv.edu.sy
```

**Password Format**:
```
{fullCardNumber}@ale&.com

Example:
  Card: 123456789012
  Password: 123456789012@ale&.com
```

**Quota Rules**:
| Degree | Name     | Quota |
|--------|----------|-------|
| B      | Bachelor | 5 MB  |
| M      | Master   | 25 MB |
| P      | PhD      | 5 MB  |

**Key Functions**:
- `generateEmail()` - Create email address
- `generatePassword()` - Create password
- `getQuota()` - Determine mailbox quota
- `generateDescription()` - Create account description
- `generateEmailAccount()` - Complete account generation
- `isValidDegree()` - Validate degree code

### 5. plesk-client.js - External Integration

**Purpose**: Interface with Plesk CLI for mailbox management

**Plesk Commands Used**:
```bash
# Check if mailbox exists
plesk bin mail --info email@domain.com

# Create mailbox
plesk bin mail --create email@domain.com -mailbox true -passwd 'password' -mbox_quota 5M

# Update mailbox description
plesk bin mail --update email@domain.com -description "Student: John Doe 2024 Bachelor"

# Test CLI availability
plesk bin mail --help
```

**Process Flow**:
```
Check Mailbox Exists
  ↓ (if not exists)
Create Mailbox
  ↓
Set Description
  ↓
Return Result
```

**Error Handling**:
- Mailbox already exists → Skip with error
- Plesk command fails → Log error, continue
- CLI not available → Abort entire process

**Key Functions**:
- `executeCommand()` - Execute shell commands
- `checkMailboxExists()` - Verify mailbox existence
- `createMailbox()` - Create single mailbox
- `createMailboxes()` - Batch creation
- `testPleskCLI()` - Verify CLI availability

### 6. logger.js - Audit Trail

**Purpose**: Logging, statistics, and reporting

**Log Files**:
```
logs/
  ├── success.log    # Successful creations
  └── error.log      # Failed creations

report.json          # JSON summary report
```

**Log Entry Format**:
```
[2026-01-12T10:30:45+03:00] Student: John Doe | Email: B2024ALEP9012@student.alepuniv.edu.sy | Status: SUCCESS
```

**Statistics Tracking**:
- Total processed count
- Success count
- Failure count
- Detailed failure information (name, email, reason)

**Key Components**:
- `logSuccess()` - Log successful creation
- `logError()` - Log failed creation
- `clearLogs()` - Clear previous logs
- `Statistics` class - Track and report metrics

## Data Flow

### Complete Processing Pipeline

```
1. User Input
   ├─ University Code: "ALEP"
   └─ CSV File: "./data/students.csv"

2. CSV Parsing
   ├─ Read file line by line
   ├─ Validate each student record
   └─ Output: Array of student objects

3. Email Generation
   ├─ For each student:
   │  ├─ Generate email address
   │  ├─ Generate password
   │  ├─ Determine quota
   │  └─ Create description
   └─ Output: Array of email account objects

4. Duplicate Detection
   ├─ Build email map
   ├─ Identify duplicates
   └─ Warn user if duplicates found

5. Mailbox Creation (Sequential)
   ├─ For each account:
   │  ├─ Check if exists
   │  ├─ Create mailbox (if not exists)
   │  ├─ Set description
   │  ├─ Log result
   │  └─ Update statistics
   └─ Output: Array of results

6. Reporting
   ├─ Generate console summary
   ├─ Save JSON report
   └─ Exit with appropriate code
```

### Data Structures

#### Student Record (from CSV)
```javascript
{
  full_name: "John Doe",
  degree: "B",
  graduation_year: "2024",
  student_card_number: "123456789012"
}
```

#### Email Account Object
```javascript
{
  email: "B2024ALEP9012@student.alepuniv.edu.sy",
  password: "123456789012@ale&.com",
  quota: 5,
  description: "Student: John Doe 2024 Bachelor",
  student: {
    name: "John Doe",
    degree: "B",
    graduationYear: "2024",
    cardNumber: "123456789012"
  }
}
```

#### Creation Result
```javascript
{
  success: true,
  email: "B2024ALEP9012@student.alepuniv.edu.sy",
  message: "Mailbox created successfully",
  student: {
    name: "John Doe",
    degree: "B",
    graduationYear: "2024",
    cardNumber: "123456789012"
  }
}
```

#### Statistics Summary
```javascript
{
  timestamp: "2026-01-12T10:30:45+03:00",
  total_processed: 100,
  successful: 98,
  failed: 2,
  failed_students: [
    {
      name: "Jane Smith",
      email: "M2025ALEP1234@student.alepuniv.edu.sy",
      reason: "Mailbox already exists"
    }
  ]
}
```

## Error Handling Strategy

### Error Categories

1. **Configuration Errors**
   - Missing university code
   - Invalid CSV file path
   - Solution: Prompt user again

2. **Environment Errors**
   - Plesk CLI not available
   - No permissions
   - Solution: Display helpful error message, exit

3. **Data Validation Errors**
   - Invalid CSV format
   - Missing required fields
   - Invalid degree codes
   - Solution: Display all errors, exit

4. **Creation Errors**
   - Mailbox already exists
   - Plesk command failure
   - Solution: Log error, continue with remaining accounts

5. **Fatal Errors**
   - File system errors
   - Unexpected exceptions
   - Solution: Display stack trace, exit with code 1

### Error Reporting

All errors include:
- Clear error message
- Context (student name, line number)
- Suggested solutions
- Stack traces for debugging (fatal errors only)

## Performance Considerations

### Sequential Processing
Mailboxes are created sequentially (not in parallel) to:
- Avoid overwhelming Plesk CLI
- Ensure proper error tracking
- Maintain log order
- Prevent race conditions

### Memory Efficiency
- CSV parsed as stream (not loaded entirely into memory)
- Progress updates via callbacks (no buffering)
- Logs written incrementally

### Scalability
Current design handles:
- Thousands of student records
- Large CSV files (streaming)
- Limited by Plesk server performance

## Security Considerations

### Password Storage
- Passwords logged to files (consider security implications)
- Log files should have restricted permissions
- Passwords follow predictable pattern (consider strengthening)

### Input Validation
- All inputs validated before processing
- File path validation prevents directory traversal
- Degree codes restricted to whitelist

### Command Injection Prevention
- Passwords wrapped in single quotes for Plesk commands
- No user input directly concatenated into shell commands

## Testing

### Module Testing
Each module includes test mode:
```bash
# Test individual modules
node src/csv-parser.js --test
node src/email-generator.js --test

# Test all modules
npm test
```

### Integration Testing
Run complete workflow with sample CSV:
```bash
npm start
# Use: examples/sample.csv
```

### Manual Testing Checklist
- [ ] Invalid CSV format handling
- [ ] Duplicate detection
- [ ] Existing mailbox handling
- [ ] Progress tracking accuracy
- [ ] Log file generation
- [ ] Report accuracy
- [ ] Error message clarity

## Deployment

### Prerequisites
1. Linux server with Plesk installed
2. SSH access with appropriate permissions
3. Node.js v14.0.0 or higher
4. Domain configured in Plesk

### Installation Steps
```bash
# Upload to server
scp -r plesk-email-generator user@server:/path/

# Install dependencies
ssh user@server
cd /path/plesk-email-generator
npm install

# Test Plesk CLI
plesk bin mail --help

# Run script
npm start
```

### Production Considerations
- Run with proper user permissions (may need sudo)
- Schedule via cron for automated processing
- Monitor log files for errors
- Backup before bulk operations
- Test with small CSV file first

## Future Enhancements

### Potential Improvements
1. **Parallel Processing**: Add option for concurrent mailbox creation
2. **Resume Capability**: Skip already processed students
3. **Web Interface**: Add HTTP API for remote control
4. **Email Notifications**: Send completion emails to administrators
5. **Database Integration**: Store results in database instead of JSON
6. **Password Complexity**: Enhance password generation rules
7. **Batch Processing**: Process multiple CSV files
8. **Dry-Run Mode**: Add full dry-run without Plesk interaction
9. **Rollback**: Add ability to delete created mailboxes
10. **Progress Persistence**: Save progress for long-running operations

## Troubleshooting

### Common Issues

**Issue**: Plesk CLI not available
- Check: `plesk version`
- Solution: Ensure running on Plesk server

**Issue**: Permission denied
- Check: `plesk bin mail --help`
- Solution: Run with sudo or adjust permissions

**Issue**: CSV validation fails
- Check: CSV format matches requirements
- Solution: Fix CSV data based on error messages

**Issue**: Mailbox already exists
- Check: logs/error.log for details
- Solution: Remove duplicates from CSV or skip existing accounts

## Maintenance

### Regular Tasks
1. Review error logs weekly
2. Archive old reports monthly
3. Update dependencies quarterly
4. Test with sample data before bulk operations
5. Backup critical data before large runs

### Log Management
```bash
# Archive logs
tar -czf logs-archive-$(date +%Y%m%d).tar.gz logs/

# Clear logs (done automatically by script)
rm -f logs/*.log report.json
```

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test after updates
npm test
```

## Conclusion

This architecture provides a robust, maintainable, and scalable solution for automated email account creation in Plesk. The modular design allows for easy testing, debugging, and future enhancements while maintaining clear separation of concerns.
