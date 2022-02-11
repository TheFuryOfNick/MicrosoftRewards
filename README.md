# MicrosoftRewards Project
This is a collection of scripts that automate the various tasks for gathering Microsoft Rewards points.

Each can be run individually with npm run commands, or all together with `npm run all`.

## Current Scripts
### EdgeSearcher.js
This tool automates desktop Edge searches, with a customizable number of searches to be run on randomized character strings.

#### Commands
`npm run desktop-searches`

#### TODOs
- Impersonate mobile by setting user agent

### DailyRewardLinksClicker.js
This tool opens the Rewards page and clicks the rewards link tiles to open each one and claim the points.

#### Commands
`npm run rewards-links`

#### TODOs
- It seems opening each link isn't enough to claim points; it might require switching to the tab and waiting a few seconds. Synchronizing this script has been a real challenge, so the TODO is to redesign this to work better, to synchronize better and to refactor the code to be easier to follow

### DailyRewardQuizRunner.js
TODO: This is perhaps better as an enhancement to the LinksClicker script, that will open Quiz links and complete them by attempting to click all answer panels

### DailyRewardPollTaker.js
TODO: This is perhaps better an an enhancement to the LinksClicker script, that will open Poll links and click one of the two options to complete the poll
