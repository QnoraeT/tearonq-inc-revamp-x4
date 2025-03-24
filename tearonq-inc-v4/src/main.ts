import Decimal from 'break_eternity.js'
import { game, gameVars, player, resetTheWholeGame, saveTheFrickingGame, tmp } from './loadSave';
import { diePopupsDie, popupList, spawnPopup } from './misc/popups';
import { Tab } from './variableTypes';
import { format, formatTime } from './misc/format';
import { updateGame_Main, updateHTML_Main } from './features/mainBuyables';
import { drawing } from './canvas';
import { updateGame_PRai, updateHTML_PRai } from './features/prai';
import { updateGame_PR2, updateHTML_PR2 } from './features/pr2';
import { updateGame_StaticUpgrades, updateHTML_StaticUpgrades } from './features/staticUpgrades';
import { updateGame_Kuaraniai, updateHTML_Kuaraniai } from './features/kuaraniai';
import { updateGame_Options, updateHTML_Options } from './features/options';

export const html: Record<string, HTMLElement> = {};
export const toHTMLvar = (id: string) => {
    const element = el(id);
    if (element === null) {
        throw new Error(`Cannot find HTML element ${id}!`);
    }
    html[id] = element;
}

export const el = (id: string): HTMLElement | null => document.getElementById(id);
export const elIm = (id: string): HTMLImageElement => document.getElementById(id)! as HTMLImageElement;

export const tab: Tab = ({
    mainTab: 0,
    optionsTab: 0,
    optionsSaveTab: 0
});

export const doOfflineTime = () => {
    for (let i = 0; i < Math.min(tmp.offlineTime.tickRemaining, 100); i++) {
        gameLoop();
        tmp.offlineTime.tickRemaining -= 1;
    }

    html['gameLoaded'].style.display = 'none';
    html['offlineTime'].style.display = '';

    html['offlineTimeDisplay'].textContent = `Ticks: ${format(tmp.offlineTime.tickRemaining)} / ${format(tmp.offlineTime.tickMax)}`;
    html['offlineTimeProgressBar'].style.width = `${100 * (1 - (tmp.offlineTime.tickRemaining / tmp.offlineTime.tickMax))}%`;

    if (tmp.offlineTime.tickRemaining > 0) {
        window.setTimeout(doOfflineTime, 0);
    } else {
        tmp.offlineTime.active = false;
        gameLoop();
    }
}

export const gameLoop = () => {
    if (!tmp.gameIsRunning) {
        return;
    }

    try {
        let start_time = Date.now();
        gameVars.delta = (Date.now() - player.lastUpdated) / 1000;
        gameVars.trueDelta = (Date.now() - player.lastUpdated) / 1000;
        gameVars.sessionTime = (Date.now() - gameVars.sessionStart) / 1000;

        if (!tmp.offlineTime.active) {
            player.lastUpdated = Date.now();
            if (gameVars.delta >= 10) {
                console.log('offline time activated');
                tmp.offlineTime.active = true;
                tmp.offlineTime.tickMax = Math.floor(gameVars.delta / tmp.offlineTime.tickLength);
                if (tmp.offlineTime.tickMax > 1000) {
                    tmp.offlineTime.tickLength = tmp.offlineTime.tickLength * (tmp.offlineTime.tickMax / 1000);
                    tmp.offlineTime.tickMax = tmp.offlineTime.tickMax / (tmp.offlineTime.tickMax / 1000);
                }
                tmp.offlineTime.tickRemaining = tmp.offlineTime.tickMax;
                doOfflineTime();
                return;
            }
            if (gameVars.delta > 0) {
                gameVars.fpsList.push(gameVars.delta);
                if (gameVars.sessionTime > gameVars.lastFPSCheck) {
                    gameVars.lastFPSCheck = gameVars.sessionTime + 0.5;
                    gameVars.fps = 0;
                    gameVars.tick = 0;
                    for (let i = 0; i < gameVars.fpsList.length; ++i) {
                        gameVars.fps += gameVars.fpsList[i];
                    }
                    for (let i = 0; i < gameVars.tickList.length; ++i) {
                        gameVars.tick += gameVars.tickList[i];
                    }
                    html['fpsCounter'].textContent = `${(gameVars.fpsList.length / gameVars.fps).toFixed(1)} (${(gameVars.tick / gameVars.tickList.length).toFixed(1)} ms)`;
                    gameVars.fpsList = [];
                    gameVars.tickList = [];
                }
            }
        } else {
            gameVars.delta = tmp.offlineTime.tickLength;
        }

        player.totalRealTime += gameVars.delta;
        let gameDelta = Decimal.mul(gameVars.delta, tmp.gameTimeSpeed).mul(player.setTimeSpeed);
        player.gameTime = Decimal.add(player.gameTime, gameDelta);

        updateGame(gameDelta);

        if (!tmp.offlineTime.active) {
            html['gameLoaded'].style.display = '';
            html['offlineTime'].style.display = 'none';

            updateHTML();
            diePopupsDie();
            drawing();

            if (!gameVars.saveDisabled && gameVars.sessionTime > gameVars.lastSave + game.autoSaveInterval) {
                saveTheFrickingGame();
                spawnPopup(0, `The game has been saved!`, `Save`, 3, `#00FF00`)
            }

            let end_time = Date.now();
            let total_time = end_time - start_time;
            gameVars.tickList.push(total_time);
            window.setTimeout(gameLoop, 16.7 - (total_time % 16.7));
            player.lastUpdated2 = Date.now();
        }
    } catch (e) {
        console.error(e);
        console.error(`(Game)   Save List Data:`);
        console.error(game);
        console.error(`(Player) Save File Data:`);
        console.error(player);
        console.error(`Temporary Variables:`);
        console.error(tmp);
        console.warn(`If you cannot go to your saves at all; If you think you are utterly hopeless of playing this game again, run resetTheWholeGame() ! I'll try to make an interactive version of this sooner or later so you don't have to go into console...`);
        alert(
            `The game has crashed! Check the console to see the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
        console.error(
            `The game has crashed! Here is the error(s) to report it to @TearonQ or @qnoraeT. \n\nYou can still export your save normally by going into Options -> Saving -> Save List -> Export Save or Export Save List to Clipboard. \nIf you see any NaNs, you might have a clue!`
        );
        throw new Error('ok');
    }
}

export const updateGame = (delta: Decimal) => {
    updateGame_Kuaraniai(delta);
    updateGame_StaticUpgrades(delta);
    updateGame_PR2(delta);
    updateGame_PRai(delta);
    updateGame_Main(delta);
    updateGame_Options(delta);
}

export const updateHTML = () => {
    for (let i = 0; i < popupList.length; i++) {
        html[`popupID${i}`].style.opacity = `${popupList[i].opacity}`
    }

    html['pointCounter'].textContent = `${format(player.gameProgress.points)}`;
    html['ppsCounter'].textContent = `${format(tmp.game.pointGen)}`;
    html['timeSinceSave'].textContent = `${formatTime(gameVars.sessionTime - gameVars.lastSave)} / ${formatTime(game.autoSaveInterval)}`;
    updateHTML_Main();
    updateHTML_PRai();
    updateHTML_PR2();
    updateHTML_StaticUpgrades();
    updateHTML_Kuaraniai();
    updateHTML_Options();
}

export let shiftDown = false;
export let ctrlDown = false;

document.onkeydown = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
    // ! thing
    if (shiftDown) {
        player.lastUpdated = Date.now() - 1000 * 60 * 60 * 24 * 365
    }
    if (ctrlDown) {
        resetTheWholeGame(false);
    }
};

document.onkeyup = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;
};

export const switchMainTab = (id: number) => {
    tab.mainTab = id;
}

export const switchOptionTab = (id: number) => {
    tab.optionsTab = id;
}

export const switchOptionSaveTab = (id: number) => {
    tab.optionsSaveTab = id;
}