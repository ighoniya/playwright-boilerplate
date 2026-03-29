# Playwright Test Automation Boilerplate

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-green)](https://playwright.dev)
[![BDD](https://img.shields.io/badge/BDD-Gherkin-orange)](https://cucumber.io/docs/gherkin/)

A standardized Playwright test automation framework for UI and API testing using TypeScript and BDD.

---

## Recommended VSCode Extensions

Install these extensions for better productivity:

| Extension | Purpose | Install |
|-----------|---------|---------|
| `alexkrechik.cucumberautocomplete` | Gherkin syntax highlighting and autocomplete | [Link](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) |
| `ms-playwright.playwright` | Playwright official extension (recorder, trace viewer) | [Link](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) |
| `dbaeumer.vscode-eslint` | ESLint for code quality (optional) | [Link](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) |

---

## Prerequisites

### System Requirements

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install npm dependencies
npm install

# Install Playwright browsers
npx playwright install
```

---

## Quick Start

```bash
# Generate BDD specs and run tests
npm test

# Run with UI mode (recommended for debugging)
npm run test:ui

# View test report
npm run report
```

---

## Environment Configuration

Available environments:

- `staging` - For staging environment testing
- `production` - For production environment testing

```bash
# Use staging environment
ENV=staging npm test

# Use production environment
ENV=production npm test

# UI mode with environment
ENV=staging npm run test:ui
ENV=production npm run test:ui
```

---

## Excluding Tests by Environment

Exclude tests from running in specific environments by configuring exclusion patterns in `support/exclude/{env}/`:

```json
{
  "exclude": [
    "tests/saucedemo/example-exclude/login.feature",
    "tests/practise/**"
  ]
}
```

### Patterns

| Pattern | Excludes |
|---------|----------|
| `tests/saucedemo/login.feature` | Specific file |
| `tests/saucedemo/example-parallel` | All files in folder |
| `tests/practise/**` | All files recursively |
| `tests/**` | All tests |

Supported files: `.feature` and `.ts` (including `.spec.ts`)

### Usage

```bash
ENV=staging npm run bddgen    # Uses staging exclusions
ENV=production npm run bddgen # Uses production exclusions
```

---

## @sequence Tag Behavior

The `@sequence` tag controls how scenarios in a feature file execute:

### With `@sequence`
- Scenarios run **sequentially** (one after another)
- If scenario 3 of 10 fails, scenarios 4-10 **will NOT run**
- Failed scenarios show as "failed", skipped scenarios show as "pending" in report
- Team focuses on fixing failures before proceeding
- Use when scenarios depend on each other or share data via `stateStore`

### Without `@sequence`
- Scenarios run in **parallel** (multiple at same time)
- All scenarios run regardless of failures
- Better for independent, isolated test cases

### How It Works
1. Add `@sequence` tag to your feature file
2. Run `npm run bddgen` to generate specs
3. The `make-serial.js` script converts `test.describe()` to `test.describe.serial()`
4. Tests run sequentially with fail-fast behavior

---

## Test Reports

After running tests, use `npm run report` to view:

- **Videos** of test execution
- **Network traffic** (HTTP requests/responses)
- **Screenshots** on each step
- **Console logs** and DOM snapshots
- **Trace viewer** for detailed debugging

---

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Cucumber Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Playwright BDD Cucumber](https://cucumber.io/docs/installation/javascript/)

---

## License

ISC
