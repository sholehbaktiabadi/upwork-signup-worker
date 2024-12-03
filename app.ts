import MailSlurp from "mailslurp-client";
import puppeteer from "puppeteer-extra"
import stealthPlugin from "puppeteer-extra-plugin-stealth"
import { JSDOM } from "jsdom"
import UserAgent from "user-agents"
import anonymizeUa from "puppeteer-extra-plugin-anonymize-ua"

// country ==> United State, United Kingdom, Canada, Indonesia, Poland, Ukraine

import XLSX from "xlsx"
import { User } from "./interface/user";
// import { env } from "./env/env";

const workbook = XLSX.readFile('user_candidate.xlsx');

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const userCandidate: User[] = XLSX.utils.sheet_to_json(sheet);

puppeteer.use(stealthPlugin())
// main => a93ef00f57c419b5f55ed8aa5502a85123d8ae1580d9bbe95fe4cac98e74268f
// laramail => 8e52d4bd2f8838f7842c5ceecfd09b1a9e45e60a8c2b1be509c84725e89cb819 
const mailslurp = new MailSlurp({ apiKey: "8e52d4bd2f8838f7842c5ceecfd09b1a9e45e60a8c2b1be509c84725e89cb819" });
const delay = (delayInms: number) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
};

const extractUrl = (html: string): string | null => {
  // Parse the HTML content
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the link containing specific text or style
  const link = document.querySelector('a[href*="/nx/signup/verify-email/token"]');

  return link ? link.getAttribute("href") : null;
};

const generateRandomUA = () => {
  // Random user agents
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15'
  ];
  const randomUAIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomUAIndex];
}


async function bootstrap() {
  for await (const { email, firstName, lastName, password, inboxId, country } of userCandidate) {
    // const userAgent = new UserAgent({ platform: 'MacIntel', deviceCategory: 'desktop' });
    // const userAgentStr = userAgent.toString();
    // console.log("User Agent => " + userAgentStr)
    const UA = anonymizeUa({
      customFn: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
      stripHeadless: undefined,
      makeWindows: true
    })

    puppeteer.use(UA);
    // const customUA = generateRandomUA();
    const browser = await puppeteer.launch({ channel: "chrome", headless: false, devtools: false, args: ['--start-fullscreen'] })
    const page = await browser.newPage()
    // await page.setUserAgent(customUA);
    page.setViewport({ width: 1920, height: 1200 })
    await page.setBypassCSP(true)
    await page.goto("https://www.upwork.com/nx/signup/?dest=home")
    await page.click("#main > div > div > div > div > div > div > div:nth-child(2) > fieldset > div > div:nth-child(2) > div > input")
    await delay(1000)
    await page.click("#main > div > div > div > div > div > div > div.mt-6x.mt-md-10x > button")
    await delay(5000)
    await page.setBypassCSP(true)
    await page.type("#first-name-input", firstName, { delay: 20 })
    await delay(100)
    await page.type("#last-name-input", lastName, { delay: 20 })
    await delay(100)
    await page.type("#redesigned-input-email", email, { delay: 20 })
    await delay(2000)
    await page.type("#password-input", password, { delay: 80 })
    await delay(100)
    await page.click("#country-dropdown > div > div > span")
    await delay(100)
    await page.waitForSelector("#country-dropdown > div.air3-dropdown-menu-container > div > div.air3-dropdown-header-container.has-search > div > div > div > input")
    await page.type("#country-dropdown > div.air3-dropdown-menu-container > div > div.air3-dropdown-header-container.has-search > div > div > div > input", country)
    await delay(100)
    await page.keyboard.down("ArrowDown")
    await delay(100)
    await page.keyboard.press("Enter")
    await delay(1000)
    await page.click("#checkbox-terms > span.air3-checkbox-fake-input")
    await delay(2000)
    await page.click("#button-submit-form")
    await delay(5000)
    const lastEmail = await mailslurp.waitForLatestEmail(inboxId)
    await delay(1000)
    console.log(lastEmail.body, "latestEmail")
    const url = extractUrl(lastEmail.body as string);
    if (url) {
      console.log("Extracted URL:", url);
    } else {
      console.log("URL not found!");
    }
    if (!url) await page.close()
    await page.goto(url as string)
    await delay(5000)
    await page.close()
    await browser.close()
    // return await browser.close()
  }
  process.exit()
}

bootstrap()