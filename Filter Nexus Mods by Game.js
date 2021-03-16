// ==UserScript==
// @name         Filter Nexus Mods by Game
// @namespace    https://github.com/ZeroDrako
// @version      1.2
// @description  Filter the mods in nexus page by keywords
// @author       ZeroDrako
// @match        https://www.nexusmods.com/search/*
// @match        https://www.nexusmods.com/mods/*
// @match        https://www.nexusmods.com/*/search/*
// @match        https://www.nexusmods.com/*/mods/*
// @icon         
// @grant        none
// ==/UserScript==

var remove_mod = true;
var FNMG_Stylesheet = document.createElement('style');
FNMG_Stylesheet.textContent = `
.FNMG_img {
    outline: 100px solid rgba(218, 142, 53, 0.75) !important;
    outline-offset: -100px;
}
.FNMG_img:hover {
    outline-offset: unset !important;
}
`;
document.head.appendChild(FNMG_Stylesheet);

var black_list = ["Skyrim", "Skyrim Special Edition", "Fallout 4", "Fallout New Vegas", "Cyberpunk 2077", "The Witcher 3", "The Sims 4", "Stardew Valley", "Resident Evil Resistance"]

function print(msg) {
    console.log(`[FNMG] ${msg}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function MutationEvent() {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(newNode => {
                    if(newNode.nodeType === 1) {
                        if( newNode.getAttribute('id') === 'mod-list') {
                            console.log("[FNMG] Filtering new page...");
                            FilterAllMods(newNode);
                        }
                    }
                });
            }
        });
    });

    observer.observe(document, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
    });
}

function FilterMod(listNodes) {
    console.log(`[FNMG] Filtering ${listNodes.length} mods`);
    listNodes.forEach(newNode => {
        var game_name = newNode.querySelectorAll('div.category a')[0].innerText;
        var mod_category = newNode.querySelectorAll('div.category a')[1].innerText;
        var mod_name = newNode.querySelector('p.tile-name a').innerText;
        if (black_list.indexOf(game_name) != -1) {
            console.log(`[FNMG] Match "${mod_name}" by game name "${game_name}"`)
            if(remove_mod) {
              newNode.remove();
            }
            else {
                newNode.querySelector("img.fore").classList.add("FNMG_img");
            }
        } else if (black_list.indexOf(mod_category) != -1) {
            console.log(`[FNMG] Match "${mod_name}" by category "${mod_category}"`)
            if(remove_mod) {
                newNode.remove();
            }
            else {
                newNode.querySelector("img.fore").classList.add("FNMG_img");
            }
        }
    });

}

function FilterAllMods(dom_object) {
    var list_mods = dom_object.querySelectorAll('#mod-list ul.tiles li.mod-tile');
    FilterMod(list_mods);
}

(async function () {
    await sleep(4000);
    console.log("[FNMG] Starting...");
    FilterAllMods(document);
    try {
        MutationEvent();
    } catch (e) {
        console.log("[FNMG] Error on MutationEvent");
        console.log(`FNMG] ${e}`);
    }
})();
