import { MAIN_UPG_DATA } from "./features/mainBuyables";
import { STATIC_UPGRADES } from "./features/staticUpgrades";
import { D } from "./misc/calc";
import { Player } from "./variableTypes";


export const updatePlayerData = (player: Player): Player => {
    player.version = player.version || -1;
    if (player.version < 0) {
        player.version = 0;
    }
    if (player.version === 0) {
        player.gameProgress.staticUpgrades = [];
        for (let i = 0; i < STATIC_UPGRADES.length; i++) {
            if (player.gameProgress.staticUpgrades[i] === undefined) {
                player.gameProgress.staticUpgrades[i] = {
                    bought: D(0)
                }
            }
        }
        player.version = 1;
    }
    if (player.version === 1) {
        if (player.gameProgress.buyables === undefined) {
            player.gameProgress.buyables = [];
        }
        for (let i = 0; i < MAIN_UPG_DATA.length; i++) {
            if (player.gameProgress.buyables[i] === undefined) {
                player.gameProgress.buyables[i] = {
                    bought: D(0),
                    boughtInKua: D(0),
                    accumulated: D(0),
                    autobought: D(0),
                    auto: false
                }
            }
        }
        player.version = 2;
    }
    if (player.version === 2) {
        if (player.gameProgress.staticUpgrades === undefined) {
            player.gameProgress.staticUpgrades = [];
        }
        for (let i = 0; i < STATIC_UPGRADES.length; i++) {
            if (player.gameProgress.staticUpgrades[i] === undefined) {
                player.gameProgress.staticUpgrades[i] = {
                    bought: D(0)
                }
            }
        }
        player.version = 3;
    }
    if (player.version === 3) {
        player.gameProgress.kua = D(0);
        player.gameProgress.kuaAuto = false;
        player.gameProgress.timeInKua = D(0);
        player.gameProgress.kshard = D(0);
        player.gameProgress.kpower = D(0);
        player.gameProgress.kuaStaticUpgs = [0, 0, 0];
        player.gameProgress.kuaDynamicUpgs = [D(0), D(0), D(0)];
        player.version = 4;
    }
    if (player.version === 4) {
        player.settings.notation = {
            mixed: false,
            mixedLimit: 66,
            notationType: 0,
            notationLimit: 8,
        }
        player.version = 5;
    }
    if (player.version === 5) {
        player.settings.notation.mixed = true;
        player.version = 6;
    }
    if (player.version === 5) {
        player.gameProgress.prestigeEssence = D(0);
        player.gameProgress.kuaStaticUpgs = [0, 0, 0];
        player.gameProgress.kuaDynamicUpgs = [D(0), D(0), D(0)];
        player.version = 6;
    }
    if (player.version === 6) {

        // player.version = 7;
    }
    return player;
};