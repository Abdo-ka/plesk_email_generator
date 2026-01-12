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
 * Collect all required inputs from user
 * 
 * Interactive prompts user for:
 * 1. University Code - Used in email address generation
 * 2. CSV File Path - Location of student data file
 * 
 * Validates inputs and prompts again if invalid.
 * Displays formatted input prompts with color coding.
 * 
 * @returns {Promise<Object>} Configuration object with properties:
 *   - universityCode {string} - University code for emails
 *   - csvPath {string} - Path to CSV file
 *   - dryRun {boolean} - Always false (used for future features)
 * 
 * @example
 * const config = await collectInputs();
 * // User prompted for university code and CSV path
 * // Returns: { universityCode: 'ALEP', csvPath: './data/students.csv', dryRun: false }
 */
async function collectInputs() {
  console.log(chalk.cyan.bold('\nConfiguration Setup\n'));

  // University code
  let universityCode = '';
  while (!universityCode) {
    universityCode = await ask(chalk.yellow('Enter university code (e.g., UNI)'));
    if (!universityCode) {
      console.log(chalk.red('University code is required'));
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
    universityCode,
    csvPath,
    dryRun: false
  };
}

module.exports = {
  ask,
  askPassword,
  askYesNo,
  collectInputs,
  validateFilePath
};
