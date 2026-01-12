/**
 * Email Generator Module
 * Handles email address generation, password creation, and quota assignment
 * based on business rules
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
    'M': 25,
    'P': 5
};

/**
 * Generate email address based on student data
 * Format: {degree}{graduationYear}{universityCode}{last4CardDigits}@alepuniv.edu.sy
 * 
 * @param {Object} student - Student data object
 * @param {string} student.degree - Degree code (B/M/P)
 * @param {string} student.graduation_year - Graduation year (4 digits)
 * @param {string} student.student_card_number - Full student card number
 * @param {string} universityCode - University code
 * @returns {string} Generated email address
 */
function generateEmail(student, universityCode) {
    const { degree, graduation_year, student_card_number } = student;

    // Get last 4 digits of card number
    const last4Digits = student_card_number.slice(-4);

    // Build email: degree + year + university code + last 4 digits
    const localPart = `${degree}${graduation_year}${universityCode}${last4Digits}`;

    return `${localPart}@${DOMAIN}`;
}

/**
 * Generate password based on student card number
 * Format: {fullStudentCardNumber}@ale&.com
 * 
 * @param {string} studentCardNumber - Full student card number
 * @returns {string} Generated password
 */
function generatePassword(studentCardNumber) {
    return `${studentCardNumber}@ale&.com`;
}

/**
 * Get quota in MB based on degree
 * 
 * @param {string} degree - Degree code (B/M/P)
 * @returns {number} Quota in MB
 */
function getQuota(degree) {
    return QUOTA_MAP[degree] || 5; // Default to 5MB if unknown
}

/**
 * Generate description for email account
 * Format: Student: {full_name} {graduation_year} {degree}
 * 
 * @param {Object} student - Student data object
 * @returns {string} Description string
 */
function generateDescription(student) {
    const { full_name, graduation_year, degree } = student;
    const degreeName = DEGREE_NAMES[degree] || degree;

    return `Student: ${full_name} ${graduation_year} ${degreeName}`;
}

/**
 * Generate complete email account data for a student
 * 
 * @param {Object} student - Student data object
 * @param {string} universityCode - University code
 * @returns {Object} Complete email account data
 */
function generateEmailAccount(student, universityCode) {
    const email = generateEmail(student, universityCode);
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
            graduationYear: student.graduation_year,
            cardNumber: student.student_card_number
        }
    };
}

/**
 * Validate degree code
 * 
 * @param {string} degree - Degree code to validate
 * @returns {boolean} True if valid
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
