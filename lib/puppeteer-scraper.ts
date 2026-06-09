import puppeteer, { Browser, Page } from "puppeteer";

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  postedDate?: string;
  source: "linkedin" | "indeed" | "glassdoor" | "custom";
}

export interface ScrapeConfig {
  source: string;
  query: string;
  location?: string;
  maxPages?: number;
  filters?: {
    remote?: boolean;
    experience?: string;
    datePosted?: string;
  };
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
];

export class JobScraper {
  private browser: Browser | null = null;

  async scrapeJobs(config: ScrapeConfig): Promise<ScrapedJob[]> {
    const maxPages = Math.min(config.maxPages || 3, 20);
    const normalizedSource = config.source.toLowerCase();

    try {
      if (normalizedSource === "indeed") {
        return await this.scrapeIndeed({ ...config, maxPages });
      }
      if (normalizedSource === "linkedin") {
        return await this.scrapeLinkedIn({ ...config, maxPages });
      }
      if (normalizedSource === "custom" && config.query) {
        const job = await this.scrapeCustomUrl(config.query);
        return job ? [job] : [];
      }
      throw new Error(`Unsupported source: ${config.source}`);
    } finally {
      await this.closeBrowser();
    }
  }

  private async launchBrowser(): Promise<Browser> {
    if (this.browser) return this.browser;

    const viewport = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
      ],
    });

    const pages = await this.browser.pages();
    if (pages[0]) {
      await pages[0].setViewport(viewport);
      await pages[0].setUserAgent(userAgent);
      await pages[0].evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
        Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
      });
    }

    return this.browser;
  }

  private async getPage(): Promise<Page> {
    const browser = await this.launchBrowser();
    const pages = await browser.pages();
    return pages[0] || browser.newPage();
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async delay(ms: number): Promise<void> {
    const jitter = Math.floor(Math.random() * 3000) + 2000; // 2-5s
    return new Promise((resolve) => setTimeout(resolve, ms + jitter));
  }

  private async safeGoto(page: Page, url: string): Promise<boolean> {
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      return true;
    } catch (error) {
      console.error(`Failed to navigate to ${url}:`, error);
      try {
        await page.screenshot({ path: `./scraper-error-${Date.now()}.png`, fullPage: true });
      } catch {
        // ignore screenshot errors
      }
      return false;
    }
  }

  private async scrapeIndeed(config: ScrapeConfig & { maxPages: number }): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const page = await this.getPage();
    const location = config.location || "";
    const query = encodeURIComponent(config.query);
    const loc = encodeURIComponent(location);

    for (let pageNum = 0; pageNum < config.maxPages; pageNum++) {
      const start = pageNum * 10;
      const url = `https://www.indeed.com/jobs?q=${query}&l=${loc}&start=${start}`;

      const ok = await this.safeGoto(page, url);
      if (!ok) continue;

      await this.delay(1000);

      const jobCards = await page.$$eval(
        ".job_seen_beacon, [data-testid='jobTitle'], .slider_container .slider_item",
        (elements) =>
          elements.map((el) => {
            const titleEl =
              el.querySelector("h2 a span") ||
              el.querySelector("[data-testid='jobTitle']") ||
              el.querySelector("a[id^='job_'] span") ||
              el.querySelector("h2 a");
            const companyEl =
              el.querySelector("[data-testid='company-name']") ||
              el.querySelector(".companyName") ||
              el.querySelector("span[data-testid='company-name']");
            const locationEl =
              el.querySelector("[data-testid='job-location']") ||
              el.querySelector(".companyLocation") ||
              el.querySelector("div[data-testid='job-location']");
            const salaryEl =
              el.querySelector("[data-testid='job-salary']") ||
              el.querySelector(".estimated-salary") ||
              el.querySelector(".salary-snippet-container");
            const linkEl = el.querySelector("h2 a") || el.querySelector("a[id^='job_']");

            return {
              title: titleEl?.textContent?.trim() || "",
              company: companyEl?.textContent?.trim() || "",
              location: locationEl?.textContent?.trim() || "",
              salary: salaryEl?.textContent?.trim() || undefined,
              link: (linkEl as HTMLAnchorElement)?.href || "",
            };
          }),
      );

      for (const card of jobCards) {
        if (!card.title || !card.company) continue;
        if (jobs.some((j) => j.url === card.link)) continue;

        let description = "";
        let postedDate = "";

        if (card.link) {
          try {
            const detailOk = await this.safeGoto(page, card.link);
            if (detailOk) {
              await this.delay(800);
              description = await page.$eval(
                "#jobDescriptionText, [data-testid='job-description-text'], .jobsearch-JobComponent-description",
                (el) => el.textContent?.trim() || "",
              ).catch(() => "");

              postedDate = await page.$eval(
                "[data-testid='job-date-posted'], .jobsearch-JobMetadataHeader-item",
                (el) => el.textContent?.trim() || "",
              ).catch(() => "");
            }
          } catch {
            // description fetch failed, use empty
          }
        }

        jobs.push({
          title: card.title,
          company: card.company,
          location: card.location,
          salary: card.salary,
          description: description || "No description available",
          url: card.link || url,
          postedDate: postedDate || undefined,
          source: "indeed",
        });

        if (jobs.length >= 50) break;
      }

      if (jobs.length >= 50) break;
      await this.delay(1500);
    }

    return jobs;
  }

  private async scrapeLinkedIn(config: ScrapeConfig & { maxPages: number }): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    const page = await this.getPage();
    const location = config.location || "";
    const query = encodeURIComponent(config.query);
    const loc = encodeURIComponent(location);

    for (let pageNum = 0; pageNum < config.maxPages; pageNum++) {
      const start = pageNum * 25;
      const url = `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${loc}&start=${start}`;

      const ok = await this.safeGoto(page, url);
      if (!ok) continue;

      await this.delay(1500);

      // Scroll to load lazy cards
      for (let scroll = 0; scroll < 3; scroll++) {
        await page.evaluate(() => window.scrollBy(0, 800));
        await this.delay(500);
      }

      const jobCards = await page.$$eval(
        ".base-card, .jobs-search__results-list li, [data-job-id]",
        (elements) =>
          elements.map((el) => {
            const titleEl =
              el.querySelector(".base-search-card__title") ||
              el.querySelector("h3") ||
              el.querySelector("a span[aria-hidden='true']");
            const companyEl =
              el.querySelector(".base-search-card__subtitle") ||
              el.querySelector("h4") ||
              el.querySelector(".base-card__subtitle");
            const locationEl =
              el.querySelector(".job-search-card__location") ||
              el.querySelector(".base-search-card__metadata span") ||
              el.querySelector("[class*='location']");
            const linkEl = el.querySelector("a.base-card__full-link, a[href*='/jobs/view/']");
            const timeEl =
              el.querySelector("time") ||
              el.querySelector(".job-search-card__listdate");

            return {
              title: titleEl?.textContent?.trim() || "",
              company: companyEl?.textContent?.trim() || "",
              location: locationEl?.textContent?.trim() || "",
              link: (linkEl as HTMLAnchorElement)?.href || "",
              postedDate: timeEl?.textContent?.trim() || (timeEl as HTMLTimeElement)?.dateTime || "",
            };
          }),
      );

      for (const card of jobCards) {
        if (!card.title || !card.company) continue;
        if (jobs.some((j) => j.url === card.link)) continue;

        let description = "";
        if (card.link) {
          try {
            const detailOk = await this.safeGoto(page, card.link);
            if (detailOk) {
              await this.delay(800);
              description = await page.$eval(
                ".description__text, .jobs-description__content, [class*='description']",
                (el) => el.textContent?.trim() || "",
              ).catch(() => "");
            }
          } catch {
            // ignore
          }
        }

        jobs.push({
          title: card.title,
          company: card.company,
          location: card.location,
          description: description || "No description available",
          url: card.link || url,
          postedDate: card.postedDate || undefined,
          source: "linkedin",
        });

        if (jobs.length >= 50) break;
      }

      if (jobs.length >= 50) break;
      await this.delay(2000);
    }

    return jobs;
  }

  private async scrapeCustomUrl(url: string): Promise<ScrapedJob | null> {
    const page = await this.getPage();
    const ok = await this.safeGoto(page, url);
    if (!ok) return null;

    await this.delay(1000);

    const title = await page.$eval("h1", (el) => el.textContent?.trim() || "").catch(() => "");
    const description = await page.evaluate(() => {
      const article = document.querySelector("article, .job-description, [class*='description']");
      if (article?.textContent) return article.textContent.trim();
      const main = document.querySelector("main");
      if (main?.textContent) return main.textContent.trim().slice(0, 4000);
      return document.body.innerText.trim().slice(0, 4000);
    });

    const company = await page.$eval(
      "[class*='company'], [class*='employer'], meta[property='og:site_name']",
      (el) => el.getAttribute("content") || el.textContent?.trim() || "",
    ).catch(() => "");

    const location = await page.$eval(
      "[class*='location'], [class*='place']",
      (el) => el.textContent?.trim() || "",
    ).catch(() => "");

    return {
      title: title || "Untitled Job",
      company: company || "Unknown Company",
      location: location || "Unknown Location",
      description: description || "No description available",
      url,
      source: "custom",
    };
  }
}
