import MailSlurp from "mailslurp-client";
import puppeteer from "puppeteer-extra"
import stealthPlugin from "puppeteer-extra-plugin-stealth"

puppeteer.use(stealthPlugin())

const delay = (delayInms: number) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };

const mailslurp = new MailSlurp({ apiKey: "a93ef00f57c419b5f55ed8aa5502a85123d8ae1580d9bbe95fe4cac98e74268f" });

async function bootstrap(){
    const browser = await puppeteer.launch({ channel: "chrome", headless: false, devtools: true, args: ['--start-fullscreen'] })
    const page = await browser.newPage()
    page.setViewport({ width: 1920, height: 1200 })
    await page.goto("https://www.upwork.com/nx/signup/?dest=home")
    await page.click("#main > div > div > div > div > div > div > div:nth-child(2) > fieldset > div > div:nth-child(2) > div > input")
    await page.click("#main > div > div > div > div > div > div > div.mt-6x.mt-md-10x > button")
    await delay(2000)
    await page.type("#first-name-input", "sholeh", { delay: 100 })
    await page.type("#last-name-input", "bakti abadi", { delay: 100 })

    await page.type("#redesigned-input-email", "sholehbaktiabadi@gmail.com", { delay: 100 })
    await page.type("#password-input", "NamaHewan1!", { delay: 100 })
    // await page.click("#country-dropdown > div > div > span")
    await page.click("#checkbox-terms > span.air3-checkbox-fake-input")
    // await page.click("#button-submit-form")
    await delay(2000)
    const lastEmail = await mailslurp.waitForLatestEmail('a0a692f7-3877-43f1-bbef-331dc79c873a')
    console.log(lastEmail, "latestEmail")
    // browser.close()
}

bootstrap()