const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');

/**
 * Prompts module - Handles all interactive CLI prompts
 * Provides secure password input and input validation
 */

/**
 * Create readline interface for user input
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question and return the answer
 * @param {string} question - The question to ask
 * @param {string} defaultValue - Optional default value
 * @returns {Promise<string>} User's answer
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
 * @param {string} question - The question to ask
 * @returns {Promise<string>} User's password
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
 * @param {string} question - The question to ask
 * @param {boolean} defaultValue - Default value (true/false)
 * @returns {Promise<boolean>} User's answer as boolean
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
 * @param {string} filePath - Path to validate
 * @returns {boolean} True if file exists
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
 * @returns {Promise<Object>} Object containing all user inputs
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
  collectInputs
};
