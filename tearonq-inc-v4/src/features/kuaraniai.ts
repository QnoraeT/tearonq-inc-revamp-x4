import Decimal from "break_eternity.js";
import { html, tab, toHTMLvar } from "../main";
import { player } from "../loadSave";
import { format } from "../misc/format";

export const intiHTML_Kuaraniai = () => {
    toHTMLvar('praiAmt4');
}

export const updateGame_Kuaraniai = (delta: Decimal) => {
    delta
}

export const updateHTML_Kuaraniai = () => {
    html['kuaraniaiTabButton'].classList.toggle("hide", Decimal.lt(player.gameProgress.pr2, 6));
    html['kuaraniai'].classList.toggle("hide", tab.mainTab !== 5);
    if (tab.mainTab === 5) {
        html['praiAmt4'].textContent = `${format(player.gameProgress.prai)}`

    }
}