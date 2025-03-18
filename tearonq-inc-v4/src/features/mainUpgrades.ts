import Decimal from "break_eternity.js"
import { D, smoothExp } from "../misc/calc"
import { html, tab, toHTMLvar } from "../main"
import { format } from "../misc/format"
import { player, tmp } from "../loadSave"

export class MainUpgrades {
    index: number
    baseEffectBase: {
        type: number,
        val: Decimal
    }
    baseCostGrowthData: {
        exp: Decimal,
        scale: Array<Decimal>
    }
    desc1: string
    desc2: string
    constructor(index: number, descriptionEarly: string, descriptionLate: string) {
        this.index = index;
        this.baseCostGrowthData = [
            {exp: D(0), scale: [D(1),    D(3),   D(1.01)  ]},
            {exp: D(0), scale: [D(1e3),  D(10),  D(1.01)  ]},
            {exp: D(0), scale: [D(1e10), D(100), D(1.02)  ]},
            // {exp: D(0), scale: [D(1e33), D(1.02),   D(1.0003)]},
            // {exp: D(0), scale: [D(1e45), D(1.03),   D(1.0002)]},
            // {exp: D(0), scale: [D(1e63), D(1.25),   D(1.025) ]},
            // {exp: D(1), scale: [D(1000), D(1.01),   D(1.0001)]},
            // {exp: D(1), scale: [D(1250), D(1.0075), D(1.0002)]},
            // {exp: D(1), scale: [D(1500), D(1.025),  D(1.0005)]},
        ][index];
        this.baseEffectBase = [
            {type: 1, val: D(2) },
            {type: 1, val: D(2) },
            {type: 0, val: D(0.01) },
            // {type: 1, val: tmp.value.kua.effects.upg4 },
            // {type: 1, val: tmp.value.kua.effects.upg5 },
            // {type: 0, val: tmp.value.kua.effects.upg6 },
            // {type: 1, val: D(1.01) },
            // {type: 1, val: D(0.99) },
            // {type: 1, val: D(1.01) },
        ][index];
        this.desc1 = descriptionEarly;
        this.desc2 = descriptionLate;
    }
}

 // TODO: make this a part of tmp
export const MAIN_UPG_DATA = [
    new MainUpgrades(0, 'Multiplies point gain by ', '×'),
    new MainUpgrades(1, 'Divides Buyable 1\'s cost by /', ''),
    new MainUpgrades(2, 'Adds +', ' to Buyable 1\'s effect base'),
    // new MainUpgrades(3),
    // new MainUpgrades(4),
    // new MainUpgrades(5),
    // new MainUpgrades(6),
    // new MainUpgrades(7),
    // new MainUpgrades(8),
]

export const initHTML_Main = () => {
    toHTMLvar('buyables');
    toHTMLvar('buyableList');

    let txt: string = ``;
    for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
        txt += `
            <div id="buyable${i}" class="flex-vertical" style="margin: 0.2vw;">
                <button id="buyable${i}Button" class="whiteText fontTrebuchetMS buyableButton alignCenter" style="width: 220px; height: 150px; font-size: 12px">
                    <h3>Upgrade ${i + 1} ×<span id="buyable${i}Bought"></span></h3><br>
                    <span id="buyable${i}EffectPer"></span><br>
                    Total: <span id="buyable${i}TotalEffect"></span><br><br>
                    Cost: <span id="buyable${i}Cost"></span> points
                </button>

                <button id="buyable${i}AutobuyerToggle" class="whiteText fontTrebuchetMS buyableButton buyableAutoButton alignCenter canClick" style="width: 220px; height: 30px; margin-top: 5px">
                    <b>Upgrade ${i + 1} Autobuyer: <span id="buyable${i}Autobuyer"></span></b>
                </button>
            </div>
        `
    }
    html['buyableList'].innerHTML = txt;

    for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
        toHTMLvar(`buyable${i}`);
        toHTMLvar(`buyable${i}Button`);
        toHTMLvar(`buyable${i}Bought`);
        toHTMLvar(`buyable${i}EffectPer`);
        toHTMLvar(`buyable${i}TotalEffect`);
        toHTMLvar(`buyable${i}Cost`);
        toHTMLvar(`buyable${i}AutobuyerToggle`);
        toHTMLvar(`buyable${i}Autobuyer`);

        html[`buyable${i}Button`].addEventListener('click', () => buyMainBuyable(i));
        html[`buyable${i}AutobuyerToggle`].addEventListener('click', () => toggleMainBuyableAutobuyer(i));
    }

    console.log(html);
}

export const updateGame_Main = (delta: Decimal) => {
    for (let i = MAIN_UPG_DATA.length - 1; i >= 0; i--) {
        if (tmp.game.upgrades[i] === undefined) {
            tmp.game.upgrades[i] = {
                cost: D(1),
                target: D(0),
                effect: D(0),
                effectBase: D(0),
                unlocked: false,
                autoUnlocked: false,
                canBuy: false
            }
        }
        
        if (i === 0) {
            tmp.game.upgrades[i].unlocked = true;
        }

        if (tmp.game.upgrades[i].unlocked) {
            tmp.game.upgrades[i].cost = D(player.gameProgress.upgrades[i].bought);
            tmp.game.upgrades[i].cost = smoothExp(tmp.game.upgrades[i].cost, MAIN_UPG_DATA[i].baseCostGrowthData.scale[2], false);
            tmp.game.upgrades[i].cost = tmp.game.upgrades[i].cost.pow_base(MAIN_UPG_DATA[i].baseCostGrowthData.scale[1]);
            tmp.game.upgrades[i].cost = tmp.game.upgrades[i].cost.mul(MAIN_UPG_DATA[i].baseCostGrowthData.scale[0]);
            tmp.game.upgrades[i].cost = tmp.game.upgrades[i].cost.layeradd10(MAIN_UPG_DATA[i].baseCostGrowthData.exp);
            if (i === 0) {
                tmp.game.upgrades[i].cost = tmp.game.upgrades[i].cost.div(tmp.game.upgrades[1].effect)
            }
            tmp.game.upgrades[i].canBuy = Decimal.gte(player.gameProgress.points, tmp.game.upgrades[i].cost);

            tmp.game.upgrades[i].target = D(0);
            if (Decimal.gte(player.gameProgress.points, MAIN_UPG_DATA[i].baseCostGrowthData.scale[0])) {
                tmp.game.upgrades[i].target = D(player.gameProgress.points);
                if (i === 0) {
                    tmp.game.upgrades[i].target = tmp.game.upgrades[i].target.mul(tmp.game.upgrades[1].effect)
                }
                tmp.game.upgrades[i].target = tmp.game.upgrades[i].target.layeradd10(MAIN_UPG_DATA[i].baseCostGrowthData.exp.neg());
                tmp.game.upgrades[i].target = tmp.game.upgrades[i].target.div(MAIN_UPG_DATA[i].baseCostGrowthData.scale[0]);
                tmp.game.upgrades[i].target = tmp.game.upgrades[i].target.log(MAIN_UPG_DATA[i].baseCostGrowthData.scale[1]);
                tmp.game.upgrades[i].target = smoothExp(tmp.game.upgrades[i].target, MAIN_UPG_DATA[i].baseCostGrowthData.scale[2], true);
            }

            tmp.game.upgrades[i].effectBase = MAIN_UPG_DATA[i].baseEffectBase.val;
            tmp.game.upgrades[i].effect = MAIN_UPG_DATA[i].baseEffectBase.type === 1
                ? tmp.game.upgrades[i].effectBase.pow(player.gameProgress.upgrades[i].bought)
                : tmp.game.upgrades[i].effectBase.mul(player.gameProgress.upgrades[i].bought);
        } else {
            tmp.game.upgrades[i].effect = MAIN_UPG_DATA[i].baseEffectBase.type === 1
                ? D(1)
                : D(0);
        }
    }

    tmp.game.pointGen = D(1);
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.upgrades[0].effect);
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.praiEffect);

    player.gameProgress.points = Decimal.max(player.gameProgress.points, 0).add(tmp.game.pointGen.mul(delta));
    player.gameProgress.totalPointsInPRai = Decimal.max(player.gameProgress.totalPointsInPRai, 0).add(tmp.game.pointGen.mul(delta));
}

export const updateHTML_Main = () => {
    html['buyables'].classList.toggle("hide", tab.mainTab !== 0);
    if (tab.mainTab === 0) {
        for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
            html[`buyable${i}`].classList.toggle("hide", !tmp.game.upgrades[i].unlocked);
            if (tmp.game.upgrades[i].unlocked) {
                html[`buyable${i}Bought`].textContent = `${format(player.gameProgress.upgrades[i].bought)}`;
                html[`buyable${i}Cost`].textContent = `${format(tmp.game.upgrades[i].cost)}`;
                html[`buyable${i}EffectPer`].textContent = `${MAIN_UPG_DATA[i].desc1}${format(tmp.game.upgrades[i].effectBase, 3)}${MAIN_UPG_DATA[i].desc2}`;
                html[`buyable${i}TotalEffect`].textContent = `${MAIN_UPG_DATA[i].desc1}${format(tmp.game.upgrades[i].effect, 2)}${MAIN_UPG_DATA[i].desc2}`;
                html[`buyable${i}Button`].classList.toggle("cannot", !tmp.game.upgrades[i].canBuy);
                html[`buyable${i}Button`].classList.toggle("can", tmp.game.upgrades[i].canBuy);
                html[`buyable${i}Button`].classList.toggle("cannotClick", !tmp.game.upgrades[i].canBuy);
                html[`buyable${i}Button`].classList.toggle("canClick", tmp.game.upgrades[i].canBuy);
                html[`buyable${i}AutobuyerToggle`].classList.toggle("hide", !tmp.game.upgrades[i].autoUnlocked);
                if (tmp.game.upgrades[i].autoUnlocked) {
                    html[`buyable${i}AutobuyerToggle`].classList.toggle("cannot", !player.gameProgress.upgrades[i].auto);
                    html[`buyable${i}AutobuyerToggle`].classList.toggle("can", player.gameProgress.upgrades[i].auto);
                    html[`buyable${i}Autobuyer`].textContent = player.gameProgress.upgrades[i].auto ? 'On' : 'Off';
                }
            }
        }
    }
}

export const buyMainBuyable = (id: number): void => {
    if (Decimal.gte(player.gameProgress.points, tmp.game.upgrades[id].cost)) {
        player.gameProgress.points = Decimal.sub(player.gameProgress.points, tmp.game.upgrades[id].cost);

        player.gameProgress.upgrades[id].bought = Decimal.add(player.gameProgress.upgrades[id].bought, 1);
        player.gameProgress.upgrades[id].boughtInKua = Decimal.max(player.gameProgress.upgrades[id].boughtInKua, player.gameProgress.upgrades[id].bought);
        updateGame_Main(D(0));
    }
}

export const toggleMainBuyableAutobuyer = (id: number): void => {
    player.gameProgress.upgrades[id].auto = !player.gameProgress.upgrades[id].auto;
}