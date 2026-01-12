# Quick Reference Card - Plesk Email Generator v7.0.0

## CSV Format
```csv
full_name,degree,registration_date,years_to_graduate,student_card_number
```

## Degree Codes
| Code | Degree | Quota |
|------|--------|-------|
| B | Bachelor | 5 MB |
| M | Master | 15 MB |
| P | PhD | 20 MB |

## Email Format
```
{degree}{YY}{facultyCode}{last4digits}@student.alepuniv.edu.sy
```
Example: `B20IT9012@student.alepuniv.edu.sy`

## Password Format
```
{fullCardNumber}@ale&.com
```
Example: `123456789012@ale&.com`

## Commands

### Start Program
```bash
npm start
```

### Create Mode
1. Select option `1`
2. Enter Faculty Code (e.g., IT)
3. Enter CSV file path

### Delete Mode
1. Select option `2`
2. Enter Faculty Code (e.g., IT)
3. Enter Graduation Date (YYYY)

## Security Features
- ✓ Antivirus: Enabled automatically
- ✓ Spam Filter: Enabled automatically

## Files
- `logs/success.log` - Successful operations
- `logs/error.log` - Failed operations
- `report.json` - JSON summary

## Common Issues

**CSV validation failed**
→ Check all 5 columns exist with correct names

**Mailbox already exists**
→ Use delete mode or check for duplicates

**Plesk CLI not available**
→ Run on Plesk server with proper permissions

## Examples

### Valid CSV Entry
```csv
John Doe,B,2020,4,123456789012
```

### Email Pattern for Delete
```
B24IT####  (Bachelor, 2024 grad, IT faculty)
M24IT####  (Master, 2024 grad, IT faculty)
P24IT####  (PhD, 2024 grad, IT faculty)
```

## Need Help?
- README.md - Full documentation
- MIGRATION.md - Upgrade guide
- CHANGELOG.md - What changed
