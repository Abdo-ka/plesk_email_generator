# Plesk Email Generator v7.0.0 - Workflow Diagram

## Program Flow

```
┌─────────────────────────────────────────┐
│         START PROGRAM                    │
│         npm start                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    OPERATION MODE SELECTION              │
│                                          │
│    1. Create email accounts              │
│    2. Delete email accounts              │
└────────────┬────────────────┬───────────┘
             │                │
    ┌────────▼─────┐    ┌────▼─────────┐
    │   CREATE     │    │   DELETE     │
    │   MODE       │    │   MODE       │
    └────────┬─────┘    └────┬─────────┘
             │                │
             │                │
    ┌────────▼─────────┐     ▼
    │ Input:           │  ┌──────────────────┐
    │ - Faculty Code   │  │ Input:           │
    │ - CSV File Path  │  │ - Faculty Code   │
    └────────┬─────────┘  │ - Graduation     │
             │            │   Date (YYYY)    │
             │            └─────┬────────────┘
             │                  │
    ┌────────▼─────────┐       │
    │ Test Plesk CLI   │       │
    └────────┬─────────┘       │
             │                  │
    ┌────────▼─────────┐  ┌────▼────────────┐
    │ Parse & Validate │  │ Test Plesk CLI  │
    │ CSV File         │  └────┬────────────┘
    └────────┬─────────┘       │
             │            ┌────▼────────────┐
             │            │ List All        │
             │            │ Mailboxes       │
             │            └────┬────────────┘
             │                 │
    ┌────────▼─────────┐  ┌───▼─────────────┐
    │ Generate Email   │  │ Filter by       │
    │ Accounts:        │  │ Pattern:        │
    │ - B20IT9012@...  │  │ {degree}{YY}    │
    │ - M22IT1098@...  │  │ {facultyCode}   │
    └────────┬─────────┘  └───┬─────────────┘
             │                │
    ┌────────▼─────────┐  ┌───▼─────────────┐
    │ Create Mailboxes │  │ Delete Filtered │
    │ with:            │  │ Mailboxes       │
    │ - Password       │  └───┬─────────────┘
    │ - Quota          │      │
    │ - Description    │      │
    └────────┬─────────┘      │
             │                │
    ┌────────▼─────────┐      │
    │ Enable Security: │      │
    │ - Antivirus      │      │
    │ - Spam Filter    │      │
    └────────┬─────────┘      │
             │                │
             │                │
    ┌────────▼────────────────▼──────┐
    │ Generate Logs & Reports        │
    │ - success.log                  │
    │ - error.log                    │
    │ - report.json                  │
    └────────┬───────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         COMPLETE                         │
│         Exit with status code            │
└─────────────────────────────────────────┘
```

## CSV Processing Flow (Create Mode)

```
┌─────────────────────────────────────────┐
│ CSV File (students.csv)                  │
│ ┌─────────────────────────────────────┐ │
│ │ full_name                           │ │
│ │ degree                              │ │
│ │ registration_date                   │ │
│ │ years_to_graduate                   │ │
│ │ student_card_number                 │ │
│ └─────────────────────────────────────┘ │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Parse CSV                                │
│ - Read rows                              │
│ - Validate each field                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Normalize Data                           │
│ - Trim whitespace                        │
│ - Convert degree to uppercase            │
│ - Calculate: graduation = reg + years    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Generate Email Account                   │
│                                          │
│ Input:                                   │
│   Registration: 2020                     │
│   Years: 4                               │
│   Faculty: IT                            │
│   Card: 123456789012                     │
│                                          │
│ Generated:                               │
│   Email: B20IT9012@student.alepuniv...   │
│   Password: 123456789012@ale&.com        │
│   Quota: 5 MB                            │
│   Graduation: 2024                       │
│   Description: Student: John Doe...      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Create in Plesk                          │
│ 1. Check if exists                       │
│ 2. Create mailbox                        │
│ 3. Set description                       │
│ 4. Enable antivirus                      │
│ 5. Enable spam filter                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Log Result                               │
│ - success.log (if successful)            │
│ - error.log (if failed)                  │
└─────────────────────────────────────────┘
```

## Delete Workflow

```
┌─────────────────────────────────────────┐
│ Input:                                   │
│ - Faculty Code: IT                       │
│ - Graduation Date: 2024                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Calculate Pattern                        │
│ Year: 2024 → 24 (last 2 digits)         │
│ Pattern: ^[BMP]24IT.*                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ List All Mailboxes                       │
│ plesk bin mail --list domain             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Filter Matching Emails                   │
│ ✓ B24IT9012@...                          │
│ ✓ B24IT9013@...                          │
│ ✗ B25IT9012@... (wrong year)             │
│ ✗ B24ENG9012@... (wrong faculty)         │
│ ✓ M24IT1098@...                          │
│ ✓ P24IT3456@...                          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Delete Each Match                        │
│ plesk bin mail --remove email            │
│ Progress: 1/5, 2/5, 3/5...               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Summary Report                           │
│ Total found: 5                           │
│ Deleted: 5                               │
│ Failed: 0                                │
└─────────────────────────────────────────┘
```

## Security Configuration Flow

```
┌─────────────────────────────────────────┐
│ Email Created                            │
│ B20IT9012@student.alepuniv.edu.sy       │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │   Configure     │
        │   Security      │
        └────────┬────────┘
                 │
        ┌────────▼─────────────────────┐
        │                              │
   ┌────▼────┐              ┌──────▼──────┐
   │Antivirus│              │ Spam Filter │
   └────┬────┘              └──────┬──────┘
        │                          │
        ▼                          ▼
   ┌─────────────────┐    ┌─────────────────┐
   │ plesk bin mail  │    │ plesk bin mail  │
   │ -u email        │    │ -u email        │
   │ -antivirus in   │    │ -spam_filter on │
   └────┬────────────┘    └──────┬──────────┘
        │                        │
        └────────┬───────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Mailbox Protected                        │
│ ✓ Antivirus: Enabled                     │
│ ✓ Spam Filter: Enabled                   │
│ ✓ Spam → Spam Folder                     │
└─────────────────────────────────────────┘
```

## Email Format Breakdown

```
B  20  IT  9012  @student.alepuniv.edu.sy
│  │   │   │    │
│  │   │   │    └─ Domain (constant)
│  │   │   └────── Last 4 digits of card
│  │   └────────── Faculty Code (IT, ENG, etc.)
│  └────────────── Registration Year (2-digit)
└───────────────── Degree Code (B/M/P)

Example Values:
- Degree: B (Bachelor)
- Registration: 2020 → 20
- Faculty: IT
- Card: 123456789012 → 9012
- Result: B20IT9012@student.alepuniv.edu.sy
```

## Data Flow Summary

```
CSV Input → Parse → Validate → Calculate → Generate → Create → Secure → Log
     │         │        │          │          │         │        │       │
     │         │        │          │          │         │        │       └─→ Logs
     │         │        │          │          │         │        └─────→ Security
     │         │        │          │          │         └──────────→ Plesk
     │         │        │          │          └────────────────→ Email Data
     │         │        │          └───────────────────────→ Graduation
     │         │        └──────────────────────────────→ Validation
     │         └───────────────────────────────────→ Student Records
     └─────────────────────────────────────────→ Raw Data
```

---

**Version:** 7.0.0  
**Diagram Type:** Workflow & Data Flow  
**Purpose:** Visual reference for program execution
