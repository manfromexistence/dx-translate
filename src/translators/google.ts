import puppeteer, { Browser, Page } from "puppeteer";
import { BaseTranslator } from "@/translators/base";
import { TranslationNotFoundException } from "@/utils/exceptions";
import { GOOGLE_LANGUAGES_TO_CODES } from "@/utils/languages";

export class GoogleTranslator extends BaseTranslator {
  private browser: Browser | null = null;

  constructor(source: string = "auto", target: "en") {
    super(source, target, GOOGLE_LANGUAGES_TO_CODES);
  }

  private async init() {
    if (!this.browser) {
      // Changed headless: "new" to headless: true for broader compatibility
      this.browser = await puppeteer.launch({ headless: true });
    }
  }

  public async translate(text: string): Promise<string> {
    if (this.source === this.target || !text.trim()) {
      return text;
    }

    await this.init();
    if (!this.browser) {
      throw new Error("Puppeteer browser is not initialized.");
    }

    const page: Page = await this.browser.newPage();
    const url = `https://translate.google.com/?sl=${this.source}&tl=${this.target}&text=${encodeURIComponent(text)}&op=translate`;

    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      // Wait for the translation result to appear in the DOM
      const resultSelector = ".ryNqvb";
      await page.waitForSelector(resultSelector, { timeout: 10000 });

      const translatedText = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent : null;
      }, resultSelector);

      if (!translatedText) {
        throw new TranslationNotFoundException(text);
      }

      return translatedText;

    } catch (error) {
        console.error("An error occurred during Google translation:", error);
        throw new TranslationNotFoundException(text);
    } finally {
      await page.close();
    }
  }

  public async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
