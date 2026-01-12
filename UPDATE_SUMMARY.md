# Plesk Email Generator v7.0.0 - Update Summary

## Executive Summary

The Plesk Email Generator has been significantly enhanced with new features, improved functionality, and better security. This document provides a comprehensive overview of all changes made in version 7.0.0.

## Major Updates

### 1. Dual Operation Modes ✨

The program now offers two operation modes at startup:

**Create Mode:**
- Creates new email accounts from CSV data
- Validates student information
- Generates unique email addresses and passwords
- Automatically enables security features

**Delete Mode:**
- Deletes emails by Faculty Code and graduation date
- Bulk deletion with pattern matching
- Safe filtering to prevent accidental deletions
- Detailed deletion reports

### 2. Enhanced CSV Format 📊

**New CSV Structure:**
```csv
full_name,degree,registration_date,years_to_graduate,student_card_number
John Doe,B,2020,4,123456789012
```

**Key Changes:**
- Added `registration_date` field (YYYY format)
- Added `years_to_graduate` field (1-10 years)
- Removed `graduation_year` (now calculated automatically)
- Graduation year = registration_date + years_to_graduate

**Benefits:**
- More accurate student records
- Tracks actual registration dates
- Flexible graduation timeline
- Better data management

### 3. Updated Email Format 📧

**New Email Pattern:**
```
{degree}{YY}{facultyCode}{last4digits}@student.alepuniv.edu.sy
```

**Example:**
- Old: `B2024ALEP9012@student.alepuniv.edu.sy`
- New: `B20IT9012@student.alepuniv.edu.sy`

**Changes:**
- 2-digit year instead of 4-digit
- Faculty Code instead of University Code
- More concise email addresses
- Year represents registration date

### 4. Built-in Security Features 🔒

All created email accounts automatically include:

**Antivirus Protection:**
- Enabled by default
- Scans incoming messages
- Blocks emails with viruses
- Configured via: `plesk bin mail -u email -antivirus in`

**Spam Filtering:**
- Enabled by default
- Moves spam to Spam folder
- Accessible via IMAP/webmail
- Configured via: `plesk bin mail -u email -spam_filter on`

**Benefits:**
- Immediate protection for all accounts
- No manual configuration needed
- Consistent security across all mailboxes
- Follows Plesk best practices

### 5. Updated Mailbox Quotas 💾

**New Quota Allocation:**
- Bachelor (B): 5 MB (unchanged)
- Master (M): 15 MB ⬇️ (was 25 MB)
- PhD (P): 20 MB ⬆️ (was 5 MB)

**Rationale:**
- Better alignment with actual usage patterns
- More appropriate for degree levels
- Optimized storage allocation

### 6. Improved Terminology 🏫

**Updated References:**
- "University Code" → "Faculty Code"
- More accurate institutional terminology
- Better reflects organizational structure
- Examples: IT, ENG, MED, LAW, SCI

### 7. Enhanced Email Descriptions 📝

**New Description Format:**
```
Student: John Doe Registration: 2020 Graduation: 2024 Bachelor
```

**Includes:**
- Student full name
- Registration date
- Calculated graduation date
- Degree type

**Benefits:**
- Comprehensive account information
- Easy identification in Plesk
- Audit trail of student lifecycle
- Better account management

## Technical Implementation

### Modified Files

1. **src/prompts.js**
   - Added operation mode selection
   - Separate input collection for create/delete
   - Enhanced validation

2. **src/plesk-client.js**
   - Added `listMailboxes()` function
   - Added `deleteMailbox()` function
   - Added `deleteMailboxesByFilter()` function
   - Integrated antivirus command
   - Integrated spam filter command

3. **src/csv-parser.js**
   - Updated required fields
   - Added registration_date validation
   - Added years_to_graduate validation
   - Enhanced normalizeStudent() with calculation

4. **src/email-generator.js**
   - Updated generateEmail() for 2-digit year
   - Changed universityCode → facultyCode
   - Updated QUOTA_MAP values
   - Enhanced generateDescription()

5. **src/index.js**
   - Added mode handling logic
   - Integrated delete workflow
   - Enhanced configuration display
   - Updated progress tracking

### New Files

1. **CHANGELOG.md**
   - Comprehensive change documentation
   - Version history
   - Breaking changes highlighted
   - Migration guidance

2. **MIGRATION.md**
   - Step-by-step upgrade guide
   - CSV conversion examples
   - Troubleshooting tips
   - Verification checklist

3. **examples/sample.csv**
   - Updated with new format
   - Real-world examples
   - All required fields

### Updated Documentation

1. **README.md**
   - Complete rewrite
   - New features documented
   - Usage examples for both modes
   - Security features section
   - Enhanced troubleshooting

2. **package.json**
   - Version bumped to 7.0.0
   - Updated description
   - New keywords added

## Usage Examples

### Create Mode Example

```bash
$ npm start

Operation Mode Selection
  1. Create email accounts
  2. Delete email accounts

Select operation mode (1 or 2): 1

Create Mode Configuration

Enter Faculty Code (e.g., IT, ENG): IT
Enter CSV file path: ./data/students.csv

Configuration Summary:
  Operation:        CREATE
  Faculty Code:     IT
  CSV File:         ./data/students.csv

✓ Testing Plesk CLI availability
✓ CSV validated successfully - 50 students found

Creating 50 email accounts...

✓ John Doe - B20IT9012@student.alepuniv.edu.sy
✓ Jane Smith - M22IT1098@student.alepuniv.edu.sy
...

All operations completed successfully!
```

### Delete Mode Example

```bash
$ npm start

Operation Mode Selection
  1. Create email accounts
  2. Delete email accounts

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
  Total found:      15
  Deleted:          15
  Failed:           0

✓ Deleted: B24IT9012@student.alepuniv.edu.sy
...

All deletions completed successfully!
```

## Security Considerations

### Antivirus Protection
- Protects against email-borne viruses
- Automatic scanning of incoming messages
- Critical for student account safety

### Spam Filtering
- Reduces inbox clutter
- Moves suspicious emails to Spam folder
- Students can review and recover false positives
- Improves email experience

### Implementation
Both features are enabled automatically during account creation. No additional configuration or manual steps required.

## Performance Impact

- **CSV Processing:** No significant change
- **Email Creation:** Slight increase due to security commands (~0.5s per email)
- **Delete Operations:** Fast pattern-based filtering
- **Overall:** Minimal performance impact for typical workloads

## Breaking Changes Summary

⚠️ **Important:** Version 7.0.0 introduces breaking changes

1. **CSV Format:** Old CSV files will not work
2. **Email Format:** New format uses 2-digit year
3. **API Changes:** Function parameters updated
4. **Terminology:** universityCode → facultyCode

**Migration Required:** See [MIGRATION.md](MIGRATION.md)

## Benefits

### For Administrators
- ✅ Dual operation modes (create & delete)
- ✅ Better bulk management
- ✅ Automatic security configuration
- ✅ Improved tracking with registration dates
- ✅ Enhanced reporting

### For Students
- ✅ Protected mailboxes from day one
- ✅ Spam filtering enabled
- ✅ Appropriate storage quotas
- ✅ Cleaner email addresses

### For Institution
- ✅ Better compliance and security
- ✅ Accurate student lifecycle tracking
- ✅ Efficient email management
- ✅ Reduced manual configuration

## Testing Recommendations

Before production use:

1. **Test CSV Conversion**
   - Convert sample CSV
   - Validate with small batch
   - Verify calculated graduation dates

2. **Test Email Creation**
   - Create 2-3 test accounts
   - Verify email format
   - Check security settings in Plesk
   - Confirm quotas are correct

3. **Test Delete Mode**
   - Create test accounts
   - Use delete mode with specific criteria
   - Verify correct accounts deleted
   - Check logs for accuracy

4. **Test Edge Cases**
   - Invalid CSV data
   - Duplicate entries
   - Existing mailboxes
   - Network issues

## Rollback Strategy

If issues arise:

```bash
# Rollback to v6.0.0
git checkout v6.0.0
npm install

# Restore old CSV format
# Use backed-up CSV files
```

**Important:** Always backup CSV files before migration!

## Future Enhancements

Potential future improvements:
- Web-based interface
- Database integration
- Email templates
- Batch operations from API
- Advanced filtering options
- Student self-service portal

## Support

For assistance:
- Review [README.md](README.md) for usage guide
- Check [MIGRATION.md](MIGRATION.md) for upgrade help
- See [CHANGELOG.md](CHANGELOG.md) for detailed changes
- Open GitHub issue for bugs/questions

## Conclusion

Version 7.0.0 represents a significant evolution of the Plesk Email Generator. The new features provide powerful capabilities while maintaining the simplicity and reliability that made v6.0.0 successful. With careful migration planning, the upgrade process should be smooth and beneficial.

**Recommended Action:** Test thoroughly with sample data, then gradually migrate production CSV files.

---

**Version:** 7.0.0  
**Release Date:** January 2026  
**Status:** Production Ready  
**Author:** Abdo Ka
