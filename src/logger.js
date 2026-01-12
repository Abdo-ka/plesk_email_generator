const fs = require('fs');
const path = require('path');

/**
 * Logger Module
 * Handles logging to files and generating reports
 */

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const SUCCESS_LOG = path.join(LOGS_DIR, 'success.log');
const ERROR_LOG = path.join(LOGS_DIR, 'error.log');
const REPORT_FILE = path.join(__dirname, '..', 'report.json');

/**
 * Ensure logs directory exists
 */
function ensureLogsDir() {
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Format log entry
 * @param {string} studentName - Student name
 * @param {string} email - Email address
 * @param {string} status - Status (SUCCESS/FAILED)
 * @param {string} reason - Optional reason for failure
 * @returns {string} Formatted log entry
 */
function formatLogEntry(studentName, email, status, reason = '') {
    const timestamp = getTimestamp();
    let entry = `[${timestamp}] Student: ${studentName} | Email: ${email} | Status: ${status}`;

    if (reason) {
        entry += ` | Reason: ${reason}`;
    }

    return entry + '\n';
}

/**
 * Write to log file
 * @param {string} filePath - Path to log file
 * @param {string} content - Content to write
 */
function writeToLog(filePath, content) {
    try {
        fs.appendFileSync(filePath, content, 'utf8');
    } catch (error) {
        console.error(`Failed to write to log file ${filePath}:`, error.message);
    }
}

/**
 * Log successful email creation
 * @param {string} studentName - Student name
 * @param {string} email - Email address
 */
function logSuccess(studentName, email) {
    ensureLogsDir();
    const entry = formatLogEntry(studentName, email, 'SUCCESS');
    writeToLog(SUCCESS_LOG, entry);
}

/**
 * Log failed email creation
 * @param {string} studentName - Student name
 * @param {string} email - Email address
 * @param {string} reason - Reason for failure
 */
function logError(studentName, email, reason) {
    ensureLogsDir();
    const entry = formatLogEntry(studentName, email, 'FAILED', reason);
    writeToLog(ERROR_LOG, entry);
}

/**
 * Clear existing log files
 */
function clearLogs() {
    ensureLogsDir();

    if (fs.existsSync(SUCCESS_LOG)) {
        fs.unlinkSync(SUCCESS_LOG);
    }

    if (fs.existsSync(ERROR_LOG)) {
        fs.unlinkSync(ERROR_LOG);
    }

    if (fs.existsSync(REPORT_FILE)) {
        fs.unlinkSync(REPORT_FILE);
    }
}

/**
 * Statistics tracker class
 */
class Statistics {
    constructor() {
        this.totalProcessed = 0;
        this.successful = 0;
        this.failed = 0;
        this.failedStudents = [];
    }

    /**
     * Record successful creation
     */
    recordSuccess() {
        this.totalProcessed++;
        this.successful++;
    }

    /**
     * Record failed creation
     * @param {string} name - Student name
     * @param {string} email - Email address
     * @param {string} reason - Failure reason
     */
    recordFailure(name, email, reason) {
        this.totalProcessed++;
        this.failed++;
        this.failedStudents.push({ name, email, reason });
    }

    /**
     * Get statistics summary
     * @returns {Object} Statistics object
     */
    getSummary() {
        return {
            timestamp: getTimestamp(),
            total_processed: this.totalProcessed,
            successful: this.successful,
            failed: this.failed,
            failed_students: this.failedStudents
        };
    }

    /**
     * Save report to JSON file
     */
    saveReport() {
        const summary = this.getSummary();

        try {
            fs.writeFileSync(REPORT_FILE, JSON.stringify(summary, null, 2), 'utf8');
            return REPORT_FILE;
        } catch (error) {
            console.error('Failed to save report:', error.message);
            return null;
        }
    }

    /**
     * Print summary to console
     * @param {Object} chalk - Chalk instance for colored output
     */
    printSummary(chalk) {
        console.log('\n' + chalk.cyan.bold('═══════════════════════════════════════'));
        console.log(chalk.cyan.bold('           FINAL STATISTICS'));
        console.log(chalk.cyan.bold('═══════════════════════════════════════\n'));

        console.log(chalk.white(`Total Processed:     ${chalk.bold(this.totalProcessed)}`));
        console.log(chalk.green(`Successfully Created: ${chalk.bold(this.successful)}`));
        console.log(chalk.red(`Failed:              ${chalk.bold(this.failed)}`));

        if (this.failedStudents.length > 0) {
            console.log('\n' + chalk.red.bold('Failed Students:'));
            this.failedStudents.forEach((student, index) => {
                console.log(chalk.red(`  ${index + 1}. ${student.name}`));
                console.log(chalk.gray(`     Email: ${student.email}`));
                console.log(chalk.gray(`     Reason: ${student.reason}`));
            });
        }

        console.log('\n' + chalk.cyan.bold('═══════════════════════════════════════\n'));
    }
}

module.exports = {
    logSuccess,
    logError,
    clearLogs,
    Statistics,
    LOGS_DIR,
    SUCCESS_LOG,
    ERROR_LOG,
    REPORT_FILE
};
