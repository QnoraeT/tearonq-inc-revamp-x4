import Decimal from "break_eternity.js"
import { D, smoothExp } from "../misc/calc"
import { html, tab, toHTMLvar } from "../main"
import { format } from "../misc/format"
import { player, tmp } from "../loadSave"

export class MainBuyable {
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
            {exp: D(0), scale: [D(1e10), D(100), D(1.01)  ]},
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
    new MainBuyable(0, 'Multiplies point gain by ', '×'),
    new MainBuyable(1, 'Divides Buyable 1\'s cost by /', ''),
    new MainBuyable(2, 'Adds +', ' to Buyable 1\'s effect base'),
    // new MainBuyable(3),
    // new MainBuyable(4),
    // new MainBuyable(5),
    // new MainBuyable(6),
    // new MainBuyable(7),
    // new MainBuyable(8),
]

export const initHTML_Main = () => {
    toHTMLvar('buyables');
    toHTMLvar('buyableCap');
    toHTMLvar('buyableList');

    let txt = ``;
    for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
        txt += `
            <div id="buyable${i}" class="flex-vertical" style="margin: 4px;">
                <button id="buyable${i}Button" class="whiteText fontTrebuchetMS buyableButton alignCenter" style="width: 220px; height: 150px; font-size: 12px">
                    <h3>Buyable ${i + 1} ×<span id="buyable${i}Bought"></span></h3><br>
                    <span id="buyable${i}EffectPer"></span><br>
                    Total: <span id="buyable${i}TotalEffect"></span><br><br>
                    Cost: <span id="buyable${i}Cost"></span> points
                </button>

                <button id="buyable${i}AutobuyerToggle" class="whiteText fontTrebuchetMS buyableButton buyableAutoButton alignCenter canClick" style="width: 220px; height: 30px; margin-top: 5px">
                    <b>Upgrade ${i + 1} Autobuyer: <span id="buyable${i}Autobuyer"></span></b>
                </button>
            </div>
        `;
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
}

export const updateGame_Main = (delta: Decimal) => {
    for (let i = MAIN_UPG_DATA.length - 1; i >= 0; i--) {
        if (i === 0) {
            tmp.game.buyables[i].unlocked = true;
        }

        if (i === 1 && Decimal.gte(player.gameProgress.pr2, 1)) {
            tmp.game.buyables[i].unlocked = true;
        }

        if (i === 2 && Decimal.gte(player.gameProgress.staticUpgrades[4].bought, 1)) {
            tmp.game.buyables[i].unlocked = true;
        }

        if (tmp.game.buyables[i].unlocked) {
            tmp.game.buyables[i].cost = D(player.gameProgress.buyables[i].bought);
            tmp.game.buyables[i].cost = smoothExp(tmp.game.buyables[i].cost, MAIN_UPG_DATA[i].baseCostGrowthData.scale[2], false);
            // scaling changes
            if (i === 0 && Decimal.gte(player.gameProgress.staticUpgrades[2].bought, 1)) {
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.mul(tmp.game.staticUpgrades[2].effect);
            }
            // end scaling changes
            tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.pow_base(MAIN_UPG_DATA[i].baseCostGrowthData.scale[1]);
            tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.mul(MAIN_UPG_DATA[i].baseCostGrowthData.scale[0]);
            tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.layeradd10(MAIN_UPG_DATA[i].baseCostGrowthData.exp);
            // cost changes
            if (i === 0) {
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.div(tmp.game.buyables[1].effect)
            }
            if (i === 1 && Decimal.gte(player.gameProgress.staticUpgrades[0].bought, 1)) {
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.mul(tmp.game.staticUpgrades[0].effect);
            }
            // end cost changes
            tmp.game.buyables[i].canBuy = Decimal.gte(player.gameProgress.points, tmp.game.buyables[i].cost) && Decimal.lt(player.gameProgress.buyables[i].bought, tmp.game.buyableCap);

            tmp.game.buyables[i].target = D(0);
            if (Decimal.gte(player.gameProgress.points, MAIN_UPG_DATA[i].baseCostGrowthData.scale[0])) {
                tmp.game.buyables[i].target = D(player.gameProgress.points);
                // cost changes
                if (i === 1 && Decimal.gte(player.gameProgress.staticUpgrades[0].bought, 1)) {
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.div(tmp.game.staticUpgrades[0].effect);
                }
                if (i === 0) {
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.mul(tmp.game.buyables[1].effect)
                }
                // end cost changes
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.layeradd10(MAIN_UPG_DATA[i].baseCostGrowthData.exp.neg());
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.div(MAIN_UPG_DATA[i].baseCostGrowthData.scale[0]);
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.log(MAIN_UPG_DATA[i].baseCostGrowthData.scale[1]);
                // scaling changes
                if (i === 0 && Decimal.gte(player.gameProgress.staticUpgrades[2].bought, 1)) {
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.div(tmp.game.staticUpgrades[2].effect);
                }
                // end scaling changes
                tmp.game.buyables[i].target = smoothExp(tmp.game.buyables[i].target, MAIN_UPG_DATA[i].baseCostGrowthData.scale[2], true);
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.min(tmp.game.buyableCap);
            }

            tmp.game.buyables[i].effectBase = MAIN_UPG_DATA[i].baseEffectBase.val;
            if (i === 0 && Decimal.gte(player.gameProgress.pr2, 2)) {
                tmp.game.buyables[i].effectBase = tmp.game.buyables[i].effectBase.add(0.25);
            }
            if (i === 2 && Decimal.gte(player.gameProgress.staticUpgrades[4].bought, 1)) {
                tmp.game.buyables[i].effectBase = tmp.game.staticUpgrades[4].effect;
            }
            if ((i === 0 || i === 1) && Decimal.gte(player.gameProgress.staticUpgrades[3].bought, 1)) {
                tmp.game.buyables[i].effectBase = tmp.game.buyables[i].effectBase.add(tmp.game.staticUpgrades[3].effect);
            }
            if (i === 0) {
                tmp.game.buyables[i].effectBase = tmp.game.buyables[i].effectBase.add(tmp.game.buyables[2].effect);
            }

            tmp.game.buyables[i].effect = MAIN_UPG_DATA[i].baseEffectBase.type === 1
                ? tmp.game.buyables[i].effectBase.pow(player.gameProgress.buyables[i].bought)
                : tmp.game.buyables[i].effectBase.mul(player.gameProgress.buyables[i].bought);
        } else {
            tmp.game.buyables[i].effect = MAIN_UPG_DATA[i].baseEffectBase.type === 1
                ? D(1)
                : D(0);
        }
    }

    tmp.game.pointGen = D(1);
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.buyables[0].effect);
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.praiEffect);
    if (Decimal.gte(player.gameProgress.pr2, 3)) {
        tmp.game.pointGen = tmp.game.pointGen.mul(8);
    }
    if (Decimal.gte(player.gameProgress.staticUpgrades[1].bought, 1)) {
        tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.staticUpgrades[1].effect);
    }
    if (Decimal.gte(player.gameProgress.pr2, 5)) {
        tmp.game.pointGen = tmp.game.pointGen.mul(5);
    }

    player.gameProgress.points = Decimal.max(player.gameProgress.points, 0).add(tmp.game.pointGen.mul(delta));
    player.gameProgress.totalPointsInPRai = Decimal.max(player.gameProgress.totalPointsInPRai, 0).add(tmp.game.pointGen.mul(delta));
}

export const updateHTML_Main = () => {
    html['buyables'].classList.toggle("hide", tab.mainTab !== 0);
    if (tab.mainTab === 0) {
        html['buyableCap'].textContent = `${format(tmp.game.buyableCap)}`;
        for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
            html[`buyable${i}`].classList.toggle("hide", !tmp.game.buyables[i].unlocked);
            if (tmp.game.buyables[i].unlocked) {
                html[`buyable${i}Bought`].textContent = `${format(player.gameProgress.buyables[i].bought)}`;
                html[`buyable${i}Cost`].textContent = `${format(tmp.game.buyables[i].cost)}`;
                html[`buyable${i}EffectPer`].textContent = `${MAIN_UPG_DATA[i].desc1}${format(tmp.game.buyables[i].effectBase, 3)}${MAIN_UPG_DATA[i].desc2}`;
                html[`buyable${i}TotalEffect`].textContent = `${MAIN_UPG_DATA[i].desc1}${format(tmp.game.buyables[i].effect, 2)}${MAIN_UPG_DATA[i].desc2}`;
                html[`buyable${i}Button`].classList.toggle("cannot", !tmp.game.buyables[i].canBuy);
                html[`buyable${i}Button`].classList.toggle("can", tmp.game.buyables[i].canBuy);
                html[`buyable${i}Button`].classList.toggle("cannotClick", !tmp.game.buyables[i].canBuy);
                html[`buyable${i}Button`].classList.toggle("canClick", tmp.game.buyables[i].canBuy);
                html[`buyable${i}AutobuyerToggle`].classList.toggle("hide", !tmp.game.buyables[i].autoUnlocked);
                if (tmp.game.buyables[i].autoUnlocked) {
                    html[`buyable${i}AutobuyerToggle`].classList.toggle("cannot", !player.gameProgress.buyables[i].auto);
                    html[`buyable${i}AutobuyerToggle`].classList.toggle("can", player.gameProgress.buyables[i].auto);
                    html[`buyable${i}Autobuyer`].textContent = player.gameProgress.buyables[i].auto ? 'On' : 'Off';
                }
            }
        }
    }
}

export const buyMainBuyable = (id: number): void => {
    if (Decimal.gte(player.gameProgress.buyables[id].bought, tmp.game.buyableCap)) {
        return;
    }
    if (Decimal.lt(player.gameProgress.points, tmp.game.buyables[id].cost)) {
        return;
    }
    player.gameProgress.points = Decimal.sub(player.gameProgress.points, tmp.game.buyables[id].cost);

    player.gameProgress.buyables[id].bought = Decimal.add(player.gameProgress.buyables[id].bought, 1);
    player.gameProgress.buyables[id].boughtInKua = Decimal.max(player.gameProgress.buyables[id].boughtInKua, player.gameProgress.buyables[id].bought);
    updateGame_Main(D(0));
}

export const toggleMainBuyableAutobuyer = (id: number): void => {
    player.gameProgress.buyables[id].auto = !player.gameProgress.buyables[id].auto;
}