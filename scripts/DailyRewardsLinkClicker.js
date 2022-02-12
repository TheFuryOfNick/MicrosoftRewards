const {By,Key,Builder} = require("selenium-webdriver");
require('msedgedriver');

const REWARDS_URL = "https://rewards.microsoft.com/";
const PAUSE = 5000;

const REWARD_LINK_CLASSNAME = "ds-card-sec";
const USER_DATA_DIR = "C:\\Users\\Nick\\AppData\\Local\\Microsoft\\Edge\\User Data";
const PROFILE_DIR = "Default";

(async () => {

    const edge = require('selenium-webdriver/edge');
    const service = new edge.ServiceBuilder().enableVerboseLogging().build();
    const options = new edge.Options();
    options.addArguments(`user-data-dir=${USER_DATA_DIR}`);
    options.addArguments(`profile-directory=${PROFILE_DIR}`);
    const driver = edge.Driver.createSession(options, service);

    try {

        await driver.get(REWARDS_URL);

        // Find all rewards links
        const els = await driver.findElements(By.className(REWARD_LINK_CLASSNAME));
        for (const el of els) {
            try {
                // Open link
                await el.click();

                // Switch to the new tab
                const tabs = await driver.getAllWindowHandles();
                await driver.switchTo().window(tabs[1]);

                // Pause, then close the tab and switch back
                await driver.sleep(PAUSE);
                await driver.close();
                await driver.switchTo().window(tabs[0]);
            } catch (e) {
                console.error("*** ERROR OPENING LINK, CONTINUING: ***");
                console.error(e);
            }
        }

        console.log("*** FINISHED SUCCESSFULLY ***");
    }
    catch (e) {
        console.error("*** ERROR OCCURRED: ***");
        console.error(e);
    }
    finally {
        await driver.quit();
    }
})();