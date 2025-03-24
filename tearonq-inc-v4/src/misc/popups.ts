import { gameVars } from "../loadSave";
import { html, toHTMLvar } from "../main";
import { colorChange } from "./calc";

export let popupID = 0;
export const popupList: Array<Popup> = [];

type Popup = {
    id: number;
    maxlife: number;
    life: number;
    type: number;
    title: string;
    message: string;
    color: string;
    opacity: number;
};

export const spawnPopup = (type = 0, text: string, title: string, timer: number, color: string) => {
    popupList.push({
        id: popupID,
        maxlife: timer,
        life: timer,
        type: type,
        title: title,
        message: text,
        color: color,
        opacity: 0
    });
    popupID++;
    updateSpawnPopups();
};

export const diePopupsDie = () => {
    let popupListChanged = false;
    for (let i = 0; i < popupList.length; i++) {
        popupList[i].life -= gameVars.trueDelta;
        popupList[i].opacity = 1;
        if (popupList[i].maxlife - popupList[i].life < 0.2) {
            popupList[i].opacity = (popupList[i].maxlife - popupList[i].life) / 0.2;
        }
        if (popupList[i].life < 0.2) {
            popupList[i].opacity = popupList[i].life / 0.2;
        }
        if (popupList[i].life < 0) {
            popupList.splice(i, 1);
            popupListChanged = true;
        }
    }
    if (popupListChanged) {
        updateSpawnPopups();
    }
};

export const updateSpawnPopups = () => {
    let txt = ``
    for (let i = 0; i < popupList.length; i++) {
        txt += `
            <div id="popupID${i}" class="popup fontVerdana" style="display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; align-content: center; background-color: ${popupList[i].color}; opacity: ${popupList[i].opacity}; color: ${colorChange(popupList[i].color, 0.5, 1.0)}">
                <span style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 2px;">${popupList[i].title}</span>
                <span style="font-size: 12px; text-align: center">${popupList[i].message}</span>
            </div>
        `
    }
    html['popup-container'].innerHTML = txt;
    for (let i = 0; i < popupList.length; i++) {
        toHTMLvar(`popupID${i}`);
        html[`popupID${i}`].addEventListener('click', () => { popupList[i].life = 0.2; });
    }
}