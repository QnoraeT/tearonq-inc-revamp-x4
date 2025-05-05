import Decimal from 'break_eternity.js'
import { game, gameTick, gameVars, player, saveTheFrickingGame, setGameLoopInterval, tmp } from './loadSave';
import { diePopupsDie, popupList, spawnPopup } from './misc/popups';
import { Tab } from './variableTypes';
import { format, formatTime } from './misc/format';
import { updateGame_Main, updateHTML_Main } from './features/mainBuyables';
import { drawing } from './canvas';
import { updateGame_PRai, updateHTML_PRai } from './features/prai';
import { updateGame_PR2, updateHTML_PR2 } from './features/pr2+';
import { updateGame_StaticUpgrades, updateHTML_StaticUpgrades } from './features/staticUpgrades';
import { kuaDynamicUpgEffDisplay, updateGame_Kuaraniai, updateHTML_Kuaraniai } from './features/kuaraniai';
import { updateGame_Options, updateHTML_Options, updateSaveFileListHTML } from './features/options';
import { updateGame_Extract, updateHTML_Extract } from './features/extract';
import { updateGame_Colosseum, updateHTML_Colosseum } from './features/colosseum';

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
    mainTab: -1,
    buyablesTab: 0,
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
        setGameLoopInterval();
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
                if (tmp.offlineTime.tickMax > 10000) {
                    tmp.offlineTime.tickLength = tmp.offlineTime.tickLength * (tmp.offlineTime.tickMax / 10000);
                    tmp.offlineTime.tickMax = tmp.offlineTime.tickMax / (tmp.offlineTime.tickMax / 10000);
                }
                tmp.offlineTime.tickRemaining = tmp.offlineTime.tickMax;
                doOfflineTime();
                clearInterval(gameTick);
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
        clearInterval(gameTick);
    }
}

export const updateGame = (delta: Decimal) => {
    updateGame_Colosseum(delta);
    updateGame_Extract(delta);
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

    html['pointCounter'].textContent = `${tmp.gameIsRunning ? format(player.gameProgress.points) : 'Loading!'}`;
    html['ppsCounter'].textContent = `${tmp.gameIsRunning ? format(tmp.game.pointGen) : 'Please wait!'}`;
    html['timeSinceSave'].textContent = `${formatTime(gameVars.sessionTime - gameVars.lastSave)} / ${formatTime(game.autoSaveInterval)}`;
    html['disclaimer'].classList.toggle("hide", tab.mainTab !== -1);
    updateHTML_Main();
    updateHTML_PRai();
    updateHTML_PR2();
    updateHTML_StaticUpgrades();
    updateHTML_Kuaraniai();
    updateHTML_Extract();
    updateHTML_Colosseum();
    updateHTML_Options();
}

export let shiftDown = false;
export let ctrlDown = false;

document.onkeydown = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;

    if (shiftDown) {
        html[`kshardDUEffects`].innerHTML = kuaDynamicUpgEffDisplay('shard', true)
        html[`kpowerDUEffects`].innerHTML = kuaDynamicUpgEffDisplay('power', true)
    }

    if (ctrlDown) {
        console.log(player)
        console.log(tmp)
        console.log(gameVars)

        player.gameProgress.kuaDynamicUpgs[0] = Decimal.floor(tmp.game.ks.dynTarget).add(1)
        player.gameProgress.kuaDynamicUpgs[1] = Decimal.floor(tmp.game.kp.dynTarget).add(1)
    }
};

document.onkeyup = function (e) {
    shiftDown = e.shiftKey;
    ctrlDown = e.ctrlKey;

    if (!shiftDown) {
        html[`kshardDUEffects`].innerHTML = kuaDynamicUpgEffDisplay('shard', false)
        html[`kpowerDUEffects`].innerHTML = kuaDynamicUpgEffDisplay('power', false)
    }
};

export const switchMainTab = (id: number) => {
    tab.mainTab = id;
}

export const switchBuyableTab = (id: number) => {
    tab.buyablesTab = id;
}

export const switchOptionTab = (id: number) => {
    tab.optionsTab = id;
    if (tab.optionsTab === 2 && tab.optionsSaveTab === 0) {
        updateSaveFileListHTML();
    }
}

export const switchOptionSaveTab = (id: number) => {
    tab.optionsSaveTab = id;
    if (tab.optionsSaveTab === 0) {
        updateSaveFileListHTML();
    }
}