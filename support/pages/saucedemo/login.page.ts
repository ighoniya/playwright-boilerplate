import { Page, expect } from "@playwright/test";
import { getText } from "../../helper/locales";
import { getEnv } from "../../helper/env";

const project = "saucedemo";
const page = "login_page";

export class LoginPage {
  readonly page: Page;

  private selectors = {
    titlePage: ".login_logo",
    usernameField: "[data-test='username']",
    passwordField: "[data-test='password']",
    loginButton: "[data-test='login-button']",
  };

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = "") {
    const baseURL = getEnv("SAUCE_BASE_URL");
    await this.page.goto(`${baseURL}/${path}`);
  }

  async validateLoginPage() {
    const title = getText(project, page, "title");
    await expect(this.page.locator(this.selectors.titlePage)).toContainText(
      title,
    );
    await expect(this.page.locator(this.selectors.usernameField)).toBeVisible();
    await expect(this.page.locator(this.selectors.passwordField)).toBeVisible();
    await expect(this.page.locator(this.selectors.loginButton)).toBeVisible();
  }

  async enterUsername(username: string) {
    await this.page.locator(this.selectors.usernameField).fill(username);
  }

  async enterPassword(password: string) {
    await this.page.locator(this.selectors.passwordField).fill(password);
  }

  async doLogin(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.page.locator(this.selectors.loginButton).click();
  }
}
