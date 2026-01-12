# Development Guide

## Getting Started

### Prerequisites

- Node.js v14.0.0 or higher
- Git
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript, Node.js, and CLI applications

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/Abdo-ka/plesk_email_generator.git
cd plesk-email-generator

# Install dependencies
npm install

# Verify installation
npm test

# Run the application
npm start
```

### Project Structure

```
plesk-email-generator/
├── src/                      # Source code
│   ├── index.js              # Main entry point
│   ├── prompts.js            # User input handling
│   ├── csv-parser.js         # CSV processing
│   ├── email-generator.js    # Email generation logic
│   ├── plesk-client.js       # Plesk CLI interaction
│   └── logger.js             # Logging and statistics
├── logs/                     # Generated at runtime
├── examples/                 # Sample CSV files
├── package.json              # Dependencies and scripts
├── README.md                 # User documentation
├── ARCHITECTURE.md           # Architecture documentation
└── DEVELOPMENT.md            # This file
```

## Development Workflow

### 1. Making Changes

#### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name
```

#### Commit Message Guidelines
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues when applicable (#123)

Example:
```
Add email validation to CSV parser

- Implement email format validation
- Add tests for invalid emails
- Update documentation

Fixes #123
```

### 2. Testing

#### Run Tests
```bash
# Test all modules
npm test

# Test individual modules
node src/csv-parser.js --test
node src/email-generator.js --test
```

#### Testing Locally Without Plesk

You can test most functionality without a Plesk server:

```javascript
// Test CSV parsing
const { parseAndValidate } = require('./src/csv-parser');
const result = await parseAndValidate('./examples/sample.csv', 'ALEP');
console.log(result.students);

// Test email generation
const { generateEmailAccount } = require('./src/email-generator');
const account = generateEmailAccount({
  full_name: 'John Doe',
  degree: 'B',
  graduation_year: '2024',
  student_card_number: '123456789012'
}, 'ALEP');
console.log(account);
```

#### Create Sample CSV for Testing

```csv
full_name,degree,graduation_year,student_card_number
Test Student One,B,2024,123456789012
Test Student Two,M,2025,987654321098
Test Student Three,P,2023,456789123456
```

### 3. Code Style

#### JavaScript Style Guide

Follow these conventions:

**Indentation**: 4 spaces (not tabs)

**Naming**:
- Functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_CASE`
- Variables: `camelCase`

**Quotes**: Single quotes for strings

**Semicolons**: Always use semicolons

**Comments**:
```javascript
// Single line comments for brief explanations

/**
 * JSDoc comments for functions and classes
 * 
 * @param {string} name - Parameter description
 * @returns {Object} Return value description
 */
function example(name) {
    // Implementation
}
```

#### ESLint Configuration (Optional)

Create `.eslintrc.json`:
```json
{
  "env": {
    "node": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "indent": ["error", 4],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### 4. Adding New Features

#### Example: Adding a New Validation Rule

1. **Update Validator**:
```javascript
// src/csv-parser.js
function validateStudent(student, lineNumber) {
    // ... existing validations ...
    
    // Add new validation
    if (student.email && !isValidEmail(student.email)) {
        errors.push(`Line ${lineNumber}: Invalid email format`);
    }
    
    return { valid: errors.length === 0, errors };
}
```

2. **Add Tests**:
```javascript
// In test section of csv-parser.js
const testStudent = {
    full_name: 'Test User',
    degree: 'B',
    graduation_year: '2024',
    student_card_number: '123456789012',
    email: 'invalid-email'  // Test invalid email
};

const result = validateStudent(testStudent, 2);
console.log('Email validation:', result.valid ? 'PASS' : 'FAIL');
```

3. **Update Documentation**:
```markdown
<!-- README.md -->
### Validation Rules
- Email must be valid format (if provided)
```

4. **Update JSDoc**:
```javascript
/**
 * Validate a single student record
 * 
 * Validates:
 * - All required fields
 * - Email format (if provided)
 * ...
 */
```

#### Example: Adding a New Email Generation Pattern

1. **Update Generator**:
```javascript
// src/email-generator.js
function generateEmail(student, universityCode, pattern = 'default') {
    if (pattern === 'alternative') {
        // New pattern implementation
        return `${universityCode}${degree}${last4Digits}@domain.com`;
    }
    
    // Default pattern
    return `${degree}${year}${universityCode}${last4Digits}@student.alepuniv.edu.sy`;
}
```

2. **Add Configuration Option**:
```javascript
// src/prompts.js
async function collectInputs() {
    // ... existing inputs ...
    
    const pattern = await ask('Email pattern (default/alternative)', 'default');
    
    return {
        universityCode,
        csvPath,
        emailPattern: pattern
    };
}
```

3. **Test New Feature**:
```bash
node src/email-generator.js --test
```

## Module Documentation

### Creating a New Module

1. **File Structure**:
```javascript
/**
 * Module Name
 * ===========
 * 
 * Brief description of module purpose.
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * @module module-name
 */

// Constants
const CONSTANT_NAME = 'value';

// Private functions
function privateHelper() {
    // Implementation
}

// Public functions
function publicFunction(param) {
    /**
     * Function description
     * 
     * @param {type} param - Parameter description
     * @returns {type} Return description
     */
    // Implementation
}

// Exports
module.exports = {
    publicFunction
};
```

2. **Add Tests**:
```javascript
// Test mode at end of file
if (require.main === module && process.argv.includes('--test')) {
    console.log('Running tests...\n');
    
    // Test 1
    console.log('Test 1: Description');
    // ... test code ...
    
    console.log('\nAll tests completed!');
}
```

3. **Update package.json**:
```json
{
  "scripts": {
    "test": "node src/module-name.js --test && ..."
  }
}
```

## Debugging

### Debug Mode

Add debug logging:
```javascript
const DEBUG = process.env.DEBUG === 'true';

function debugLog(message) {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`);
    }
}
```

Run with debug:
```bash
DEBUG=true npm start
```

### Using Node.js Debugger

```bash
# Start with debugger
node inspect src/index.js

# Or with VS Code
# Add breakpoints and press F5
```

### VS Code Launch Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Main",
      "program": "${workspaceFolder}/src/index.js",
      "console": "integratedTerminal"
    }
  ]
}
```

## Common Development Tasks

### Adding a Dependency

```bash
# Install package
npm install package-name

# Update package.json manually if needed
# Test that everything still works
npm test

# Commit changes
git add package.json package-lock.json
git commit -m "Add package-name dependency"
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Test after updates
npm test
```

### Fixing a Bug

1. **Reproduce the Bug**:
   - Create a test case that fails
   - Document the expected vs actual behavior

2. **Fix the Bug**:
   - Locate the problematic code
   - Implement the fix
   - Verify the test now passes

3. **Add Regression Test**:
   - Ensure bug won't reoccur
   - Add test to the test suite

4. **Document the Fix**:
   - Update CHANGELOG if present
   - Reference issue number in commit

### Refactoring

1. **Ensure Tests Pass**:
   ```bash
   npm test
   ```

2. **Make Incremental Changes**:
   - Refactor small pieces at a time
   - Test after each change

3. **Keep Functionality Identical**:
   - Don't change behavior during refactoring
   - Save new features for separate commits

4. **Update Documentation**:
   - Update JSDoc comments
   - Update architecture docs if needed

## Performance Optimization

### Profiling

```bash
# Profile with Node.js profiler
node --prof src/index.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

### Memory Usage

```javascript
// Check memory usage
const used = process.memoryUsage();
console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
```

### Benchmarking

```javascript
console.time('operation');
// ... code to benchmark ...
console.timeEnd('operation');
```

## Documentation

### Updating Documentation

When making changes, update:
1. **Code Comments**: JSDoc for functions/classes
2. **README.md**: User-facing features
3. **ARCHITECTURE.md**: Design changes
4. **DEVELOPMENT.md**: Developer workflow changes

### Documentation Checklist

- [ ] Function has JSDoc comment
- [ ] Parameters documented with types
- [ ] Return value documented
- [ ] Examples provided for complex functions
- [ ] Module header includes overview
- [ ] README updated for user-visible changes
- [ ] Architecture doc updated for design changes

## Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **Major**: Breaking changes (2.0.0)
- **Minor**: New features, backward compatible (1.1.0)
- **Patch**: Bug fixes (1.0.1)

### Creating a Release

1. **Update Version**:
```bash
npm version patch  # or minor, or major
```

2. **Update CHANGELOG** (if present):
```markdown
## [1.0.1] - 2026-01-12
### Fixed
- Fixed email validation bug
```

3. **Tag Release**:
```bash
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1
```

4. **Create GitHub Release**:
- Go to GitHub releases
- Draft new release
- Select tag
- Add release notes

## Troubleshooting Development Issues

### Node Modules Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Permission Issues

```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $USER ~/.npm
```

### Git Issues

```bash
# Undo last commit (keep changes)
git reset HEAD~1

# Discard all local changes
git reset --hard HEAD
```

## Contributing Guidelines

### Before Submitting PR

- [ ] Code follows style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No merge conflicts with main branch

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes
4. Push to your fork
5. Open pull request
6. Address review comments
7. Merge when approved

## Resources

### Documentation
- [Node.js Docs](https://nodejs.org/docs/)
- [npm Docs](https://docs.npmjs.com/)
- [Plesk CLI Reference](https://docs.plesk.com/en-US/onyx/cli-linux/)

### Learning Resources
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)
- [Postman](https://www.postman.com/) (for API testing)

## Getting Help

- Check [README.md](README.md) for usage instructions
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for design details
- Review existing issues on GitHub
- Create new issue with:
  - Clear description
  - Steps to reproduce
  - Expected vs actual behavior
  - System information

## License

MIT License - See [LICENSE](LICENSE) file for details
