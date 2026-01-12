const fs = require('fs');
const path = require('path');

/**
 * Logger Module
 * ==============
 * 
 * Handles all logging operations and statistics tracking.
 * Provides file-based logging and JSON report generation.
 * 
 * Features:
 * - Success/error logging to separate files
 * - ISO timestamp formatting
 * - Statistics tracking (success/failure counts)
 * - JSON report generation
 * - Formatted console output
 * - Log file management (clearing)
 * 
 * Log Files:
 * - logs/success.log - Successful email creations
 * - logs/error.log - Failed email creations with reasons
 * - report.json - JSON summary of all operations
 * 
 * @module logger
 */

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const SUCCESS_LOG = path.join(LOGS_DIR, 'success.log');
const ERROR_LOG = path.join(LOGS_DIR, 'error.log');
const REPORT_FILE = path.join(__dirname, '..', 'report.json');

/**
 * Ensure logs directory exists
 * 
 * Creates logs/ directory if it doesn't exist.
 * Uses recursive flag to create parent directories if needed.
 * Called automatically before any logging operation.
 * 
 * @private
 */
function ensureLogsDir() {
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
}

/**
 * Get current timestamp in ISO format
 * 
 * Returns current date/time in ISO 8601 format with timezone.
 * Used for all log entries and reports.
 * 
 * @returns {string} ISO timestamp (e.g., '2026-01-12T10:30:45+03:00')
 * 
 * @private
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Format log entry
 * 
 * Creates a standardized log entry string with:
 * - ISO timestamp
 * - Student name
 * - Email address
 * - Status (SUCCESS/FAILED)
 * - Reason (for failures only)
 * 
 * @param {string} studentName - Student's full name
 * @param {string} email - Email address
 * @param {string} status - Status string ('SUCCESS' or 'FAILED')
 * @param {string} [reason=''] - Failure reason (optional, only for failures)
 * 
 * @returns {string} Formatted log entry with newline
 * 
 * @private
 * 
 * @example
 * const entry = formatLogEntry('John Doe', 'B2024ALEP9012@alepuniv.edu.sy', 'SUCCESS');
 * // Returns: '[2026-01-12T10:30:45+03:00] Student: John Doe | Email: B2024ALEP9012@alepuniv.edu.sy | Status: SUCCESS\n'
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
 * 
 * Appends success entry to logs/success.log file.
 * Creates log directory and file if they don't exist.
 * 
 * @param {string} studentName - Student's full name
 * @param {string} email - Created email address
 * 
 * @example
 * logSuccess('John Doe', 'B2024ALEP9012@student.alepuniv.edu.sy');
 */
function logSuccess(studentName, email) {
    ensureLogsDir();
    const entry = formatLogEntry(studentName, email, 'SUCCESS');
    writeToLog(SUCCESS_LOG, entry);
}

/**
 * Log failed email creation
 * 
 * Appends error entry to logs/error.log file.
 * Includes reason for failure for troubleshooting.
 * Creates log directory and file if they don't exist.
 * 
 * @param {string} studentName - Student's full name
 * @param {string} email - Email address that failed to create
 * @param {string} reason - Reason for failure (e.g., 'Mailbox already exists')
 * 
 * @example
 * logError('John Doe', 'B2024ALEP9012@student.alepuniv.edu.sy', 'Mailbox already exists');
 */
function logError(studentName, email, reason) {
    ensureLogsDir();
    const entry = formatLogEntry(studentName, email, 'FAILED', reason);
    writeToLog(ERROR_LOG, entry);
}

/**
 * Clear existing log files
 * 
 * Deletes all log files and reports from previous runs:
 * - logs/success.log
 * - logs/error.log
 * - report.json
 * 
 * Called at the start of each run to ensure clean state.
 * Creates logs directory if it doesn't exist.
 * 
 * @example
 * clearLogs(); // Clears all previous logs
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
 * 
 * Tracks processing metrics for all mailbox creation operations.
 * Maintains counts of successes and failures, plus detailed failure information.
 * Generates summary reports and formatted console output.
 * 
 * Usage:
 * 1. Create instance at start of processing
 * 2. Call recordSuccess() or recordFailure() for each operation
 * 3. Call printSummary() to display results
 * 4. Call saveReport() to generate JSON report
 * 
 * @class
 * 
 * @example
 * const stats = new Statistics();
 * stats.recordSuccess();
 * stats.recordFailure('John Doe', 'email@example.com', 'Mailbox exists');
 * stats.printSummary(chalk);
 * const reportPath = stats.saveReport();
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
     * 
     * Increments total processed and successful counts.
     * Call this method after each successfully created mailbox.
     * 
     * @example
     * stats.recordSuccess();
     */
    recordSuccess() {
        this.totalProcessed++;
        this.successful++;
    }

    /**
     * Record failed creation
     * 
     * Increments total processed and failed counts.
     * Stores failure details for reporting.
     * Call this method after each failed mailbox creation.
     * 
     * @param {string} name - Student's full name
     * @param {string} email - Email address that failed
     * @param {string} reason - Reason for failure
     * 
     * @example
     * stats.recordFailure('John Doe', 'B2024ALEP9012@student.alepuniv.edu.sy', 'Mailbox already exists');
     */
    recordFailure(name, email, reason) {
        this.totalProcessed++;
        this.failed++;
        this.failedStudents.push({ name, email, reason });
    }

    /**
     * Get statistics summary
     * 
     * Returns complete statistics object suitable for JSON export.
     * Includes timestamp, counts, and failure details.
     * 
     * @returns {Object} Statistics summary:
     *   - timestamp {string} - ISO timestamp of summary generation
     *   - total_processed {number} - Total accounts processed
     *   - successful {number} - Successfully created count
     *   - failed {number} - Failed creation count
     *   - failed_students {Array<Object>} - Array of failure details
     * 
     * @example
     * const summary = stats.getSummary();
     * console.log(`Success rate: ${summary.successful}/${summary.total_processed}`);
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
     * 
     * Generates report.json in project root with complete statistics.
     * Includes timestamp, counts, and detailed failure information.
     * Uses 2-space indentation for readability.
     * 
     * @returns {string|null} Path to report file if successful, null if failed
     * 
     * @example
     * const reportPath = stats.saveReport();
     * if (reportPath) {
     *   console.log(`Report saved to: ${reportPath}`);
     * }
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
     * 
     * Displays formatted statistics summary with color coding:
     * - Cyan headers and borders
     * - Green for successful operations
     * - Red for failed operations
     * - Gray for detailed failure information
     * 
     * Includes list of all failed students with reasons.
     * 
     * @param {Object} chalk - Chalk instance for colored console output
     * 
     * @example
     * const chalk = require('chalk');
     * stats.printSummary(chalk);
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
