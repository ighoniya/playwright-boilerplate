import { createBdd } from "playwright-bdd";
import { InventoryPage } from "../../pages/saucedemo/inventory.page";
import { setLanguage } from "../../helper/locales";

const { Then, Before } = createBdd();

let inventoryPage: InventoryPage;

Before(async ({ page }) => {
  setLanguage("en");
  inventoryPage = new InventoryPage(page);
});

Then("I am redirected to the inventory page of Saucedemo", async () => {
  await inventoryPage.validateInventoryPage();
});
