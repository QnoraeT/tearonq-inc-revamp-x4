import Decimal, { DecimalSource } from "break_eternity.js"
import { html, tab, toHTMLvar } from "../main"
import { player, tmp } from "../loadSave"
import { D, smoothExp, smoothPoly } from "../misc/calc"
import { hasKuaStaticUpg } from "./kuaraniai"
import { format, formatPerc } from "../misc/format"

export type PExt_Buyables = Array<{
    id: number
    cost(x: DecimalSource): Decimal
    target: Decimal
    desc: string
    nextDesc: string
    eff1(x: DecimalSource): Decimal
    eff2(x: DecimalSource): Decimal
}>

export const PRESTIGE_EXTRACT_BUYABLES: PExt_Buyables = [
    {
        id: 0,
        cost(x) {
            let cost = D(x);
            cost = smoothPoly(cost, 2, 25, false).pow_base(3).mul(1e7);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(target.div(1e7).max(1).log(3), 2, 25, true);
            return target;
        },
        get desc() {
            return `Boost P.E. gain by ${format(tmp.game.pEBuyables[this.id].eff1)}× and boost points by ${format(tmp.game.pEBuyables[this.id].eff2)}×.`;
        },
        get nextDesc() {
            return `Boost P.E. gain by ${format(tmp.game.pEBuyables[this.id].eff1)}× → ${format(tmp.game.pEBuyables[this.id].nextEff1)}× and boost points by ${format(tmp.game.pEBuyables[this.id].eff2)}× → ${format(tmp.game.pEBuyables[this.id].nextEff2)}×.`;
        },
        eff1(x) {
            let eff = D(2);
            eff = Decimal.pow(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = D(2);
            eff = Decimal.pow(eff, x);
            return eff;
        }
    },
    {
        id: 1,
        cost(x) {
            let cost = D(x);
            cost = smoothPoly(cost, 2.5, 25, false).pow_base(10).mul(1e9);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(target.div(1e9).max(1).log(10), 2.5, 25, true);
            return target;
        },
        get desc() {
            return `Boost P.E.'s gain exponent by +${format(tmp.game.pEBuyables[this.id].eff1, 2)} and P.E. increases point gain by ${format(tmp.game.pEBuyables[this.id].eff2)}×.`;
        },
        get nextDesc() {
            return `Boost P.E.'s gain exponent by +${format(tmp.game.pEBuyables[this.id].eff1, 2)} → +${format(tmp.game.pEBuyables[this.id].nextEff1, 2)} and P.E. increases point gain by ${format(tmp.game.pEBuyables[this.id].eff2)}× → ${format(tmp.game.pEBuyables[this.id].nextEff2)}×.`;
        },
        eff1(x) {
            let eff = D(0.5);
            eff = Decimal.mul(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = Decimal.max(player.gameProgress.prestigeExtract, 1e6).div(1e6).pow(0.25);
            eff = Decimal.pow(eff, x);
            eff = eff.root(eff.add(1).log10().add(1).log10().add(1));
            return eff;
        }
    },
    {
        id: 2,
        cost(x) {
            let cost = D(x);
            cost = smoothPoly(cost, 3, 25, false).pow_base(40).mul(1e10);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(target.div(1e10).max(1).log(40), 3, 25, true);
            return target;
        },
        get desc() {
            return `P.E. Buyable 1's effect base is increased by +${format(tmp.game.pEBuyables[this.id].eff1, 1)} and slow down Buyable 3's cost by ${formatPerc(tmp.game.pEBuyables[this.id].eff2)}.`;
        },
        get nextDesc() {
            return `P.E. Buyable 1's effect base is increased by +${format(tmp.game.pEBuyables[this.id].eff1, 1)} → +${format(tmp.game.pEBuyables[this.id].nextEff1, 1)} and slow down Buyable 3's cost by ${formatPerc(tmp.game.pEBuyables[this.id].eff2)} → ${formatPerc(tmp.game.pEBuyables[this.id].nextEff2)}.`;
        },
        eff1(x) {
            let eff = D(0.2);
            eff = Decimal.mul(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = D(1.1);
            eff = Decimal.pow(eff, Decimal.add(x, 1).ln());
            return eff;
        }
    },
    {
        id: 3,
        cost(x) {
            let cost = D(x);
            cost = smoothPoly(cost, 3.5, 25, false).pow_base(200).mul(1e12);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(target.div(1e12).max(1).log(200), 3.5, 25, true);
            return target;
        },
        get desc() {
            return `P.E. gain is increased by ${format(tmp.game.pEBuyables[this.id].eff1, 2)}× based off points and Buyable 1's cost is decreased by /${format(tmp.game.pEBuyables[this.id].eff2)}.`;
        },
        get nextDesc() {
            return `P.E. gain is increased by ${format(tmp.game.pEBuyables[this.id].eff1, 2)}× → ${format(tmp.game.pEBuyables[this.id].nextEff1, 2)} based off points and Buyable 1's cost is decreased by /${format(tmp.game.pEBuyables[this.id].eff2)} → /${format(tmp.game.pEBuyables[this.id].nextEff2)}.`;
        },
        eff1(x) {
            let eff = D(0.2);
            eff = Decimal.mul(eff, x);
            eff = Decimal.max(player.gameProgress.points, 1).log10().pow(eff);
            return eff;
        },
        eff2(x) {
            let eff = D(100);
            eff = Decimal.pow(eff, x);
            return eff;
        }
    },
    {
        id: 4,
        cost(x) {
            let cost = D(x);
            cost = smoothPoly(cost, 4, 25, false).pow_base(500).mul(1e15);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(target.div(1e15).max(1).log(500), 4, 25, true);
            return target;
        },
        get desc() {
            return `PR3 boosts P.E. gain by ${format(tmp.game.pEBuyables[this.id].eff1, 2)}× and point gain past ${format(1e100)} is raised to the ^${format(tmp.game.pEBuyables[this.id].eff2, 3)}.`;
        },
        get nextDesc() {
            return `PR3 boosts P.E. gain by ${format(tmp.game.pEBuyables[this.id].eff1, 2)}× → ${format(tmp.game.pEBuyables[this.id].nextEff1, 2)} and point gain past ${format(1e100)} is raised to the ^${format(tmp.game.pEBuyables[this.id].eff2, 3)} → ^${format(tmp.game.pEBuyables[this.id].nextEff2, 3)}.`;
        },
        eff1(x) {
            let eff = Decimal.max(player.gameProgress.pr3, 0).add(1).pow_base(2);
            eff = Decimal.mul(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = Decimal.add(x, 1).log2().div(100);
            eff = eff.add(1);
            return eff;
        }
    },
    {
        id: 5,
        cost(x) {
            let cost = D(x);
            cost = smoothPoly(cost, 5, 20, false).pow_base(1e4).mul(1e18);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(target.div(1e18).max(1).log(1e4), 5, 20, true);
            return target;
        },
        get desc() {
            return `Buyable 1 increases P.E. by ${format(tmp.game.pEBuyables[this.id].eff1, 2)}× and P.E. slows down Buyable 4 and 5's costs by ${formatPerc(tmp.game.pEBuyables[this.id].eff2, 3)}.`;
        },
        get nextDesc() {
            return `Buyable 1 increases P.E. by ${format(tmp.game.pEBuyables[this.id].eff1, 2)}× → ${format(tmp.game.pEBuyables[this.id].nextEff1, 2)} and P.E. slows down Buyable 4 and 5's costs by ${formatPerc(tmp.game.pEBuyables[this.id].eff2, 3)} → ${formatPerc(tmp.game.pEBuyables[this.id].nextEff2, 3)}.`;
        },
        eff1(x) {
            let eff = tmp.game.buyables[0].eff.pow(0.003);
            eff = Decimal.pow(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = Decimal.max(player.gameProgress.prestigeExtract, 1e18).log(1e18).ln().add(1);
            eff = Decimal.pow(eff, x);
            return eff;
        }
    },
    {
        id: 6,
        cost(x) {
            let cost = D(x);
            cost = smoothExp(smoothPoly(cost, 2, 40, false), 1.02, false).pow_base(1e5).mul(1e25);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(smoothExp(target.div(1e25).max(1).log(1e5), 1.02, true), 2, 40, true);
            return target;
        },
        get desc() {
            return `P.E. is raised to the ^${format(tmp.game.pEBuyables[this.id].eff1, 2)} and Point gain is raised ^${format(tmp.game.pEBuyables[this.id].eff2, 2)}.`;
        },
        get nextDesc() {
            return `P.E. is raised to the ^${format(tmp.game.pEBuyables[this.id].eff1, 2)} → ^${format(tmp.game.pEBuyables[this.id].nextEff1, 2)} and Point gain is raised ^${format(tmp.game.pEBuyables[this.id].eff2, 2)} → ${format(tmp.game.pEBuyables[this.id].nextEff2, 2)}.`;
        },
        eff1(x) {
            let eff = D(1.01);
            eff = Decimal.pow(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = D(1.01);
            eff = Decimal.pow(eff, x);
            return eff;
        }
    },
    {
        id: 7,
        cost(x) {
            let cost = D(x);
            cost = smoothExp(smoothPoly(cost, 2, 25, false), 1.03, false).pow_base(1e8).mul(1e40);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(smoothExp(target.div(1e40).max(1).log(1e8), 1.03, true), 2, 25, true);
            return target;
        },
        get desc() {
            return `P.E.'s gain exponent is multiplied by ×${format(tmp.game.pEBuyables[this.id].eff1, 2)} and PRai gain is raised ^${format(tmp.game.pEBuyables[this.id].eff2, 2)}.`;
        },
        get nextDesc() {
            return `P.E.'s gain exponent is multiplied by ×${format(tmp.game.pEBuyables[this.id].eff1, 2)} → ×${format(tmp.game.pEBuyables[this.id].nextEff1, 2)} and PRai gain is raised ^${format(tmp.game.pEBuyables[this.id].eff2, 2)} → ^${format(tmp.game.pEBuyables[this.id].nextEff2, 2)}.`;
        },
        eff1(x) {
            let eff = D(1.03);
            eff = Decimal.pow(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = D(1.01);
            eff = Decimal.pow(eff, x);
            return eff;
        }
    },
    {
        id: 8,
        cost(x) {
            let cost = D(x);
            cost = smoothExp(smoothPoly(cost, 2, 20, false), 1.05, false).pow_base(1e20).mul(1e70);
            return cost;
        },
        get target() {
            let target = D(player.gameProgress.prestigeExtract);
            target = smoothPoly(smoothExp(target.div(1e70).max(1).log(1e20), 1.05, true), 2, 20, true);
            return target;
        },
        get desc() {
            return `P.E.'s gain exponent is multiplied by ×${format(tmp.game.pEBuyables[this.id].eff1, 2)} and PRai's gain exponent is multiplied by ×${format(tmp.game.pEBuyables[this.id].eff2, 2)}.`;
        },
        get nextDesc() {
            return `P.E.'s gain exponent is multiplied by ×${format(tmp.game.pEBuyables[this.id].eff1, 2)} → ×${format(tmp.game.pEBuyables[this.id].nextEff1, 2)} and PRai's gain exponent is multiplied by ×${format(tmp.game.pEBuyables[this.id].eff2, 2)} → ×${format(tmp.game.pEBuyables[this.id].nextEff2, 2)}.`;
        },
        eff1(x) {
            let eff = D(1.03);
            eff = Decimal.pow(eff, x);
            return eff;
        },
        eff2(x) {
            let eff = D(1.02);
            eff = Decimal.pow(eff, x);
            return eff;
        }
    },
]

export const initHTML_Extract = () => {
    toHTMLvar('extractTabButton')
    toHTMLvar('extract')
    toHTMLvar('pextractAmt')
    toHTMLvar('pextractAmtGain')
    toHTMLvar('pextractAmtGenPRai')
    toHTMLvar('pextractAmtGenPRaiGain')
    toHTMLvar('pextractEff')


    // <span class="whiteText fontTrebuchetMS" style="margin-bottom: 4px;">You have <b><span id="pextractAmt"></span></b> Prestige Extract. (<b><span id="pextractAmtGain"></span></b>/s)</span>
    // <span class="whiteText fontTrebuchetMS" style="margin-bottom: 4px;">Your Prestige Extract is boosting your points by <b><span id="pextractEff"></span></b>&times;!</span>
    // <span class="whiteText fontTrebuchetMS" style="margin-bottom: 4px;">PRai is generating <b><span id="pextractAmtGenPRai"></span></b> Prestige Extract per second. (+<b><span id="pextractAmtGenPRaiGain"></span></b>)</span>
}

export const updateGame_Extract = (delta: Decimal) => {
    if (hasKuaStaticUpg('shard', 0)) {
        tmp.game.pEEffect = D(2); // gain exp
        tmp.game.pEEffect = tmp.game.pEEffect.add(tmp.game.ks.dynEffs[1]);
        tmp.game.pEGP = Decimal.max(player.gameProgress.prai, 0).div(1e33).add(1).log10().pow(tmp.game.pEEffect); // prai only

        tmp.game.pEG = D(1);
        tmp.game.pEG = tmp.game.pEG.mul(tmp.game.pEGP);
        if (hasKuaStaticUpg('power', 10)) {
            tmp.game.pEG = tmp.game.pEG.mul(tmp.game.kp.upgEffs[10]);
        }

        tmp.game.pEGPR = Decimal.add(player.gameProgress.prai, tmp.game.prai.gain).div(1e33).add(1).log10().pow(tmp.game.pEEffect); // prai only after prai reset

        tmp.game.pEGR = D(1); // after prai reset
        tmp.game.pEGR = tmp.game.pEGR.mul(tmp.game.pEGPR);
        if (hasKuaStaticUpg('power', 10)) {
            tmp.game.pEGR = tmp.game.pEGR.mul(tmp.game.kp.upgEffs[10]);
        }

        player.gameProgress.prestigeExtract = Decimal.add(player.gameProgress.prestigeExtract, tmp.game.pEG.mul(delta));

        tmp.game.pEEffect = Decimal.add(player.gameProgress.prestigeExtract, 1); // real eff
    } else {
        tmp.game.pEG = D(0);
        tmp.game.pEGP = D(0); // prai only
        tmp.game.pEGR = D(0); // after prai reset
        tmp.game.pEGPR = D(0); // prai only after prai reset
        tmp.game.pEEffect = D(1);
    }
}

export const updateHTML_Extract = () => {
    html['extractTabButton'].classList.toggle("hide", !hasKuaStaticUpg('shard', 0));
    html['extract'].classList.toggle("hide", tab.mainTab !== 6);
    if (tab.mainTab === 6) {
        html['pextractAmt'].textContent = `${format(player.gameProgress.prestigeExtract, 2)}`;
        html['pextractAmtGain'].textContent = `${format(tmp.game.pEG, 2)}`;
        html['pextractEff'].textContent = `${format(tmp.game.pEEffect)}`;
        html['pextractAmtGenPRai'].textContent = `${format(tmp.game.pEGP)}`;
        html['pextractAmtGenPRaiGain'].textContent = `${format(tmp.game.pEGPR)}`;
        
    }
}