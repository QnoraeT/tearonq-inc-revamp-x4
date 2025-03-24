import Decimal from "break_eternity.js";
import { html, switchOptionSaveTab, switchOptionTab, tab, toHTMLvar } from "../main";
import { deleteSave, displayModes, duplicateSave, exportSave, exportSaveList, game, gameVars, importSave, importSaveList, importSFIntoNew, player, renameSave, resetTheWholeGame, saveTheFrickingGame, setAutosaveInterval, switchToSave } from "../loadSave";
import { D, gRC } from "../misc/calc";
import { format, formatTime } from "../misc/format";

export const intiHTML_Options = () => {
    toHTMLvar('options-notesTabButton')
    toHTMLvar('options-linksTabButton')
    toHTMLvar('options-savingTabButton')
    toHTMLvar('options-otherTabButton')
    toHTMLvar('options-updateLogTabButton')
    toHTMLvar('options-cheatsTabButton')
    toHTMLvar('options-saving-saveListTabButton')
    toHTMLvar('options-saving-saveCreateTabButton')
    toHTMLvar('manualSaveButton')
    toHTMLvar('autoSaveButton')
    toHTMLvar('exportSaveListButton')
    toHTMLvar('importSaveListButton')
    toHTMLvar('importSaveFileButton')
    toHTMLvar('deleteSaveListButton')
    toHTMLvar('saveList')
    toHTMLvar('timeSpeedSetCheatButton')

    html['options-notesTabButton'].addEventListener('click', () => switchOptionTab(0));
    html['options-linksTabButton'].addEventListener('click', () => switchOptionTab(1));
    html['options-savingTabButton'].addEventListener('click', () => switchOptionTab(2));
    html['options-otherTabButton'].addEventListener('click', () => switchOptionTab(3));
    html['options-updateLogTabButton'].addEventListener('click', () => switchOptionTab(4));
    html['options-cheatsTabButton'].addEventListener('click', () => switchOptionTab(5));
    html['options-saving-saveListTabButton'].addEventListener('click', () => switchOptionSaveTab(0));
    html['options-saving-saveCreateTabButton'].addEventListener('click', () => switchOptionSaveTab(1));
    html['manualSaveButton'].addEventListener('click', () => saveTheFrickingGame(true));
    html['autoSaveButton'].addEventListener('click', () => setAutosaveInterval());
    html['exportSaveListButton'].addEventListener('click', () => exportSaveList());
    html['importSaveListButton'].addEventListener('click', () => importSaveList());
    html['importSaveFileButton'].addEventListener('click', () => importSFIntoNew);
    html['deleteSaveListButton'].addEventListener('click', () => resetTheWholeGame(true));
    html['timeSpeedSetCheatButton'].addEventListener('click', () => setTimeSpeed());

    updateSaveFileListHTML();
}

export const updateGame_Options = (delta: Decimal) => {
    delta
}

export const updateHTML_Options = () => {
    html['optionTabButton'].classList.toggle("hide", Decimal.lt(player.gameProgress.pr2, 6));
    html['options'].classList.toggle("hide", tab.mainTab !== 1);
    if (tab.mainTab === 1) {
        html['options-notes'].classList.toggle("hide", tab.optionsTab !== 0);
        html['options-links'].classList.toggle("hide", tab.optionsTab !== 1);
        html['options-saving'].classList.toggle("hide", tab.optionsTab !== 2);
        html['options-other'].classList.toggle("hide", tab.optionsTab !== 3);
        html['options-updateLog'].classList.toggle("hide", tab.optionsTab !== 4);
        html['options-cheats'].classList.toggle("hide", tab.optionsTab !== 5);
        if (tab.optionsTab === 2) {
            html['options-saving-saveList'].classList.toggle("hide", tab.optionsSaveTab !== 0);
            html['options-saving-saveCreate'].classList.toggle("hide", tab.optionsSaveTab !== 1);
            if (tab.optionsSaveTab === 0) {
                for (let i = 0; i < game.list.length; i++) {
                    let color = `2px solid ${gRC(gameVars.sessionTime, 1, 1)}`
                    html[`saveFile${i}`].style.border = game.currentSave === i ? color : '2px solid #788088'
                    html[`saveFile${i}progBase`].style.backgroundColor = game.currentSave === i ? `${gRC(gameVars.sessionTime, 0.125, 1)}80` : ''
                    html[`saveFile${i}progFill`].style.backgroundColor = game.currentSave === i ? `${gRC(gameVars.sessionTime, 0.5, 1)}80` : '#50586080'
                    html[`saveFile${i}loadSave`].style.border = game.currentSave === i ? '2px solid #788088' : color
                    html[`saveFile${i}duplicateSave`].style.border = color
                    html[`saveFile${i}deleteSave`].style.border = color
                    html[`saveFile${i}renameSave`].style.border = color
                    html[`saveFile${i}importSave`].style.border = color
                    html[`saveFile${i}exportSave`].style.border = color
                }
            }
        }
    }
}

export const updateSaveFileListHTML = () => {
    let txt = ``
    for (let i = 0; i < game.list.length; i++) {
        txt += `
            <div id="saveFile${i}" style="position: relative; min-height: 19%; height: 19%; width: 98%; margin-top: 1%;"> 
                <div style="height: 100%; width: 100%">
                    <div style="height: 100%; width: 100%; position: relative">
                        <div id="saveFile${i}progBase" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%;"></div>
                        <div id="saveFile${i}progFill" style="position: absolute; top: 0; left: 0; height: 100%;"></div>
                    </div>
                    <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%;">
                        <div style="margin: 4px; margin-top: 2px">
                            <div style="position: relative; width: 100%; height: 25%">
                                <div class="flex-container fontTrebuchetMS" style="margin: 4px; margin-top: 2px; height: 20%;">
                                    <div id="saveFile${i}name" style="text-align: left;" class="whiteText saveListTopText"></div>
                                    <div id="saveFile${i}version" style="text-align: center;" class="whiteText saveListTopText"></div>
                                    <div id="saveFile${i}modes" style="text-align: right;" class="whiteText saveListTopText"></div>
                                </div>
                            </div>
                            <div style="position: relative; width: 100%; height: 50%">
                                <div style="display: flex; justify-content: center; height: 100%;" class="fontTrebuchetMS">
                                    <span id="saveFile${i}info" style="text-align: center; font-size: 10px" class="whiteText"></span>
                                </div>
                            </div>
                            <div style="position: relative; width: 100%; height: 25%; display: flex; align-items: flex-end;">
                                <div style="flex-grow: 0.3333; flex-basis: 0; text-align: left; display: flex; flex-direction: column;" class="fontTrebuchetMS">
                                    <span id="saveFile${i}totalTime" style="font-size: 12px" class="whiteText"></span>
                                    <span id="saveFile${i}offlineInfo" style="font-size: 10px" class="whiteText"></span>
                                </div>
                                <div style="flex-grow: 1; flex-basis: 0; text-align: right; font-size: 15px;" class="whiteText">
                                    <button id="saveFile${i}loadSave" class="whiteText fontTrebuchetMS buyableButton saveListMiniButton canClick">
                                        Load Save
                                    </button>
                                    <button id="saveFile${i}duplicateSave" class="whiteText fontTrebuchetMS buyableButton saveListMiniButton canClick">
                                        Duplicate Save
                                    </button>
                                    <button id="saveFile${i}deleteSave" class="whiteText fontTrebuchetMS buyableButton saveListMiniButton canClick">
                                        Delete Save
                                    </button>
                                    <button id="saveFile${i}renameSave" class="whiteText fontTrebuchetMS buyableButton saveListMiniButton canClick">
                                        Rename Save
                                    </button>
                                    <button id="saveFile${i}importSave" class="whiteText fontTrebuchetMS buyableButton saveListMiniButton canClick">
                                        Import Save
                                    </button>
                                    <button id="saveFile${i}exportSave" class="whiteText fontTrebuchetMS buyableButton saveListMiniButton canClick">
                                        Export Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
    html['saveList'].innerHTML = txt
    for (let i = 0; i < game.list.length; i++) {
        toHTMLvar(`saveFile${i}`)
        toHTMLvar(`saveFile${i}progBase`)
        toHTMLvar(`saveFile${i}progFill`)
        toHTMLvar(`saveFile${i}name`)
        toHTMLvar(`saveFile${i}version`)
        toHTMLvar(`saveFile${i}modes`)
        toHTMLvar(`saveFile${i}info`)
        toHTMLvar(`saveFile${i}totalTime`)
        toHTMLvar(`saveFile${i}offlineInfo`)
        toHTMLvar(`saveFile${i}loadSave`)
        toHTMLvar(`saveFile${i}duplicateSave`)
        toHTMLvar(`saveFile${i}deleteSave`)
        toHTMLvar(`saveFile${i}renameSave`)
        toHTMLvar(`saveFile${i}importSave`)
        toHTMLvar(`saveFile${i}exportSave`)

            /*
        <div
        v-for="(item, index) in game.list"
        :key="index"
        :style="{
            border: `0.24vw solid ${gRC(game.currentSave === index ? gameVars.sessionTime : 4.0, game.currentSave === index ? 1 : 0.5, game.currentSave === index ? 1 : 0.125)}`
        }"
        style="position: relative; min-height: 19%; height: 19%; width: 98%; margin-top: 1%;"
    > 
        <div v-if="item !== undefined && item !== null" style="height: 100%; width: 100%">
            <div style="height: 100%; width: 100%; position: relative">
                <div
                    :style="{
                        backgroundColor: gRC(
                            game.currentSave === index
                                ? gameVars.sessionTime
                                : 4.0,
                            0.1,
                            game.currentSave === index ? 1 : 0.125
                        )
                    }"
                    style="position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
                ></div>
                <div :style="{ backgroundColor: gRC(game.currentSave === index ? gameVars.sessionTime : 4.0, 0.25, game.currentSave === index ? 1 : 0.125), width: `${getEndgame(item.data.gameProgress.main.bestEver).toNumber()}%` }" style="position: absolute; top: 0; left: 0; height: 100%;"></div>
            </div>
            <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%;">
                <div style="margin: 0.3vw; margin-top: 0.15vw">
                    <div style="position: relative; width: 100%; height: 25%">
                        <div class="flex-container fontTrebuchetMS" style=" margin: 0.3vw; margin-top: 0.15vw; height: 20%;">
                            <div style="text-align: left;" class="whiteText saveListTopText">{{ item.name }}</div>
                            <div style="text-align: center;" class="whiteText saveListTopText">{{ item.data.displayVersion }}</div>
                            <div style="text-align: right;" class="whiteText saveListTopText">{{ displayModes(item.modes) }}</div>
                        </div>
                    </div>
                    <div style="position: relative; width: 100%; height: 50%">
                        <div style="display: flex; justify-content: center; height: 100%;" class="fontTrebuchetMS">
                            <span style="text-align: center; font-size: 0.75vw" class="whiteText">Points: {{ format( item.data.gameProgress.main.points, 2 ) }}</span>
                            <span v-if="Decimal.gte(item.data.gameProgress.main.prai.totalEver, 1) && Decimal.lt(item.data.gameProgress.col.power, 1)" style="text-align: center; font-size: 0.75vw" class="whiteText">, PRai: {{ format( item.data.gameProgress.main.prai.amount ) }}</span>
                            <span v-if="Decimal.gte(item.data.gameProgress.main.prai.totalEver, 10) && (item.data.gameProgress.layer4 === undefined ? true : Decimal.lt(item.data.gameProgress.layer4.gro.totalAmt, 1) && Decimal.lt(item.data.gameProgress.layer4.tax.totalEver, 1))" style="text-align: center; font-size: 0.75vw" class="whiteText" >, PR2: {{ format(item.data.gameProgress.main.pr2.amount) }}</span>
                            <span v-if="Decimal.gte(item.data.gameProgress.main.pr2.bestEver, 10)" style="text-align: center; font-size: 0.75vw" class="whiteText">, Kuaraniai: {{ format(item.data.gameProgress.kua.amount, 3) }} </span>
                            <span v-if="Decimal.gte(item.data.gameProgress.col.power, 1)" style="text-align: center; font-size: 0.75vw" class="whiteText">, Col. Power: {{ format( item.data.gameProgress.col.power, 2 ) }}</span>
                            <span v-if="item.data.gameProgress.layer4 === undefined ? false : Decimal.gte(item.data.gameProgress.layer4.gro.totalAmt, 1)" style="text-align: center; font-size: 0.75vw" class="whiteText">, Total grōwan: {{ format( item.data.gameProgress.layer4.gro.totalAmt, 2 ) }}</span>
                        </div>
                    </div>
                    <div style="position: relative; width: 100%; height: 25%; display: flex; align-items: flex-end;">
                        <div style="flex-grow: 0.3333; flex-basis: 0; text-align: left; display: flex; flex-direction: column;" class="fontTrebuchetMS">
                            <span style="font-size: 0.9vw" class="whiteText">
                                {{ formatTime(item.data.totalRealTime, 0, 3, 4) }}
                            </span>
                            <span v-if="game.currentSave != index" style="font-size: 0.75vw" class="whiteText" >
                                Offline for {{ formatTime((Date.now() - item.data.lastUpdated) / 1000, 0, 3, 4) }}
                            </span>
                            <span style="font-size: 0.75vw" class="whiteText">
                                Offline Time: {{ formatTime(Decimal.div(item.data.offlineTime, 1000), 0, 3, 4) }}
                            </span>
                        </div>
                        <div style="flex-grow: 1; flex-basis: 0; text-align: right; font-size: 1.2vw;" class="whiteText">
                            <button
                                @click="switchToSave(index)"
                                class="whiteText fontTrebuchetMS generatorButton saveListMiniButton"
                                :style="{
                                    cursor:
                                        game.currentSave !== index
                                            ? 'pointer'
                                            : 'not-allowed',
                                    border: `0.12vw solid ${gRC(game.currentSave !== index ? gameVars.sessionTime : 4.0, game.currentSave !== index ? 1 : 0.5, game.currentSave !== index ? 1 : 0.125)}`
                                }"
                            >
                                Load Save
                            </button>
                            <button @click="duplicateSave(index)" class="whiteText fontTrebuchetMS generatorButton saveListMiniButton" :style="{ border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}` }">
                                Duplicate Save
                            </button>
                            <button @click="deleteSave(index)" class="whiteText fontTrebuchetMS generatorButton saveListMiniButton" :style="{ border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}` }">
                                Delete Save
                            </button>
                            <button @click="renameSave(index)" class="whiteText fontTrebuchetMS generatorButton saveListMiniButton" :style="{ border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}` }">
                                Rename Save
                            </button>
                            <button @click="importSave(index)" class="whiteText fontTrebuchetMS generatorButton saveListMiniButton" :style="{ border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}` }">
                                Import Save
                            </button>
                            <button @click="exportSave(index)" class="whiteText fontTrebuchetMS generatorButton saveListMiniButton" :style="{ border: `0.12vw solid ${gRC(gameVars.sessionTime, 1, 1)}` }">
                                Export Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    */

        html[`saveFile${i}loadSave`].addEventListener('click', () => switchToSave(i));
        html[`saveFile${i}duplicateSave`].addEventListener('click', () => duplicateSave(i));
        html[`saveFile${i}deleteSave`].addEventListener('click', () => deleteSave(i));
        html[`saveFile${i}renameSave`].addEventListener('click', () => renameSave(i));
        html[`saveFile${i}importSave`].addEventListener('click', () => importSave(i));
        html[`saveFile${i}exportSave`].addEventListener('click', () => exportSave(i));

        html[`saveFile${i}progFill`].style.width = `${D(game.list[i].data.gameProgress.points).max(1).log(1e63).min(1).mul(100).toNumber()}%`
        html[`saveFile${i}name`].textContent = game.list[i].name
        html[`saveFile${i}version`].textContent = `v${game.list[i].data.version}`
        html[`saveFile${i}modes`].textContent = displayModes(game.list[i].modes)
        html[`saveFile${i}info`].textContent = `Points: ${format(game.list[i].data.gameProgress.points)}`
        html[`saveFile${i}totalTime`].textContent = `${formatTime(game.list[i].data.totalRealTime, 0, 3, 4)}`
        html[`saveFile${i}offlineInfo`].textContent = `Offline for ${formatTime((Date.now() - game.list[i].data.lastUpdated) / 1000, 0, 3, 4) }`
    }
}

export const setTimeSpeed = () => {
    const i = prompt(
        "What speed would you like to set this game to? (Input blank to keep the current timespeed.)"
    );
    if (!(i === "" || i === null)) {
        const numI = new Decimal(i);

        if (Decimal.isNaN(numI)) {
            alert("Your set time speed is not a number...");
            return;
        }

        if (numI.lt(0)) {
            alert("Your input is not a positive number...");
            return;
        }

        player.setTimeSpeed = numI;
    }
};