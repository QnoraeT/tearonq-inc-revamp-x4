import Decimal, { DecimalSource } from "break_eternity.js"

export type Game = {
    currentSave: number;
    autoSaveInterval: number;
    list: Array<{
        name: string;
        modes: Array<number>;
        data: Player;
    }>;
};

// * Everything in player has to be DecimalSource because saving to localStorage needs a string, and we'll get a string back, however, the Decimal variable can't really be made into a string without losing data
// * simplest way of accounting for 'Decimals that might turn into strings'
export type Player = {
    lastUpdated: number,
    totalRealTime: number,
    gameTime: DecimalSource,
    setTimeSpeed: DecimalSource,
    version: number,
    settings: {
        notation: {
            mixed: boolean,
            mixedLimit: number,
            notationType: number,
            notationLimit: number,
        }
    },
    gameProgress: {
        points: DecimalSource
        totalPointsInPRai: DecimalSource
        totalPointsInCol: DecimalSource
        buyables: Array<{
            bought: DecimalSource
            boughtInKua: DecimalSource
            accumulated: DecimalSource
            autobought: DecimalSource
            auto: boolean
        }>,
        staticUpgrades: Array<{
            bought: DecimalSource
        }>
        prai: DecimalSource
        praiAuto: boolean
        timeInPRai: DecimalSource
        prestigeExtract: DecimalSource
        pEBuyables: Array<{
            bought: DecimalSource
        }>
        pr2: DecimalSource
        pr2Auto: boolean
        timeInPR2: DecimalSource
        pr3: DecimalSource
        pr3Auto: boolean
        timeInPR3: DecimalSource
        kua: DecimalSource
        kuaAuto: boolean
        timeInKua: DecimalSource
        kshard: DecimalSource
        kpower: DecimalSource
        kuaStaticUpgs: Array<number> // like the old-style
        kuaDynamicUpgs: Array<DecimalSource> // the effects kinda work like exotic dimensions' yellow quarks
        colPower: DecimalSource
        colCompleted: Array<DecimalSource>
        colDifficulty: Array<DecimalSource>
        colChallenge: number | null
        timeInCol: DecimalSource
    }
}

export type Temp = {
    gameTimeSpeed: Decimal,
    inputSaveList: string,
    gameIsRunning: boolean,
    saveModes: Array<boolean>,
    achievementList: Array<Array<number>>
    offlineTime: {
        active: boolean,
        tickRemaining: number,
        tickMax: number,
        tickLength: number,
    },
    game: {
        inAnyChallenge: boolean,
        pointGen: Decimal,
        buyableCap: Decimal,
        buyables: Array<{
            cost: Decimal,
            scalingSpeed: Decimal,
            target: Decimal,
            eff: Decimal,
            effBase: Decimal,
            unlocked: boolean,
            autoUnlocked: boolean,
            autoBought: Decimal,
            autoSpeed: Decimal,
            canBuy: boolean
        }>,
        prai: {
            req: Decimal,
            gain: Decimal,
            exp: Decimal,
            next: Decimal,
            eff: Decimal,
            nextEff: Decimal
        }
        pr2Req: Decimal,
        pr3: {
            req: Decimal,
            target: Decimal,
            eff: Decimal
        },
        staticUpgCap: Decimal,
        staticUpgs: Array<{
            eff: Decimal
            cost: Decimal
            target: Decimal
            unlocked: boolean
            canBuy: boolean
        }>
        kua: {
            req: Decimal
            gain: Decimal
            upgEffs: Array<Decimal>
            next: Decimal
            eff: Decimal
            nextEff: Decimal
        }
        ks: {
            gain: Decimal
            dynEffs: Array<Decimal>
            dynCost: Decimal
            dynTarget: Decimal
        }
        kp: {
            gain: Decimal
            upgEffs: Array<Decimal>
            dynEffs: Array<Decimal>
            dynCost: Decimal
            dynTarget: Decimal
        }
        pEG: Decimal
        pEGP: Decimal // prai only
        pEGR: Decimal // after prai reset
        pEGPR: Decimal // prai only after prai reset
        pEEffect: Decimal
        pEBuyables: Array<{
            cost: Decimal
            canBuy: boolean
            target: Decimal
            eff1: Decimal
            eff2: Decimal
            nextEff1: Decimal
            nextEff2: Decimal
        }>
        baseColGain: Decimal
        trueColGain: Decimal
        colMaxTime: Decimal
    }
}

export type Tab = {
    mainTab: number
    disclaimerTab: number
    buyablesTab: number
    optionsTab: number
    optionsSaveTab: number
};

export type GameVars = {
    delta: number,
    gameLoadedFirst: boolean,
    trueDelta: number,
    lastFPSCheck: number,
    fpsList: Array<number>,
    tickList: Array<number>,
    lastSave: number,
    sessionTime: number,
    sessionStart: number,
    fps: number,
    tick: number,
    displayedFPS: string,
    displayedTick: string,
    warnings: {
        negativePPS: boolean
    }
    saveDisabled: boolean
};