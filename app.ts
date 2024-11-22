import MailSlurp from "mailslurp-client";
import puppeteer from "puppeteer-extra"
import stealthPlugin from "puppeteer-extra-plugin-stealth"
import { JSDOM } from "jsdom"

import XLSX from "xlsx"
import { User } from "./interface/user";

// Load the file
const workbook = XLSX.readFile('user_candidate.xlsx');

// Select the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert sheet to JSON
const userCandidate: User[] = XLSX.utils.sheet_to_json(sheet);

puppeteer.use(stealthPlugin())

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

const mailslurp = new MailSlurp({ apiKey: "a93ef00f57c419b5f55ed8aa5502a85123d8ae1580d9bbe95fe4cac98e74268f" });

async function bootstrap({ email, firstName, lastName, password, inboxId }: User) {
  console.log(userCandidate)
  const browser = await puppeteer.launch({ channel: "chrome", headless: false, devtools: true, args: ['--start-fullscreen'] })
  const page = await browser.newPage()
  page.setViewport({ width: 1920, height: 1200 })
  await page.goto("https://www.upwork.com/nx/signup/?dest=home")
  await page.setBypassCSP(true)
  await page.click("#main > div > div > div > div > div > div > div:nth-child(2) > fieldset > div > div:nth-child(2) > div > input")
  await delay(3000)
  await page.click("#main > div > div > div > div > div > div > div.mt-6x.mt-md-10x > button")
  await delay(5000)
  await page.type("#first-name-input", firstName, { delay: 500 })
  await delay(3000)
  await page.type("#last-name-input", lastName, { delay: 500 })
  await delay(3000)
  await page.type("#redesigned-input-email", email, { delay: 500 })
  await delay(3000)
  await page.type("#password-input", password, { delay: 500 })
  await delay(3000)
  // await page.click("#country-dropdown > div > div > span")
  await page.click("#checkbox-terms > span.air3-checkbox-fake-input")
  await delay(3000)
  await page.setBypassCSP(true)
  await page.click("#button-submit-form")
  await delay(3000)
  const lastEmail = await mailslurp.waitForLatestEmail(inboxId)
  await delay(3000)
  console.log(lastEmail.body, "latestEmail")
  // selector resend verification selector => #main > div > div > div > div.air3-grid-container.px-lg-10x > div > div:nth-child(3) > div > button
  // browser.close()
  const url = extractUrl(lastEmail.body as string);
  if (url) {
    console.log("Extracted URL:", url);
  } else {
    console.log("URL not found!");
  }
  if(!url) await page.close()
  await page.goto(url as string)
  await page.close()
}

userCandidate.forEach(async (res) => {
  await bootstrap(res)
});