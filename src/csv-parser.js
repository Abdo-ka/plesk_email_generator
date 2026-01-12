const fs = require('fs');
const csv = require('csv-parser');
const { isValidDegree } = require('./email-generator');

/**
 * CSV Parser Module
 * ==================
 * 
 * Responsible for reading, parsing, validating, and processing CSV files.
 * Handles student record validation with detailed error reporting.
 * 
 * Features:
 * - CSV file reading and parsing using csv-parser library
 * - Individual student record validation with line-number reporting
 * - Student data normalization (trimming, case conversion)
 * - Duplicate email detection across student list
 * - Comprehensive error reporting with specific validation messages
 * 
 * Validation Rules:
 * - All required fields must be present and non-empty
 * - Degree must be B, M, or P
 * - Graduation year must be exactly 4 digits
 * - Student card number must be numeric and at least 4 digits
 * 
 * @module csv-parser
 */

// Required CSV columns - must be present in CSV file
const REQUIRED_FIELDS = ['full_name', 'degree', 'graduation_year', 'student_card_number'];

/**
 * Validate a single student record
 * 
 * Performs comprehensive validation on a student record:
 * 1. Checks all required fields are present and non-empty
 * 2. Validates degree code (B, M, or P)
 * 3. Validates graduation year (4 digits)
 * 4. Validates student card number (numeric, 4+ digits)
 * 
 * @param {Object} student - Student record from CSV
 * @param {string} student.full_name - Student's full name
 * @param {string} student.degree - Degree code (B/M/P)
 * @param {string} student.graduation_year - Graduation year (4 digits)
 * @param {string} student.student_card_number - Student card number
 * @param {number} lineNumber - Line number in CSV file (for error reporting)
 * 
 * @returns {Object} Validation result object:
 *   - valid {boolean} - True if all validations passed
 *   - errors {Array<string>} - Array of error messages (empty if valid)
 * 
 * @example
 * const student = { full_name: 'John Doe', degree: 'B', graduation_year: '2024', student_card_number: '123456789012' };
 * const result = validateStudent(student, 2);
 * // Returns: { valid: true, errors: [] }
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
 * Normalize student data
 * 
 * Cleans and standardizes student record:
 * - Trims whitespace from all fields
 * - Converts degree to uppercase
 * 
 * @param {Object} student - Raw student data from CSV
 * @returns {Object} Normalized student data ready for processing
 * 
 * @example
 * const raw = { full_name: '  John Doe  ', degree: 'b', graduation_year: '2024', student_card_number: '123456789012' };
 * const normalized = normalizeStudent(raw);
 * // Returns: { full_name: 'John Doe', degree: 'B', graduation_year: '2024', student_card_number: '123456789012' }
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
 * Reads CSV file and parses into student records.
 * Validates each row and collects any validation errors.
 * Uses csv-parser library for streaming CSV parsing.
 * 
 * @param {string} filePath - Absolute or relative path to CSV file
 * 
 * @returns {Promise<Object>} Result object:
 *   - students {Array<Object>} - Array of valid, normalized student records
 *   - errors {Array<string>} - Array of validation error messages with line numbers
 * 
 * @throws {Error} If CSV file cannot be read or is malformed
 * 
 * @example
 * const result = await parseCSV('./data/students.csv');
 * console.log(`Found ${result.students.length} valid students`);
 * console.log(`Found ${result.errors.length} validation errors`);
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
 * Scans through generated email accounts and identifies any duplicate
 * email addresses. This catches cases where multiple students would
 * generate the same email (e.g., same degree, year, and last 4 card digits).
 * 
 * @param {Array<Object>} emailAccounts - Array of email account objects, each with an 'email' property
 * 
 * @returns {Array<string>} Array of duplicate email addresses (each duplicate listed once)
 * 
 * @example
 * const accounts = [
 *   { email: 'B2024ALEP9012@alepuniv.edu.sy', ... },
 *   { email: 'B2024ALEP9012@alepuniv.edu.sy', ... },  // Duplicate
 *   { email: 'M2025ALEP1234@alepuniv.edu.sy', ... }
 * ];
 * const dupes = detectDuplicates(accounts);
 * // Returns: ['B2024ALEP9012@alepuniv.edu.sy']
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
 * Complete validation pipeline that:
 * 1. Parses CSV file
 * 2. Validates all student records
 * 3. Generates email accounts for valid students
 * 4. Detects duplicate emails
 * 5. Returns success status with all data and errors
 * 
 * This is the main entry point for CSV processing.
 * 
 * @param {string} filePath - Path to CSV file
 * @param {string} universityCode - University code for email address generation (e.g., 'ALEP')
 * 
 * @returns {Promise<Object>} Complete validation result:
 *   - success {boolean} - True if no errors found
 *   - students {Array<Object>} - Array of email account objects ready for creation
 *   - errors {Array<string>} - All validation and duplicate errors
 *   - duplicates {Array<string>} - List of duplicate email addresses
 * 
 * @example
 * const result = await parseAndValidate('./students.csv', 'ALEP');
 * if (result.success) {
 *   console.log(`Ready to create ${result.students.length} accounts`);
 * } else {
 *   console.error('Validation failed:', result.errors);
 * }
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
