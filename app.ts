import MailSlurp from "mailslurp-client";
import puppeteer from "puppeteer-extra"
import p from "puppeteer"
import stealthPlugin from "puppeteer-extra-plugin-stealth"
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

// const extractUrl = (html: string): string | null => {
//   // Parse the HTML content
//   const dom = new JSDOM(html);
//   const document = dom.window.document;

//   // Find the link containing specific text or style
//   const link = document.querySelector('a[href*="/nx/signup/verify-email/token"]');

//   return link ? link.getAttribute("href") : null;
// };

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
  for await (const { email, firstName, lastName, password, inboxId, country, skill, exCompany, desc, role, adress, city } of userCandidate) {
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
    // await page.goto("https://www.upwork.com/nx/signup/?dest=home")
    // await page.click("#main > div > div > div > div > div > div > div:nth-child(2) > fieldset > div > div:nth-child(2) > div > input")
    // await delay(1000)
    // await page.click("#main > div > div > div > div > div > div > div.mt-6x.mt-md-10x > button")
    // await delay(5000)
    // await page.setBypassCSP(true)
    // await page.type("#first-name-input", firstName, { delay: 20 })
    // await delay(100)
    // await page.type("#last-name-input", lastName, { delay: 20 })
    // await delay(100)
    // await page.type("#redesigned-input-email", email, { delay: 20 })
    // await delay(2000)
    // await page.type("#password-input", password, { delay: 80 })
    // await delay(100)
    // await page.click("#country-dropdown > div > div > span")
    // await delay(100)
    // await page.waitForSelector("#country-dropdown > div.air3-dropdown-menu-container > div > div.air3-dropdown-header-container.has-search > div > div > div > input")
    // await page.type("#country-dropdown > div.air3-dropdown-menu-container > div > div.air3-dropdown-header-container.has-search > div > div > div > input", country)
    // await delay(100)
    // await page.keyboard.down("ArrowDown")
    // await delay(100)
    // await page.keyboard.press("Enter")
    // await delay(1000)
    // await page.click("#checkbox-terms > span.air3-checkbox-fake-input")
    // await delay(2000)
    // await page.click("#button-submit-form")
    // await delay(5000)
    // const lastEmail = await mailslurp.waitForLatestEmail(inboxId)
    // await delay(1000)
    // console.log(lastEmail.body, "latestEmail")
    // const url = extractUrl(lastEmail.body as string);
    // if (url) {
    //   console.log("Extracted URL:", url);
    // } else {
    //   console.log("URL not found!");
    // }
    // if (!url) await page.close()
    // await page.goto(url as string)
    // await delay(5000)
    await page.setDefaultTimeout(90000)
    await page.goto("https://www.upwork.com/ab/account-security/login")
    // login section
    await page.waitForSelector("#login_username")
    await page.type("#login_username", email)
    await delay(5000)
    await page.click("#login_password_continue")

    await delay(5000)
    await page.waitForSelector("#login_password")
    await page.waitForSelector("#login_control_continue")
    await page.type("#login_password", password)
    await delay(100)
    await page.click("#login_control_continue")
    await delay(5000)

    const pageUrl = page.url()
    if(pageUrl != "https://www.upwork.com/nx/create-profile/welcome") await page.goto("https://www.upwork.com/nx/create-profile/welcome")
    // get started section
    await delay(5000)
    await page.waitForSelector("#main > div > div > div.span-md-10.span-lg-6 > div > div.d-flex.mr-md-7.align-items-center > button > span")
    await page.click("#main > div > div > div.span-md-10.span-lg-6 > div > div.d-flex.mr-md-7.align-items-center > button > span")
    await delay(2000)

    // quick section 1/3
    await page.waitForSelector("#step-2 > div > div.mt-6 > div > div > div > div:nth-child(3) > div > input")
    await page.click("#step-2 > div > div.mt-6 > div > div > div > div:nth-child(3) > div > input")
    await delay(100)
    await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button.air3-btn.air3-btn-primary")
    await delay(1000)
    // quick section 2/3
    await page.waitForSelector("#step-6 > div > div.mt-6 > div > div > div > div:nth-child(3) > div > input")
    await page.click("#step-6 > div > div.mt-6 > div > div > div > div:nth-child(3) > div > input")
    await delay(100)
    await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button.air3-btn.air3-btn-primary")
    await delay(2000)
    // quick section 3/3
    await page.waitForSelector("#step-11 > div > div.mt-6 > div:nth-child(1) > div > div:nth-child(1) > div > input")
    const checkboxs = await page.$$("input[type='checkbox']")
    let isChecked : boolean = false
    let checkBucket : boolean[] = []
    for await (const checkbox of checkboxs) {
        isChecked = await checkbox.evaluate(input => input.checked)
        checkBucket.push(isChecked)
    }
    isChecked = checkBucket.includes(true)
    await delay(1000)
    if(!isChecked) await page.click("#step-11 > div > div.mt-6 > div:nth-child(1) > div > div:nth-child(1) > div > input")
    await delay(100)
    await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button.air3-btn.air3-btn-primary")
    await delay(5000)

    // create profile 1/10
    await page.waitForSelector("div.air3-grid-container.justify-space-between > div.span-12.span-md-5.pt-8x > div > button:nth-child(4) > span")
    await page.click("div.air3-grid-container.justify-space-between > div.span-12.span-md-5.pt-8x > div > button:nth-child(4) > span")
    await delay(2000)
    const isMarkAsEditedProfile = await page.$("body > div.air3-fullscreen-element > div > div.air3-fullscreen-container > div > div > div.air3-modal-footer > div > button.air3-btn.air3-btn-primary.mb-0")
    if(isMarkAsEditedProfile) await page.click("body > div.air3-fullscreen-element > div > div.air3-fullscreen-container > div > div > div.air3-modal-footer > div > button.air3-btn.air3-btn-primary.mb-0")

    await delay(5000)
    // create profile 2/10
    checkBucket.fill(false)
    const checkboxs2_10 = await page.$$("input[type='checkbox']")
    for await (const checkbox of checkboxs2_10) {
        isChecked = await checkbox.evaluate(input => input.checked)
        checkBucket.push(isChecked)
    }
    isChecked = checkBucket.includes(true)
    if(!isChecked){
      await page.click("div.onb-fe-categories-step > div.d-none.d-md-flex.content.mb-5 > div.left.d-flex.flex-column > nav > ul > li:nth-child(11) > a")
      await delay(100)
      await page.click("div.onb-fe-categories-step > div.d-none.d-md-flex.content.mb-5 > div.right.d-flex.flex-column > div.specialties > fieldset > label:nth-child(1) > span")
      const isOption2Exist = await page.$("div.onb-fe-categories-step > div.d-none.d-md-flex.content.mb-5 > div.right.d-flex.flex-column > div.has-error.specialties > fieldset > label:nth-child(2) > span")
      if(isOption2Exist) await page.click("div.onb-fe-categories-step > div.d-none.d-md-flex.content.mb-5 > div.right.d-flex.flex-column > div.has-error.specialties > fieldset > label:nth-child(2) > span")
    }else{
      await page.click("div.onb-fe-categories-step > div.d-none.d-md-flex.content.mb-5 > div.left.d-flex.flex-column > nav > ul > li:nth-child(11) > a")
      await delay(200)
      const isOption2Exist = await page.$("div.onb-fe-categories-step > div.d-none.d-md-flex.content.mb-5 > div.right.d-flex.flex-column > div.has-error.specialties > fieldset > label:nth-child(2) > span")
      if(isOption2Exist) await page.click("div.onb-fe-categories-step > div.d-none.d-md-flex.content.mb-5 > div.right.d-flex.flex-column > div.has-error.specialties > fieldset > label:nth-child(2) > span")
    }
    await delay(100)
    await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button")
    await delay(2000)
    // create profile 3/10
    // const yourSkill = await page.waitForSelector('::-p-xpath(//html/body/div[3]/div/div/main/div/div/div/div/div[1]/div[2]/div/div[3]/div/div[2]/div[1]/div/div[1]/div[1]/div/div[1]/div/span/div/div[1]/div/ol[1]/li/div/div/div/span/div[1]/div/div/div/input)')
    await delay(400)
    await page.click("div.air3-grid-container > div.span-md-10.span-lg-7.span-xl-8.mr-md-7 > div > div.suggested-skills-container > div > div > div:nth-child(1)")
    await delay(100)
    await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button")
    await delay(2000)
    // create profile 4/10
    await page.waitForSelector("div.air3-grid-container > div > div > div > div > div > div > input")
    await page.type("div.air3-grid-container > div > div > div > div > div > div > input", skill)
    await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button")
    await delay(2000)
    // create profile 5/10
    await page.click("div.mt-6 > div:nth-child(1) > a > div > button")
    await delay(2000)
    const titleField5_10 = await page.waitForSelector('input[placeholder="Ex: Software Engineer"]');
    await titleField5_10.focus()
    await delay(1000)
    await titleField5_10.type("Softw", { delay: 2000 });
    await page.keyboard.down("ArrowDown")
    await delay(100)
    await page.keyboard.press("Enter")
    const companyField5_10 = await page.waitForSelector('input[placeholder="Ex: Microsoft"]');
    await companyField5_10.focus()
    await delay(500)
    await companyField5_10.type(exCompany, { delay: 200 });
    await delay(1000)
    const locationField5_10 = await page.waitForSelector('input[placeholder="Ex: London"]');
    await delay(500)
    await locationField5_10.type("Remote", { delay: 200 });
    await delay(1000)
    const span5_10 = await page.waitForSelector('span[data-v-920a6dda=""]');
    await delay(500)
    await span5_10.click();
    await delay(500)
    const yearDropdown5_10 = await page.waitForSelector(
      'div[data-test="dropdown-toggle"][aria-labelledby="start-date-year"]'
    );
    await delay(500)
    await yearDropdown5_10.click();
    await delay(500)
    await page.keyboard.down("ArrowDown")
    await delay(100)
    await page.keyboard.down("ArrowDown")
    await delay(100)
    await page.keyboard.press("Enter")
    await delay(1000)
    const monthDropdown5_10 = await page.waitForSelector(
      'div[data-test="dropdown-toggle"][aria-labelledby="start-date-month"]'
    );
    await delay(500)
    await monthDropdown5_10.click();
    await delay(500)
    await page.keyboard.down("ArrowDown")
    await delay(100)
    await page.keyboard.down("ArrowDown")
    await delay(100)
    await page.keyboard.press("Enter")
    await delay(1000)
    const saveButton5_10 = await page.waitForSelector(
      'div[data-qa="employment-dialog-footer"] button[data-qa="btn-save"]'
    );
    saveButton5_10.click()
    await delay(1000)
    await page.click("div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button.air3-btn.air3-btn-primary")
    await delay(2000)
    
    // create profile 6/10
    await page.click("div.mt-6 > div.d-md-block > a")
    await delay(2000)
    const schoolName6_10 = await page.waitForSelector('input[placeholder="Ex: Northwestern University"]');
    await schoolName6_10.focus()
    await delay(1000)
    await schoolName6_10.type("Politeknik Negeri Madiun", { delay: 200 });
    await delay(1000)
    const degree6_10 = await page.waitForSelector('input[placeholder="Ex: Bachelors"]');
    await degree6_10.focus()
    await delay(1000)
    await degree6_10.type("Bachelor Of T", { delay: 2000 });
    await page.keyboard.down("ArrowDown")
    await delay(100)
    await page.keyboard.press("Enter")
    const fieldStudy6_10 = await page.waitForSelector('input[placeholder="Ex: Computer Science"]');
    await delay(1000)
    await fieldStudy6_10.focus()
    await delay(500)
    await fieldStudy6_10.type("Teknik Komputer Kontrol", { delay: 50 });

    const dropdowns = await page.$$('div[data-test="dropdown-toggle"]');

    for (const dropdown of dropdowns) {
        const label = await dropdown.$eval(
            'span.air3-dropdown-toggle-label',
            el => el.textContent.trim()
        );
    
        if (label === 'From') {
            await delay(500)
            await dropdown.focus()
            await delay(1000)
            await dropdown.click();
            await delay(500)
            await page.keyboard.down("ArrowDown")
            await delay(100)
            await page.keyboard.down("ArrowDown")
            await delay(100)
            await page.keyboard.down("ArrowDown")
            await delay(100)
            await page.keyboard.press("Enter")
        } else if (label === 'To (or expected graduation year)') {
            await delay(500)
            await dropdown.focus()
            await delay(1000)
            await dropdown.click();
            await delay(500)
            await page.keyboard.down("ArrowDown")
            await delay(100)
            await page.keyboard.down("ArrowDown")
            await delay(100)
            await page.keyboard.down("ArrowDown")
            await delay(100)
            await page.keyboard.press("Enter")
        }
    }

    const saveButton6_10 = await page.waitForSelector(
      'div[data-qa="education-dialog-footer"] button[data-qa="btn-save"]'
    );
    await delay(500)
    saveButton6_10.click()
    await delay(2000)
    await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button")
    // <div data-ev-label="dropdown_toggle" data-test="dropdown-toggle" class="air3-dropdown-toggle is-selected" role="combobox" aria-expanded="false" tabindex="0" aria-controls="dropdown-menu" aria-labelledby="dates-attended-label"><div class="air3-dropdown-toggle-title"><!----><span class="air3-dropdown-toggle-label ellipsis">From</span><div class="air3-icon md air3-dropdown-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 24 24" role="img"><path vector-effect="non-scaling-stroke" stroke="var(--icon-color, #001e00)" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M18 10l-6 5-6-5"></path></svg></div></div></div>
    await delay(2000)

    // // create profile 7/10
    // #step-8 > div > div.onb-fe-language-step > div > div.air3-grid-container.fe-eng-row.align-items-center > div:nth-child(2) > div > div.span-12.span-md-9 > div > div > div > div
    // await page.click("#step-133 > div > div.onb-fe-language-step > div > div.air3-grid-container.fe-eng-row.align-items-center > div:nth-child(2) > div > div.span-12.span-md-9 > div > div > div > div > div > span")
    // await delay(100)
    // await page.click("#dropdown-menu > li.is-active.is-focused.air3-menu-item > span")
    // await delay(50)
    // await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button")
    // await delay(1000)
    // // create profile 8/10
    // await page.type("#step-134 > div > div > div:nth-child(1) > div.mt-6 > div > div > div > textarea", desc)
    // await delay(100)
    // await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button")
    // await delay(1000)
    // // create profile 9/10
    // await page.type("#step-135 > div > div.pb-7 > div.has-error > div.air3-grid-container > div.span-md-5.span-8.d-flex.align-end.align-items-center.justify-content-end > div > div > div > div > input", "20")
    // await delay(100)
    // await page.click("#main > div > div > div > div > div.air3-wizard-footer > div.air3-wizard-btns-container.air3-wizard-btns > span > button")
    // await delay(1000)
    // // create profile 10/10
    // await page.type("#step-140 > div > div.up-fe-location-step > div > div.span-md-9.span-lg-10 > div:nth-child(1) > div > div > div > div:nth-child(1) > div > input", "2000-12-12")
    // await delay(100)
    // await page.click("#step-140 > div > div.up-fe-location-step > div > div.span-md-9.span-lg-10 > div.up-fe-location > div > div.air3-grid-container > div > div > div > div > div > span")
    // await page.type("#step-140 > div > div.up-fe-location-step > div > div.span-md-9.span-lg-10 > div.up-fe-location > div > div.air3-grid-container > div > div > div > div.air3-dropdown-menu-container > div > div.air3-dropdown-header-container.has-search > div > div > div > input", country)
    // await page.keyboard.down("ArrowDown")
    // await delay(100)
    // await page.keyboard.press("Enter")
    
    // await page.type("#typeahead-input-295", adress, { delay: 50 })

    // await page.type("#typeahead-input-272", city, { delay: 50 })
    // await page.keyboard.down("ArrowDown")
    // await delay(100)
    // await page.keyboard.press("Enter")

    
    // await page.close()
    // await browser.close()
  }
  process.exit()
}

bootstrap()