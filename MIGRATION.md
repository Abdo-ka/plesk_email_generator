# Migration Guide: v6.0.0 → v7.0.0

This guide helps you upgrade from version 6.0.0 to 7.0.0 of the Plesk Email Account Generator.

## Overview of Changes

Version 7.0.0 introduces significant improvements:
- ✅ Dual operation modes (Create & Delete)
- ✅ New CSV format with registration date
- ✅ 2-digit year in email addresses
- ✅ Automatic antivirus and antispam protection
- ✅ Updated mailbox quotas
- ✅ Faculty Code terminology

## Breaking Changes

### 1. CSV Format Changed

**Old CSV Format (v6.0.0):**
```csv
full_name,degree,graduation_year,student_card_number
John Doe,B,2024,123456789012
```

**New CSV Format (v7.0.0):**
```csv
full_name,degree,registration_date,years_to_graduate,student_card_number
John Doe,B,2020,4,123456789012
```

### 2. Email Format Changed

**Old Format:**
```
B2024IT9012@student.alepuniv.edu.sy
   ^^^^
   4 digits
```

**New Format:**
```
B24IT9012@student.alepuniv.edu.sy
  ^^
  2 digits (from registration year)
```

### 3. Terminology Changed

- "University Code" → "Faculty Code"
- Prompts now ask for "Faculty Code" (e.g., IT, ENG, MED)

## Step-by-Step Migration

### Step 1: Update Your CSV Files

You have two options:

#### Option A: Convert Existing CSV (Recommended)

If you have graduation year and know the typical program duration:

```python
# Python script to convert CSV
import pandas as pd

# Read old CSV
df = pd.read_csv('old_students.csv')

# Add new columns
# Assuming Bachelor = 4 years, Master = 2 years, PhD = 5 years
def calculate_registration(row):
    duration = {'B': 4, 'M': 2, 'P': 5}
    return int(row['graduation_year']) - duration.get(row['degree'], 4)

def get_duration(degree):
    return {'B': 4, 'M': 2, 'P': 5}.get(degree, 4)

df['registration_date'] = df.apply(calculate_registration, axis=1)
df['years_to_graduate'] = df['degree'].apply(get_duration)

# Drop old column
df = df.drop('graduation_year', axis=1)

# Save new CSV
df.to_csv('new_students.csv', index=False)
```

Or using Excel:
1. Open your CSV in Excel
2. Add columns `registration_date` and `years_to_graduate`
3. Calculate registration_date:
   - For Bachelor: `graduation_year - 4`
   - For Master: `graduation_year - 2`
   - For PhD: `graduation_year - 5`
4. Set years_to_graduate: 4 for B, 2 for M, 5 for P
5. Delete `graduation_year` column
6. Save as CSV

#### Option B: Create New CSV

Start fresh with the new format:

```csv
full_name,degree,registration_date,years_to_graduate,student_card_number
John Doe,B,2020,4,123456789012
Jane Smith,M,2022,2,987654321098
Alice Johnson,P,2019,5,456789123456
```

### Step 2: Update Your Scripts

If you have custom scripts that call this tool:

**Old Code:**
```bash
# Old prompts
echo "ALEP" | node src/index.js
```

**New Code:**
```bash
# New prompts - choose mode first
echo -e "1\nIT" | node src/index.js
```

**Old API Usage:**
```javascript
const { parseAndValidate } = require('./csv-parser');
const result = await parseAndValidate('./data.csv', 'ALEP');
```

**New API Usage:**
```javascript
const { parseAndValidate } = require('./csv-parser');
const result = await parseAndValidate('./data.csv', 'IT');  // Faculty Code
```

### Step 3: Install New Version

```bash
# Pull latest changes
git pull origin main

# Install dependencies (if changed)
npm install

# Verify installation
npm start
```

### Step 4: Test with Sample Data

Before processing real data:

1. Create a test CSV with 2-3 entries
2. Run in create mode
3. Verify emails are created correctly
4. Check email format: `B{YY}{FACULTY}{####}@...`
5. Verify antivirus and antispam are enabled in Plesk

## New Features You Can Use

### Delete Mode

New functionality to bulk delete emails:

```bash
npm start
# Select option 2 (Delete)
# Enter Faculty Code: IT
# Enter Graduation Date: 2024
# Confirms before deletion
```

This will delete all emails matching:
- `B24IT####@student.alepuniv.edu.sy`
- `M24IT####@student.alepuniv.edu.sy`
- `P24IT####@student.alepuniv.edu.sy`

### Automatic Security

All new emails automatically have:
- ✅ Antivirus protection enabled
- ✅ Spam filter enabled (moves to Spam folder)

No configuration needed!

### Updated Quotas

New mailbox sizes:
- Bachelor: 5 MB (unchanged)
- Master: 15 MB (was 25 MB)
- PhD: 20 MB (was 5 MB)

## Troubleshooting Migration

### Issue: CSV validation fails

**Error:** "Missing required field 'registration_date'"

**Solution:** Your CSV still uses the old format. Update it following Step 1 above.

### Issue: Old emails exist with different format

**Problem:** You have old emails like `B2024IT9012@...` and want to create new ones like `B24IT9012@...`

**Solution:** Both can coexist. The new format uses only 2 digits. If you want to clean up old emails:
1. Document all old email patterns
2. Use Delete mode carefully
3. Recreate with new format

### Issue: Faculty Code confusion

**Problem:** Not sure what Faculty Code to use

**Solution:** 
- Use your faculty/department abbreviation
- Examples: IT, ENG, MED, LAW, SCI
- Keep it short (2-4 characters recommended)
- Use uppercase for consistency

### Issue: Years to graduate calculation

**Problem:** Not sure what value to use for `years_to_graduate`

**Solution:**
- Bachelor programs: Typically 4 years
- Master programs: Typically 2 years
- PhD programs: Typically 4-6 years
- Use your institution's standard program duration

## Rollback Plan

If you need to rollback to v6.0.0:

```bash
# Checkout previous version
git checkout v6.0.0

# Reinstall dependencies
npm install

# Restore old CSV format if you converted it
# (Keep backups of your original CSV files!)
```

## Support

If you encounter issues during migration:

1. Check the [CHANGELOG.md](CHANGELOG.md) for detailed changes
2. Review the [README.md](README.md) for updated documentation
3. Create an issue on GitHub with:
   - Your CSV format (sanitized)
   - Error messages
   - Steps to reproduce

## Verification Checklist

After migration, verify:

- [ ] CSV file has all 5 required columns
- [ ] CSV validation passes
- [ ] Emails are created with 2-digit year format
- [ ] Email descriptions show registration and graduation dates
- [ ] Antivirus is enabled in Plesk
- [ ] Spam filter is enabled in Plesk
- [ ] Quotas are correct (B:5MB, M:15MB, P:20MB)
- [ ] Delete mode works (test with test account)
- [ ] Logs are generated correctly

## Conclusion

Version 7.0.0 brings powerful new features while maintaining reliability. The migration is straightforward if you follow these steps carefully. Always test with sample data before processing real student records!

---

**Questions?** Open an issue on GitHub or contact the development team.
