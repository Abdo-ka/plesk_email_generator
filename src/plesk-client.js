const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Plesk Client Module
 * Handles interaction with Plesk CLI for email account management
 */

const PLESK_BIN = 'plesk bin mail';
const DOMAIN = 'student.alepuniv.edu.sy';

/**
 * Execute a shell command
 * @param {string} command - Command to execute
 * @returns {Promise<Object>} Result with stdout and stderr
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
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>} True if mailbox exists
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
 * @param {string} email - Email address
 * @param {string} password - Password for the mailbox
 * @param {number} quota - Quota in MB
 * @param {string} description - Mailbox description
 * @param {boolean} dryRun - If true, don't actually execute
 * @returns {Promise<Object>} Result object
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

    return {
        success: true,
        email,
        message: 'Mailbox created successfully'
    };
}

/**
 * Create multiple mailboxes from account data
 * @param {Array} accounts - Array of account objects
 * @param {boolean} dryRun - If true, don't actually execute
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Array>} Array of results
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
 * @returns {Promise<boolean>} True if Plesk CLI is available
 */
async function testPleskCLI() {
    const command = `${PLESK_BIN} --help`;
    const result = await executeCommand(command);

    return result.success;
}

module.exports = {
    createMailbox,
    createMailboxes,
    checkMailboxExists,
    testPleskCLI,
    executeCommand
};
