import MailSlurp from "mailslurp-client";
import puppeteer from "puppeteer-extra"
import stealthPlugin from "puppeteer-extra-plugin-stealth"
import { JSDOM } from "jsdom"
import UserAgent from "user-agents"
import anonymizeUa from "puppeteer-extra-plugin-anonymize-ua"

import XLSX from "xlsx"
import { User } from "./interface/user";
// import { env } from "./env/env";

const workbook = XLSX.readFile('user_candidate.xlsx');

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const userCandidate: User[] = XLSX.utils.sheet_to_json(sheet);

puppeteer.use(stealthPlugin())

const mailslurp = new MailSlurp({ apiKey: "a93ef00f57c419b5f55ed8aa5502a85123d8ae1580d9bbe95fe4cac98e74268f" });
const delay = (delayInms: number) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
};

const extractUrl = (html: string): string | null => {
  // Parse the HTML content
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the link containing specific text or style
  const link = document.querySelector('a[href*="/nx/signup/verify-email/token"]');

  // Return the URL if found, otherwise return null
  return link ? link.getAttribute("href") : null;
};

const generateRandomUA = () => {
  // Array of random user agents
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15'
  ];
  // Get a random index based on the length of the user agents array 
  const randomUAIndex = Math.floor(Math.random() * userAgents.length);
  // Return a random user agent using the index above
  return userAgents[randomUAIndex];
}


async function bootstrap({ email, firstName, lastName, password, inboxId }: User) {
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
  await delay(3000)
  await page.click("#main > div > div > div > div > div > div > div.mt-6x.mt-md-10x > button")
  await delay(5000)
  await page.setBypassCSP(true)
  await page.type("#first-name-input", firstName, { delay: 50 })
  await delay(3000)
  await page.type("#last-name-input", lastName, { delay: 50 })
  await delay(3000)
  await page.type("#redesigned-input-email", email, { delay: 50 })
  await delay(3000)
  await page.type("#password-input", password, { delay: 500 })
  await delay(3000)
  // await page.click("#country-dropdown > div > div > span")
  await page.click("#checkbox-terms > span.air3-checkbox-fake-input")
  await delay(3000)
  await page.click("#button-submit-form")
  await delay(3000)
  const lastEmail = await mailslurp.waitForLatestEmail(inboxId)
  await delay(10000)
  console.log(lastEmail.body, "latestEmail")
  // selector resend verification selector => #main > div > div > div > div.air3-grid-container.px-lg-10x > div > div:nth-child(3) > div > button
  const url = extractUrl(lastEmail.body as string);
  if (url) {
    console.log("Extracted URL:", url);
  } else {
    console.log("URL not found!");
  }
  if (!url) await page.close()
  await page.goto(url as string)
  // await page.close()
  // await browser.close()
  // return await browser.close()
}

userCandidate.forEach(async (res) => {
  await bootstrap(res)
})