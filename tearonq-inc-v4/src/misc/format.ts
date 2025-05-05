import Decimal, { type DecimalSource } from "break_eternity.js";
import { D } from "./calc";
import { player } from "../loadSave";

const abbSuffixes: Array<Array<string>> = [
    ["", "K",  "M",  "B",  "T",  "Qa", "Qi", "Sx", "Sp", "Oc", "No"],
    ["", "Dc", "Vg", "Tg", "Qe", "Qt", "Se", "St", "Og", "Ng"],
    ["", "U",  "D",  "T",  "Qa", "Qi", "Sx", "Sp", "Oc", "No"],
    ["", "Ce", "Dn", "Tn", "qn", "Qn", "sn", "Sn", "On", "Nn"],
    ["", "Mi", "Mc", "undefined x3", "undefined x4", "undefined x5", "undefined x6", "undefined x7", "undefined x8", "undefined x9", "undefined x10"]
]
const letter: Array<string> = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

const timeList = [
    { name: "pt",  stop: true,  amt: 5.39e-44 },
    { name: "qs",  stop: true,  amt: 1 / 1e30 },
    { name: "rs",  stop: true,  amt: 1 / 1e27 },
    { name: "ys",  stop: true,  amt: 1 / 1e24 },
    { name: "zs",  stop: true,  amt: 1 / 1e21 },
    { name: "as",  stop: true,  amt: 1 / 1e18 },
    { name: "fs",  stop: true,  amt: 1 / 1e15 },
    { name: "ps",  stop: true,  amt: 1 / 1e12 },
    { name: "ns",  stop: true,  amt: 1 / 1e9 },
    { name: "µs",  stop: true,  amt: 1 / 1e6 },
    { name: "ms",  stop: true,  amt: 1 / 1e3 },
    { name: "s",   stop: true,  amt: 1 },
    { name: "m",   stop: false, amt: 60 },
    { name: "h",   stop: false, amt: 3600 },
    { name: "d",   stop: false, amt: 86400 },
    { name: "mo",  stop: false, amt: 2592000 },
    { name: "y",   stop: false, amt: 3.1536e7 },
    { name: "mil", stop: false, amt: 3.1536e10 },
    { name: "uni", stop: false, amt: 4.320432e17 }
];

const abbExp = D(1e66);

function numberWithCommas(x: string): string {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function formatLetter(remainingLogNumber: DecimalSource, string = ``): string {
    if (Decimal.gte(remainingLogNumber, 1e12)) {
        console.error(
            `formatLetter is taking in numbers greater than ee12! This *will* freeze the game!`
        );
        return ``;
    }
    if (Decimal.lt(remainingLogNumber, letter.length)) {
        return `${letter[new Decimal(remainingLogNumber).toNumber()]}${string}`;
    }
    return formatLetter(
        Decimal.div(remainingLogNumber, letter.length).sub(1).floor(),
        `${letter[new Decimal(remainingLogNumber).mod(letter.length).toNumber()]}${string}`
    );
}

function formatStandard(number: DecimalSource, aboveE33 = false): string {
    if (Decimal.lt(number, 1)) {
        return ``;
    }
    const exp = Decimal.log(number, 1e3).sub(1).mul(1.00000000001).floor();
    if (Decimal.lt(exp, 10) && !aboveE33) {
        return `${abbSuffixes[0][exp.add(1).toNumber()]}`;
    } else if (Decimal.lt(exp, 100)) {
        return `${abbSuffixes[2][exp.mod(10).toNumber()]}${abbSuffixes[1][exp.div(10).floor().toNumber()]}`;
    } else if (Decimal.lt(exp, 1000)) {
        return `${abbSuffixes[2][exp.mod(10).toNumber()]}${abbSuffixes[1][exp.div(10).mod(10).floor().toNumber()]}${abbSuffixes[3][exp.div(100).floor().toNumber()]}`;
    } else {
        const factor = exp.log(1000).mul(1.00000000001).floor().mul(3).pow10();
        const newExp = exp.div(factor);
        return `${formatStandard(newExp.mul(3).pow10(), true)}${abbSuffixes[4][exp.log(1000).mul(1.0000000001).floor().toNumber()]}-${formatStandard(exp.sub(newExp.floor().mul(factor)).add(1).mul(3).pow10(), true)}`;
    }
}

export const format = (number: DecimalSource, dec = 0, expdec = 3, notation = player.settings.notation.notationType, mixedToggle = true): string => {
    if (number === undefined) { return `undefined` }
    if (Decimal.lt(number, 0)) { return `-${format(Decimal.negate(number), dec, expdec)}`; }
    if (Decimal.eq(number, 0)) { return (0).toFixed(dec); }
    if (Decimal.isNaN(number)) { return "NaN"; }
    if (!Decimal.isFinite(number)) { return "Infinity"; }
    try {
        if (notation !== 4 && player.settings.notation.mixed && mixedToggle && Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit).pow10())) {
            if (Decimal.gte(number, Decimal.pow10(player.settings.notation.notationLimit)) && Decimal.lt(number, Decimal.pow10(player.settings.notation.mixedLimit))) {
                const abb = Decimal.log10(number).mul(0.3333333336666665).floor();
                return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${formatStandard(number)}`;
            }
            return format(number, dec, expdec, notation, false);
        }
        switch (notation) {
            case 0: // sci
                if (Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit).neg().pow10())) {
                    return `e${format(Decimal.log10(number), 0, expdec)}`;
                } else if (Decimal.lt(number, 0.1 ** dec * 0.499999999)) {
                    const exp = Decimal.log10(number).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit))) {
                    return numberWithCommas(new Decimal(number).toNumber().toFixed(dec));
                } else if (Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit).pow10())) {
                    const exp = Decimal.log10(number).mul(1.0000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, "10^^7")) {
                    return `e${format(Decimal.log10(number), dec, expdec)}`;
                } else {
                    return `F${format(Decimal.slog(number), Math.max(dec, 3), expdec)}`;
                }
            case 4:
                if (Decimal.gte(number, 1e3) && Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit).pow10())) {
                    const abb = Decimal.log10(number).mul(0.3333333336666665).floor();
                    return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${formatLetter(abb.sub(1), "")}`;
                }
                return format(number, dec, expdec, 0);
            default:
                console.error(typeof notation)
                throw new Error(`${player.settings.notation.notationType} is not a valid notation index!`);
        }
    } catch(e) {
        console.warn(
            `There was an error trying to get player.settings.notation.notationType! Falling back to Mixed Scientific...\n\nIf you have an object that has an item that uses format() without it being a get or function, this will occurr on load!`
        );
        console.warn(e);
        if (Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit).neg().pow10())) {
            return `e${format(Decimal.log10(number), 0, expdec)}`;
        } else if (Decimal.lt(number, 0.001)) {
            const exp = Decimal.log10(number).floor();
            return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
        } else if (Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit))) {
            return numberWithCommas(new Decimal(number).toNumber().toFixed(dec));
        } else if (Decimal.lt(number, abbExp)) {
            const abb = Decimal.log10(number).mul(0.33333333336666665).floor();
            return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${abbSuffixes[abb.toNumber()]}`;
        } else if (Decimal.lt(number, Decimal.pow10(player.settings.notation.notationLimit).pow10())) {
            const exp = Decimal.log10(number).mul(1.00000000001).floor();
            return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
        } else if (Decimal.lt(number, "10^^7")) {
            return `e${format(Decimal.log10(number), dec, expdec)}`;
        } else {
            return `F${format(Decimal.slog(number), Math.max(dec, 3), expdec)}`;
        }
    }
};

export const formatPerc = (number: DecimalSource, dec = 3, expdec = 3): string => {
    if (Decimal.gte(number, 1000)) {
        return `${format(number, dec, expdec)}x`;
    } else {
        return `${format(Decimal.sub(100, Decimal.div(100, number)), dec, expdec)}%`;
    }
};

export const formatTime = (number: DecimalSource, dec = 0, expdec = 3, limit = 2): string => {
    if (Decimal.lt(number, 0)) return `-${formatTime(Decimal.negate(number), dec, expdec)}`;
    if (Decimal.eq(number, 0)) return `${(0).toFixed(dec)}s`;
    if (Decimal.isNaN(number)) return "NaN";
    if (!Decimal.isFinite(number)) return "Infinity";
    let lim = 0;
    let str = "";
    let end = false;
    let prevNumber;
    for (let i = timeList.length - 1; i >= 0; i--) {
        if (lim >= limit) {
            break;
        }
        if (Decimal.gte(number, timeList[i].amt)) {
            end = lim + 1 >= limit || timeList[i].stop;
            prevNumber = Decimal.div(number, timeList[i].amt);
            str = `${str} ${format(prevNumber.sub(end ? 0 : 0.5), end ? dec : 0, expdec)}${timeList[i].name}`;
            number = Decimal.sub(number, prevNumber.floor().mul(timeList[i].amt));
            lim++;
            if (timeList[i].stop || prevNumber.gte(Decimal.pow10(player.settings.notation.notationLimit))) {
                break;
            }
        } else {
            if (i === 0) {
                return `${str} ${format(number, dec, expdec)}s`.slice(1);
            }
        }
    }
    return str.slice(1);
};