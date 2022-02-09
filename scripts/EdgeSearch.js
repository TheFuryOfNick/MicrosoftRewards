const {By,Key,Builder} = require("selenium-webdriver");
require('msedgedriver');

const NUM_SEARCHES = 25;
const PAUSE_BETWEEN_SEARCHES = 2000;

(async function RunSearch() {

    const edge = require('selenium-webdriver/edge');
    const service = new edge.ServiceBuilder().enableVerboseLogging().build();
    const options = new edge.Options();
    options.addArguments("user-data-dir=C:\\Users\\Nick\\AppData\\Local\\Microsoft\\Edge\\User Data");
    options.addArguments("profile-directory=Default");
    const driver = edge.Driver.createSession(options, service);

    const ALPHABET = "abcdefghijklmnopqrstuvwxyz"

    const randomCharacter = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    let searchTerm = "Bing ";

    try {
        await driver.get('https://bing.com');

        for (let i = 0; i < NUM_SEARCHES; i++) {
            // Add character to search
            searchTerm = randomCharacter();

            // Submit search
            const element = await driver.findElement(By.id('sb_form_q'));
            await element.sendKeys(searchTerm);
            await element.submit();

            // Pause before doing next search
            await driver.sleep(PAUSE_BETWEEN_SEARCHES);
        }

    } 
    finally {
        await driver.quit();
    }

})();