import { COL_CHALLENGES } from "./features/colosseum";
import { PRESTIGE_EXTRACT_BUYABLES as PEXT_BUYABLES } from "./features/extract";
import { MAIN_BUYABLE_DATA } from "./features/mainBuyables";
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
        for (let i = 0; i < MAIN_BUYABLE_DATA.length; i++) {
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
        player.gameProgress.prestigeExtract = D(0);
        player.gameProgress.kuaStaticUpgs = [0, 0, 0];
        player.gameProgress.kuaDynamicUpgs = [D(0), D(0), D(0)];
        player.version = 6;
    }
    if (player.version === 6) {
        player.gameProgress.prestigeExtract = D(0);
        player.version = 7;
    }
    if (player.version === 7) {
        player.gameProgress.totalPointsInCol = D(0);
        player.version = 8;
    }
    if (player.version === 8) {
        player.gameProgress.colDifficulty = [];
        player.version = 9;
    }
    if (player.version === 9) {
        player.gameProgress.colPower = D(0);
        player.version = 10;
    }
    if (player.version === 10) {
        player.gameProgress.colPower = D(0);
        player.version = 11;
    }
    if (player.version === 11) {
        player.gameProgress.pr3 = D(0);
        player.gameProgress.pr3Auto = false;
        player.gameProgress.timeInPR3 = D(0);
        player.version = 12;
    }
    if (player.version === 12) {
        player.gameProgress.pEBuyables = [];
        player.version = 13;
    }
    if (player.version === 13) {
        player.version = 14;
    }
    if (player.version === 14) {

        // player.version = 15;
    }
    if (player.version === 15) {

        // player.version = 16;
    }

    // dynamic fixes
    for (let i = 0; i < MAIN_BUYABLE_DATA.length; i++) {
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
    for (let i = 0; i < STATIC_UPGRADES.length; i++) {
        if (player.gameProgress.staticUpgrades[i] === undefined) {
            player.gameProgress.staticUpgrades[i] = {
                bought: D(0)
            }
        }
    }
    for (let i = 0; i < PEXT_BUYABLES.length; i++) {
        if (player.gameProgress.pEBuyables[i] === undefined) {
            player.gameProgress.pEBuyables[i] = {
                bought: D(0)
            }
        }
    }
    for (let i = 0; i < COL_CHALLENGES.length; i++) {
        if (player.gameProgress.colCompleted[i] === undefined) {
            player.gameProgress.colCompleted[i] = D(0);
        }
        if (player.gameProgress.colDifficulty[i] === undefined) {
            player.gameProgress.colDifficulty[i] = D(0);
        }
    }

    return player;
};