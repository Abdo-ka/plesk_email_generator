# Changelog

All notable changes to the Plesk Email Account Generator project are documented in this file.

## [7.0.0] - 2026-01-13

### Added

#### New Features
- **Dual Operation Modes**: Script now offers two operation modes at startup:
  - Create mode: Create new email accounts from CSV
  - Delete mode: Delete emails by Faculty Code and graduation date
  
- **Delete Functionality**: 
  - Delete emails matching specific Faculty Code and graduation date
  - Pattern-based email filtering
  - Bulk deletion with progress tracking
  - Detailed deletion reports

- **CSV Registration Date Field**:
  - New required field: `registration_date` (YYYY format)
  - New required field: `years_to_graduate` (1-10 years)
  - Automatic graduation year calculation: `registration_date + years_to_graduate`

- **Security Features**:
  - Automatic antivirus activation for all created email accounts
  - Automatic antispam filter activation for all created email accounts
  - Spam messages moved to Spam folder (accessible via IMAP)

#### Changes

- **Email Format**:
  - Changed from 4-digit year to 2-digit year in email address
  - Old: `B2024IT9012@student.alepuniv.edu.sy`
  - New: `B24IT9012@student.alepuniv.edu.sy`

- **Terminology Updates**:
  - Changed "University Code" to "Faculty Code"
  - Changed "Faculty Abbr" usage throughout the codebase
  - More accurate terminology for university structure

- **Mailbox Quotas**:
  - Bachelor (B): 5 MB (unchanged)
  - Master (M): Changed from 25 MB to **15 MB**
  - PhD (P): Changed from 5 MB to **20 MB**

- **Email Description Format**:
  - Enhanced with registration date and calculated graduation year
  - Old: `Student: John Doe 2024 Bachelor`
  - New: `Student: John Doe Registration: 2020 Graduation: 2024 Bachelor`

#### Technical Improvements

- **prompts.js**:
  - Added `askOperationMode()` for mode selection
  - Added `collectCreateInputs()` for create mode
  - Added `collectDeleteInputs()` for delete mode
  - Refactored `collectInputs()` to handle both modes

- **plesk-client.js**:
  - Added `listMailboxes()` to retrieve all emails
  - Added `deleteMailbox()` for single email deletion
  - Added `deleteMailboxesByFilter()` for bulk deletion by criteria
  - Added antivirus activation command: `-antivirus in`
  - Added spam filter activation command: `-spam_filter on`

- **csv-parser.js**:
  - Updated required fields to include `registration_date` and `years_to_graduate`
  - Removed `graduation_year` as direct input (now calculated)
  - Enhanced validation for new fields
  - Updated `normalizeStudent()` to calculate graduation year

- **email-generator.js**:
  - Updated `generateEmail()` to use 2-digit year and registration date
  - Changed parameter from `universityCode` to `facultyCode`
  - Updated `generateDescription()` to include registration and graduation dates
  - Updated `QUOTA_MAP` with new quota values

- **index.js**:
  - Added mode handling for create and delete operations
  - Enhanced `displayConfig()` to show mode-specific information
  - Integrated delete workflow with progress tracking
  - Added delete statistics and reporting

#### Documentation

- **README.md**:
  - Complete rewrite with new features
  - Added Delete Mode section
  - Updated CSV Format section with new fields
  - Added Security Features section
  - Updated Email Generation Rules
  - Enhanced Troubleshooting section
  - Updated all examples to new format

- **CHANGELOG.md**:
  - New file documenting all changes

### Breaking Changes

⚠️ **CSV Format Changed** - Existing CSV files must be updated:
- Add `registration_date` column (YYYY format)
- Add `years_to_graduate` column (1-10)
- Remove `graduation_year` column (now calculated)

⚠️ **Email Format Changed** - Email addresses now use 2-digit year:
- Old emails: `B2024ALEP9012@...`
- New emails: `B24ALEP9012@...`
- This change affects delete operations and email pattern matching

⚠️ **Function Signatures Changed**:
- `generateEmail(student, universityCode)` → `generateEmail(student, facultyCode)`
- `parseAndValidate(filePath, universityCode)` → `parseAndValidate(filePath, facultyCode)`
- All functions updated to use `facultyCode` instead of `universityCode`

### Migration Guide

#### Updating Existing CSV Files

1. Add new columns to your CSV:
```csv
full_name,degree,registration_date,years_to_graduate,student_card_number
```

2. For existing data with `graduation_year`:
   - Calculate `registration_date` = `graduation_year` - typical degree duration
   - Set `years_to_graduate` to typical degree duration
   - Example: Bachelor graduating 2024 → registered 2020, 4 years to graduate

#### Updating Scripts/Code

If you have custom scripts using this tool:

1. Update prompts:
   - Old: Ask for "University Code"
   - New: Ask for "Faculty Code"

2. Update email patterns:
   - Old: `{degree}{YYYY}{code}...`
   - New: `{degree}{YY}{code}...`

3. Update API calls:
   - Replace `universityCode` parameter with `facultyCode`

### Security Notes

- All newly created email accounts now have antivirus protection enabled
- Spam filtering is automatically activated for all accounts
- These security features cannot be disabled during creation (intentional)

### Known Issues

None at this time.

### Acknowledgments

- Security features inspired by Plesk best practices
- Delete functionality requested by university administrators
- CSV improvements based on real-world usage feedback

---

## [6.0.0] - Previous Version

Previous stable version with basic create functionality.

### Features
- CSV-based email creation
- Email and password generation
- Logging and reporting
- Progress tracking
- Duplicate detection

---

For older versions, see git history.
