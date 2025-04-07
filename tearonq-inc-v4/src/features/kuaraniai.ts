import Decimal from "break_eternity.js";
import { html, tab, toHTMLvar } from "../main";
import { player, tmp } from "../loadSave";
import { format } from "../misc/format";
import { D, inverseFact, invHarmonicSum, sumHarmonicSeries } from "../misc/calc";
import { EffectCache } from "../misc/effectCache";

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
            desc: `Unlock Prestige Essence Buyables, which primarily buff Prestige Essence while also having a secondary effect.`,
        },
        {
            cost: D(1e8),
            desc: `Unlock Prestige Essense Upgrades, which are one-time special boosts that synergise Prestige Essence with other resources.`
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
            eff: new EffectCache(() => { return D(0.9); })
        },
        {
            cost: D(10),
            get desc() {
                return `Buyable 2's effect base is multiplied by ${format(tmp.game.kpupgEffs[1], 2)}×, based off points up to 2×.`
            },
            eff: new EffectCache(() => {
                return Decimal.max(player.gameProgress.points, 10).log10().sub(1).div(100).add(1).min(2)
            })
        },
        {
            cost: D(100),
            get desc() {
                return `Point gain is increased by ${format(tmp.game.kpupgEffs[2], 2)}×, based off Kua. P. Outside of the main game, this effect is drastically reduced.`
            },
            eff: new EffectCache(() => {
                return Decimal.max(player.gameProgress.kpower, 100).div(100).root(2)
            })
        },
        {
            cost: D(1000),
            desc: `PRai gain is raised to the power of ^1.1.`,
            eff: new EffectCache(() => { return D(1.1); })
        },
        {
            cost: D(5000),
            desc: `Buyable purchase cap is increased by +10, but costs scale much faster above the cap.`,
            eff: new EffectCache(() => { return D(10); })
        },
        {
            cost: D(1e5),
            get desc() {
                return `Buyable 1's cost decreases by /${format(tmp.game.kpupgEffs[5], 2)}, over time in a Kua. reset.`
            },
            eff: new EffectCache(() => {
                return Decimal.max(player.gameProgress.timeInKua, 0).div(10).add(1).ln().mul(10).pow_base(2)
            })
        },
        {
            cost: D(1e6),
            get desc() {
                return `PRai gain is multiplied by ${format(tmp.game.kpupgEffs[6], 2)}×, based off the product of Kua., Kua. S., and Kua. P.`
            },
            eff: new EffectCache(() => {
                return Decimal.max(player.gameProgress.kua, 0).mul(Decimal.max(player.gameProgress.kshard, 0)).mul(Decimal.max(player.gameProgress.kpower, 0)).root(18).max(1)
            })
        },
        {
            cost: D(1e8),
            desc: `PR3's effect boost is increased and extends to PE.`,
            eff: new EffectCache(() => { return D(1); })
        },
        {
            cost: D(1e10),
            get desc() {
                return `Buyable purchase cap is increased by +5, and another +1 every power of two seconds spent in a Kua. reset. Currently: +${format(tmp.game.kpupgEffs[8])}.`
            },
            eff: new EffectCache(() => {
                return Decimal.lt(player.gameProgress.timeInKua, 1)
                    ? D(0)
                    : Decimal.log2(player.gameProgress.timeInKua).add(1).floor()
            })
        },
        {
            cost: D(1e12),
            desc: `Every 150 purchases of a buyable, that buyable's effect is increased by +1×`,
            eff: new EffectCache(() => { return D(1); })
        },
        {
            cost: D(1e14),
            get desc() {
                return `Prestige Essence boosts its own generation. Currently: ${format(tmp.game.kpupgEffs[10], 2)}×.`
            },
            eff: new EffectCache(() => {
                return Decimal.max(player.gameProgress.prestigeEssence, 0).div(100).add(1).pow(0.2).root(Decimal.max(player.gameProgress.prestigeEssence, 10).log10().log10().pow(2).div(10).add(1))
            })
        },
        {
            cost: D(1e16),
            get desc() {
                return `Prestige Essence past ${format(1e33)} slows down Buyable 1-3's costs up to -50%. Currently: -${format(tmp.game.kpupgEffs[11].mul(100), 2)}%.`
            },
            eff: new EffectCache(() => {
                return Decimal.gte(player.gameProgress.prestigeEssence, 1e33)
                    ? Decimal.sub(0.5, Decimal.log(player.gameProgress.prestigeEssence, 1e33).pow(2).recip().mul(0.4))
                    : D(0)
            })
        },
        {
            cost: D(1e18),
            get desc() {
                return `Point gain in challenges are increased based on how long you've been in a Colosseum reset. Capped at ${format(1000)}× Currently: ${format(tmp.game.kpupgEffs[11].mul(100), 2)}×.`
            },
            eff: new EffectCache(() => {
                return tmp.game.inAnyChallenge
                    ? Decimal.max(player.gameProgress.timeInCol, 0).add(1).pow(0.2165).sub(1).min(3).pow10()
                    : D(1)
            })
        },
        {
            cost: D(1e21),
            desc: `PRai's effect is improved and scales better.`,
            eff: new EffectCache(() => { return D(1); })
        },
    ],
    kua: []
}

export const intiHTML_Kuaraniai = () => {
    toHTMLvar('praiAmt4');
    toHTMLvar('kshardAmount')
    toHTMLvar('kshardGeneration')
    toHTMLvar('kshardStaticUpg')
    toHTMLvar('kshardDynamicUpg')
    toHTMLvar('kshardDynamicUpgButton')
    toHTMLvar('kshardDUAmount')
    toHTMLvar('kshardDUCost')
    toHTMLvar('kshardDUEffects')
    toHTMLvar('kpowerAmount')
    toHTMLvar('kpowerGeneration')
    toHTMLvar('kpowerStaticUpg')
    toHTMLvar('kpowerDynamicUpg')
    toHTMLvar('kpowerDynamicUpgButton')
    toHTMLvar('kpowerDUAmount')
    toHTMLvar('kpowerDUCost')
    toHTMLvar('kpowerDUEffects')

    let txt = ``
    for (let i = 0; i < KUA_UPGRADES.shard.length; i++) {
        txt += `
            <button id="kshardStaticUpg${i}" class="whiteText fontTrebuchetMS kuaUpgradeButton" style="width: 150px; height: 120px; font-size: 10px;">
                <b>Kua. S. Static Upgrade #${i + 1}</b><br>
                <span id="kshardSU${i}Effects"></span><br><br>
                Cost: <span id="kshardSU${i}Cost">${format(KUA_UPGRADES.shard[i].cost, 1)}</span> Kua. S.<br>
            </button>
        `
    }
    html['kshardStaticUpg'].innerHTML = txt
    for (let i = 0; i < KUA_UPGRADES.shard.length; i++) {
        toHTMLvar(`kshardStaticUpg${i}`)
        toHTMLvar(`kshardSU${i}Effects`)
        toHTMLvar(`kshardSU${i}Cost`)
    }

    txt = ``
    for (let i = 0; i < KUA_UPGRADES.power.length; i++) {
        txt += `
            <button id="kpowerStaticUpg${i}" class="whiteText fontTrebuchetMS kuaUpgradeButton" style="width: 150px; height: 120px; font-size: 10px;">
                <b>Kua. P. Static Upgrade #${i + 1}</b><br>
                <span id="kpowerSU${i}Effects"></span><br><br>
                Cost: <span id="kpowerSU${i}Cost">${format(KUA_UPGRADES.power[i].cost, 1)}</span> Kua. S.<br>
            </button>
        `
    }
    html['kpowerStaticUpg'].innerHTML = txt

    for (let i = 0; i < KUA_UPGRADES.power.length; i++) {
        toHTMLvar(`kpowerStaticUpg${i}`)
        toHTMLvar(`kpowerSU${i}Effects`)
        toHTMLvar(`kpowerSU${i}Cost`)
    }
}

export const updateGame_Kuaraniai = (delta: Decimal) => {
    player.gameProgress.timeInKua = Decimal.max(player.gameProgress.timeInKua, 0).add(delta);

    for (let i = 0; i < KUA_UPGRADES.power.length; i++) {
        KUA_UPGRADES.power[i].eff.invalidateCache()
        tmp.game.kpupgEffs = KUA_UPGRADES.power[i].eff.getEffect()
    }

    tmp.game.kuaReq = D(1e20);
    tmp.game.kuaGain = sumHarmonicSeries(Decimal.max(player.gameProgress.prai, tmp.game.kuaReq.div(10)).log(tmp.game.kuaReq)).sub(1.5).mul(2).pow_base(1000)
    tmp.game.kuaNext = invHarmonicSum(tmp.game.kuaGain.mul(1000).floor().div(1000).log(1000).div(2).add(1.5)).pow_base(tmp.game.kuaReq)

    tmp.game.ksGain = Decimal.max(player.gameProgress.kua, 0)
    player.gameProgress.kshard = Decimal.max(player.gameProgress.kshard, 0).add(tmp.game.ksGain.mul(delta))
    tmp.game.kpGain = Decimal.max(player.gameProgress.kshard, 0)
    player.gameProgress.kpower = Decimal.max(player.gameProgress.kpower, 0).add(tmp.game.kpGain.mul(delta))

    tmp.game.ksDynamicCost = Decimal.max(player.gameProgress.kuaDynamicUpgs[0], 0).add(1).factorial();
    tmp.game.ksDynamicTarget = inverseFact(Decimal.max(player.gameProgress.kshard, 1)).sub(1)
    tmp.game.kpDynamicCost = Decimal.max(player.gameProgress.kuaDynamicUpgs[1], 0).add(1).factorial();
    tmp.game.kpDynamicTarget = inverseFact(Decimal.max(player.gameProgress.kpower, 1)).sub(1)
}

export const updateHTML_Kuaraniai = () => {
    html['kuaraniaiTabButton'].classList.toggle("hide", Decimal.lt(player.gameProgress.pr2, 6));
    html['kuaraniai'].classList.toggle("hide", tab.mainTab !== 5);
    if (tab.mainTab === 5) {
        html['praiAmt4'].textContent = `${format(player.gameProgress.prai)}`
        html['kshardAmount'].textContent = `${format(player.gameProgress.kshard, 3)}`
        html['kshardGeneration'].textContent = `${format(tmp.game.ksGain, 3)}`
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
        html[`kshardDynamicUpgButton`].classList.toggle("complete", Decimal.gte(player.gameProgress.kshard, tmp.game.ksDynamicCost));
        html[`kshardDynamicUpgButton`].classList.toggle("cannotClick", Decimal.gte(player.gameProgress.kshard, tmp.game.ksDynamicCost));
        html[`kshardDynamicUpgButton`].classList.toggle("cannot", Decimal.gte(player.gameProgress.kshard, tmp.game.ksDynamicCost));
        html[`kshardDynamicUpgButton`].classList.toggle("can", Decimal.gte(player.gameProgress.kshard, tmp.game.ksDynamicCost));

        html['kpowerAmount'].textContent = `${format(player.gameProgress.kpower, 2)}`
        html['kpowerGeneration'].textContent = `${format(tmp.game.kpGain, 2)}`
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

                html[`kpowerStaticUpg${i}`].style.opacity = `${100 * kuaUpgradeOpacity(1, i)}%`
                html[`kpowerSU${i}Effects`].textContent = `${KUA_UPGRADES.power[i].desc}`
            }
        }
        html[`kpowerDynamicUpgButton`].classList.toggle("complete", Decimal.gte(player.gameProgress.kpower, tmp.game.kpDynamicCost));
        html[`kpowerDynamicUpgButton`].classList.toggle("cannotClick", Decimal.gte(player.gameProgress.kpower, tmp.game.kpDynamicCost));
        html[`kpowerDynamicUpgButton`].classList.toggle("cannot", Decimal.gte(player.gameProgress.kpower, tmp.game.kpDynamicCost));
        html[`kpowerDynamicUpgButton`].classList.toggle("can", Decimal.gte(player.gameProgress.kpower, tmp.game.kpDynamicCost));
    }
}

export const kuaUpgradeOpacity = (type: 0 | 1 | 2, id: number) => {
    return Math.min(1, 2 ** (player.gameProgress.kuaStaticUpgs[type] - id))
}