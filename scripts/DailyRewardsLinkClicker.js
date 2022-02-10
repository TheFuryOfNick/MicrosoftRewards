const {By,Key,Builder} = require("selenium-webdriver");
require('msedgedriver');

const REWARDS_URL = "https://rewards.microsoft.com/";
const PAUSE = 2000;

async function main() {

    const edge = require('selenium-webdriver/edge');
    const service = new edge.ServiceBuilder().enableVerboseLogging().build();
    const options = new edge.Options();
    options.addArguments("user-data-dir=C:\\Users\\Nick\\AppData\\Local\\Microsoft\\Edge\\User Data");
    options.addArguments("profile-directory=Default");
    const driver = edge.Driver.createSession(options, service);

    try {

        await driver.get(REWARDS_URL);
        await driver.findElements(By.className('ds-card-sec'))
        .then(els => els.forEach(el => {
            // TODO: It seems opening the link isn't enough, you sometimes have to go to the tab so maybe
            // open each one, switch to that tab, wait for 5 seconds, then close the tab and repeat
            el.getText().then(val => el.click().then(console.log(`Clicked ${val}`)))
        }));


        // Ensure everything finishes TODO: Do this better
        // I need the main() to block on the internal promises so make the internals resolve the promise I guess?
        await driver.sleep(10000);
    } 
    finally {
        await driver.quit();
    }

}

main();