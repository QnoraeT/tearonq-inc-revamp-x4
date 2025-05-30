import Decimal, { DecimalSource } from "break_eternity.js";
import { html, shiftDown, tab, toHTMLvar } from "../main";
import { gameVars, player, tmp } from "../loadSave";
import { format, formatTime } from "../misc/format";
import { D, inverseFact } from "../misc/calc";
import { pr2Reset, updateGame_PR2 } from "./pr2+";

export type KuaUpgradeAllTypes = 0 | 1 | 2;
export type KuaUpgradeAllNames = 'shard' | 'power' | 'kua';
export const KUA_UPGRADE_NAMES: Array<KuaUpgradeAllNames> = ['shard', 'power', 'kua'];

export const KUA_UPGRADES = {
    shard: [
        {
            cost: D(0.1),
            desc: `PRai produces Prestige Extract, which boosts points.`,
        },
        {
            cost: D(100),
            desc: `Unlock Colosseum.`,
        },
        {
            cost: D(1000),
            desc: `Unlock the second Colosseum Challenge.`,
        },
        {
            cost: D(1e4),
            desc: `Unlock PR3, which resets PR2 in exchange for a boost to Points and PRai and gives QoL. This effect weakens by -75% in challenges.`,
        },
        {
            cost: D(2.5e4),
            desc: `Unlock the third Colosseum Challenge.`,
        },
        {
            cost: D(1e5),
            desc: `Unlock Buyable 4, which increases Buyable 2's effect.`,
        },
        {
            cost: D(1e6),
            desc: `Unlock Buyable 5, which increases Buyable 3's effect.`,
        },
        {
            cost: D(1e7),
            desc: `Unlock prestige extract Buyables, which primarily buff prestige extract while also having a secondary effect.`,
        },
        {
            cost: D(1e8),
            desc: `Unlock prestige extract Upgrades, which are one-time special boosts that synergise prestige extract with other resources.`
        },
        {
            cost: D(1e10),
            desc: `Unlock the fourth Colosseum Challenge.`
        }
    ],
    power: [
        {
            cost: D(1),
            desc: `Buyable 1 scales -10% slower.`,
            eff: D(0.9)
        },
        {
            cost: D(10),
            get desc() {
                return `Buyable 2's effect base is multiplied by ${format(tmp.game.kp.upgEffs[1], 2)}×, based off points up to 2×.`;
            },
            get eff() {
                return Decimal.max(player.gameProgress.points, 10).log10().sub(1).div(250).add(1).min(2);
            }
        },
        {
            cost: D(100),
            get desc() {
                return `Point gain is increased by ${format(tmp.game.kp.upgEffs[2], 2)}×, based off Kua. P. Outside of the main game, this effect is drastically reduced.`;
            },
            get eff() {
                return Decimal.max(player.gameProgress.kpower, 100).div(100).root(tmp.game.inAnyChallenge ? 5 : 2);
            }
        },
        {
            cost: D(1000),
            desc: `PRai gain is raised to the power of ^1.1.`,
            eff: D(1.1)
        },
        {
            cost: D(5000),
            desc: `Buyable purchase cap is increased by +10, but costs scale much faster above the cap.`,
            eff: D(10)
        },
        {
            cost: D(1e5),
            get desc() {
                return `Buyable 1's cost decreases by /${format(tmp.game.kp.upgEffs[5], 2)}, over time in a Kua. reset.`;
            },
            get eff() {
                return Decimal.max(player.gameProgress.timeInKua, 0).div(10).add(1).ln().mul(10).pow_base(2);
            }
        },
        {
            cost: D(1e6),
            get desc() {
                return `PRai gain is multiplied by ${format(tmp.game.kp.upgEffs[6], 2)}×, based off the product of Kua., Kua. S., and Kua. P.`;
            },
            get eff() {
                return Decimal.max(player.gameProgress.kua, 0).mul(Decimal.max(player.gameProgress.kshard, 0)).mul(Decimal.max(player.gameProgress.kpower, 0)).root(18).max(1);
            }
        },
        {
            cost: D(1e8),
            desc: `PR3's effect boost is increased and extends to PE.`,
            eff: D(1)
        },
        {
            cost: D(1e10),
            get desc() {
                return `Buyable purchase cap is increased by +5, and another +1 every power of two seconds spent in a Kua. reset. Currently: +${format(tmp.game.kp.upgEffs[8])}, next at ${formatTime(Decimal.log2(player.gameProgress.timeInKua).add(2).floor().sub(1).pow_base(2).sub(player.gameProgress.timeInKua))}.`;
            },
            get eff() {
                return Decimal.lt(player.gameProgress.timeInKua, 1)
                    ? D(0)
                    : Decimal.log2(player.gameProgress.timeInKua).add(1).floor()
            }
        },
        {
            cost: D(1e12),
            desc: `Every 150 purchases of a buyable, that buyable's effect base is increased by +0.25×.`,
            eff: D(1)
        },
        {
            cost: D(1e14),
            get desc() {
                return `Prestige Extract boosts its own generation. Currently: ${format(tmp.game.kp.upgEffs[10], 2)}×.`;
            },
            get eff() {
                return Decimal.max(player.gameProgress.prestigeExtract, 0).div(100).add(1).pow(0.2).root(Decimal.max(player.gameProgress.prestigeExtract, 10).log10().log10().pow(2).div(10).add(1));
            }
        },
        {
            cost: D(1e16),
            get desc() {
                return `Prestige Extract past ${format(1e10)} slows down Buyable 1-3's costs up to -50%. Currently: -${format(tmp.game.kp.upgEffs[11].mul(100), 2)}%.`;
            },
            get eff() {
                return Decimal.gte(player.gameProgress.prestigeExtract, 1e10)
                    ? Decimal.sub(0.5, Decimal.log(player.gameProgress.prestigeExtract, 1e10).pow(2).recip().mul(0.4))
                    : D(0)
            }
        },
        {
            cost: D(1e18),
            get desc() {
                return `Point gain in challenges are increased based on how long you've been in a Colosseum reset. Capped at ${format(1000)}× Currently: ${format(tmp.game.kp.upgEffs[11].mul(100), 2)}×.`;
            },
            get eff() {
                return tmp.game.inAnyChallenge
                    ? Decimal.max(player.gameProgress.timeInCol, 0).add(1).pow(0.2165).sub(1).min(3).pow10()
                    : D(1)
            }
        },
        {
            cost: D(1e21),
            desc: `PRai's effect is improved and scales better.`,
            eff: D(1)
        },
    ],
    kua: [
        {
            cost: D('10^^1.797e308'),
            desc: `Lorem ipsum`,
            eff: D(1)
        }
    ]
}

export type KuaDynamicBase = {
    level(x?: DecimalSource): Decimal
    cap: Decimal
    effPer: Decimal
    eff: Decimal
    descPer: string
    descTotal: string
}

export type KuaDynamic = {
    shard: Array<KuaDynamicBase>
    power: Array<KuaDynamicBase>
    kua: Array<KuaDynamicBase>
}
export const KUA_DYNAMICS: KuaDynamic = {
    shard: [
        {
            level(x = player.gameProgress.kuaDynamicUpgs[0]) {
                return D(x)
            },
            cap: D(Infinity),
            effPer: D(2),
            get eff() {
                return KUA_DYNAMICS.shard[0].level().pow_base(2)
            },
            get descPer() {
                return `PRai gain outside of any challenge is increased by ${format(this.effPer)}×.`
            },
            get descTotal() {
                return `PRai gain outside of any challenge is increased by ${format(tmp.game.ks.dynEffs[0])}×.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[0]) {
                return D(x).min(this.cap).sub(3).div(3).add(1).floor().max(0)
            },
            cap: D(30),
            effPer: D(0.8),
            get eff() {
                return KUA_DYNAMICS.shard[1].level().mul(0.8)
            },
            get descPer() {
                return `PE gain exponent is increased by +${format(0.8, 2)}.`
            },
            get descTotal() {
                return `PE gain exponent is increased by +${format(tmp.game.ks.dynEffs[1], 2)}.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[0]) {
                return D(x).min(this.cap).sub(5).div(2).add(1).floor().max(0)
            },
            cap: D(99),
            effPer: Decimal.root(1e6, 48),
            get eff() {
                return KUA_DYNAMICS.shard[2].level().div(48).pow_base(1e6)
            },
            get descPer() {
                return `Point gain in colosseum challenges are increased by ~${format(Decimal.root(1e6, 48), 2)}×.`
            },
            get descTotal() {
                return `Point gain in colosseum challenges are increased by ${format(tmp.game.ks.dynEffs[2], 2)}×.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[0]) {
                return D(x).min(this.cap).sub(10).div(2).add(1).floor().max(0)
            },
            cap: D(68),
            effPer: D(1e10),
            get eff() {
                return KUA_DYNAMICS.shard[3].level().pow_base(1e10)
            },
            get descPer() {
                return `PR3's requirement is decreased by ${format(this.effPer)}×.`
            },
            get descTotal() {
                return `PR3's requirement is decreased by ${format(tmp.game.ks.dynEffs[3])}×.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[0]) {
                return D(x).min(this.cap).sub(12).div(6).add(1).floor().max(0)
            },
            cap: D(60),
            get effPer() {
                return KUA_DYNAMICS.shard[4].level().add(6).pow10()
            },
            get eff() {
                return KUA_DYNAMICS.shard[4].level().mul(KUA_DYNAMICS.shard[4].level().add(11)).div(2).pow10()
            },
            get descPer() {
                return `Buyable 4-5's costs are decreased by /${format(this.effPer)}.`
            },
            get descTotal() {
                return `Buyable 4-5's costs are decreased by /${format(tmp.game.ks.dynEffs[4])}.`
            }
        },
    ],
    power: [
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x)
            },
            cap: D(Infinity),
            effPer: D(2),
            get eff() {
                return KUA_DYNAMICS.power[0].level().pow_base(2)
            },
            get descPer() {
                return `Point gain outside of any challenge is increased by ${format(this.effPer)}×.`
            },
            get descTotal() {
                return `Point gain outside of any challenge is increased by ${format(tmp.game.kp.dynEffs[0])}×.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sub(2).div(2).add(1).floor().max(0)
            },
            cap: D(10),
            effPer: D(0.1),
            get eff() {
                return KUA_DYNAMICS.power[1].level().mul(0.1)
            },
            get descPer() {
                return `Buyable 1 scales -${format(this.effPer.mul(100))}% slower.`
            },
            get descTotal() {
                return `Buyable 1 scales -${format(tmp.game.kp.dynEffs[1].mul(100))}% slower.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sub(5).div(5).add(1).floor().max(0)
            },
            cap: D(50),
            effPer: D(0.001),
            get eff() {
                return KUA_DYNAMICS.power[2].level().mul(0.001)
            },
            get descPer() {
                return `Buyable 3's effect base is added by +${format(this.effPer, 3)}.`
            },
            get descTotal() {
                return `Buyable 3's effect base is added by +${format(tmp.game.kp.dynEffs[2], 3)}.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).sub(5).max(0)
            },
            cap: D(Infinity),
            effPer: D(1),
            get eff() {
                return KUA_DYNAMICS.power[3].level()
            },
            get descPer() {
                return `Increase the buyable cap by +${format(this.effPer)}.`
            },
            get descTotal() {
                return `Increase the buyable cap by +${format(tmp.game.kp.dynEffs[3])}.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sub(8).div(3).add(1).floor().max(0)
            },
            cap: D(698),
            effPer: Decimal.root(10, 231),
            get eff() {
                return KUA_DYNAMICS.power[4].level().div(231).pow_base(10)
            },
            get descPer() {
                return `Buyable 2's effect base is multiplied by ×${format(this.effPer, 2)}.`
            },
            get descTotal() {
                return `Buyable 2's effect base is multiplied by ×${format(tmp.game.kp.dynEffs[4], 2)}.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sub(9).div(2).add(1).floor().max(0)
            },
            cap: D(57),
            effPer: Decimal.root(1.5, 25),
            get eff() {
                return KUA_DYNAMICS.power[5].level().div(25).pow_base(1.5)
            },
            get descPer() {
                return `PRai effect is raised to the power of ^${format(this.effPer, 3)}.`
            },
            get descTotal() {
                return `PRai effect is raised to the power of ^${format(tmp.game.kp.dynEffs[5], 3)}.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sub(10).div(10).add(1).floor().max(0)
            },
            cap: D(640),
            effPer: D(65536),
            get eff() {
                return KUA_DYNAMICS.power[6].level().pow_base(65536)
            },
            get descPer() {
                return `Point gain outside of any challenge is increased by ${format(this.effPer)}×.`
            },
            get descTotal() {
                return `Point gain outside of any challenge is increased by ${format(tmp.game.kp.dynEffs[6])}×.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sub(12).div(6).add(1).floor().max(0)
            },
            cap: D(66),
            effPer: D(0.05),
            get eff() {
                return KUA_DYNAMICS.power[7].level().mul(0.05)
            },
            get descPer() {
                return `Buyable 2 scales -${format(this.effPer.mul(100))}% slower.`
            },
            get descTotal() {
                return `Buyable 2 scales -${format(tmp.game.kp.dynEffs[7].mul(100))}% slower.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sub(15).div(7).add(1).floor().max(0)
            },
            cap: D(99),
            effPer: D(0.05),
            get eff() {
                return KUA_DYNAMICS.power[8].level().mul(0.04)
            },
            get descPer() {
                return `Buyable 3 scales -${format(this.effPer.mul(100))}% slower.`
            },
            get descTotal() {
                return `Buyable 3 scales -${format(tmp.game.kp.dynEffs[8].mul(100))}% slower.`
            }
        },
        {
            level(x = player.gameProgress.kuaDynamicUpgs[1]) {
                return D(x).min(this.cap).sqrt().sub(4).floor().max(0)
            },
            cap: D(100),
            effPer: Decimal.root(1.1, 6),
            get eff() {
                return KUA_DYNAMICS.power[9].level().div(6).pow_base(1.1)
            },
            get descPer() {
                return `Point gain is raised to the power of ^${format(this.effPer, 3)}.`
            },
            get descTotal() {
                return `Point gain is raised to the power of ^${format(tmp.game.kp.dynEffs[9], 3)}.`
            }
        },
    ],
    kua: [
        
    ]
}

export const intiHTML_Kuaraniai = () => {
    toHTMLvar('praiAmt4');
    toHTMLvar('praiAmtGain4');
    toHTMLvar('praiAmtGainTotal');
    toHTMLvar('kuaReset');
    toHTMLvar('kuaResetButton');
    toHTMLvar('kuaAmount');
    toHTMLvar('kuaGain');
    toHTMLvar('kuaReq');
    toHTMLvar('kuaReqAmt');
    toHTMLvar('kuaDesc');
    toHTMLvar('kuaAmt2');
    toHTMLvar('kuaEffect');
    toHTMLvar('kuaBoostEffect');
    toHTMLvar('kshardAmount');
    toHTMLvar('kshardGeneration');
    toHTMLvar('kshardStaticUpg');
    toHTMLvar('kshardDynamicUpg');
    toHTMLvar('kshardDynamicUpgButton');
    toHTMLvar('kshardDUAmount');
    toHTMLvar('kshardDUCost');
    toHTMLvar('kshardDUEffects');
    toHTMLvar('kpowerAmount');
    toHTMLvar('kpowerGeneration');
    toHTMLvar('kpowerStaticUpg');
    toHTMLvar('kpowerDynamicUpg');
    toHTMLvar('kpowerDynamicUpgButton');
    toHTMLvar('kpowerDUAmount');
    toHTMLvar('kpowerDUCost');
    toHTMLvar('kpowerDUEffects');

    let txt = ``;
    for (let i = 0; i < KUA_UPGRADES.shard.length; i++) {
        txt += `
            <button id="kshardStaticUpg${i}" class="whiteText fontTrebuchetMS kuaUpgradeButton" style="width: 150px; height: 120px; font-size: 10px; margin: 4px;">
                <b>Kua. S. Static Upgrade #${i + 1}</b><br>
                <span id="kshardSU${i}Effects"></span><br><br>
                Cost: <span id="kshardSU${i}Cost">${format(KUA_UPGRADES.shard[i].cost, 1)}</span> Kua. S.<br>
            </button>
        `;
    }
    html['kshardStaticUpg'].innerHTML = txt;
    for (let i = 0; i < KUA_UPGRADES.shard.length; i++) {
        toHTMLvar(`kshardStaticUpg${i}`);
        toHTMLvar(`kshardSU${i}Effects`);
        toHTMLvar(`kshardSU${i}Cost`);

        // see updateSaveFileListHTML for why i don't check here -- tl;dr these are children of kshardStaticUpg and their event listeners get cleared if i set innerhtml
        html[`kshardStaticUpg${i}`].addEventListener('click', () => buyKuaStaticShard(i));
    }

    txt = ``
    for (let i = 0; i < KUA_UPGRADES.power.length; i++) {
        txt += `
            <button id="kpowerStaticUpg${i}" class="whiteText fontTrebuchetMS kuaUpgradeButton" style="width: 150px; height: 120px; font-size: 10px; margin: 4px;">
                <b>Kua. P. Static Upgrade #${i + 1}</b><br>
                <span id="kpowerSU${i}Effects"></span><br><br>
                Cost: <span id="kpowerSU${i}Cost">${format(KUA_UPGRADES.power[i].cost, 1)}</span> Kua. S.<br>
            </button>
        `;
    }
    html['kpowerStaticUpg'].innerHTML = txt;

    for (let i = 0; i < KUA_UPGRADES.power.length; i++) {
        toHTMLvar(`kpowerStaticUpg${i}`);
        toHTMLvar(`kpowerSU${i}Effects`);
        toHTMLvar(`kpowerSU${i}Cost`);

        // see updateSaveFileListHTML for why i don't check here -- tl;dr these are children of kpowerStaticUpg and their event listeners get cleared if i set innerhtml
        html[`kpowerStaticUpg${i}`].addEventListener('click', () => buyKuaStaticPower(i));
    }

    html[`kshardDUEffects`].innerHTML = kuaDynamicUpgEffDisplay('shard', false)
    html[`kpowerDUEffects`].innerHTML = kuaDynamicUpgEffDisplay('power', false)

    // see loadSave.ts in the initHTML function
    if (!gameVars.gameLoadedFirst) {
        html['kuaResetButton'].addEventListener('click', () => kuaReset(false));
        html['kshardDynamicUpgButton'].addEventListener('click', () => buyKuaDynamicShard());
        html['kpowerDynamicUpgButton'].addEventListener('click', () => buyKuaDynamicPower());
    }
}

export const updateGame_Kuaraniai = (delta: Decimal) => {
    player.gameProgress.timeInKua = Decimal.max(player.gameProgress.timeInKua, 0).add(delta);

    for (let i = 0; i < KUA_UPGRADES.power.length; i++) {
        tmp.game.kp.upgEffs[i] = KUA_UPGRADES.power[i].eff;
    }

    for (let i = 0; i < KUA_DYNAMICS.shard.length; i++) {
        tmp.game.ks.dynEffs[i] = KUA_DYNAMICS.shard[i].eff;
    }

    for (let i = 0; i < KUA_DYNAMICS.power.length; i++) {
        tmp.game.kp.dynEffs[i] = KUA_DYNAMICS.power[i].eff;
    }

    tmp.game.kua.req = D(1e20);
    if (Decimal.gte(player.gameProgress.pr2, 9)) {
        tmp.game.kua.req = D(1e15);
    }
    tmp.game.kua.gain = Decimal.add(player.gameProgress.prai, tmp.game.prai.gain).max(1).log(tmp.game.kua.req).max(0.1).ln().sub(0.75).mul(2).pow_base(100).mul(1000).floor().div(1000);
    if (tmp.game.kua.gain.lt(100) || Decimal.lt(player.gameProgress.kua, 100)) {
        tmp.game.kua.next = tmp.game.kua.gain.mul(1000).add(1).floor().div(1000).log(100).div(2).add(0.75).exp().pow_base(tmp.game.kua.req).sub(player.gameProgress.prai).sub(tmp.game.prai.gain);
    } else {
        tmp.game.kua.next = tmp.game.kua.gain.log10().floor().add(1).pow10().log(100).div(2).add(0.75).exp().pow_base(tmp.game.kua.req).sub(player.gameProgress.prai).sub(tmp.game.prai.gain);
    }

    tmp.game.kua.eff = D(player.gameProgress.kua);
    tmp.game.kua.nextEff = D(player.gameProgress.kua);

    tmp.game.ks.gain = Decimal.max(tmp.game.kua.eff, 0);
    player.gameProgress.kshard = Decimal.max(player.gameProgress.kshard, 0).add(tmp.game.ks.gain.mul(delta));
    tmp.game.kp.gain = Decimal.max(player.gameProgress.kshard, 0);
    player.gameProgress.kpower = Decimal.max(player.gameProgress.kpower, 0).add(tmp.game.kp.gain.mul(delta));

    tmp.game.ks.dynCost = Decimal.max(player.gameProgress.kuaDynamicUpgs[0], 0).add(1).factorial();
    tmp.game.ks.dynTarget = inverseFact(Decimal.max(player.gameProgress.kshard, 1)).sub(1);
    tmp.game.kp.dynCost = Decimal.max(player.gameProgress.kuaDynamicUpgs[1], 0).add(1).factorial();
    tmp.game.kp.dynTarget = inverseFact(Decimal.max(player.gameProgress.kpower, 1)).sub(1);
}

export const updateHTML_Kuaraniai = () => {
    html['kuaraniaiTabButton'].classList.toggle("hide", Decimal.lt(player.gameProgress.pr2, 6) && Decimal.eq(player.gameProgress.kua, 0));
    html['kuaraniai'].classList.toggle("hide", tab.mainTab !== 5);
    if (tab.mainTab === 5) {
        html['praiAmt4'].textContent = `${format(player.gameProgress.prai)}`;
        html['praiAmtGain4'].textContent = `${format(tmp.game.prai.gain)}`;
        html['praiAmtGainTotal'].textContent = `${format(tmp.game.prai.gain.add(player.gameProgress.prai))}`;
        html['kuaResetButton'].classList.toggle("cannot", !Decimal.gte(player.gameProgress.prai, tmp.game.kua.req));
        html['kuaResetButton'].classList.toggle("can", Decimal.gte(player.gameProgress.prai, tmp.game.kua.req));
        html['kuaResetButton'].classList.toggle("cannotClick", !Decimal.gte(player.gameProgress.prai, tmp.game.kua.req));
        html['kuaResetButton'].classList.toggle("canClick", Decimal.gte(player.gameProgress.prai, tmp.game.kua.req));
        html['kuaAmount'].textContent = `${format(player.gameProgress.kua, 3)}`;
        html['kuaAmt2'].textContent = `${format(player.gameProgress.kua, 3)}`;
        html['kuaGain'].textContent = `${format(tmp.game.kua.gain, 3)}`;
        html['kuaReq'].classList.toggle("hide", tmp.game.kua.gain.gte(100));
        if (tmp.game.kua.gain.lt(100)) {
            html['kuaReqAmt'].textContent = `${format(tmp.game.kua.req)}`;
        }
        if (Decimal.lt(player.gameProgress.prai, tmp.game.kua.req)) {
            html['kuaDesc'].textContent = `You can Kuaraniai reset in ~${format(tmp.game.kua.req.sub(player.gameProgress.prai).div(tmp.game.prai.gain.max(1)))} resets.`;
        } else if (tmp.game.kua.gain.lt(100) || Decimal.lt(player.gameProgress.kua, 100)) {
            html['kuaDesc'].textContent = `Next thousandth in ${format(tmp.game.kua.next)} PRai. (${format(tmp.game.kua.gain.div(player.gameProgress.timeInKua), 2)}/s)`;
        } else {
            html['kuaDesc'].textContent = `Next OoM in ${format(tmp.game.kua.next)} PRai. (${format(tmp.game.kua.gain.add(player.gameProgress.kua).div(player.gameProgress.kua).log10().div(player.gameProgress.timeInKua), 3)} OoM/s)`;
        }
        html['kuaEffect'].textContent = `${format(tmp.game.kua.eff, 3)}`;
        html['kuaBoostEffect'].textContent = `${format(tmp.game.kua.eff.eq_tolerance(0, 1e-9) ? 0 : tmp.game.kua.nextEff.div(tmp.game.kua.eff), 3)}`;
        
        html['kshardAmount'].textContent = `${format(player.gameProgress.kshard, 3)}`;
        html['kshardGeneration'].textContent = `${format(tmp.game.ks.gain, 3)}`;
        for (let i = 0; i < KUA_UPGRADES.shard.length; i++) {
            html[`kshardStaticUpg${i}`].classList.toggle("hide", kuaUpgradeOpacity(0, i) < 0.1);
            if (kuaUpgradeOpacity(0, i) >= 0.1) {
                if (i < player.gameProgress.kuaStaticUpgs[0]) {
                    html[`kshardStaticUpg${i}`].classList.toggle("complete", true);
                    html[`kshardStaticUpg${i}`].classList.toggle("cannotClick", true);
                } else {
                    html[`kshardStaticUpg${i}`].classList.toggle("cannot", Decimal.lt(player.gameProgress.kshard, KUA_UPGRADES.shard[i].cost));
                    html[`kshardStaticUpg${i}`].classList.toggle("can", Decimal.gte(player.gameProgress.kshard, KUA_UPGRADES.shard[i].cost));
                    html[`kshardStaticUpg${i}`].classList.toggle("cannotClick", Decimal.lt(player.gameProgress.kshard, KUA_UPGRADES.shard[i].cost));
                    html[`kshardStaticUpg${i}`].classList.toggle("canClick", Decimal.gte(player.gameProgress.kshard, KUA_UPGRADES.shard[i].cost));
                }

                html[`kshardStaticUpg${i}`].style.opacity = `${100 * kuaUpgradeOpacity(0, i)}%`
                html[`kshardSU${i}Effects`].textContent = `${KUA_UPGRADES.shard[i].desc}`
            }
        }
        html[`kshardDynamicUpgButton`].classList.toggle("canClick", Decimal.gte(player.gameProgress.kshard, tmp.game.ks.dynCost));
        html[`kshardDynamicUpgButton`].classList.toggle("cannotClick", Decimal.lt(player.gameProgress.kshard, tmp.game.ks.dynCost));
        html[`kshardDynamicUpgButton`].classList.toggle("cannot", Decimal.lt(player.gameProgress.kshard, tmp.game.ks.dynCost));
        html[`kshardDynamicUpgButton`].classList.toggle("can", Decimal.gte(player.gameProgress.kshard, tmp.game.ks.dynCost));
        html[`kshardDUAmount`].textContent = `${format(player.gameProgress.kuaDynamicUpgs[0])}`;
        html[`kshardDUCost`].textContent = `${format(tmp.game.ks.dynCost)}`;

        html['kpowerAmount'].textContent = `${format(player.gameProgress.kpower, 2)}`;
        html['kpowerGeneration'].textContent = `${format(tmp.game.kp.gain, 2)}`;
        for (let i = 0; i < KUA_UPGRADES.power.length; i++) {
            html[`kpowerStaticUpg${i}`].classList.toggle("hide", kuaUpgradeOpacity(1, i) < 0.1);
            if (kuaUpgradeOpacity(1, i) >= 0.1) {
                if (i < player.gameProgress.kuaStaticUpgs[1]) {
                    html[`kpowerStaticUpg${i}`].classList.toggle("complete", true);
                    html[`kpowerStaticUpg${i}`].classList.toggle("cannotClick", true);
                } else {
                    html[`kpowerStaticUpg${i}`].classList.toggle("cannot", Decimal.lt(player.gameProgress.kpower, KUA_UPGRADES.power[i].cost));
                    html[`kpowerStaticUpg${i}`].classList.toggle("can", Decimal.gte(player.gameProgress.kpower, KUA_UPGRADES.power[i].cost));
                    html[`kpowerStaticUpg${i}`].classList.toggle("cannotClick", Decimal.lt(player.gameProgress.kpower, KUA_UPGRADES.power[i].cost));
                    html[`kpowerStaticUpg${i}`].classList.toggle("canClick", Decimal.gte(player.gameProgress.kpower, KUA_UPGRADES.power[i].cost));
                }

                html[`kpowerStaticUpg${i}`].style.opacity = `${100 * kuaUpgradeOpacity(1, i)}%`;
                html[`kpowerSU${i}Effects`].textContent = `${KUA_UPGRADES.power[i].desc}`;
            }
        }
        html[`kpowerDynamicUpgButton`].classList.toggle("canClick", Decimal.gte(player.gameProgress.kpower, tmp.game.kp.dynCost));
        html[`kpowerDynamicUpgButton`].classList.toggle("cannotClick", Decimal.lt(player.gameProgress.kpower, tmp.game.kp.dynCost));
        html[`kpowerDynamicUpgButton`].classList.toggle("cannot", Decimal.lt(player.gameProgress.kpower, tmp.game.kp.dynCost));
        html[`kpowerDynamicUpgButton`].classList.toggle("can", Decimal.gte(player.gameProgress.kpower, tmp.game.kp.dynCost));
        html[`kpowerDUAmount`].textContent = `${format(player.gameProgress.kuaDynamicUpgs[1])}`;
        html[`kpowerDUCost`].textContent = `${format(tmp.game.kp.dynCost)}`;
    }
}

export const kuaReset = (override: boolean) => {
    if (!override) {
        if (Decimal.lt(player.gameProgress.prai, tmp.game.kua.req)) {
            return;
        }
        player.gameProgress.kua = Decimal.add(player.gameProgress.kua, tmp.game.kua.gain);
    }

    player.gameProgress.timeInKua = D(0);

    updateGame_PR2(D(0));
    pr2Reset(true);
}

export const kuaUpgradeOpacity = (type: 0 | 1 | 2, id: number) => {
    return Math.min(1, 2 ** (player.gameProgress.kuaStaticUpgs[type] - id));
}

export const buyKuaStaticShard = (id: number) => {
    if (player.gameProgress.kuaStaticUpgs[0] !== id) {
        return;
    }
    if (Decimal.lt(player.gameProgress.kshard, KUA_UPGRADES.shard[id].cost)) {
        return;
    }
    player.gameProgress.kshard = Decimal.sub(player.gameProgress.kshard, KUA_UPGRADES.shard[id].cost);
    player.gameProgress.kuaStaticUpgs[0] += 1;
}

export const buyKuaStaticPower = (id: number) => {
    if (player.gameProgress.kuaStaticUpgs[1] !== id) {
        return;
    }
    if (Decimal.lt(player.gameProgress.kpower, KUA_UPGRADES.power[id].cost)) {
        return;
    }
    player.gameProgress.kpower = Decimal.sub(player.gameProgress.kpower, KUA_UPGRADES.power[id].cost);
    player.gameProgress.kuaStaticUpgs[1] += 1;
}

export const hasKuaStaticUpg = (type: KuaUpgradeAllNames, id: number) => {
    return player.gameProgress.kuaStaticUpgs[KUA_UPGRADE_NAMES.indexOf(type)] > id;
}

export const kuaDynamicUpgEffDisplay = (type: KuaUpgradeAllNames, total: boolean) => {
    const index = KUA_UPGRADE_NAMES.indexOf(type);
    let txt = ``;
    for (let i = 0; i < KUA_DYNAMICS[type].length; i++) {
        if (total) {
            if (KUA_DYNAMICS[type][i].level().gt(0)) {
                if (Decimal.gte(player.gameProgress.kuaDynamicUpgs[index], KUA_DYNAMICS[type][i].cap)) {
                    txt += `<li style="color: #ffff80">${KUA_DYNAMICS[type][i].descTotal} (Capped!)</li>`;
                } else {
                    txt += `<li>${KUA_DYNAMICS[type][i].descTotal}</li>`;
                }
            }
        } else {
            if (KUA_DYNAMICS[type][i].level(Decimal.add(player.gameProgress.kuaDynamicUpgs[index], 1)).gt(KUA_DYNAMICS[type][i].level(player.gameProgress.kuaDynamicUpgs[index]))) {
                txt += `<li>${KUA_DYNAMICS[type][i].descPer}</li>`;
            }
        }
    }
    return txt;
}

export const buyKuaDynamicShard = () => {
    if (Decimal.lt(player.gameProgress.kshard, tmp.game.ks.dynCost)) {
        return;
    }
    player.gameProgress.kshard = Decimal.sub(player.gameProgress.kshard, tmp.game.ks.dynCost);
    player.gameProgress.kuaDynamicUpgs[0] = Decimal.add(player.gameProgress.kuaDynamicUpgs[0], 1);
    updateGame_Kuaraniai(D(0));
    html['kshardDUEffects'].innerHTML = kuaDynamicUpgEffDisplay('shard', shiftDown);
}

export const buyKuaDynamicPower = () => {
    if (Decimal.lt(player.gameProgress.kpower, tmp.game.kp.dynCost)) {
        return;
    }
    player.gameProgress.kpower = Decimal.sub(player.gameProgress.kpower, tmp.game.kp.dynCost);
    player.gameProgress.kuaDynamicUpgs[1] = Decimal.add(player.gameProgress.kuaDynamicUpgs[1], 1);
    updateGame_Kuaraniai(D(0));
    html['kpowerDUEffects'].innerHTML = kuaDynamicUpgEffDisplay('power', shiftDown);
}