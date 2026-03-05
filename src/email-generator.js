/**
 * Email Generator Module
 * =======================
 * 
 * Responsible for generating email addresses, passwords, and account metadata
 * according to university business rules.
 * 
 * Email Format: {degree}{year}{universityCode}{last4CardDigits}@student.alepuniv.edu.sy
 * Password Format: {fullCardNumber}@ale&.com
 * 
 * Business Rules:
 * - Bachelor (B) accounts: 5MB quota
 * - Master (M) accounts: 25MB quota
 * - PhD (P) accounts: 5MB quota
 * 
 * Domain: student.alepuniv.edu.sy (configured as constant)
 * 
 * @module email-generator
 */

const DOMAIN = 'student.alepuniv.edu.sy';

// Degree to full name mapping
const DEGREE_NAMES = {
    'B': 'Bachelor',
    'M': 'Master',
    'P': 'PhD'
};

// Quota mapping (in MB)
const QUOTA_MAP = {
    'B': 5,
    'M': 15,
    'P': 20
};

/**
 * Generate email address based on student data
 * 
 * Creates email address following the pattern:
 * {degree}{registrationYearLast2Digits}{facultyCode}{last4CardDigits}@student.alepuniv.edu.sy
 * 
 * Example:
 * - Degree: B (Bachelor)
 * - Registration Date: 2020 (becomes 20)
 * - Faculty: IT
 * - Card: 123456789012 (last 4 digits: 9012)
 * - Result: B20IT9012@student.alepuniv.edu.sy
 * 
 * @param {Object} student - Student data object
 * @param {string} student.degree - Degree code (B/M/P)
 * @param {string} student.registration_date - Registration year (4 digits)
 * @param {string} student.student_card_number - Full student card number (minimum 4 digits)
 * @param {string} facultyCode - Faculty code (e.g., 'IT', 'ENG')
 * 
 * @returns {string} Complete email address
 * 
 * @example
 * const student = { degree: 'B', registration_date: '2020', student_card_number: '123456789012' };
 * const email = generateEmail(student, 'IT');
 * // Returns: 'B20IT9012@student.alepuniv.edu.sy'
 */
function generateEmail(student, facultyCode) {
    const { degree, registration_date, student_card_number } = student;

    // Get last 2 digits of registration year
    const yearShort = registration_date.slice(-2);

    // Get last 4 digits of card number
    const last4Digits = student_card_number.slice(-4);

    // Build email: degree + 2-digit year + faculty code + last 4 digits
    const localPart = `${degree}${yearShort}${facultyCode}${last4Digits}`;

    return `${localPart}@${DOMAIN}`;
}

/**
 * Generate password based on student card number
 * 
 * Creates password following the pattern:
 * {fullStudentCardNumber}@ale&.com
 * 
 * Uses full card number for security, with special characters
 * for password strength.
 * 
 * @param {string} studentCardNumber - Full student card number (all digits)
 * 
 * @returns {string} Generated password
 * 
 * @example
 * const password = generatePassword('123456789012');
 * // Returns: '123456789012@ale&.com'
 */
function generatePassword(studentCardNumber) {
    return `${studentCardNumber}@ale&.com`;
}

/**
 * Get quota in MB based on degree
 * 
 * Returns mailbox quota according to business rules:
 * - Bachelor (B): 5 MB
 * - Master (M): 15 MB
 * - PhD (P): 20 MB
 * - Unknown: 5 MB (default fallback)
 * 
 * @param {string} degree - Degree code (B/M/P)
 * 
 * @returns {number} Quota in megabytes
 * 
 * @example
 * const quota = getQuota('M');
 * // Returns: 15
 */
function getQuota(degree) {
    return QUOTA_MAP[degree] || 5; // Default to 5MB if unknown
}

/**
 * Generate description for email account
 * 
 * Creates human-readable description for Plesk mailbox.
 * Format: Student: {full_name} Registration: {registration_date} Graduation: {graduation_year} {degree_full_name}
 * 
 * Converts degree code to full degree name:
 * - B becomes Bachelor
 * - M becomes Master
 * - P becomes PhD
 * 
 * @param {Object} student - Student data object
 * @param {string} student.full_name - Student's full name
 * @param {string} student.registration_date - Registration year
 * @param {string} student.graduation_year - Graduation year (calculated)
 * @param {string} student.degree - Degree code (B/M/P)
 * 
 * @returns {string} Formatted description string
 * 
 * @example
 * const student = { full_name: 'John Doe', registration_date: '2020', graduation_year: '2024', degree: 'B' };
 * const desc = generateDescription(student);
 * // Returns: 'Student: John Doe Registration: 2020 Graduation: 2024 Bachelor'
 */
function generateDescription(student) {
    const { full_name, registration_date, graduation_year, degree } = student;
    const degreeName = DEGREE_NAMES[degree] || degree;

    return `Student: ${full_name} Registration: ${registration_date} Graduation: ${graduation_year} ${degreeName}`;
}

/**
 * Generate complete email account data for a student
 * 
 * Master function that generates all data needed to create a mailbox:
 * - Email address
 * - Password
 * - Mailbox quota
 * - Account description
 * - Student metadata
 * 
 * This is the primary function used by the CSV parser.
 * 
 * @param {Object} student - Student data object
 * @param {string} student.full_name - Student's full name
 * @param {string} student.degree - Degree code (B/M/P)
 * @param {string} student.registration_date - Registration year (4 digits)
 * @param {string} student.graduation_year - Graduation year (4 digits, calculated)
 * @param {string} student.student_card_number - Full student card number
 * @param {string} facultyCode - Faculty code for email generation
 * 
 * @returns {Object} Complete email account object:
 *   - email {string} - Generated email address
 *   - password {string} - Generated password
 *   - quota {number} - Mailbox quota in MB
 *   - description {string} - Account description
 *   - student {Object} - Normalized student data
 * 
 * @example
 * const student = {
 *   full_name: 'John Doe',
 *   degree: 'B',
 *   registration_date: '2020',
 *   graduation_year: '2024',
 *   student_card_number: '123456789012'
 * };
 * const account = generateEmailAccount(student, 'IT');
 * // Returns: {
 * //   email: 'B20IT9012@student.alepuniv.edu.sy',
 * //   password: '123456789012@ale&.com',
 * //   quota: 5,
 * //   description: 'Student: John Doe Registration: 2020 Graduation: 2024 Bachelor',
 * //   student: { name: 'John Doe', degree: 'B', ... }
 * // }
 */
function generateEmailAccount(student, facultyCode) {
    const email = generateEmail(student, facultyCode);
    const password = generatePassword(student.student_card_number);
    const quota = getQuota(student.degree);
    const description = generateDescription(student);

    return {
        email,
        password,
        quota,
        description,
        student: {
            name: student.full_name,
            degree: student.degree,
            registrationDate: student.registration_date,
            graduationYear: student.graduation_year,
            cardNumber: student.student_card_number
        }
    };
}

/**
 * Validate degree code
 * 
 * Checks if degree code is one of the accepted values:
 * B (Bachelor), M (Master), or P (PhD)
 * 
 * @param {string} degree - Degree code to validate (should be uppercase)
 * 
 * @returns {boolean} True if degree is B, M, or P; false otherwise
 * 
 * @example
 * isValidDegree('B');  // true
 * isValidDegree('M');  // true
 * isValidDegree('X');  // false
 */
function isValidDegree(degree) {
    return ['B', 'M', 'P'].includes(degree);
}

// Test mode
if (require.main === module && process.argv.includes('--test')) {
    console.log('Running email-generator tests...\n');

    const testStudent = {
        full_name: 'John Doe',
        degree: 'B',
        registration_date: '2020',
        graduation_year: '2024',
        student_card_number: '123456789012'
    };

    const universityCode = 'UNI';
    const account = generateEmailAccount(testStudent, universityCode);

    console.log('Test Student:', testStudent);
    console.log('\nGenerated Account:');
    console.log('  Email:', account.email);
    console.log('  Password:', account.password);
    console.log('  Quota:', account.quota, 'MB');
    console.log('  Description:', account.description);

    // Validate
    const expectedEmail = 'B2024UNI9012@alepuniv.edu.sy';
    const expectedPassword = '123456789012@ale&.com';

    console.log('\n✓ Email generation:', account.email === expectedEmail ? 'PASS' : 'FAIL');
    console.log('✓ Password generation:', account.password === expectedPassword ? 'PASS' : 'FAIL');
    console.log('✓ Quota assignment:', account.quota === 5 ? 'PASS' : 'FAIL');

    console.log('\nAll tests completed!');
}

module.exports = {
    generateEmail,
    generatePassword,
    getQuota,
    generateDescription,
    generateEmailAccount,
    isValidDegree,
    DEGREE_NAMES,
    QUOTA_MAP
};
