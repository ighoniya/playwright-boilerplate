import { createBdd } from "playwright-bdd";
import { LoginPage } from "../../pages/saucedemo/login.page";
import { getUserCredentials } from "../../helper/credentials";
import { setLanguage } from "../../helper/locales";

const { Given, When, Then, Before } = createBdd();

let loginPage: LoginPage;
const project = "saucedemo";

Before(async ({ page }) => {
  setLanguage("en");
  loginPage = new LoginPage(page);
});

Given("I navigate to the login page of Saucedemo", async () => {
  await loginPage.navigate();
});

Then("the login page of Saucedemo is displayed", async () => {
  await loginPage.validateLoginPage();
});

When(
  "I log in with the {string} account on Saucedemo",
  async ({}, accountKey: string) => {
    const creds = getUserCredentials(project, accountKey);
    await loginPage.doLogin(creds.username, creds.password);
  },
);
