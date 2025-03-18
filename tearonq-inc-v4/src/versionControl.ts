import { Player } from "./variableTypes";


export const updatePlayerData = (player: Player): Player => {
    player.version = player.version || -1;
    if (player.version < 0) {
        player.version = 0;
    }
    if (player.version === 0) {

        // player.version = 1;
    }
    return player;
};