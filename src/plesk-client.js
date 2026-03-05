const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Plesk Client Module
 * ====================
 * 
 * Handles all interaction with Plesk CLI for email account management.
 * Wraps Plesk bin mail commands in JavaScript functions.
 * 
 * Features:
 * - Mailbox existence checking
 * - Mailbox creation with quota and description
 * - Batch mailbox creation with progress tracking
 * - Plesk CLI availability testing
 * - Error handling and reporting
 * 
 * Plesk Commands Used:
 * - plesk bin mail --info {email} - Check if mailbox exists
 * - plesk bin mail --create {email} - Create new mailbox
 * - plesk bin mail --update {email} - Update mailbox properties
 * - plesk bin mail --help - Test CLI availability
 * 
 * @module plesk-client
 */

const PLESK_BIN = 'plesk bin mail';
const DOMAIN = 'student.alepuniv.edu.sy';

/**
 * Execute a shell command
 * 
 * Wraps Node.js child_process exec in a promise.
 * Captures stdout and stderr for all commands.
 * Returns success/failure status with output.
 * 
 * @param {string} command - Shell command to execute
 * 
 * @returns {Promise<Object>} Execution result:
 *   - success {boolean} - True if command executed without error
 *   - stdout {string} - Standard output (trimmed)
 *   - stderr {string} - Standard error (trimmed)
 *   - error {string} - Error message if failed
 * 
 * @private
 * 
 * @example
 * const result = await executeCommand('plesk bin mail --help');
 * if (result.success) {
 *   console.log('Output:', result.stdout);
 * }
 */
async function executeCommand(command) {
    try {
        const { stdout, stderr } = await execAsync(command);
        return {
            success: true,
            stdout: stdout.trim(),
            stderr: stderr.trim()
        };
    } catch (error) {
        return {
            success: false,
            stdout: error.stdout ? error.stdout.trim() : '',
            stderr: error.stderr ? error.stderr.trim() : '',
            error: error.message
        };
    }
}

/**
 * Check if a mailbox exists
 * 
 * Queries Plesk to determine if mailbox already exists.
 * Uses 'plesk bin mail --info' command which succeeds if mailbox exists,
 * fails if mailbox not found.
 * 
 * @param {string} email - Email address to check
 * 
 * @returns {Promise<boolean>} True if mailbox exists, false otherwise
 * 
 * @example
 * const exists = await checkMailboxExists('B2024ALEP9012@student.alepuniv.edu.sy');
 * if (exists) {
 *   console.log('Mailbox already exists');
 * }
 */
async function checkMailboxExists(email) {
    const command = `${PLESK_BIN} --info ${email}`;
    const result = await executeCommand(command);

    // If command succeeds, mailbox exists
    // If it fails with "not found" or similar, mailbox doesn't exist
    return result.success;
}

/**
 * Create a new mailbox in Plesk
 * 
 * Creates a mailbox with specified credentials and settings.
 * Process:
 * 1. Check if mailbox already exists
 * 2. If exists, return error
 * 3. If not, create mailbox with password and quota
 * 4. Update mailbox with description
 * 
 * Plesk commands executed:
 * - plesk bin mail --info {email} (check existence)
 * - plesk bin mail --create {email} -mailbox true -passwd '{password}' -mbox_quota {quota}M
 * - plesk bin mail --update {email} -description "{description}"
 * 
 * @param {string} email - Email address to create
 * @param {string} password - Password for the mailbox
 * @param {number} quota - Quota in MB (e.g., 5, 25)
 * @param {string} description - Mailbox description (visible in Plesk)
 * @param {boolean} [dryRun=false] - If true, log command but don't execute
 * 
 * @returns {Promise<Object>} Creation result:
 *   - success {boolean} - True if mailbox created successfully
 *   - email {string} - Email address
 *   - error {string} - Error message if failed
 *   - message {string} - Success message if succeeded
 *   - dryRun {boolean} - Present and true if dry-run mode
 * 
 * @example
 * const result = await createMailbox(
 *   'B2024ALEP9012@student.alepuniv.edu.sy',
 *   '123456789012@ale&.com',
 *   5,
 *   'Student: John Doe 2024 Bachelor',
 *   false
 * );
 * if (result.success) {
 *   console.log('Mailbox created successfully');
 * }
 */
async function createMailbox(email, password, quota, description, dryRun = false) {
    // Check if mailbox already exists
    const exists = await checkMailboxExists(email);

    if (exists) {
        return {
            success: false,
            error: 'Mailbox already exists',
            email
        };
    }

    // Build create command
    const createCommand = `${PLESK_BIN} --create ${email} -mailbox true -passwd '${password}' -mbox_quota ${quota}M`;

    if (dryRun) {
        console.log(`[DRY-RUN] Would execute: ${createCommand.replace(password, '***')}`);
        return {
            success: true,
            dryRun: true,
            email,
            message: 'Dry-run mode: No actual changes made'
        };
    }

    // Execute create command
    const createResult = await executeCommand(createCommand);

    if (!createResult.success) {
        return {
            success: false,
            error: createResult.stderr || createResult.error || 'Failed to create mailbox',
            email
        };
    }

    // Set description
    const descCommand = `${PLESK_BIN} --update ${email} -description "${description}"`;
    const descResult = await executeCommand(descCommand);

    // Description update failure is not critical, just log it
    if (!descResult.success) {
        console.warn(`Warning: Failed to set description for ${email}`);
    }

    // Enable antivirus protection (incoming and outgoing)
    const antivirusCommand = `${PLESK_BIN} -u ${email} -antivirus inout`;
    const antivirusResult = await executeCommand(antivirusCommand);

    if (!antivirusResult.success) {
        console.warn(`Warning: Failed to enable antivirus for ${email}`);
    }

    return {
        success: true,
        email,
        message: 'Mailbox created successfully'
    };
}

/**
 * Create multiple mailboxes from account data
 * 
 * Batch creates mailboxes sequentially (not parallel to avoid overwhelming Plesk).
 * Provides progress updates via callback for each mailbox processed.
 * 
 * @param {Array<Object>} accounts - Array of account objects from email-generator
 * @param {boolean} [dryRun=false] - If true, simulate creation without executing
 * @param {Function} [onProgress=null] - Progress callback: (current, total, account) => void
 * 
 * @returns {Promise<Array<Object>>} Array of result objects, one per account:
 *   Each result contains:
 *   - success {boolean} - Creation success
 *   - email {string} - Email address
 *   - error {string} - Error if failed
 *   - student {Object} - Student data from account
 * 
 * @example
 * const accounts = [
 *   { email: '...', password: '...', quota: 5, description: '...', student: {...} },
 *   // ... more accounts
 * ];
 * 
 * const results = await createMailboxes(accounts, false, (current, total, account) => {
 *   console.log(`Processing ${current}/${total}: ${account.student.name}`);
 * });
 * 
 * const successCount = results.filter(r => r.success).length;
 * console.log(`Created ${successCount} mailboxes`);
 */
async function createMailboxes(accounts, dryRun = false, onProgress = null) {
    const results = [];

    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];

        if (onProgress) {
            onProgress(i + 1, accounts.length, account);
        }

        const result = await createMailbox(
            account.email,
            account.password,
            account.quota,
            account.description,
            dryRun
        );

        results.push({
            ...result,
            student: account.student
        });
    }

    return results;
}

/**
 * Test Plesk CLI availability
 * 
 * Verifies that Plesk CLI is installed and accessible.
 * Executes 'plesk bin mail --help' command.
 * Should be called before attempting any mailbox operations.
 * 
 * @returns {Promise<boolean>} True if Plesk CLI is available and working
 * 
 * @example
 * const available = await testPleskCLI();
 * if (!available) {
 *   console.error('Plesk CLI not available. Make sure you are on a Plesk server.');
 *   process.exit(1);
 * }
 */
async function testPleskCLI() {
    const command = `${PLESK_BIN} --help`;
    const result = await executeCommand(command);

    return result.success;
}

/**
 * List all mailboxes for the domain
 * 
 * Retrieves a list of all email addresses in the student domain.
 * 
 * @returns {Promise<Array<string>>} Array of email addresses
 */
async function listMailboxes() {
    const command = `${PLESK_BIN} --list ${DOMAIN}`;
    const result = await executeCommand(command);

    if (!result.success) {
        return [];
    }

    // Parse output to get email addresses
    const emails = result.stdout
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes('@'));

    return emails;
}

/**
 * Delete a mailbox from Plesk
 * 
 * Removes a mailbox completely from the Plesk system.
 * 
 * @param {string} email - Email address to delete
 * 
 * @returns {Promise<Object>} Deletion result:
 *   - success {boolean} - True if mailbox deleted successfully
 *   - email {string} - Email address
 *   - error {string} - Error message if failed
 */
async function deleteMailbox(email) {
    const command = `${PLESK_BIN} --remove ${email}`;
    const result = await executeCommand(command);

    if (!result.success) {
        return {
            success: false,
            error: result.stderr || result.error || 'Failed to delete mailbox',
            email
        };
    }

    return {
        success: true,
        email,
        message: 'Mailbox deleted successfully'
    };
}

/**
 * Delete mailboxes by Faculty Code and graduation date
 * 
 * Filters and deletes all mailboxes matching the specified Faculty Code and graduation date.
 * Email format expected: {degree}{YY}{facultyCode}{digits}@domain
 * 
 * @param {string} facultyCode - Faculty code to filter (e.g., 'IT', 'ENG')
 * @param {string} graduationDate - Graduation date in YYYY format (e.g., '2024')
 * @param {Function} [onProgress=null] - Progress callback: (current, total, email) => void
 * 
 * @returns {Promise<Object>} Deletion results:
 *   - total {number} - Total mailboxes found matching criteria
 *   - deleted {number} - Number of mailboxes successfully deleted
 *   - failed {number} - Number of mailboxes that failed to delete
 *   - results {Array<Object>} - Detailed results for each deletion
 */
async function deleteMailboxesByFilter(facultyCode, graduationDate, onProgress = null) {
    // Get all mailboxes
    const allEmails = await listMailboxes();

    // Convert graduation year to 2-digit format
    const yearShort = graduationDate.slice(-2); // Last 2 digits

    // Filter emails matching the pattern
    // Pattern: {degree}{YY}{facultyCode}{digits}@domain
    // Example: B24IT1234@student.alepuniv.edu.sy
    const matchingEmails = allEmails.filter(email => {
        const localPart = email.split('@')[0];
        // Check if email contains the year and faculty code
        // Pattern: starts with B/M/P, followed by 2-digit year, followed by faculty code
        const pattern = new RegExp(`^[BMP]${yearShort}${facultyCode}`, 'i');
        return pattern.test(localPart);
    });

    const results = [];
    let deleted = 0;
    let failed = 0;

    for (let i = 0; i < matchingEmails.length; i++) {
        const email = matchingEmails[i];

        if (onProgress) {
            onProgress(i + 1, matchingEmails.length, email);
        }

        const result = await deleteMailbox(email);
        results.push(result);

        if (result.success) {
            deleted++;
        } else {
            failed++;
        }
    }

    return {
        total: matchingEmails.length,
        deleted,
        failed,
        results
    };
}

module.exports = {
    createMailbox,
    createMailboxes,
    checkMailboxExists,
    testPleskCLI,
    executeCommand,
    listMailboxes,
    deleteMailbox,
    deleteMailboxesByFilter
};
