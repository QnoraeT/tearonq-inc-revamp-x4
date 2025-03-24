import Decimal from "break_eternity.js"
import { player, tmp } from "../loadSave"
import { D } from "../misc/calc"
import { html, tab, toHTMLvar } from "../main"
import { format, formatTime } from "../misc/format"
import { MAIN_UPG_DATA, updateGame_Main } from "./mainBuyables"

export const initHTML_PRai = () => {
    toHTMLvar('praiReset');
    toHTMLvar('praiResetButton');
    toHTMLvar('praiAmount');
    toHTMLvar('praiGain');
    toHTMLvar('praiReq');
    toHTMLvar('praiReqAmt');
    toHTMLvar('praiDesc');
    toHTMLvar('praiAmt2');
    toHTMLvar('praiEffect');
    toHTMLvar('praiBoostEffect');

    html['praiResetButton'].addEventListener('click', () => praiReset(false));
}

export const updateGame_PRai = (delta: Decimal) => {
    player.gameProgress.timeInPRai = Decimal.max(player.gameProgress.timeInPRai, 0).add(delta);

    tmp.game.praiReq = D(1e3);
    tmp.game.praiExp = D(0.5);
    tmp.game.praiGain = Decimal.max(player.gameProgress.totalPointsInPRai, 0).div(tmp.game.praiReq).pow(tmp.game.praiExp).floor();
    if (tmp.game.praiGain.lt(100) || Decimal.lt(player.gameProgress.prai, 100)) {
        tmp.game.praiNext = tmp.game.praiGain.add(1).floor().root(tmp.game.praiExp).mul(tmp.game.praiReq).sub(player.gameProgress.totalPointsInPRai);
    } else {
        tmp.game.praiNext = tmp.game.praiGain.log10().floor().add(1).pow10().root(tmp.game.praiExp).mul(tmp.game.praiReq).sub(player.gameProgress.totalPointsInPRai);
    }

    tmp.game.praiEffect = Decimal.max(player.gameProgress.prai, 0).add(1).log10().add(1).pow(2.633975697259367);
    if (Decimal.gte(player.gameProgress.pr2, 6)) {
        tmp.game.praiEffect = tmp.game.praiEffect.pow(2);
    }

    tmp.game.praiNextEffect = Decimal.add(player.gameProgress.prai, tmp.game.praiGain).max(0).add(1).log10().add(1).pow(2.633975697259367);
    if (Decimal.gte(player.gameProgress.pr2, 6)) {
        tmp.game.praiNextEffect = tmp.game.praiNextEffect.pow(2);
    }
}

export const updateHTML_PRai = () => {
    if (tab.mainTab === 0) {
        html['praiResetButton'].classList.toggle("cannot", !Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.praiReq));
        html['praiResetButton'].classList.toggle("can", Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.praiReq));
        html['praiResetButton'].classList.toggle("cannotClick", !Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.praiReq));
        html['praiResetButton'].classList.toggle("canClick", Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.praiReq));
        html['praiAmount'].textContent = `${format(player.gameProgress.prai)}`;
        html['praiAmt2'].textContent = `${format(player.gameProgress.prai)}`;
        html['praiGain'].textContent = `${format(tmp.game.praiGain)}`;
        html['praiReq'].classList.toggle("hide", tmp.game.praiGain.gte(100));
        if (tmp.game.praiGain.lt(100)) {
            html['praiReqAmt'].textContent = `${format(tmp.game.praiReq)}`;
        }
        if (Decimal.lt(player.gameProgress.totalPointsInPRai, tmp.game.praiReq)) {
            html['praiDesc'].textContent = `You can PRai reset in ${formatTime(tmp.game.praiReq.sub(player.gameProgress.totalPointsInPRai).div(tmp.game.pointGen))}.`;
        } else if (tmp.game.praiGain.lt(100) || Decimal.lt(player.gameProgress.prai, 100)) {
            html['praiDesc'].textContent = `Next in ${format(tmp.game.praiNext)} points. (${format(tmp.game.praiGain.div(player.gameProgress.timeInPRai), 2)}/s)`;
        } else {
            html['praiDesc'].textContent = `Next OoM in ${format(tmp.game.praiNext)} points. (${format(tmp.game.praiGain.add(player.gameProgress.prai).div(player.gameProgress.prai).log10().div(player.gameProgress.timeInPRai), 3)} OoM/s)`;
        }
        html['praiEffect'].textContent = `${format(tmp.game.praiEffect, 2)}`;
        html['praiBoostEffect'].textContent = `${format(tmp.game.praiNextEffect.div(tmp.game.praiEffect), 2)}`;
    }
}

export const praiReset = (override: boolean) => {
    if (!override) {
        if (Decimal.lt(player.gameProgress.totalPointsInPRai, tmp.game.praiReq)) {
            return;
        }
        player.gameProgress.prai = Decimal.add(player.gameProgress.prai, tmp.game.praiGain);
    }

    player.gameProgress.points = D(0);
    player.gameProgress.totalPointsInPRai = D(0);
    player.gameProgress.timeInPRai = D(0);
    for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
        player.gameProgress.buyables[i].accumulated = D(0);
        player.gameProgress.buyables[i].autobought = D(0);
        player.gameProgress.buyables[i].bought = D(0);
    }
    updateGame_Main(D(0));
}