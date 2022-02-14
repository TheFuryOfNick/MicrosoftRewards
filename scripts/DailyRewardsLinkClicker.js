const {By} = require("selenium-webdriver");
require('msedgedriver');

// Configurations
const REWARDS_URL = "https://rewards.microsoft.com/";
const PAUSE = 3000;
const USER_DATA_DIR = "C:\\Users\\Nick\\AppData\\Local\\Microsoft\\Edge\\User Data";
const PROFILE_DIR = "Default";
const NUM_OF_QUIZ_SETS = 3;
const MAX_ATTEMPTS = 30;

// CSS Selectors
const REWARD_LINK_CLASSNAME = "ds-card-sec";
const QUIZ_PANEL_ID = "quizWelcomeContainer";
const QUIZ_START_BUTTON_ID = "rqStartQuiz";
const POLL_PANEL_ID = "btPollOverlay";
const ANSWER_PANEL_CLASSNAME = "b_cards";
const COMPLETED_QUIZ_OPTION_CLASSNAME = "btsel";
const POLL_CHOICE_PANEL_CLASSNAME = "btOption";


const takeQuiz = async (driver) => {
    // TODO: Find all answer panels, click each in succession until the quiz is complete
    // TODO: Handle case when all answers have been selected, the set will end and the code will keep trying to click the remaining ones
    // TODO: Quiz could already have been completed so handle that
    await driver.sleep(PAUSE);
    const startButton = await driver.findElements(By.id(QUIZ_START_BUTTON_ID));
    if (startButton.length === 0) {
        console.debug(`-->NO QUIZ START BUTTON FOUND, SKIPPING...`);
        return;
    }

    // Click Quiz Start Button
    await driver.sleep(PAUSE);
    try {
        await startButton[0].click();
    } catch (e) {
        console.warn("ERROR STARTING QUIZ. CONTINUING...");
        return;
    }
    await driver.sleep(PAUSE);
    
    // Keep clicking unclicked answers until the quiz is completed
    let iterationCount = 0;
    while (iterationCount++ < MAX_ATTEMPTS) {
        const answerPanels = await driver.findElements(By.className(ANSWER_PANEL_CLASSNAME));
        if (answerPanels.length === 0) {
            console.debug(`-->NO ANSWER PANELS FOUND, QUIZ MAY HAVE BEEN COMPLETED`);
            return;
        }

        // Click each answer panel
        for (const el of answerPanels) {
            const classNames = await el.getAttribute("class");
            if (classNames.includes(COMPLETED_QUIZ_OPTION_CLASSNAME)) {
                // This panel has already been clicked so skip it
                continue;
            }
            console.debug(`-->CLICKING ANSWER PANEL: ${await el.getText()}`);
            try {
                // Open link then wait for page to reload and start over
                await el.click();
                await driver.sleep(PAUSE);
                break;
            } catch (e) {
                const link = await el.getId();
                console.warn(`-->ERROR CLICKING ANSWER PANEL: ${link}, Skipping Quiz...`);
                // console.error(e);
                return;
            }
        }
    }

    console.debug(`-->QUIZ COMPLETE!`);

};

const doPoll = async (driver) => {
    // Find first answer in the poll and click it
    const pollChoices = await driver.findElements(By.className(POLL_CHOICE_PANEL_CLASSNAME));
    console.log(`Num Poll Choices: ${pollChoices.length}`);
    try {
        // Click answer
        await driver.sleep(PAUSE);
        await pollChoices[0].click();
        await driver.sleep(PAUSE);
    } catch (e) {
        console.warn(`-->ERROR CLICKING POLL CHOICE, CONTINUING...`);
        console.error(e);
    }
    console.log("POLL COMPLETED");
};

/*
* TODOs:
* - The Rewards page includes a preview of tomorrow's 3 links, which aren't clickable so the click throws an exception.
 It would be nice to be able to detect these and skip them, though it's able to recover with a Try-Catch so it's required.
 All I see is the parent div has a disabled tag on it, so maybe a more complex selector would skip these.
*/


(async () => {

    // Init Edge Driver
    const edge = require('selenium-webdriver/edge');
    const service = new edge.ServiceBuilder().build();
    const options = new edge.Options();
    options.addArguments(`user-data-dir=${USER_DATA_DIR}`);
    options.addArguments(`profile-directory=${PROFILE_DIR}`);
    const driver = edge.Driver.createSession(options, service);

    try {

        // Open Rewards page
        await driver.get(REWARDS_URL);

        // Find all rewards links
        const els = await driver.findElements(By.className(REWARD_LINK_CLASSNAME));

        // Open and complete each link
        for (const el of els) {
            // console.info(`OPENING LINK: ${await el.getText()} ***`);
            try {
                // Open link
                await el.click();
            } catch (e) {
                const link = await el.getId();
                // console.warn(`-->ERROR OPENING LINK: ${link}, CONTINUING...`);
                // console.error(e);
                continue;
            }

            // Switch to the new tab
            const tabs = await driver.getAllWindowHandles();
            await driver.switchTo().window(tabs[1]);

            // Look for quiz
            const quizPanel = await driver.findElements(By.id(QUIZ_PANEL_ID));
            if (quizPanel.length > 0) {
                // console.info("-->Quiz Found");
                await takeQuiz(driver);
            } else {
                // console.debug("-->No Quiz Found, continuing...");
            }

            // Look for poll
            const pollPanel = await driver.findElements(By.id(POLL_PANEL_ID));
            if (pollPanel.length > 0) {
                // console.info("-->Poll Found");
                await doPoll(driver);
            } else {
                // console.debug("-->No Poll Found, continuing...");
            }

            // Pause, then close the tab and switch back
            await driver.sleep(PAUSE);
            await driver.close();
            await driver.switchTo().window(tabs[0]);
            
            // console.info("-->Link Completed!");
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