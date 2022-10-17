# MicrosoftRewards Project
This is a collection of scripts that automate the various tasks for gathering Microsoft Rewards points. The intention is for these scripts to be run once per day in order to maximize the harvested points, as there are daily caps.

Each can be run individually with the below npm run commands, or all together with `npm run all`.

## Scripts
### EdgeSearcher.js
This tool automates desktop and mobile Edge searches, with a customizable number of searches to be run on randomized character strings.

#### Commands
`npm run desktop-searches` and `npm run mobile-searches`
These commands will run the minimum number of searches required to maximize daily harvested points. Currently, this is 35 desktop and 25 mobile searches per day.

### DailyRewardLinksClicker.js
This tool opens the Rewards page and clicks the rewards link tiles to open each one and claim the points. This includes doing polls and quizzes to harvest points.

#### Commands
`npm run rewards-links`
