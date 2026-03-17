import { Page, expect } from "@playwright/test";
import { getText } from "../../helper/locales";

const project = "saucedemo";
const page = "inventory_page";

export class InventoryPage {
  readonly page: Page;

  private selectors = {
    titlePage: "[data-test='title']",
  };

  constructor(page: Page) {
    this.page = page;
  }

  async validateInventoryPage() {
    const title = getText(project, page, "title");
    await expect(this.page.locator(this.selectors.titlePage)).toContainText(
      title,
    );
  }
}
