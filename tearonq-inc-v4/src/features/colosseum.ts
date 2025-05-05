import Decimal from "break_eternity.js";
import { player, tmp } from "../loadSave";
import { D } from "../misc/calc";
import { format, formatTime } from "../misc/format";
import { html, tab, toHTMLvar } from "../main";
import { hasKuaStaticUpg } from "./kuaraniai";

export const COL_CHALLENGES = [
    {
        type: 0, // One-Time
        name: "Buyable Hell",
        goal: D(1e25),
        cap: D(1),
        get progress() {
            return Decimal.max(player.gameProgress.totalPointsInPRai, 1).log(this.goal).min(1);
        },
        get goalDescription() {
            return `Reach ${format(this.goal)} Points.`;
        },
        show: true,
        desc: `<span>All buyables' cost scaling are <b>10</b>× slower, but multiplicative effect bases are now x<sup><b>0.1</b></sup> and additive effect bases are <b>x/10</b>.</span>`,
        rewardDesc: `<span>Unlock Colosseum Researches and buyables' multiplicative effect bases are raised x<sup><b>1.05</b></sup> and additive effect bases are multiplied by <b>1.05</b>.</span>`
    },
    {
        type: 1, // Repeatable
        name: "Decimated Income",
        goal: [
            D(1e39),
            D(1e40),
            D(1e41),
            D(1e42),
            D(1e45),
            D(1e48),
            D(1e63),
            D(1e80),
            D(1e100),
            D(1e125),
            D(Infinity), // you aren't supposed to get past 10 but i was bored
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity),
            D(Infinity)
        ],
        // reminder to change this back to 10
        cap: D(20),
        get progress() {
            return Decimal.max(player.gameProgress.totalPointsInPRai, 1).log(this.goal[Decimal.max(player.gameProgress.colDifficulty[1], 0).min(this.cap).toNumber()]).min(1);
        },
        get goalDescription() {
            return `Reach ${format(this.goal[Decimal.max(player.gameProgress.colDifficulty[1], 0).min(this.cap).toNumber()])} Points.`;
        },
        get show() {
            return hasKuaStaticUpg('shard', 2);
        },
        effInChallengeList: [
            { pts: D(0.75),  prai: D(1.00), kres: D(1),      buyable: D(1.00),  timeSlow: D(1),    pointDilate: D(1.00) },
            { pts: D(0.50),  prai: D(0.90), kres: D(1),      buyable: D(1.00),  timeSlow: D(1),    pointDilate: D(1.00) },
            { pts: D(0.33),  prai: D(0.80), kres: D(1),      buyable: D(1.00),  timeSlow: D(1),    pointDilate: D(1.00) },
            { pts: D(0.20),  prai: D(0.70), kres: D(2),      buyable: D(1.00),  timeSlow: D(1),    pointDilate: D(1.00) },
            { pts: D(0.15),  prai: D(0.60), kres: D(4),      buyable: D(1.00),  timeSlow: D(1),    pointDilate: D(1.00) },
            { pts: D(0.12),  prai: D(0.50), kres: D(10),     buyable: D(1.05),  timeSlow: D(1),    pointDilate: D(1.00) },
            { pts: D(0.08),  prai: D(0.40), kres: D(25),     buyable: D(1.10),  timeSlow: D(1),    pointDilate: D(1.00) },
            { pts: D(0.06),  prai: D(0.30), kres: D(50),     buyable: D(1.20),  timeSlow: D(1.5),  pointDilate: D(1.00) },
            { pts: D(0.04),  prai: D(0.20), kres: D(200),    buyable: D(1.50),  timeSlow: D(2),    pointDilate: D(1.00) },
            { pts: D(0.02),  prai: D(0.10), kres: D(1e3),    buyable: D(2.00),  timeSlow: D(5),    pointDilate: D(0.80) },
            { pts: D(0.01),  prai: D(0.00), kres: D(1e5),    buyable: D(3.00),  timeSlow: D(10),   pointDilate: D(0.50) }, // you shouldn't get past 10 due to cap being Infinity but i was bored
            { pts: D(1e-3),  prai: D(0.00), kres: D(1e10),   buyable: D(5.00),  timeSlow: D(100),  pointDilate: D(0.25) },
            { pts: D(1e-4),  prai: D(0.00), kres: D(1e20),   buyable: D(10.0),  timeSlow: D(1e3),  pointDilate: D(0.15) },
            { pts: D(1e-5),  prai: D(0.00), kres: D(1e50),   buyable: D(25.0),  timeSlow: D(1e4),  pointDilate: D(0.10) },
            { pts: D(1e-7),  prai: D(0.00), kres: D(1e100),  buyable: D(50.0),  timeSlow: D(1e6),  pointDilate: D(0.07) },
            { pts: D(1e-9),  prai: D(0.00), kres: D(1e200),  buyable: D(100),   timeSlow: D(1e9),  pointDilate: D(0.05) },
            { pts: D(1e-12), prai: D(0.00), kres: D('e500'), buyable: D(500),   timeSlow: D(1e12), pointDilate: D(0.03) },
            { pts: D(1e-15), prai: D(0.00), kres: D('ee3'),  buyable: D(4000),  timeSlow: D(1e16), pointDilate: D(0.02) },
            { pts: D(1e-20), prai: D(0.00), kres: D('ee4'),  buyable: D(7.5e4), timeSlow: D(1e20), pointDilate: D(0.01) },
            { pts: D(1e-30), prai: D(0.00), kres: D('ee5'),  buyable: D(3.5e5), timeSlow: D(1e25), pointDilate: D(1e-3) },
            { pts: D(1e-45), prai: D(0.00), kres: D('ee6'),  buyable: D(1.2e7), timeSlow: D(1e32), pointDilate: D(1e-4) },
        ],
        rewardList: [
            { cap: D(3),    prai: D(1.00), dynamic: D(1.00), buyables: D(1),         timeSpeed: D(1.0), pts: D(0)      },
            { cap: D(6),    prai: D(1.05), dynamic: D(1.00), buyables: D(1),         timeSpeed: D(1.0), pts: D(0)      },
            { cap: D(10),   prai: D(1.10), dynamic: D(1.00), buyables: D(1),         timeSpeed: D(1.0), pts: D(0)      },
            { cap: D(15),   prai: D(1.15), dynamic: D(0.97), buyables: D(1),         timeSpeed: D(1.0), pts: D(0)      },
            { cap: D(20),   prai: D(1.20), dynamic: D(0.94), buyables: D(1),         timeSpeed: D(1.0), pts: D(0)      },
            { cap: D(25),   prai: D(1.30), dynamic: D(0.90), buyables: D(10),        timeSpeed: D(1.0), pts: D(0)      },
            { cap: D(40),   prai: D(1.40), dynamic: D(0.85), buyables: D(100),       timeSpeed: D(1.0), pts: D(0)      },
            { cap: D(60),   prai: D(1.50), dynamic: D(0.80), buyables: D(1e3),       timeSpeed: D(1.5), pts: D(0)      },
            { cap: D(100),  prai: D(1.60), dynamic: D(0.75), buyables: D(1e6),       timeSpeed: D(2.0), pts: D(0)      },
            { cap: D(200),  prai: D(1.75), dynamic: D(0.70), buyables: D(1e12),      timeSpeed: D(3.0), pts: D(10)     }, // you'd probably be expected to complete this challenge with at least e40,000 pts, a e200 boost (dilate ^0.5) feels too little
            { cap: D(300),  prai: D(2.00), dynamic: D(0.67), buyables: D(1e24),      timeSpeed: D(5.0), pts: D(25)     },
            { cap: D(500),  prai: D(2.50), dynamic: D(0.64), buyables: D(1e48),      timeSpeed: D(8.0), pts: D(75)     }, // you are not meant to complete the challenge >10 times
            { cap: D(1e3),  prai: D(3.00), dynamic: D(0.60), buyables: D(1e90),      timeSpeed: D(13),  pts: D(150)    },
            { cap: D(2e3),  prai: D(3.75), dynamic: D(0.55), buyables: D(1e240),     timeSpeed: D(21),  pts: D(325)    },
            { cap: D(4e3),  prai: D(4.50), dynamic: D(0.50), buyables: D('e500'),    timeSpeed: D(34),  pts: D(600)    },
            { cap: D(1e4),  prai: D(5.50), dynamic: D(0.45), buyables: D('ee3'),     timeSpeed: D(55),  pts: D(1375)   },
            { cap: D(3e4),  prai: D(6.75), dynamic: D(0.40), buyables: D('e2200'),   timeSpeed: D(89),  pts: D(2500)   },
            { cap: D(1e5),  prai: D(8.00), dynamic: D(0.35), buyables: D('e4600'),   timeSpeed: D(144), pts: D(4050)   },
            { cap: D(1e6),  prai: D(11.0), dynamic: D(0.30), buyables: D('e9100'),   timeSpeed: D(233), pts: D(8750)   },
            { cap: D(1e7),  prai: D(14.0), dynamic: D(0.26), buyables: D('e21000'),  timeSpeed: D(377), pts: D(23000)  },
            { cap: D(1e8),  prai: D(17.0), dynamic: D(0.23), buyables: D('e72000'),  timeSpeed: D(610), pts: D(69420)  },
            { cap: D(1e10), prai: D(20.0), dynamic: D(0.20), buyables: D('e244000'), timeSpeed: D(987), pts: D(131072) },
        ],
        get desc() {
            const diff = Decimal.max(player.gameProgress.colDifficulty[1], 0).min(this.cap);
            const item = this.effInChallengeList[diff.toNumber()];
            let txt = ``;
            txt += `<li>Your point gain is raised to the ^<b>${format(item.pts, 2)}</b></li>`;
            if (Decimal.gte(diff, 1)) {
                txt += `<li>PRai's gain is raised to the ^<b>${format(item.prai, 2)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next restriction will occur at <b>difficulty 1!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 3)) {
                txt += `<li>Kua., K.S., and K.P. gain are reduced by /<b>${format(item.kres)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next restriction will occur at <b>difficulty 3!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 5)) {
                txt += `<li>Buyables' costs are dilated to the ^<b>${format(item.buyable, 2)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next restriction will occur at <b>difficulty 5!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 7)) {
                txt += `<li>Tier 1 time speed is slower by /<b>${format(item.timeSlow, 1)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next restriction will occur at <b>difficulty 7!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 9)) {
                txt += `<li>Point gain is dilated to the ^<b>${format(item.pointDilate, 2)}</b> after being rooted.</li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next restriction will occur at <b>difficulty 9!</b></li>`;
                return txt;
            }
            return txt;
        },
        get rewardDesc() {
            const diff = Decimal.max(player.gameProgress.colDifficulty[1], 0).min(this.cap);
            const item = this.rewardList[diff.toNumber()];
            let txt = ``;
            txt += `<li>Buyable Cap is increased by +<b>${format(item.cap)}</b></li>`;
            if (Decimal.gte(diff, 1)) {
                txt += `<li>PRai's effect is raised to the ^<b>${format(item.prai, 2)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next reward will occur at <b>difficulty 1!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 3)) {
                txt += `<li>K.S. and K.P.'s dynamic upgrade costs are reduced by ^<b>${format(item.dynamic, 2)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next reward will occur at <b>difficulty 3!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 5)) {
                txt += `<li>Buyable costs are divided by /<b>${format(item.buyables, 2)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next reward will occur at <b>difficulty 5!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 7)) {
                txt += `<li>Tier 1 time speed is increased by ×<b>${format(item.timeSpeed, 1)}</b> outside of challenges.</li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next reward will occur at <b>difficulty 7!</b></li>`;
                return txt;
            }
            if (Decimal.gte(diff, 9)) {
                txt += `<li>Point gain is multiplied by ×<b>${format(Decimal.max(player.gameProgress.points, 1).log10().add(1).sqrt().sub(1).pow10().pow(item.pts))}</b> based on itself.</li>`;
            } else {
                txt += `<li style="color: #FFFF80">The next reward will occur at <b>difficulty 9!</b></li>`;
                return txt;
            }
            return txt;
        }
    },
    {
        type: 2, // Continuous
        name: "Decaying Feeling",
        get goal() {
            return D(1e60)
        },
        cap: D(Infinity),
        get progress() {
            return Decimal.max(player.gameProgress.totalPointsInPRai, 1).log(this.goal).min(1);
        },
        get goalDescription() {
            return `Reach ${format(this.goal)} Points.`;
        },
        get show() {
            return hasKuaStaticUpg('shard', 4);
        },
        desc: `<span>Point, PRai, P. Extract, and Kuaraniai gains all slowly decay based on how much each resource has.</span>`,
        get rewardContinuous() {
            const obj = {
                research: D(1),
                kb: D(1),
                pts: D(1)
            }
            obj.research = Decimal.lt(player.gameProgress.colCompleted[2], this.goal)
                ? D(1)
                : Decimal.div(player.gameProgress.colCompleted[2], this.goal).log10().add(1).pow(0.4).sub(1).pow_base(2)
            obj.kb = Decimal.lt(player.gameProgress.colCompleted[2], this.goal.pow(1.5))
                ? D(0)
                : Decimal.div(player.gameProgress.colCompleted[2], this.goal.pow(1.5)).log2()
            obj.pts = Decimal.lt(player.gameProgress.colCompleted[2], this.goal.pow(2))
                ? D(1)
                : Decimal.div(player.gameProgress.colCompleted[2], this.goal.pow(2)).log(this.goal.pow(2)).ln().div(3).add(1).pow(3).pow_base(1000)
            return obj
        },
        get rewardDesc() {
            const item = this.rewardContinuous;
            let txt = ``;
            if (Decimal.gte(player.gameProgress.colCompleted[2], this.goal)) {
                txt += `<li>Research Speed is multiplied by ×<b>${format(item.research)}</b></li>`;
            } else {
                txt += `<li style="color: #FFFF80">You need <b>${format(this.goal)} points</b> to gain the next reward!</li>`;
                return txt;
            }
            if (Decimal.gte(player.gameProgress.colCompleted[2], this.goal.pow(1.5))) {
                txt += `<li>K. Blessings gain is boosted by ×<b>${format(item.kb)}</b>.</li>`;
            } else {
                txt += `<li style="color: #FFFF80">You need <b>${format(this.goal.pow(1.5))} points</b> to gain the next reward!</li>`;
                return txt;
            }
            if (Decimal.gte(player.gameProgress.colCompleted[2], this.goal.pow(2))) {
                txt += `<li>Point gain is boosted by ×<b>${format(item.pts)}</b>.</li>`;
            } else {
                txt += `<li style="color: #FFFF80">You need <b>${format(this.goal.pow(2))} points</b> to gain the next reward!</li>`;
                return txt;
            }
            return txt;
        }
    },
]

export const initHTML_Colosseum = () => {
    toHTMLvar('kuaAmt3');
    toHTMLvar('kuaAmtGain');
    toHTMLvar('colPowAmt');
    toHTMLvar('colPowGain');
    toHTMLvar('colTimer');
    toHTMLvar('colChalList');

    let txt = ``;
    for (let i = 0; i < COL_CHALLENGES.length; i++) {
        let completionText = ``;
        if (COL_CHALLENGES[i].type === 1) {
            completionText = `${format(player.gameProgress.colCompleted[i])} / ${format(COL_CHALLENGES[i].cap)}`;
        }
        if (COL_CHALLENGES[i].type === 2) {
            completionText = `PB: ${format(player.gameProgress.colCompleted[i])}`;
        }
        txt += `
            <div id="colChal${i}" class="colButton" style="width: 240px; height: 360px; padding: 0px; margin: 4px">
                <div class="colosseum-container" style="height: 16.667%; background-color: #521400;">
                    <span id="colChal${i}Type" class="whiteText fontTrebuchetMS absolute-text" style="left: 3px; top: 3px; font-size: 12px;">${['One-Time', 'Repeatable', 'Continuous'][COL_CHALLENGES[i].type]} ${completionText}</span>
                    <span id="colChal${i}Num" class="whiteText fontTrebuchetMS absolute-text" style="right: 3px; top: 3px; font-size: 12px;">#${i + 1}</span>
                    <span id="colChal${i}Name" class="whiteText fontTrebuchetMS centered-text" style="top: 18px; font-size: 18px;"><b>${COL_CHALLENGES[i].name}</b></span>
                </div>
                <div class="colosseum-container colButtonDesc" style="height: 33.333%;">
                    <span id="colChal${i}Goal" class="whiteText fontTrebuchetMS flex-vertical" style="font-size: 12px; padding-top: 6px"><b>Goal: ${COL_CHALLENGES[i].goalDescription}</b></span>
                    <div id="colChal${i}Desc" class="whiteText fontTrebuchetMS flex-vertical alignCenter" style="font-size: 10px; padding: 6px">
                        ${COL_CHALLENGES[i].desc}
                    </div>
                </div>
                <div class="colosseum-container colButtonRew" style="height: 50%;">
                    <span id="colChal${i}RewLabel" class="whiteText fontTrebuchetMS flex-vertical" style="font-size: 12px; padding-top: 6px"><b> - REWARD - </b></span>
                    <div id="colChal${i}Rew" class="whiteText fontTrebuchetMS flex-vertical alignCenter" style="font-size: 10px; padding: 6px">
                        ${COL_CHALLENGES[i].rewardDesc}
                    </div>
                </div>
                <div id="colChal${i}SliderContainer" class="whiteText fontVerdana flex-vertical" style="padding: 0%; margin-left: -4px; margin-top: 4px; width: 240px; height: 45px; border: 4px solid #fff;">
                    <div class="colosseum-container" style="height: 40%">
                        <span class="absolute-text" style="left: 4px; top: 4px; font-size: 10px">Select Difficulty</span>
                        <span id="colChal${i}SliderDisplay" class="absolute-text" style="right: 4px; top: 4px; font-size: 10px"></span>
                    </div>
                    <div class="colosseum-container" style="height: 60%">
                        <div class="slidecontainer" style="position: absolute; left: 3%; width: 94%;">
                            <input id="colChal${i}Slider" class="slider colSlider" style="position: absolute; padding: 0px; margin: 0px; top: 6px;" type="range" min="0" max="${false ? new Decimal(player.gameProgress.colCompleted[i]).min(20).toNumber() : 20}" value="0"/>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
    html['colChalList'].innerHTML = txt;

    for (let i = 0; i < COL_CHALLENGES.length; i++) {
        toHTMLvar(`colChal${i}`);
        toHTMLvar(`colChal${i}Type`);
        toHTMLvar(`colChal${i}Num`);
        toHTMLvar(`colChal${i}Name`);
        toHTMLvar(`colChal${i}Goal`);
        toHTMLvar(`colChal${i}Desc`);
        toHTMLvar(`colChal${i}RewLabel`);
        toHTMLvar(`colChal${i}Rew`);
        toHTMLvar(`colChal${i}SliderContainer`);
        toHTMLvar(`colChal${i}SliderDisplay`);
        toHTMLvar(`colChal${i}Slider`);

        // see updateSaveFileListHTML for why i don't check here -- tl;dr these are children of colChal${i} and their event listeners get cleared if i set innerhtml
        html[`colChal${i}Slider`].addEventListener('input', () => updateColChallenges());

        (html[`colChal${i}Slider`] as HTMLInputElement).value = `${player.gameProgress.colDifficulty[i]}`;
    }
    
    updateColChallenges();
}

export const updateGame_Colosseum = (delta: Decimal) => {
    player.gameProgress.timeInCol = Decimal.max(player.gameProgress.timeInCol, 0).add(delta);

    tmp.game.baseColGain = Decimal.max(player.gameProgress.kua, 1);

    tmp.game.trueColGain = Decimal.max(player.gameProgress.colPower, 1).sub(1).div(10).exp().add(tmp.game.baseColGain).ln().mul(10).add(1).sub(player.gameProgress.colPower)
    player.gameProgress.colPower = Decimal.max(player.gameProgress.colPower, 1).sub(1).div(10).exp().add(tmp.game.baseColGain.mul(delta)).ln().mul(10).add(1)

    for (let i = 0; i < COL_CHALLENGES.length; i++) {

    }
}

export const updateHTML_Colosseum = () => {
    html['colosseumTabButton'].classList.toggle("hide", !hasKuaStaticUpg('shard', 1));
    html['colosseum'].classList.toggle("hide", tab.mainTab !== 7);
    if (tab.mainTab === 7) {
        html['kuaAmt3'].textContent = `${format(player.gameProgress.kua, 3)}`;
        html['kuaAmtGain'].textContent = `${format(tmp.game.kua.gain, 3)}`;
        html['colPowAmt'].textContent = `${format(player.gameProgress.colPower, 2)}`;
        html['colPowGain'].textContent = `${format(tmp.game.trueColGain, 2)}`;
        html['colTimer'].textContent = `${formatTime(player.gameProgress.colPower, 2)}`;
        for (let i = 0; i < COL_CHALLENGES.length; i++) {
            html[`colChal${i}`].classList.toggle("hide", !COL_CHALLENGES[i].show);
            if (checkIfSliderEligible(i)) {
                html[`colChal${i}SliderDisplay`].textContent = `${format(player.gameProgress.colDifficulty[i])} / ${format(Decimal.add(player.gameProgress.colCompleted[i], 1))}`
            }
        }
    }
}

export const updateColChallenges = () => {
    for (let i = 0; i < COL_CHALLENGES.length; i++) {
        player.gameProgress.colDifficulty[i] = new Decimal((html[`colChal${i}Slider`] as HTMLInputElement).value);

        html[`colChal${i}Goal`].innerHTML = `${COL_CHALLENGES[i].goalDescription}`;
        html[`colChal${i}Desc`].innerHTML = `${COL_CHALLENGES[i].desc}`;
        html[`colChal${i}Rew`].innerHTML = `${COL_CHALLENGES[i].rewardDesc}`;

        html[`colChal${i}SliderContainer`].classList.toggle("hide", !checkIfSliderEligible(i));
    }
}

export const checkIfSliderEligible = (id: number) => {
    if (COL_CHALLENGES[id].type !== 1) {
        return false;
    }
    if (Decimal.lt(player.gameProgress.colCompleted[id], 1)) {
        return false;
    }
    if (Decimal.gt(player.gameProgress.colCompleted[id], 20)) {
        return false;
    }
    return true;
}