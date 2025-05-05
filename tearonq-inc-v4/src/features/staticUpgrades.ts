import Decimal from "break_eternity.js";
import { D } from "../misc/calc";
import { player, tmp } from "../loadSave";
import { format } from "../misc/format";
import { html, tab, toHTMLvar } from "../main";

export const STATIC_UPGRADES = [
    {
        id: 0,
        get desc() {
            return `Every OoM of PRai decreases Buyable 2's cost by -${format(10)}%. Currently: /${format(tmp.game.staticUpgs[this.id].eff.recip(), 2)}.`;
        },
        cost: D(1e6),
        get eff() {
            return Decimal.max(player.gameProgress.prai, 1).log10().floor().pow_base(0.9);
        },
        egt: "pow"
    },
    {
        id: 1,
        get desc() {
            return `PRai gives another, scarcer, but stronger boost to points. Currently: ×${format(tmp.game.staticUpgs[this.id].eff)}, Next at ${format(Decimal.max(player.gameProgress.prai, 10).log10().add(1).sqrt().add(1).floor().pow(2).sub(1).pow10())} PRai.`;
        },
        cost: D(2.5e8),
        get eff() {
            return Decimal.max(player.gameProgress.prai, 1e7).log10().add(1).sqrt().sub(2).floor().pow10();
        },
        egt: "pow"
    },
    {
        id: 2,
        get desc() {
            return `Buyable 1 scales ${format(Decimal.sub(1, tmp.game.staticUpgs[this.id].eff).mul(100))}% slower.`;
        },
        cost: D(5e9),
        eff: D(0.9),
        egt: "pow"
    },
    {
        id: 3,
        get desc() {
            return `Increase Buyable 1 and 2's effect bases by +${format(tmp.game.staticUpgs[this.id].eff, 2)}.`;
        },
        cost: D(1e11),
        eff: D(0.15),
        egt: "mul"
    },
    {
        id: 4,
        get desc() {
            return `Unlock Buyable 3 and their effect base is +${format(tmp.game.staticUpgs[this.id].eff, 2)}.`;
        },
        cost: D(1e15),
        eff: D(0.01),
        egt: "mul"
    },
]

export const initHTML_StaticUpgrades = () => {
    toHTMLvar('praiAmt3');
    toHTMLvar('praiAmtGain3');
    toHTMLvar('upgradeList');

    let txt = ``;
    for (let i = 0; i < STATIC_UPGRADES.length; i++) {
        txt += `
            <div id="upgrade${i}" class="flex-vertical" style="margin: 4px;">
                <button id="upgrade${i}Button" class="whiteText fontTrebuchetMS buyableButton alignCenter" style="width: 220px; height: 150px; font-size: 12px">
                    <h3>Upgrade ${i + 1}<span id="upgrade${i}Bought"></span></h3><br>
                    <span id="upgrade${i}Effect"></span><br><br>
                    Cost: <span id="upgrade${i}Cost"></span> PRai
                </button>
            </div>
        `;
    }
    html['upgradeList'].innerHTML = txt;

    for (let i = 0; i < STATIC_UPGRADES.length; i++) {
        toHTMLvar(`upgrade${i}`);
        toHTMLvar(`upgrade${i}Button`);
        toHTMLvar(`upgrade${i}Bought`);
        toHTMLvar(`upgrade${i}Effect`);
        toHTMLvar(`upgrade${i}Cost`);

        // see updateSaveFileListHTML for why i don't check here -- tl;dr these are children of upgradeList and their event listeners get cleared if i set innerhtml
        html[`upgrade${i}Button`].addEventListener('click', () => buyStaticUpgrade(i));
    }
}

export const updateGame_StaticUpgrades = (delta: Decimal) => {
    delta // delta isn't used but the compiler annoys me
    tmp.game.staticUpgCap = D(1);

    for (let i = 0; i < STATIC_UPGRADES.length; i++) {
        if (i >= 0 && i <= 2 && Decimal.gte(player.gameProgress.pr2, 4)) {
            tmp.game.staticUpgs[i].unlocked = true;
        }
        if (i >= 3 && i <= 4 && Decimal.gte(player.gameProgress.pr2, 5)) {
            tmp.game.staticUpgs[i].unlocked = true;
        }

        if (tmp.game.staticUpgs[i].unlocked) {
            if (Decimal.gte(player.gameProgress.staticUpgrades[i].bought, tmp.game.staticUpgCap)) {
                tmp.game.staticUpgs[i].cost = D(Infinity);
                tmp.game.staticUpgs[i].target = tmp.game.staticUpgCap;
            } else {
                tmp.game.staticUpgs[i].cost = D(player.gameProgress.staticUpgrades[i].bought);
                tmp.game.staticUpgs[i].cost = tmp.game.staticUpgs[i].cost.pow_base(2);
                tmp.game.staticUpgs[i].cost = STATIC_UPGRADES[i].cost.pow(tmp.game.staticUpgs[i].cost);

                tmp.game.staticUpgs[i].target = D(0);
                if (Decimal.gte(player.gameProgress.prai, STATIC_UPGRADES[i].cost)) {
                    tmp.game.staticUpgs[i].target = D(player.gameProgress.prai);
                    tmp.game.staticUpgs[i].target = tmp.game.staticUpgs[i].target.log(STATIC_UPGRADES[i].cost);
                    tmp.game.staticUpgs[i].target = tmp.game.staticUpgs[i].target.log2();
                }
            }

            tmp.game.staticUpgs[i].canBuy = Decimal.gte(player.gameProgress.prai, tmp.game.staticUpgs[i].cost);
        }
        tmp.game.staticUpgs[i].eff = STATIC_UPGRADES[i].eff;
        if (STATIC_UPGRADES[i].egt === 'mul') {
            tmp.game.staticUpgs[i].eff = tmp.game.staticUpgs[i].eff.mul(Decimal.max(player.gameProgress.staticUpgrades[i].bought, 1));
        } else if (STATIC_UPGRADES[i].egt === 'pow') {
            tmp.game.staticUpgs[i].eff = tmp.game.staticUpgs[i].eff.pow(Decimal.max(player.gameProgress.staticUpgrades[i].bought, 1));
        }
    }
}

export const updateHTML_StaticUpgrades = () => {
    html['upgradeTabButton'].classList.toggle("hide", Decimal.lt(player.gameProgress.pr2, 4));
    html['upgrades'].classList.toggle("hide", tab.mainTab !== 4);
    if (tab.mainTab === 4) {
        html['praiAmt3'].textContent = `${format(player.gameProgress.prai)}`;
        html['praiAmtGain3'].textContent = `${format(tmp.game.prai.gain)}`;
        for (let i = 0; i < STATIC_UPGRADES.length; i++) {
            html[`upgrade${i}`].classList.toggle("hide", !tmp.game.staticUpgs[i].unlocked);
            if (tmp.game.staticUpgs[i].unlocked) {
                html[`upgrade${i}Bought`].textContent = tmp.game.staticUpgCap.gt(1) ? ` ×${format(player.gameProgress.staticUpgrades[i].bought)}` : '';
                html[`upgrade${i}Effect`].textContent = `${STATIC_UPGRADES[i].desc}`;
                html[`upgrade${i}Cost`].textContent = `${format(tmp.game.staticUpgs[i].cost)}`;
                html[`upgrade${i}Button`].classList.toggle("cannot", !tmp.game.staticUpgs[i].canBuy && Decimal.lt(player.gameProgress.staticUpgrades[i].bought, tmp.game.staticUpgCap));
                html[`upgrade${i}Button`].classList.toggle("can", tmp.game.staticUpgs[i].canBuy);
                html[`upgrade${i}Button`].classList.toggle("complete", Decimal.gte(player.gameProgress.staticUpgrades[i].bought, tmp.game.staticUpgCap));
                html[`upgrade${i}Button`].classList.toggle("cannotClick", !tmp.game.staticUpgs[i].canBuy);
                html[`upgrade${i}Button`].classList.toggle("canClick", tmp.game.staticUpgs[i].canBuy);
            }
        }
    }
}

export const buyStaticUpgrade = (id: number) => {
    if (Decimal.gte(player.gameProgress.staticUpgrades[id].bought, tmp.game.staticUpgCap)) {
        return;
    }
    if (Decimal.gte(player.gameProgress.prai, tmp.game.staticUpgs[id].cost)) {
        player.gameProgress.prai = Decimal.sub(player.gameProgress.prai, tmp.game.staticUpgs[id].cost);
        player.gameProgress.staticUpgrades[id].bought = Decimal.add(player.gameProgress.staticUpgrades[id].bought, 1);
        updateGame_StaticUpgrades(D(0));
    }
}