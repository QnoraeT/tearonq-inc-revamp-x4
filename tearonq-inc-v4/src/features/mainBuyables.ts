import Decimal from "break_eternity.js"
import { D, smoothExp } from "../misc/calc"
import { html, tab, toHTMLvar } from "../main"
import { format } from "../misc/format"
import { player, tmp } from "../loadSave"
import { hasKuaStaticUpg } from "./kuaraniai"
import { PR3_EFFECTS } from "./pr2+"

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
            {exp: D(0), scale: [D(1),    D(3),    D(1.01)  ]},
            {exp: D(0), scale: [D(1e3),  D(10),   D(1.01)  ]},
            {exp: D(0), scale: [D(1e10), D(100),  D(1.01)  ]},
            {exp: D(0), scale: [D(1e30), D(1e15), D(1.025) ]},
            {exp: D(0), scale: [D(1e70), D(1e35), D(1.025) ]},
            // {exp: D(0), scale: [D(1e63), D(1.25),   D(1.025) ]},
            // {exp: D(1), scale: [D(1000), D(1.01),   D(1.0001)]},
            // {exp: D(1), scale: [D(1250), D(1.0075), D(1.0002)]},
            // {exp: D(1), scale: [D(1500), D(1.025),  D(1.0005)]},
        ][index];
        this.baseEffectBase = [
            {type: 1, val: D(2) },
            {type: 1, val: D(2) },
            {type: 0, val: D(0.01) },
            {type: 1, val: D(1.04) },
            {type: 0, val: D(0.002) },
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
export const MAIN_BUYABLE_DATA = [
    new MainBuyable(0, 'Multiplies point gain by ', '×'),
    new MainBuyable(1, 'Divides Buyable 1\'s cost by /', ''),
    new MainBuyable(2, 'Adds +', ' to Buyable 1\'s effect base'),
    new MainBuyable(3, 'Multiplies Buyable 2\'s effect base by ', '×'),
    new MainBuyable(4, 'Adds +', ' to Buyable 3\'s effect base'),
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
    toHTMLvar('buyableCapAfter');
    toHTMLvar('buyableList');

    let txt = ``;
    for (let i = 0; i < MAIN_BUYABLE_DATA.length; i++) {
        txt += `
            <div id="buyable${i}" class="flex-vertical" style="margin: 4px;">
                <button id="buyable${i}Button" class="whiteText fontTrebuchetMS buyableButton alignCenter" style="width: 220px; height: 150px; font-size: 12px">
                    <h3>Buyable ${i + 1} ×<span id="buyable${i}Bought"></span></h3><br>
                    <span id="buyable${i}EffectPer"></span><br>
                    Total: <span id="buyable${i}TotalEffect"></span><br><br>
                    Cost: <span id="buyable${i}Cost"></span> points
                </button>

                <button id="buyable${i}AutobuyerToggle" class="whiteText fontTrebuchetMS buyableButton buyableAutoButton alignCenter canClick" style="width: 220px; height: 30px; margin-top: 5px">
                    <b>Autobuyer: <span id="buyable${i}Autobuyer"></span></b>
                </button>
            </div>
        `;
    }
    html['buyableList'].innerHTML = txt;

    for (let i = 0; i < MAIN_BUYABLE_DATA.length; i++) {
        toHTMLvar(`buyable${i}`);
        toHTMLvar(`buyable${i}Button`);
        toHTMLvar(`buyable${i}Bought`);
        toHTMLvar(`buyable${i}EffectPer`);
        toHTMLvar(`buyable${i}TotalEffect`);
        toHTMLvar(`buyable${i}Cost`);
        toHTMLvar(`buyable${i}AutobuyerToggle`);
        toHTMLvar(`buyable${i}Autobuyer`);

        // see updateSaveFileListHTML for why i don't check here -- tl;dr these are children of buyableList and their event listeners get cleared if i set innerhtml
        html[`buyable${i}Button`].addEventListener('click', () => buyMainBuyable(i));
        html[`buyable${i}AutobuyerToggle`].addEventListener('click', () => toggleMainBuyableAutobuyer(i));
    }
}

export const updateGame_Main = (delta: Decimal) => {
    tmp.game.buyableCap = D(100);
    tmp.game.buyableCap = tmp.game.buyableCap.add(tmp.game.kp.dynEffs[3]);
    if (hasKuaStaticUpg('power', 4)) {
        tmp.game.buyableCap = tmp.game.buyableCap.add(tmp.game.kp.upgEffs[4]);
    }
    if (hasKuaStaticUpg('power', 8)) {
        tmp.game.buyableCap = tmp.game.buyableCap.add(tmp.game.kp.upgEffs[8]);
    }

    for (let i = MAIN_BUYABLE_DATA.length - 1; i >= 0; i--) {
        if (i === 0) {
            tmp.game.buyables[i].unlocked = true;
        }
        if (i === 1 && Decimal.gte(player.gameProgress.pr2, 1)) {
            tmp.game.buyables[i].unlocked = true;
        }
        if (i === 2 && Decimal.gte(player.gameProgress.staticUpgrades[4].bought, 1)) {
            tmp.game.buyables[i].unlocked = true;
        }
        if (i === 3 && hasKuaStaticUpg('shard', 5)) {
            tmp.game.buyables[i].unlocked = true;
        }
        if (i === 4 && hasKuaStaticUpg('shard', 6)) {
            tmp.game.buyables[i].unlocked = true;
        }

        if (tmp.game.buyables[i].unlocked) {
            tmp.game.buyables[i].autoUnlocked = false;
            if (i === 0 && Decimal.gte(player.gameProgress.pr3, 1)) {
                tmp.game.buyables[i].autoUnlocked = true;
            }
            if (i === 1 && Decimal.gte(player.gameProgress.pr3, 2)) {
                tmp.game.buyables[i].autoUnlocked = true;
            }
            if (i === 2 && Decimal.gte(player.gameProgress.pr3, 3)) {
                tmp.game.buyables[i].autoUnlocked = true;
            }

            if (tmp.game.buyables[i].autoUnlocked) {
                tmp.game.buyables[i].autoSpeed = D(0);
                if (i === 0 && Decimal.gte(player.gameProgress.pr3, 1)) {
                    tmp.game.buyables[i].autoSpeed = PR3_EFFECTS[2](player.gameProgress.pr3);
                }
                if (i === 1 && Decimal.gte(player.gameProgress.pr3, 2)) {
                    tmp.game.buyables[i].autoSpeed = PR3_EFFECTS[3](player.gameProgress.pr3);
                }
                if (i === 2 && Decimal.gte(player.gameProgress.pr3, 3)) {
                    tmp.game.buyables[i].autoSpeed = PR3_EFFECTS[3](player.gameProgress.pr3);
                }
            }

            tmp.game.buyables[i].scalingSpeed = D(1);
            if (i === 0) {
                if (Decimal.gte(player.gameProgress.staticUpgrades[2].bought, 1)) {
                    tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.mul(tmp.game.staticUpgs[2].eff);
                }
                tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.mul(Decimal.sub(1, tmp.game.kp.dynEffs[1]));
                if (hasKuaStaticUpg('power', 0)) {
                    tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.mul(tmp.game.kp.upgEffs[0]);
                }
            }
            if (i === 1) {
                tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.mul(Decimal.sub(1, tmp.game.kp.dynEffs[7]));
            }
            if (i === 2) {
                tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.mul(Decimal.sub(1, tmp.game.kp.dynEffs[8]));
                tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.div(tmp.game.pEBuyables[2].eff2);
            }
            if (i >= 0 && i <= 2 && hasKuaStaticUpg('power', 11)) {
                tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.mul(Decimal.sub(1, tmp.game.kp.upgEffs[11]));
            }
            if (i === 3 || i === 4) {
                tmp.game.buyables[i].scalingSpeed = tmp.game.buyables[i].scalingSpeed.div(tmp.game.pEBuyables[5].eff2);
            }

            tmp.game.buyables[i].target = D(0);
            if (Decimal.gte(player.gameProgress.points, MAIN_BUYABLE_DATA[i].baseCostGrowthData.scale[0])) {
                tmp.game.buyables[i].target = D(player.gameProgress.points);
                // cost changes
                if (i === 3 || i === 4) {
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.mul(tmp.game.ks.dynEffs[4]);
                }
                if (Decimal.gte(player.gameProgress.pr2, 7)) {
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.mul(1e6);
                }
                if (i === 1 && Decimal.gte(player.gameProgress.staticUpgrades[0].bought, 1)) {
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.div(tmp.game.staticUpgs[0].eff);
                }
                if (i === 0) {
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.mul(tmp.game.pEBuyables[3].eff2);
                    if (hasKuaStaticUpg('power', 5)) {
                        tmp.game.buyables[i].target = tmp.game.buyables[i].target.mul(tmp.game.kp.upgEffs[5]);
                    }
                    tmp.game.buyables[i].target = tmp.game.buyables[i].target.mul(tmp.game.buyables[1].eff);
                }
                // end cost changes
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.layeradd10(MAIN_BUYABLE_DATA[i].baseCostGrowthData.exp.neg());
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.div(MAIN_BUYABLE_DATA[i].baseCostGrowthData.scale[0]);
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.log(MAIN_BUYABLE_DATA[i].baseCostGrowthData.scale[1]);
                // scaling changes
                tmp.game.buyables[i].target = tmp.game.buyables[i].target.div(tmp.game.buyables[i].scalingSpeed);
                // end scaling changes
                tmp.game.buyables[i].target = smoothExp(tmp.game.buyables[i].target, MAIN_BUYABLE_DATA[i].baseCostGrowthData.scale[2], true);
                if (Decimal.gte(tmp.game.buyables[i].target, tmp.game.buyableCap)) {
                    if (hasKuaStaticUpg('power', 4)) {
                        if (Decimal.gte(player.gameProgress.pr2, 10)) {
                            tmp.game.buyables[i].target = tmp.game.buyables[i].target.div(tmp.game.buyableCap).root(2).mul(tmp.game.buyableCap);
                        } else {
                            tmp.game.buyables[i].target = tmp.game.buyables[i].target.sub(tmp.game.buyableCap).root(2).add(tmp.game.buyableCap);
                        }
                    } else {
                        tmp.game.buyables[i].target = tmp.game.buyableCap;
                    }
                }
            }

            if (player.gameProgress.buyables[i].auto && tmp.game.buyables[i].autoUnlocked) {
                player.gameProgress.buyables[i].autobought = Decimal.add(player.gameProgress.buyables[i].autobought, tmp.game.buyables[i].autoSpeed.mul(delta)).min(tmp.game.buyables[i].target);
                let bought = player.gameProgress.buyables[i].bought;
                player.gameProgress.buyables[i].bought = Decimal.add(player.gameProgress.buyables[i].autobought, 0.99999999).floor().max(player.gameProgress.buyables[i].bought);
                bought = Decimal.sub(bought, player.gameProgress.buyables[i].bought);
                if (bought.lt(0)) {
                    // why only the first buy? the earlier purchases get increasingly negligible
                    // ee15 as a limit because at some point, cost may equal points and do some weird crap
                    if (Decimal.lt(player.gameProgress.points, 'ee15')) {
                        player.gameProgress.points = Decimal.sub(player.gameProgress.points, tmp.game.buyables[i].cost).max(0);
                    }
                }
            }

            tmp.game.buyables[i].cost = D(player.gameProgress.buyables[i].bought);
            if (Decimal.gte(tmp.game.buyables[i].cost, tmp.game.buyableCap)) {
                if (hasKuaStaticUpg('power', 4)) {
                    if (Decimal.gte(player.gameProgress.pr2, 10)) {
                        tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.div(tmp.game.buyableCap).pow(2).mul(tmp.game.buyableCap);
                    } else {
                        tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.sub(tmp.game.buyableCap).pow(2).add(tmp.game.buyableCap);
                    }
                } else {
                    tmp.game.buyables[i].cost = D(Infinity);
                }
            }
            tmp.game.buyables[i].cost = smoothExp(tmp.game.buyables[i].cost, MAIN_BUYABLE_DATA[i].baseCostGrowthData.scale[2], false);
            // scaling changes
            tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.mul(tmp.game.buyables[i].scalingSpeed);
            // end scaling changes
            tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.pow_base(MAIN_BUYABLE_DATA[i].baseCostGrowthData.scale[1]);
            tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.mul(MAIN_BUYABLE_DATA[i].baseCostGrowthData.scale[0]);
            tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.layeradd10(MAIN_BUYABLE_DATA[i].baseCostGrowthData.exp);
            // cost changes
            if (i === 0) {
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.div(tmp.game.buyables[1].eff);
                if (hasKuaStaticUpg('power', 5)) {
                    tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.div(tmp.game.kp.upgEffs[5]);
                }
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.div(tmp.game.pEBuyables[3].eff2);
            }
            if (i === 1 && Decimal.gte(player.gameProgress.staticUpgrades[0].bought, 1)) {
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.mul(tmp.game.staticUpgs[0].eff);
            }
            if (Decimal.gte(player.gameProgress.pr2, 7)) {
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.div(1e6);
            }
            if (i === 3 || i === 4) {
                tmp.game.buyables[i].cost = tmp.game.buyables[i].cost.div(tmp.game.ks.dynEffs[4]);
            }
            // end cost changes
            tmp.game.buyables[i].canBuy = Decimal.gte(player.gameProgress.points, tmp.game.buyables[i].cost) && (Decimal.lt(player.gameProgress.buyables[i].bought, tmp.game.buyableCap) || hasKuaStaticUpg('power', 4));

            tmp.game.buyables[i].effBase = MAIN_BUYABLE_DATA[i].baseEffectBase.val;
            if (i === 0) {
                if (Decimal.gte(player.gameProgress.pr2, 2)) {
                    tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.add(0.25);
                }
                tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.add(tmp.game.buyables[2].eff);
                if (Decimal.gte(player.gameProgress.staticUpgrades[3].bought, 1)) {
                    tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.add(tmp.game.staticUpgs[3].eff);
                }
            }
            if (i === 1) {
                tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.mul(tmp.game.kp.dynEffs[4]);
                if (hasKuaStaticUpg('power', 1)) {
                    tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.mul(tmp.game.kp.upgEffs[1]);
                }
                if (Decimal.gte(player.gameProgress.staticUpgrades[3].bought, 1)) {
                    tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.add(tmp.game.staticUpgs[3].eff);
                }
                tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.mul(tmp.game.buyables[3].eff);
            }
            if (i === 2) {
                if (Decimal.gte(player.gameProgress.staticUpgrades[4].bought, 1)) {
                    tmp.game.buyables[i].effBase = tmp.game.staticUpgs[4].eff;
                }
                tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.add(tmp.game.kp.dynEffs[2]);
                tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.add(tmp.game.buyables[4].eff);
            }
            if (hasKuaStaticUpg('power', 9)) {
                tmp.game.buyables[i].effBase = tmp.game.buyables[i].effBase.mul(Decimal.div(player.gameProgress.buyables[i].bought, 150).floor().mul(0.25).add(1));
            }

            tmp.game.buyables[i].eff = MAIN_BUYABLE_DATA[i].baseEffectBase.type === 1
                ? tmp.game.buyables[i].effBase.pow(player.gameProgress.buyables[i].bought)
                : tmp.game.buyables[i].effBase.mul(player.gameProgress.buyables[i].bought);
        } else {
            tmp.game.buyables[i].eff = MAIN_BUYABLE_DATA[i].baseEffectBase.type === 1
                ? D(1)
                : D(0);
        }
    }

    tmp.game.pointGen = D(1);
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.buyables[0].eff);
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.prai.eff);
    if (Decimal.gte(player.gameProgress.pr2, 3)) {
        tmp.game.pointGen = tmp.game.pointGen.mul(8);
    }
    if (Decimal.gte(player.gameProgress.pr2, 5)) {
        tmp.game.pointGen = tmp.game.pointGen.mul(5);
    }
    if (Decimal.gte(player.gameProgress.staticUpgrades[1].bought, 1)) {
        tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.staticUpgs[1].eff);
    }
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.pEEffect);
    tmp.game.pointGen = tmp.game.pointGen.mul(PR3_EFFECTS[0](player.gameProgress.pr3));
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.pEBuyables[0].eff2);
    tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.pEBuyables[1].eff2);
    if (!tmp.game.inAnyChallenge) {
        tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.kp.dynEffs[0]);
        tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.kp.dynEffs[6]);
    } else {
        tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.ks.dynEffs[2]);
    }
    if (hasKuaStaticUpg('power', 2)) {
        tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.kp.upgEffs[2]);
    }
    if (hasKuaStaticUpg('power', 12) && tmp.game.inAnyChallenge) {
        tmp.game.pointGen = tmp.game.pointGen.mul(tmp.game.kp.upgEffs[12]);
    }
    if (tmp.game.pointGen.gte(1e100)) {
        tmp.game.pointGen = tmp.game.pointGen.div(1e100).pow(tmp.game.pEBuyables[4].eff2).mul(1e100);
    }
    tmp.game.pointGen = tmp.game.pointGen.pow(tmp.game.pEBuyables[6].eff2);
    tmp.game.pointGen = tmp.game.pointGen.pow(tmp.game.kp.dynEffs[9]);

    player.gameProgress.points = Decimal.max(player.gameProgress.points, 0).add(tmp.game.pointGen.mul(delta));
    player.gameProgress.totalPointsInPRai = Decimal.max(player.gameProgress.totalPointsInPRai, 0).add(tmp.game.pointGen.mul(delta));
    player.gameProgress.totalPointsInCol = Decimal.max(player.gameProgress.totalPointsInCol, 0).add(tmp.game.pointGen.mul(delta));
}

export const updateHTML_Main = () => {
    html['buyables'].classList.toggle("hide", tab.mainTab !== 0);
    if (tab.mainTab === 0) {
        html['buyableCap'].textContent = `${format(tmp.game.buyableCap)}`;
        html['buyableCapAfter'].textContent = hasKuaStaticUpg('power', 4) ? ` before the buyable starts scaling harshly` : ``;
        for (let i = 0; i < MAIN_BUYABLE_DATA.length; i++) {
            html[`buyable${i}`].classList.toggle("hide", !tmp.game.buyables[i].unlocked);
            if (tmp.game.buyables[i].unlocked) {
                html[`buyable${i}Bought`].textContent = `${format(player.gameProgress.buyables[i].bought)}`;
                html[`buyable${i}Cost`].textContent = `${format(tmp.game.buyables[i].cost)}`;
                html[`buyable${i}EffectPer`].textContent = `${MAIN_BUYABLE_DATA[i].desc1}${format(tmp.game.buyables[i].effBase, 3)}${MAIN_BUYABLE_DATA[i].desc2}`;
                html[`buyable${i}TotalEffect`].textContent = `${MAIN_BUYABLE_DATA[i].desc1}${format(tmp.game.buyables[i].eff, 2)}${MAIN_BUYABLE_DATA[i].desc2}`;
                html[`buyable${i}Button`].classList.toggle("cannot", !tmp.game.buyables[i].canBuy);
                html[`buyable${i}Button`].classList.toggle("complete", Decimal.gte(player.gameProgress.buyables[i].bought, tmp.game.buyableCap) && !hasKuaStaticUpg('power', 4));
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
    if (Decimal.gte(player.gameProgress.buyables[id].bought, tmp.game.buyableCap) && !hasKuaStaticUpg('power', 4)) {
        return;
    }
    if (Decimal.lt(player.gameProgress.points, tmp.game.buyables[id].cost)) {
        return;
    }
    player.gameProgress.points = Decimal.sub(player.gameProgress.points, tmp.game.buyables[id].cost);

    player.gameProgress.buyables[id].bought = Decimal.add(player.gameProgress.buyables[id].bought, 1);
    player.gameProgress.buyables[id].autobought = Decimal.add(player.gameProgress.buyables[id].autobought, 1);
    player.gameProgress.buyables[id].boughtInKua = Decimal.max(player.gameProgress.buyables[id].boughtInKua, player.gameProgress.buyables[id].bought);
    updateGame_Main(D(0));
}

export const toggleMainBuyableAutobuyer = (id: number): void => {
    player.gameProgress.buyables[id].auto = !player.gameProgress.buyables[id].auto;
}