const fs = require('fs');
const csv = require('csv-parser');
const { isValidDegree } = require('./email-generator');

/**
 * CSV Parser Module
 * Handles CSV file reading, validation, and duplicate detection
 */

// Required CSV columns
const REQUIRED_FIELDS = ['full_name', 'degree', 'graduation_year', 'student_card_number'];

/**
 * Validate a single student record
 * 
 * @param {Object} student - Student record from CSV
 * @param {number} lineNumber - Line number in CSV (for error reporting)
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
function validateStudent(student, lineNumber) {
    const errors = [];

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
        if (!student[field] || student[field].trim() === '') {
            errors.push(`Line ${lineNumber}: Missing required field '${field}'`);
        }
    }

    // If missing required fields, return early
    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Validate degree
    const degree = student.degree.trim().toUpperCase();
    if (!isValidDegree(degree)) {
        errors.push(`Line ${lineNumber}: Invalid degree '${student.degree}'. Must be B, M, or P`);
    }

    // Validate graduation year (must be 4 digits)
    const year = student.graduation_year.trim();
    if (!/^\d{4}$/.test(year)) {
        errors.push(`Line ${lineNumber}: Invalid graduation year '${year}'. Must be 4 digits`);
    }

    // Validate student card number (must be numeric and at least 4 digits)
    const cardNumber = student.student_card_number.trim();
    if (!/^\d+$/.test(cardNumber)) {
        errors.push(`Line ${lineNumber}: Invalid student card number '${cardNumber}'. Must be numeric`);
    } else if (cardNumber.length < 4) {
        errors.push(`Line ${lineNumber}: Student card number '${cardNumber}' must be at least 4 digits`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Normalize student data (trim whitespace, uppercase degree)
 * 
 * @param {Object} student - Raw student data
 * @returns {Object} Normalized student data
 */
function normalizeStudent(student) {
    return {
        full_name: student.full_name.trim(),
        degree: student.degree.trim().toUpperCase(),
        graduation_year: student.graduation_year.trim(),
        student_card_number: student.student_card_number.trim()
    };
}

/**
 * Parse and validate CSV file
 * 
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Object>} Result object with students array and errors array
 */
function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const students = [];
        const errors = [];
        let lineNumber = 1; // Start at 1 (header is line 0)

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                lineNumber++;

                // Validate student
                const validation = validateStudent(row, lineNumber);

                if (validation.valid) {
                    const normalizedStudent = normalizeStudent(row);
                    students.push(normalizedStudent);
                } else {
                    errors.push(...validation.errors);
                }
            })
            .on('end', () => {
                resolve({ students, errors });
            })
            .on('error', (error) => {
                reject(new Error(`Failed to read CSV file: ${error.message}`));
            });
    });
}

/**
 * Detect duplicate emails in student list
 * 
 * @param {Array} emailAccounts - Array of email account objects
 * @returns {Array} Array of duplicate email addresses
 */
function detectDuplicates(emailAccounts) {
    const emailMap = new Map();
    const duplicates = [];

    for (const account of emailAccounts) {
        const email = account.email;

        if (emailMap.has(email)) {
            // Duplicate found
            if (!duplicates.includes(email)) {
                duplicates.push(email);
            }
        } else {
            emailMap.set(email, account);
        }
    }

    return duplicates;
}

/**
 * Parse CSV and return validated students with generated email data
 * 
 * @param {string} filePath - Path to CSV file
 * @param {string} universityCode - University code for email generation
 * @returns {Promise<Object>} Result with validated students and errors
 */
async function parseAndValidate(filePath, universityCode) {
    const { generateEmailAccount } = require('./email-generator');

    // Parse CSV
    const { students, errors } = await parseCSV(filePath);

    if (students.length === 0 && errors.length > 0) {
        return {
            success: false,
            students: [],
            errors,
            duplicates: []
        };
    }

    // Generate email accounts
    const emailAccounts = students.map(student =>
        generateEmailAccount(student, universityCode)
    );

    // Detect duplicates
    const duplicates = detectDuplicates(emailAccounts);

    if (duplicates.length > 0) {
        errors.push(`Found ${duplicates.length} duplicate email(s): ${duplicates.join(', ')}`);
    }

    return {
        success: errors.length === 0,
        students: emailAccounts,
        errors,
        duplicates
    };
}

// Test mode
if (require.main === module && process.argv.includes('--test')) {
    console.log('Running csv-parser tests...\n');

    // Test validation
    const testStudent1 = {
        full_name: 'John Doe',
        degree: 'B',
        graduation_year: '2024',
        student_card_number: '123456789012'
    };

    const testStudent2 = {
        full_name: '',
        degree: 'X',
        graduation_year: '24',
        student_card_number: 'abc'
    };

    console.log('Test 1: Valid student');
    const result1 = validateStudent(testStudent1, 2);
    console.log('  Valid:', result1.valid);
    console.log('  Errors:', result1.errors);

    console.log('\nTest 2: Invalid student');
    const result2 = validateStudent(testStudent2, 3);
    console.log('  Valid:', result2.valid);
    console.log('  Errors:', result2.errors);

    console.log('\n✓ Validation tests completed!');
}

module.exports = {
    parseCSV,
    parseAndValidate,
    validateStudent,
    detectDuplicates,
    normalizeStudent
};
