import Decimal from "break_eternity.js";

export class EffectCache {
    func: Function
    cached: boolean
    cachedEffect: Decimal | null
    constructor(func: Function) {
        this.func = func;
        this.cached = false;
        this.cachedEffect = null;
    }

    getEffect() {
        if (this.cached) {
            return this.cachedEffect;
        }
        let eff = this.func();
        this.cachedEffect = eff;
        this.cached = true;
        return eff;
    }

    invalidateCache() {
        this.cached = false;
        this.cachedEffect = null;
    }
}