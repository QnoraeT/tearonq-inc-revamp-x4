import Decimal, { DecimalSource } from "break_eternity.js"
import { gameVars, player, tmp } from "../loadSave"
import { D } from "../misc/calc"
import { html, tab, toHTMLvar } from "../main"
import { format, formatTime } from "../misc/format"
import { MAIN_BUYABLE_DATA, updateGame_Main } from "./mainBuyables"
import { hasKuaStaticUpg } from "./kuaraniai"
import { PR3_EFFECTS } from "./pr2+"

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
    toHTMLvar('praiAutobuyerToggle');
    toHTMLvar('praiAutobuyer');

    // see loadSave.ts in the initHTML function
    if (!gameVars.gameLoadedFirst) {
        html['praiResetButton'].addEventListener('click', () => praiReset(false));
        html['praiAutobuyerToggle'].addEventListener('click', () => togglePRaiAutobuyer());
    }
}

export const updateGame_PRai = (delta: Decimal) => {
    player.gameProgress.timeInPRai = Decimal.max(player.gameProgress.timeInPRai, 0).add(delta);

    tmp.game.prai.req = D(1e3);
    tmp.game.prai.exp = D(0.5);
    if (Decimal.gte(player.gameProgress.pr2, 8)) {
        tmp.game.prai.exp = D(0.525);
    }

    tmp.game.prai.gain = Decimal.max(player.gameProgress.totalPointsInPRai, 0).div(tmp.game.prai.req).pow(tmp.game.prai.exp).floor();
    tmp.game.prai.gain = tmp.game.prai.gain.mul(tmp.game.ks.dynEffs[0]);
    if (hasKuaStaticUpg('power', 6)) {
        tmp.game.prai.gain = tmp.game.prai.gain.mul(tmp.game.kp.upgEffs[6]);
    }
    tmp.game.prai.gain = tmp.game.prai.gain.mul(PR3_EFFECTS[1](player.gameProgress.pr3));
    if (hasKuaStaticUpg('power', 3)) {
        tmp.game.prai.gain = tmp.game.prai.gain.pow(tmp.game.kp.upgEffs[3]);
    }

    tmp.game.prai.next = tmp.game.prai.gain;
    if (hasKuaStaticUpg('power', 3)) {
        tmp.game.prai.next = tmp.game.prai.next.root(tmp.game.kp.upgEffs[3]);
    }
    tmp.game.prai.next = tmp.game.prai.next.div(PR3_EFFECTS[1](player.gameProgress.pr3));
    if (hasKuaStaticUpg('power', 6)) {
        tmp.game.prai.next = tmp.game.prai.next.div(tmp.game.kp.upgEffs[6]);
    }
    tmp.game.prai.next = tmp.game.prai.next.div(tmp.game.ks.dynEffs[0]);
    if (tmp.game.prai.gain.lt(100) || Decimal.lt(player.gameProgress.prai, 100)) {
        tmp.game.prai.next = tmp.game.prai.next.add(1).floor().root(tmp.game.prai.exp).mul(tmp.game.prai.req);
    } else {
        tmp.game.prai.next = tmp.game.prai.next.log10().floor().add(1).pow10().root(tmp.game.prai.exp).mul(tmp.game.prai.req);
    }
    tmp.game.prai.next = tmp.game.prai.next.sub(player.gameProgress.totalPointsInPRai);

    if (player.gameProgress.praiAuto) {
        player.gameProgress.prai = Decimal.max(player.gameProgress.prai, 0).add(tmp.game.prai.gain.mul(delta).mul(PR3_EFFECTS[5](player.gameProgress.pr3).div(100)));
    }

    tmp.game.prai.eff = getPRaiEff(player.gameProgress.prai);
    tmp.game.prai.nextEff = getPRaiEff(Decimal.add(player.gameProgress.prai, tmp.game.prai.gain));
}

export const updateHTML_PRai = () => {
    if (tab.mainTab === 0) {
        html['praiResetButton'].classList.toggle("cannot", !Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.prai.req));
        html['praiResetButton'].classList.toggle("can", Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.prai.req));
        html['praiResetButton'].classList.toggle("cannotClick", !Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.prai.req));
        html['praiResetButton'].classList.toggle("canClick", Decimal.gte(player.gameProgress.totalPointsInPRai, tmp.game.prai.req));
        html['praiAmount'].textContent = `${format(player.gameProgress.prai)}`;
        html['praiAmt2'].textContent = `${format(player.gameProgress.prai)}`;
        html['praiGain'].textContent = `${format(tmp.game.prai.gain)}`;
        html['praiReq'].classList.toggle("hide", tmp.game.prai.gain.gte(100));
        if (tmp.game.prai.gain.lt(100)) {
            html['praiReqAmt'].textContent = `${format(tmp.game.prai.req)}`;
        }
        if (Decimal.lt(player.gameProgress.totalPointsInPRai, tmp.game.prai.req)) {
            html['praiDesc'].textContent = `You can PRai reset in ${formatTime(tmp.game.prai.req.sub(player.gameProgress.totalPointsInPRai).div(tmp.game.pointGen))}.`;
        } else {
            if (tmp.game.prai.gain.lt(100) || Decimal.lt(player.gameProgress.prai, 100)) {
                html['praiDesc'].textContent = `Next in ${format(tmp.game.prai.next)} points. `;
            } else {
                html['praiDesc'].textContent = `Next OoM in ${format(tmp.game.prai.next)} points. `;
            }
            if (Decimal.gt(player.gameProgress.prai, tmp.game.prai.gain) || Decimal.lt(player.gameProgress.prai, 100)) {
                html['praiDesc'].textContent += `(${format(tmp.game.prai.gain.div(player.gameProgress.timeInPRai), 2)}/s)`;
            } else {
                html['praiDesc'].textContent += `(${format(tmp.game.prai.gain.add(player.gameProgress.prai).div(player.gameProgress.prai).log10().div(player.gameProgress.timeInPRai), 3)} OoM/s)`;
            }
        }
        html['praiEffect'].textContent = `${format(tmp.game.prai.eff, 2)}`;
        html['praiBoostEffect'].textContent = `${format(tmp.game.prai.nextEff.div(tmp.game.prai.eff), 2)}`;

        html['praiAutobuyerToggle'].classList.toggle("hide", Decimal.lt(player.gameProgress.pr3, 5));
        if (Decimal.gte(player.gameProgress.pr3, 5)) {
            html[`praiAutobuyerToggle`].classList.toggle("cannot", !player.gameProgress.praiAuto);
            html[`praiAutobuyerToggle`].classList.toggle("can", player.gameProgress.praiAuto);
            html['praiAutobuyer'].textContent = player.gameProgress.praiAuto ? 'On' : 'Off';
        }
    }
}

export const getPRaiEff = (prai: DecimalSource) => {
    let eff = Decimal.max(prai, 0).add(1).log10().add(1).pow(2.633975697259367);
    if (hasKuaStaticUpg('power', 13)) {
        eff = Decimal.max(player.gameProgress.prai, 0).add(1).log10().add(1).root(5).sub(1).mul(5).pow10();
    }
    if (Decimal.gte(player.gameProgress.pr2, 6)) {
        eff = eff.pow(2);
    }
    eff = eff.pow(tmp.game.kp.dynEffs[5]);
    eff = eff.pow(tmp.game.pEBuyables[7].eff2);
    return eff;
}

export const praiReset = (override: boolean) => {
    if (!override) {
        if (Decimal.lt(player.gameProgress.totalPointsInPRai, tmp.game.prai.req)) {
            return;
        }
        player.gameProgress.prai = Decimal.add(player.gameProgress.prai, tmp.game.prai.gain);
    }

    player.gameProgress.points = D(0);
    player.gameProgress.totalPointsInPRai = D(0);
    player.gameProgress.timeInPRai = D(0);
    for (let i = 0; i < MAIN_BUYABLE_DATA.length; i++) {
        player.gameProgress.buyables[i].accumulated = D(0);
        player.gameProgress.buyables[i].autobought = D(0);
        player.gameProgress.buyables[i].bought = D(0);
    }
    updateGame_Main(D(0));
}

export const togglePRaiAutobuyer = (): void => {
    player.gameProgress.praiAuto = !player.gameProgress.praiAuto;
}