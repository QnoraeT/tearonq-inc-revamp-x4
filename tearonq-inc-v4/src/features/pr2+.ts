import Decimal, { DecimalSource } from "break_eternity.js";
import { html, tab, toHTMLvar } from "../main";
import { gameVars, player, tmp } from "../loadSave";
import { D, smoothExp } from "../misc/calc";
import { praiReset, updateGame_PRai } from "./prai";
import { format } from "../misc/format";
import { STATIC_UPGRADES } from "./staticUpgrades";
import { hasKuaStaticUpg } from "./kuaraniai";

export const initHTML_PR2 = () => {
    toHTMLvar('pr2Reset');
    toHTMLvar('pr2ResetButton');
    toHTMLvar('pr2Amount');
    toHTMLvar('pr2ReqAmt');
    toHTMLvar('pr2Desc');
    toHTMLvar('pr3Reset');
    toHTMLvar('pr3ResetButton');
    toHTMLvar('pr3Amount');
    toHTMLvar('pr3ReqAmt');
    toHTMLvar('pr3Desc');

    // see loadSave.ts in the initHTML function
    if (!gameVars.gameLoadedFirst) {
        html['pr2ResetButton'].addEventListener('click', () => pr2Reset(false));
        html['pr3ResetButton'].addEventListener('click', () => pr3Reset(false));
    }

    updatePR2_effectList();
    updatePR3_effectList();
}

export const updateGame_PR2 = (delta: Decimal) => {
    player.gameProgress.timeInPR2 = Decimal.max(player.gameProgress.timeInPR2, 0).add(delta);

    tmp.game.pr3.req = smoothExp(Decimal.max(player.gameProgress.pr3, 0), 1.05, false).pow_base(1e20).mul(1e50);
    tmp.game.pr3.req = tmp.game.pr3.req.div(tmp.game.ks.dynEffs[3]);

    tmp.game.pr3.target = D(player.gameProgress.prai);
    tmp.game.pr3.target = tmp.game.pr3.target.mul(tmp.game.ks.dynEffs[3]);
    tmp.game.pr3.target = smoothExp(Decimal.div(tmp.game.pr3.target, 1e50).max(1).log(1e20), 1.05, true);

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
            D(1e63),
            D(1e95),
            D(3.333e133),
            D(1e200),
            smoothExp(D(729), 1.05, false).pow10()
        ][D(player.gameProgress.pr2).toNumber()]
    }
}

export const updateHTML_PR2 = () => {
    if (tab.mainTab === 0) {
        html['pr2Reset'].classList.toggle("hide", Decimal.lt(player.gameProgress.prai, 1) && Decimal.lt(player.gameProgress.pr2, 1));
        if (!(Decimal.lt(player.gameProgress.prai, 1) && Decimal.lt(player.gameProgress.pr2, 1))) {
            html['pr2ResetButton'].classList.toggle("cannot", !Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
            html['pr2ResetButton'].classList.toggle("can", Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
            html['pr2ResetButton'].classList.toggle("cannotClick", !Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
            html['pr2ResetButton'].classList.toggle("canClick", Decimal.gte(player.gameProgress.prai, tmp.game.pr2Req));
            html['pr2Amount'].textContent = `${format(player.gameProgress.pr2)}`;
            html['pr2ReqAmt'].textContent = `${format(tmp.game.pr2Req)}`
        }

        html['pr3Reset'].classList.toggle("hide", !hasKuaStaticUpg('shard', 3) && Decimal.lt(player.gameProgress.pr3, 1));
        if (!(!hasKuaStaticUpg('shard', 3) && Decimal.lt(player.gameProgress.pr3, 1))) {
            html['pr3ResetButton'].classList.toggle("cannot", !Decimal.gte(player.gameProgress.prai, tmp.game.pr3.req));
            html['pr3ResetButton'].classList.toggle("can", Decimal.gte(player.gameProgress.prai, tmp.game.pr3.req));
            html['pr3ResetButton'].classList.toggle("cannotClick", !Decimal.gte(player.gameProgress.prai, tmp.game.pr3.req));
            html['pr3ResetButton'].classList.toggle("canClick", Decimal.gte(player.gameProgress.prai, tmp.game.pr3.req));
            html['pr3Amount'].textContent = `${format(player.gameProgress.pr3)}`;
            html['pr3ReqAmt'].textContent = `${format(tmp.game.pr3.req)}`
        }
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
    player.gameProgress.prestigeExtract = D(0);
    if (Decimal.lt(player.gameProgress.pr3, 4)) {
        for (let i = 0; i < STATIC_UPGRADES.length; i++) {
            player.gameProgress.staticUpgrades[i].bought = D(0);
        }
    }
    updateGame_PRai(D(0));
    praiReset(true);

    updatePR2_effectList();
}

export const pr3Reset = (override: boolean) => {
    if (!override) {
        if (Decimal.lt(player.gameProgress.prai, tmp.game.pr3.req)) {
            return;
        }
        player.gameProgress.pr3 = Decimal.add(player.gameProgress.pr3, 1);
    }

    if (Decimal.gte(player.gameProgress.pr3, 8)) {
        player.gameProgress.pr2 = Decimal.min(player.gameProgress.pr2, 9);
    } else {
        player.gameProgress.pr2 = D(0);
    }
    updateGame_PR2(D(0));
    pr2Reset(true);

    updatePR3_effectList();
}

export const updatePR2_effectList = () => {
    const obj = [
        { req: D(1), eff: `Unlock <b>Buyable 2.</b>` },
        { req: D(2), eff: `Increase Buyable 1\'s effect base by <b>+0.25</b>.` },
        { req: D(3), eff: `Boost point gain by <b>×8</b>.` },
        { req: D(4), eff: `Unlock <b>Static Upgrades</b>.` },
        { req: D(5), eff: `Unlock 2 more <b>Static Upgrades</b>, and boost point gain by <b>×5</b>.` },
        { req: D(6), eff: `Unlock Kuaraniai, and PRai's effect is squared.` },
        { req: D(7), eff: `All buyables are /${format(1e6)} cheaper.` },
        { req: D(8), eff: `PRai's gain exponent is slightly increased from x<sup>0.5</sup> to x<sup>0.525</sup>.` },
        { req: D(9), eff: `Kuaraniai's requirement is decreased from ${format(1e20)} to ${format(1e15)}.` },
        { req: D(10), eff: `Buyables past Buyable Cap scale significantly weaker.` }
    ];

    let final = D(Infinity);
    let txt = ``;
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].req.gt(final)) {
            break;
        }
        if (Decimal.gte(player.gameProgress.pr2, obj[i].req)) {
            txt += `
                <li>${obj[i].eff} <span style="font-size: 10px">(@${format(obj[i].req)} PR2)</span></li>
            `;
        } else {
            final = obj[i].req;
            txt += `
                <li style="color: #ff8080">At <b>${format(obj[i].req)}</b> PR2, ${obj[i].eff}</li>
            `;
        }
    }
    html['pr2Desc'].innerHTML = txt;
}

export const PR3_EFFECTS = [
    (x: DecimalSource) => {
        let eff = Decimal.max(x, 0).pow10();
        if (tmp.game.inAnyChallenge) {
            eff = eff.pow(0.25);
        };
        return eff;
    },
    (x: DecimalSource) => {
        let eff = Decimal.max(x, 0).pow_base(2);
        if (tmp.game.inAnyChallenge) {
            eff = eff.pow(0.25);
        };
        return eff;
    },
    (x: DecimalSource) => {
        let eff = Decimal.lt(x, 1) ? D(0) : Decimal.sub(x, 1).pow_base(2).mul(10);
        return eff;
    },
    (x: DecimalSource) => {
        let eff = Decimal.lt(x, 2) ? D(0) : Decimal.sub(x, 2).pow_base(2).mul(8);
        return eff;
    },
    (x: DecimalSource) => {
        let eff = Decimal.lt(x, 3) ? D(0) : Decimal.sub(x, 3).pow_base(2).mul(6);
        return eff;
    },
    (x: DecimalSource) => {
        let eff = Decimal.lt(x, 5) ? D(0) : Decimal.sub(x, 5).min(15).div(15).pow_base(10000).div(100);
        return eff;
    },
]

export const updatePR3_effectList = () => {
    const next = Decimal.add(player.gameProgress.pr3, 1);
    const eff: Array<Decimal> = [];
    const effNext: Array<Decimal> = [];
    for (let i = 0; i < PR3_EFFECTS.length; i++) {
        eff[i] = PR3_EFFECTS[i](player.gameProgress.pr3);
        effNext[i] = PR3_EFFECTS[i](next);
    }
    const obj = [
        { req: D(1), eff: `Boost point gain by ×${format(eff[0])} → <b>×${format(effNext[0])}</b>.` },
        { req: D(1), eff: `Boost PRai gain by ×${format(eff[1])} → <b>×${format(effNext[1])}</b>.` },
        { req: D(1), eff: `Unlock Buyable 1's automation. Speed: ${format(eff[2])}/s → <b>${format(effNext[2])}/s</b>.` },
        { req: D(2), eff: `Unlock Buyable 2's automation. Speed: ${format(eff[3])}/s → <b>${format(effNext[3])}/s</b>.` },
        { req: D(3), eff: `Unlock Buyable 3's automation. Speed: ${format(eff[4])}/s → <b>${format(effNext[4])}/s</b>.` },
        { req: D(4), eff: `Your upgrades bought is not reset on PR2, PR3, nor Kuaraniai resets.` },
        { req: D(5), eff: `PRai is auto-obtainable. Speed: ${format(eff[5], 2)}%/s → <b>${format(effNext[5], 2)}%/s</b>.` },
        { req: D(8), eff: `Keep your PR2 up to <b>${format(9)}</b> times.` },
    ];

    let txt = ``;
    let final = D(Infinity);
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].req.gt(final)) {
            break;
        }
        if (Decimal.gte(player.gameProgress.pr3, obj[i].req)) {
            txt += `
                <li>${obj[i].eff} <span style="font-size: 10px">(@${format(obj[i].req)} PR3)</span></li>
            `;
        } else {
            final = obj[i].req;
            txt += `
                <li style="color: #ff8080">At <b>${format(obj[i].req)}</b> PR3, ${obj[i].eff}</li>
            `;
        }
    }
    html['pr3Desc'].innerHTML = txt;
}