const {By} = require("selenium-webdriver");
require('msedgedriver');

// Configurations
const REWARDS_URL = "https://rewards.microsoft.com/";
const PAUSE = 3000;
const LONG_PAUSE = 5000;
const USER_DATA_DIR = "C:\\Users\\Nick\\AppData\\Local\\Microsoft\\Edge\\User Data";
const PROFILE_DIR = "Default";
const MAX_ATTEMPTS = 30;

// CSS Selectors
const REWARD_LINK_CLASSNAME = "ds-card-sec";
const QUIZ_PANEL_ID = "quizWelcomeContainer";
const QUIZ_START_BUTTON_ID = "rqStartQuiz";
const POLL_PANEL_ID = "btPollOverlay";
const ANSWER_PANEL_CLASSNAME = "bt_lstcl_card";
const ALT_ANSWER_PANEL_CLASSNAME = "rqOption";
const THIS_OR_THAT_PANEL_CLASSNAME = "btOptionCard";

const QUIZ_CLASSNAMES = ["bt_lstcl_card", "rqOption", "btOptionCard"];

const COMPLETED_ANSWER_PANEL_CLASSNAME = "btsel";
const ALT_COMPLETED_ANSWER_PANEL_CLASSNAME = "optionDisable";
const POLL_CHOICE_PANEL_CLASSNAME = "btOption";


const takeQuiz = async (driver) => {
    // Click the start quiz button
    await driver.sleep(PAUSE);
    const startButton = await driver.findElements(By.id(QUIZ_START_BUTTON_ID));
    if (startButton.length === 0) {
        console.info(`-->NO QUIZ START BUTTON FOUND, SKIPPING...`);
        return;
    }
    
    try {
        await startButton[0].click();
    } catch (e) {
        console.warn("ERROR STARTING QUIZ. CONTINUING...");
        return;
    }
    
    // Keep clicking unclicked answers until the quiz is completed
    let iterationCount = 0;
    while (iterationCount++ < MAX_ATTEMPTS) {
        await driver.sleep(LONG_PAUSE);
        // Search for answer panels to click
        let answerPanels = await driver.findElements(By.className(ANSWER_PANEL_CLASSNAME));
        if (answerPanels.length === 0) {
            // Some quizzes have a different set of answer panels, so look for those
            answerPanels = await driver.findElements(By.className(ALT_ANSWER_PANEL_CLASSNAME));
        }
        if (answerPanels.length === 0) {
            // This or That quizzes
            answerPanels = await driver.findElements(By.className(THIS_OR_THAT_PANEL_CLASSNAME));
        }

        // const answerPanels = [];
        // QUIZ_CLASSNAMES.forEach(async className => answerPanels.push(await driver.findElements(By.className(className))));

        if (answerPanels.length === 0) {
            // No answer panels found of either type, so abort
            console.log(`-->NO ANSWER PANELS FOUND, QUIZ MAY HAVE BEEN COMPLETED`);
            return;
        }

        // Find and click the first unclicked answer panel
        for (const el of answerPanels) {
            const classNames = await el.getAttribute("class");
            if (classNames.includes(COMPLETED_ANSWER_PANEL_CLASSNAME) || classNames.includes(ALT_COMPLETED_ANSWER_PANEL_CLASSNAME)) {
                // This panel has already been clicked so skip it
                continue;
            }
            console.info(`-->CLICKING ANSWER PANEL: ${await el.getText()}`);
            try {
                // Open link then wait for page to reload and start over
                await el.click();
                break;
            } catch (e) {
                console.warn(`-->ERROR CLICKING ANSWER PANEL: ${await el.getText()}, Skipping Quiz...`);
                // console.error(e);
                return;
            }
        }
    }

    console.log(`-->QUIZ COMPLETE!`);
};

const doPoll = async (driver) => {
    // Find first answer in the poll and click it
    const pollChoices = await driver.findElements(By.className(POLL_CHOICE_PANEL_CLASSNAME));
    try {
        // Click answer
        await driver.sleep(PAUSE);
        await pollChoices[0].click();
        await driver.sleep(PAUSE);
    } catch (e) {
        console.warn(`-->ERROR CLICKING POLL CHOICE, CONTINUING...`);
        console.error(e);
        return;
    }
    console.log("POLL COMPLETED");
};

/*
* TODOs:
* - The Rewards page includes a preview of tomorrow's 3 links, which aren't clickable so the click throws an exception.
 It would be nice to be able to detect these and skip them, though it's able to recover with a Try-Catch so it's not required.
 All I see is the parent div has a disabled tag on it, so maybe a more complex selector would skip these.
*/


(async () => {

    // Init Edge Driver
    const edge = require('selenium-webdriver/edge');
    const service = new edge.ServiceBuilder().build();
    const options = new edge.Options();
    options.addArguments(`user-data-dir=${USER_DATA_DIR}`);
    options.addArguments(`profile-directory=${PROFILE_DIR}`);
    options.addArguments(`--enable-features=msEdgeDeleteBrowsingDataOnExit`);
    options.addArguments('headless');
    const driver = edge.Driver.createSession(options, service);

    try {

        // Open Rewards page
        await driver.get(REWARDS_URL);

        // Find all rewards links
        const els = await driver.findElements(By.className(REWARD_LINK_CLASSNAME));

        // Open and complete each link
        for (const el of els) {
            try {
                // Open link
                await el.click();
            } catch (e) {
                console.info(`ERROR OPENING LINK: ${await el.getId()}, CONTINUING...`);
                continue;
            }

            // Switch to the new tab
            const tabs = await driver.getAllWindowHandles();
            await driver.switchTo().window(tabs[1]);

            // Look for quiz
            const quizPanel = await driver.findElements(By.id(QUIZ_PANEL_ID));
            if (quizPanel.length > 0) {
                await takeQuiz(driver);
            }

            // Look for poll
            const pollPanel = await driver.findElements(By.id(POLL_PANEL_ID));
            if (pollPanel.length > 0) {
                await doPoll(driver);
            }

            // Pause, then close the tab and switch back
            await driver.sleep(PAUSE);
            await driver.close();
            await driver.switchTo().window(tabs[0]);
        }

        console.log("*** FINISHED SUCCESSFULLY ***");
    }
    catch (e) {
        console.error("*** ERROR OCCURRED: ***");
        console.error(e);
    }
    finally {
        await driver.close();
        await driver.quit();
    }
})();