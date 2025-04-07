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
        prestigeEssence: DecimalSource
        pr2: DecimalSource
        pr2Auto: boolean
        timeInPR2: DecimalSource
        kua: DecimalSource
        kuaAuto: boolean
        timeInKua: DecimalSource
        kshard: DecimalSource
        kpower: DecimalSource
        kuaStaticUpgs: Array<number> // like the old-style
        kuaDynamicUpgs: Array<DecimalSource> // the effects kinda work like exotic dimensions' yellow quarks
        colPower: DecimalSource
        colCompleted: Array<DecimalSource>
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
            target: Decimal,
            effect: Decimal,
            effectBase: Decimal,
            unlocked: boolean,
            autoUnlocked: boolean,
            canBuy: boolean
        }>,
        praiReq: Decimal,
        praiGain: Decimal,
        praiExp: Decimal,
        praiNext: Decimal,
        praiEffect: Decimal,
        praiNextEffect: Decimal,
        pr2Req: Decimal,
        pr2Effect: Decimal,
        staticUpgradeCap: Decimal,
        staticUpgrades: Array<{
            effect: Decimal
            cost: Decimal
            target: Decimal
            unlocked: boolean
            canBuy: boolean
        }>
        kuaReq: Decimal
        kuaGain: Decimal
        kuaNext: Decimal
        ksGain: Decimal
        kpGain: Decimal
        kpupgEffs: Array<Decimal>
        kuupgEffs: Array<Decimal>
        ksDynamicCost: Decimal
        kpDynamicCost: Decimal
        ksDynamicTarget: Decimal
        kpDynamicTarget: Decimal
    }
}

export type Tab = {
    mainTab: number
    optionsTab: number
    optionsSaveTab: number
};

export type GameVars = {
    delta: number,
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