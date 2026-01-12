#!/usr/bin/env node

/**
 * Plesk Email Account Generator
 * ===============================
 * Main CLI Entry Point
 * 
 * Production-ready script for automated bulk creation of student email accounts
 * in Plesk from CSV data. Orchestrates the entire workflow from user input to
 * completion with comprehensive error handling and reporting.
 * 
 * Workflow:
 * 1. Display welcome banner
 * 2. Collect user inputs (university code, CSV file path)
 * 3. Display configuration summary
 * 4. Clear previous logs
 * 5. Test Plesk CLI availability
 * 6. Parse and validate CSV file
 * 7. Create email accounts in Plesk
 * 8. Log all operations
 * 9. Display statistics and generate reports
 * 
 * Features:
 * - Interactive CLI with color-coded output
 * - Real-time progress tracking
 * - Comprehensive error handling
 * - Detailed logging and reporting
 * - Safe exit codes for automation
 * 
 * Exit Codes:
 * - 0: All operations completed successfully
 * - 1: One or more operations failed or fatal error occurred
 * 
 * @module index
 * @version 6.0.0
 */

const chalk = require('chalk');
const ora = require('ora');
const { collectInputs } = require('./prompts');
const { parseAndValidate } = require('./csv-parser');
const { createMailboxes, testPleskCLI, deleteMailboxesByFilter } = require('./plesk-client');
const { logSuccess, logError, clearLogs, Statistics } = require('./logger');

/**
 * Display welcome banner
 * 
 * Clears console and shows styled application banner.
 * Displays application name, version, and purpose.
 * Uses cyan bold styling for visual emphasis.
 * 
 * @private
 */
function displayBanner() {
    console.clear();
    console.log(chalk.cyan.bold('\n==================================================='));
    console.log(chalk.cyan.bold('                                                   '));
    console.log(chalk.cyan.bold('      PLESK EMAIL ACCOUNT GENERATOR v6.0.0         '));
    console.log(chalk.cyan.bold('                                                   '));
    console.log(chalk.cyan.bold('   Automated bulk email creation for students      '));
    console.log(chalk.cyan.bold('                                                   '));
    console.log(chalk.cyan.bold('===================================================\n'));
}

/**
 * Display configuration summary
 * 
 * Shows user-provided configuration before processing:
 * - University Code
 * - CSV File Path
 * - Mode (PRODUCTION)
 * 
 * Provides opportunity for user to verify settings.
 * Uses color coding for clear presentation.
 * 
 * @param {Object} config - Configuration object from collectInputs()
 * @param {string} config.universityCode - University code
 * @param {string} config.csvPath - Path to CSV file
 * @param {boolean} config.dryRun - Dry-run mode flag
 * 
 * @private
 */
/**
 * Display configuration summary
 * 
 * Shows user-provided configuration before processing.
 * Adapts display based on operation mode (create or delete).
 * Uses color coding for clear presentation.
 * 
 * @param {Object} config - Configuration object from collectInputs()
 * 
 * @private
 */
function displayConfig(config) {
    console.log(chalk.cyan.bold('Configuration Summary:\n'));
    
    if (config.mode === 'create') {
        console.log(chalk.white(`  Operation:        ${chalk.bold('CREATE')}`));
        console.log(chalk.white(`  Faculty Code:     ${chalk.bold(config.facultyCode)}`));
        console.log(chalk.white(`  CSV File:         ${chalk.bold(config.csvPath)}`));
        console.log(chalk.yellow('\nEmail accounts will be created in Plesk.\n'));
    } else if (config.mode === 'delete') {
        console.log(chalk.white(`  Operation:        ${chalk.bold('DELETE')}`));
        console.log(chalk.white(`  Faculty Code:     ${chalk.bold(config.facultyCode)}`));
        console.log(chalk.white(`  Graduation Date:  ${chalk.bold(config.graduationDate)}`));
        console.log(chalk.red('\nWARNING: Email accounts matching these criteria will be DELETED!\n'));
    }
}

/**
 * Main execution function
 * 
 * Orchestrates the complete workflow:
 * 1. User interaction and configuration
 * 2. Validation and testing
 * 3. CSV parsing and email generation
 * 4. Mailbox creation in Plesk
 * 5. Logging and reporting
 * 
 * Handles all errors gracefully and provides detailed feedback.
 * Sets appropriate exit codes for automation integration.
 * 
 * @async
 * @returns {Promise<void>} Resolves when processing complete
 * 
 * @throws {Error} Fatal errors are caught and logged before exiting
 */
async function main() {
    try {
        // Display banner
        displayBanner();

        // Collect user inputs
        const config = await collectInputs();

        // Display configuration
        displayConfig(config);

        // Clear previous logs
        console.log(chalk.gray('Clearing previous logs...\n'));
        clearLogs();

        // Initialize statistics
        const stats = new Statistics();

        // Test Plesk CLI availability
        const spinner = ora('Testing Plesk CLI availability...').start();
        const pleskAvailable = await testPleskCLI();

        if (!pleskAvailable) {
            spinner.fail(chalk.red('Plesk CLI not available!'));
            console.log(chalk.red('\nError: Cannot access Plesk CLI. Please ensure:'));
            console.log(chalk.red('   1. You are running this script on a server with Plesk installed'));
            console.log(chalk.red('   2. You have permissions to execute "plesk bin mail" commands'));
            console.log(chalk.red('   3. You are connected via SSH to the Plesk server\n'));
            process.exit(1);
        }

        spinner.succeed(chalk.green('Plesk CLI is available'));

        // Handle different modes
        if (config.mode === 'delete') {
            // Delete mode
            console.log(chalk.cyan.bold(`\nSearching for emails to delete...\n`));

            const progressSpinner = ora('Searching...').start();

            const deleteResults = await deleteMailboxesByFilter(
                config.facultyCode,
                config.graduationDate,
                (current, total, email) => {
                    progressSpinner.text = `Deleting ${current}/${total}: ${email}`;
                }
            );

            progressSpinner.stop();

            console.log('');
            console.log(chalk.cyan.bold('Deletion Summary:'));
            console.log(chalk.white(`  Total found:      ${deleteResults.total}`));
            console.log(chalk.green(`  Deleted:          ${deleteResults.deleted}`));
            console.log(chalk.red(`  Failed:           ${deleteResults.failed}`));
            console.log('');

            // Display detailed results
            deleteResults.results.forEach(result => {
                if (result.success) {
                    console.log(chalk.green(`✓ Deleted: ${result.email}`));
                    logSuccess('Deleted', result.email);
                } else {
                    console.log(chalk.red(`✗ Failed: ${result.email} (${result.error})`));
                    logError('Delete Failed', result.email, result.error);
                }
            });

            console.log('');

            if (deleteResults.total === 0) {
                console.log(chalk.yellow('No emails found matching the criteria.\n'));
            } else if (deleteResults.failed > 0) {
                console.log(chalk.yellow('Completed with errors\n'));
                process.exit(1);
            } else {
                console.log(chalk.green('All deletions completed successfully!\n'));
                process.exit(0);
            }

        } else {
            // Create mode
            // Parse and validate CSV
            const parseSpinner = ora('Parsing and validating CSV file...').start();
            const parseResult = await parseAndValidate(config.csvPath, config.facultyCode);

            if (!parseResult.success) {
                parseSpinner.fail(chalk.red('CSV validation failed!'));
                console.log(chalk.red('\nValidation Errors:\n'));
                parseResult.errors.forEach(error => {
                    console.log(chalk.red(`   - ${error}`));
                });
                console.log('');
                process.exit(1);
            }

            parseSpinner.succeed(chalk.green(`CSV validated successfully - ${parseResult.students.length} students found`));

            // Display warnings for duplicates
            if (parseResult.duplicates.length > 0) {
                console.log(chalk.yellow('\nWarning: Duplicate emails detected:'));
                parseResult.duplicates.forEach(email => {
                    console.log(chalk.yellow(`   - ${email}`));
                });
                console.log('');
            }

            // Create email accounts
            console.log(chalk.cyan.bold(`\nCreating ${parseResult.students.length} email accounts...\n`));

            const progressSpinner = ora('Processing...').start();

            const results = await createMailboxes(
                parseResult.students,
                config.dryRun,
                (current, total, account) => {
                    progressSpinner.text = `Processing ${current}/${total}: ${account.student.name}`;
                }
            );

            progressSpinner.stop();

            // Process results and log
            console.log('');
            results.forEach(result => {
                const studentName = result.student.name;
                const email = result.email;

                if (result.success) {
                    console.log(chalk.green(`✓ ${studentName} - ${email}`));
                    logSuccess(studentName, email);
                    stats.recordSuccess();
                } else {
                    const reason = result.error || 'Unknown error';
                    console.log(chalk.red(`✗ ${studentName} - ${email} (${reason})`));
                    logError(studentName, email, reason);
                    stats.recordFailure(studentName, email, reason);
                }
            });

            // Display final statistics
            stats.printSummary(chalk);

            // Save report
            const reportPath = stats.saveReport();
            if (reportPath) {
                console.log(chalk.cyan(`Report saved to: ${chalk.bold(reportPath)}\n`));
            }

            // Display log file locations
            console.log(chalk.gray('Log files:'));
            console.log(chalk.gray(`  - Success: logs/success.log`));
            console.log(chalk.gray(`  - Errors:  logs/error.log\n`));

            // Exit with appropriate code
            if (stats.failed > 0) {
                console.log(chalk.yellow('Completed with errors\n'));
                process.exit(1);
            } else {
                console.log(chalk.green('All operations completed successfully!\n'));
                process.exit(0);
            }
        }

    } catch (error) {
        console.error(chalk.red.bold('\nFatal Error:\n'));
        console.error(chalk.red(error.message));
        console.error(chalk.gray('\nStack trace:'));
        console.error(chalk.gray(error.stack));
        console.log('');
        process.exit(1);
    }
}

// Run main function
if (require.main === module) {
    main();
}

module.exports = { main };
