# Playwright Boilerplate - Standardization Guide

---

## Project Structure

`tests/{project}/{feature}.feature` - BDD | `support/pages/{project}/{page}.page.ts` - Page objects
`support/step_definitions/{project}/{page}.steps.ts` - Steps | `support/language/{en,id}.json` - Translations
`support/fixtures/credentials/{env}/{type}.json` - Test data | `integration/` - Generated specs

---

## Language Format

**Pattern:** `{project}.{page_name}.{element}` (page uses underscore)

```json
{ "saucedemo": { "login_page": { "title": "Swag Labs" } }
```

**Usage:** `getText('saucedemo', 'login_page', 'title')`

---

## Page Objects

**File:** `{page}.page.ts` | **Class:** `{PageName}Page`

```typescript
const project = "saucedemo",
  page = "login_page";
export class LoginPage {
  readonly page: Page;
  private selectors = { usernameField: "[data-test='username']" };
  constructor(page: Page) {
    this.page = page;
  }
  async navigate(path = "") {
    await this.page.goto(`${process.env.SAUCE_BASE_URL}/${path}`);
  }
}
```

---

## Step Definitions

**Include project name in step description**

```typescript
const { Given, When } = createBdd();
Given(
  "I navigate to the login page of Saucedemo",
  async () => await loginPage.navigate(),
);
When(
  "I log in with the {string} account on Saucedemo",
  async ({}, accountKey) => {
    const creds = getUserCredentials("saucedemo", accountKey);
    await loginPage.doLogin(creds.username, creds.password);
  },
);
```

---

## Credentials & Environment

**Structure:** `support/fixtures/credentials/{env}/{type}.json`

```json
{ "saucedemo": { "main": { "username": "...", "password": "***" } }
```

**Usage:** `getUserCredentials(project, userKey)` → `{ username, password }`
**Env:** `support/environment/.env.{staging,production}` | Switch: `ENV=staging npm test`

---

## Key Helpers

`getText(project, page_name, key)` - Get localized text
`getUserCredentials(project, userKey)` - Get `{ username, password }`
`setLanguage("en"|"id")` - Set language
`stateStore[key] = value` - Share data across sequential scenarios (use with `@sequence`)

---

## Commands

`npm test` - Run all | `npm run test:ui` - UI mode | `npm run report` - View report
`npm run test:report` - Run + open | `npm run record` - Codegen | `npm run bddgen` - Generate specs
**Workflow:** `.feature` → `.page.ts` → `.steps.ts` → `npm run bddgen` → `npm test`
