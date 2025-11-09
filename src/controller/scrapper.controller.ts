import { Request, Response } from "express";
import puppeteer from "puppeteer";
import { validateAndNormalizeUrl } from "../utils/url";

export async function scrapper(req: Request, res: Response) {
  const MAX_EXECUTION_TIME = 20000; // max time a task will have to scrape details

  const inputUrl = req.query["url"];
  const validation = validateAndNormalizeUrl(inputUrl);

  if (!validation.ok) {
    return res.status(400).json({
      status: 400,
      error: "invalid_url",
      code: validation.error,
    });
  }

  const url = validation.value!;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: MAX_EXECUTION_TIME,
    });

    await page.setViewport({ width: 1080, height: 1024 });

    const h1_element = await page.$("h1");
    const h1Text = h1_element
      ? (await h1_element.evaluate((n) => n.textContent?.trim() || "")) || null
      : null;

    const metaDescription = await page
      .$eval(
        'meta[name="description"]',
        (el) => (el as HTMLMetaElement).content.trim() || null
      )
      .catch(() => null);

    const titleRaw = await page.title();
    const title = titleRaw.trim() || null;

    return res.status(200).json({
      title,
      metaDescription,
      h1: h1Text,
      status: 200,
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      error: "scrape_failed",
      message: (e as Error).message,
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
