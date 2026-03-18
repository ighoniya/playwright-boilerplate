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

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Generate BDD specs and run tests
npm test

# Run with UI mode (recommended for debugging)
npm run test:ui

# View test report
npm run report
```

---

## Project Structure

```
playwright-boilerplate/
├── tests/{project}/              # BDD feature files
├── support/
│   ├── pages/{project}/          # Page Object Models ({page}.page.ts)
│   ├── step_definitions/{project}/ # Step definitions ({page}.steps.ts)
│   ├── language/{en,id}.json     # Translations
│   ├── fixtures/credentials/{env}/ # Test data (gitignored)
│   └── fixtures/                 # Upload files
└── integration/                  # Generated specs
```

---

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Run tests with UI mode |
| `npm run test:ui-stag` | UI mode on staging |
| `npm run test:ui-prod` | UI mode on production |
| `npm run report` | View HTML report |
| `npm run test:report` | Run tests + open report |
| `npm run record` | Start Playwright codegen |

**Environment switching:**
```bash
ENV=staging npm test       # Uses .env.staging
ENV=production npm test    # Uses .env.production
```

---

## Workflow

1. **Write feature file** in `tests/{project}/{feature}.feature`
2. **Create page object** in `support/pages/{project}/{page}.page.ts`
3. **Implement steps** in `support/step_definitions/{project}/{page}.steps.ts`
4. **Generate specs:** `npm run bddgen`
5. **Run tests:** `npm test`

---

## Example Feature File

```gherkin
@sequence
Feature: Login with sequence

  Scenario: User logs in with valid credentials on Saucedemo
    Given I navigate to the login page of Saucedemo
    Then the login page of Saucedemo is displayed
    When I log in with the "main" account on Saucedemo
    Then I am redirected to the inventory page of Saucedemo
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

For complete standardization guide, conventions, and examples, see **[CLAUDE.md](./CLAUDE.md)**

---

## License

ISC
