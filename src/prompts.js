const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');

/**
 * Prompts Module
 * ===============
 * Handles all interactive CLI prompts, user input collection, and validation.
 * Provides a user-friendly interface for collecting configuration.
 * 
 * Features:
 * - Text input prompts with default values
 * - Password input with masked display
 * - Yes/No prompts
 * - File path validation
 * - Error messaging and guidance
 * 
 * @module prompts
 */

/**
 * Create readline interface for user input
 * 
 * Initializes a new readline interface for reading from stdin
 * and writing to stdout.
 * 
 * @returns {readline.Interface} Readline interface instance
 * 
 * @private
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question and return the answer
 * 
 * Prompts the user with a question and returns their input.
 * Displays optional default value in gray. If user doesn't input
 * anything, returns the default value.
 * 
 * @param {string} question - The question to display to user
 * @param {string} [defaultValue=''] - Optional default value if user presses Enter
 * @returns {Promise<string>} Promise resolving to user's answer (trimmed)
 * 
 * @example
 * const name = await ask('Enter your name', 'John');
 * // User sees: "Enter your name (default: John): "
 */
function ask(question, defaultValue = '') {
  const rl = createInterface();

  return new Promise((resolve) => {
    const prompt = defaultValue
      ? `${question} ${chalk.gray(`(default: ${defaultValue})`)}: `
      : `${question}: `;

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Ask for password with masked input
 * 
 * Prompts for password input while masking the displayed characters.
 * Displays asterisks instead of actual characters typed.
 * 
 * @param {string} question - The question/prompt to display
 * @returns {Promise<string>} Promise resolving to the password (trimmed)
 * 
 * @example
 * const password = await askPassword('Enter password');
 * // User sees: "Enter password: ****" (as they type)
 */
function askPassword(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Mute output for password
    const stdin = process.stdin;
    stdin.on('data', (char) => {
      char = char.toString();
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`${question}: ${'*'.repeat(rl.line.length)}`);
          break;
      }
    });

    rl.question(`${question}: `, (password) => {
      rl.close();
      console.log(''); // New line after password
      resolve(password.trim());
    });

    rl._writeToOutput = function _writeToOutput() {
      // Override to prevent password display
    };
  });
}

/**
 * Ask yes/no question
 * 
 * Prompts user with a yes/no question and returns boolean answer.
 * Accepts 'y', 'yes', 'n', 'no' (case-insensitive).
 * Defaults to provided value if invalid answer.
 * 
 * @param {string} question - The question to ask
 * @param {boolean} [defaultValue=true] - Default value if Enter pressed or invalid answer
 * @returns {Promise<boolean>} Promise resolving to boolean answer
 * 
 * @example
 * const proceed = await askYesNo('Continue?', true);
 * // User sees: "Continue? (Y/n): "
 */
async function askYesNo(question, defaultValue = true) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await ask(`${question} ${chalk.gray(`(${defaultText})`)}`, defaultValue ? 'y' : 'n');

  const normalized = answer.toLowerCase();
  if (normalized === 'y' || normalized === 'yes') return true;
  if (normalized === 'n' || normalized === 'no') return false;

  return defaultValue;
}

/**
 * Validate file path exists
 * 
 * Checks if a file exists at the given path.
 * Returns false if path doesn't exist or is not a file.
 * 
 * @param {string} filePath - Path to file to validate
 * @returns {boolean} True if file exists and is readable, false otherwise
 * 
 * @example
 * if (validateFilePath('./data.csv')) {
 *   console.log('CSV file found');
 * }
 */
function validateFilePath(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Ask user to choose operation mode
 * 
 * Prompts user to choose between create and delete operations.
 * 
 * @returns {Promise<string>} Selected mode: 'create' or 'delete'
 */
async function askOperationMode() {
  console.log(chalk.cyan.bold('\nOperation Mode Selection\n'));
  console.log(chalk.white('  1. Create email accounts'));
  console.log(chalk.white('  2. Delete email accounts'));
  console.log('');

  let mode = '';
  while (mode !== '1' && mode !== '2') {
    mode = await ask(chalk.yellow('Select operation mode (1 or 2)'));
    if (mode !== '1' && mode !== '2') {
      console.log(chalk.red('Please enter 1 for Create or 2 for Delete'));
    }
  }

  return mode === '1' ? 'create' : 'delete';
}

/**
 * Collect inputs for create operation
 * 
 * Interactive prompts user for:
 * 1. Faculty Code - Used in email address generation
 * 2. CSV File Path - Location of student data file
 * 
 * @returns {Promise<Object>} Configuration object with properties:
 *   - mode {string} - 'create'
 *   - facultyCode {string} - Faculty code for emails
 *   - csvPath {string} - Path to CSV file
 */
async function collectCreateInputs() {
  console.log(chalk.cyan.bold('\nCreate Mode Configuration\n'));

  // Faculty code
  let facultyCode = '';
  while (!facultyCode) {
    facultyCode = await ask(chalk.yellow('Enter Faculty Code (e.g., IT, ENG)'));
    if (!facultyCode) {
      console.log(chalk.red('Faculty Code is required'));
    }
  }

  // CSV file path
  let csvPath = '';
  while (!csvPath || !validateFilePath(csvPath)) {
    csvPath = await ask(chalk.yellow('Enter CSV file path'));
    if (!csvPath) {
      console.log(chalk.red('CSV file path is required'));
    } else if (!validateFilePath(csvPath)) {
      console.log(chalk.red(`File not found: ${csvPath}`));
      csvPath = '';
    }
  }

  console.log(''); // Empty line for spacing

  return {
    mode: 'create',
    facultyCode,
    csvPath,
    dryRun: false
  };
}

/**
 * Collect inputs for delete operation
 * 
 * Interactive prompts user for:
 * 1. Faculty Code - Used to filter emails
 * 2. Graduation Date - Used to filter emails
 * 
 * @returns {Promise<Object>} Configuration object with properties:
 *   - mode {string} - 'delete'
 *   - facultyCode {string} - Faculty code to filter
 *   - graduationDate {string} - Graduation date to filter (YYYY format)
 */
async function collectDeleteInputs() {
  console.log(chalk.cyan.bold('\nDelete Mode Configuration\n'));

  // Faculty code
  let facultyCode = '';
  while (!facultyCode) {
    facultyCode = await ask(chalk.yellow('Enter Faculty Code to delete (e.g., IT, ENG)'));
    if (!facultyCode) {
      console.log(chalk.red('Faculty Code is required'));
    }
  }

  // Graduation date
  let graduationDate = '';
  while (!graduationDate || !/^\d{4}$/.test(graduationDate)) {
    graduationDate = await ask(chalk.yellow('Enter Graduation Date (YYYY format, e.g., 2024)'));
    if (!graduationDate) {
      console.log(chalk.red('Graduation Date is required'));
    } else if (!/^\d{4}$/.test(graduationDate)) {
      console.log(chalk.red('Graduation Date must be 4 digits (YYYY format)'));
      graduationDate = '';
    }
  }

  console.log(''); // Empty line for spacing

  return {
    mode: 'delete',
    facultyCode,
    graduationDate
  };
}

/**
 * Collect all required inputs from user
 * 
 * Interactive prompts user for operation mode, then collects
 * specific inputs based on selected mode.
 * 
 * @returns {Promise<Object>} Configuration object
 */
async function collectInputs() {
  const mode = await askOperationMode();

  if (mode === 'create') {
    return await collectCreateInputs();
  } else {
    return await collectDeleteInputs();
  }
}

module.exports = {
  ask,
  askPassword,
  askYesNo,
  collectInputs,
  askOperationMode,
  collectCreateInputs,
  collectDeleteInputs,
  validateFilePath
};
