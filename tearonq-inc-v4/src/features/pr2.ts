import Decimal from "break_eternity.js";
import { html, tab, toHTMLvar } from "../main";
import { player, tmp } from "../loadSave";
import { D } from "../misc/calc";
import { praiReset, updateGame_PRai } from "./prai";
import { format } from "../misc/format";
import { STATIC_UPGRADES } from "./staticUpgrades";

export const initHTML_PR2 = () => {
    toHTMLvar('pr2Reset');
    toHTMLvar('pr2ResetButton');
    toHTMLvar('pr2Amount');
    toHTMLvar('pr2ReqAmt');
    toHTMLvar('pr2Desc');

    html['pr2ResetButton'].addEventListener('click', () => pr2Reset(false));

    updatePR2_effectList();
}

export const updateGame_PR2 = (delta: Decimal) => {
    player.gameProgress.timeInPR2 = Decimal.max(player.gameProgress.timeInPR2, 0).add(delta);

    if (Decimal.gte(player.gameProgress.pr2, 10)) {
        tmp.game.pr2Req = D(Infinity);
    } else {
        tmp.game.pr2Req = [
            D(3),
            D(25),
            D(750),
            D(1e7),
            D(1e12),
            D(1e17),
            D('e1.29e55')
        ][D(player.gameProgress.pr2).toNumber()]
    }
}

export const updateHTML_PR2 = () => {
    if (tab.mainTab === 0) {
        html['pr2Reset'].classList.toggle("hide", Decimal.lt(player.gameProgress.prai, 1) && Decimal.lt(player.gameProgress.pr2, 1));

        html['pr2ResetButton'].classList.toggle("cannot", !Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
        html['pr2ResetButton'].classList.toggle("can", Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
        html['pr2ResetButton'].classList.toggle("cannotClick", !Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
        html['pr2ResetButton'].classList.toggle("canClick", Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
        html['pr2Amount'].textContent = `${format(player.gameProgress.pr2)}`;
        html['pr2ReqAmt'].textContent = `${format(tmp.game.pr2Req)}`
    }
}

export const pr2Reset = (override: boolean) => {
    if (!override) {
        if (Decimal.lt(player.gameProgress.prai, tmp.game.pr2Req)) {
            return;
        }
        player.gameProgress.pr2 = Decimal.add(player.gameProgress.pr2, 1);
    }

    player.gameProgress.prai = D(0);
    for (let i = 0; i < STATIC_UPGRADES.length; i++) {
        player.gameProgress.staticUpgrades[i].bought = D(0);
    }
    updateGame_PRai(D(0));
    praiReset(true);

    updatePR2_effectList();
}

export const updatePR2_effectList = () => {
    let arr = [
        [D(1), 'Unlock <b>Buyable 2.</b>'],
        [D(2), `Increase Buyable 1\'s effect base by <b>+${format(0.25, 2)}</b>.`],
        [D(3), `Boost point gain by <b>×${format(8)}</b>.`],
        [D(4), `Unlock <b>Static Upgrades</b>.`],
        [D(5), `Unlock 2 more <b>Static Upgrades</b>, and boost point gain by <b>×${format(5)}</b>.`],
        [D(6), `Unlock Kuaraniai, and PRai's effect is squared.`],
    ]

    let txt = ``
    for (let i = 0; i < arr.length; i++) {
        if (Decimal.gte(player.gameProgress.pr2, arr[i][0])) {
            txt += `
                <li>${arr[i][1]} <span style="font-size: 10px">(@${format(arr[i][0])} PR2)</span></li>
            `;
        } else {
            txt += `
                <li style="color: #ff8080">At <b>${format(arr[i][0])}</b> PR2, ${arr[i][1]}</li>
            `;
            break;
        }
    }
    html['pr2Desc'].innerHTML = txt;
}