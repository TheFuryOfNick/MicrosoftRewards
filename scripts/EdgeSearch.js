const {By} = require("selenium-webdriver");
require('msedgedriver');

const NUM_SEARCHES = 50;
const PAUSE = 2000;
const BING_SEARCH_URL = "https://bing.com";
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const USER_DATA_DIR = "C:\\Users\\Nick\\AppData\\Local\\Microsoft\\Edge\\User Data";
const PROFILE_DIR = "Default";
const MOBILE = "mobile";
const MOBILE_DEVICE = "Nexus 5";

(async function RunSearch() {
    // Get Input Args
    const myArgs = process.argv.slice(2);
    const isMobile = myArgs && myArgs[0].toLowerCase() === MOBILE;
    const numSearches = myArgs && (myArgs[1] || NUM_SEARCHES);
    console.log(`Running EdgeSearch on ${isMobile ? "Mobile" : "Desktop"} with number of searches = ${numSearches}...`);

    // Create Driver
    const edge = require('selenium-webdriver/edge');
    const service = new edge.ServiceBuilder().build();
    const options = new edge.Options();
    if (isMobile) {
        options.setMobileEmulation({"deviceName": MOBILE_DEVICE});
    }
    options.addArguments(`user-data-dir=${USER_DATA_DIR}`);
    options.addArguments(`profile-directory=${PROFILE_DIR}`);
    const driver = edge.Driver.createSession(options, service);

    const randomCharacter = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    let searchTerm = "Bing ";

    try {
        await driver.get(BING_SEARCH_URL);

        for (let i = 0; i < numSearches; i++) {
            // Add character to search
            searchTerm = randomCharacter();

            // Submit search
            const element = await driver.findElement(By.id('sb_form_q'));
            await element.sendKeys(searchTerm);
            await element.submit();

            // Pause before doing next search
            await driver.sleep(PAUSE);
        }
    } 
    finally {
        await driver.quit();
    }
})();