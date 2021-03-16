// ==UserScript==
// @name         Steam Workshops Cleaner
// @namespace    https://github.com/ZeroDrako
// @version      1.2
// @description  Filter or Remove Steam mods by author or words.
// @author       ZeroDrako
// @match        https://steamcommunity.com/app/*/workshop/
// @match        https://steamcommunity.com/workshop/browse/?appid=*
// @icon         https://www.google.com/s2/favicons?domain=steamcommunity.com
// @grant        none
// ==/UserScript==


var FNMG_Stylesheet = document.createElement('style');
FNMG_Stylesheet.textContent = `
.FNMG_img {
    outline: 100px solid rgba(27, 40, 56, 0.85) !important;
    outline-offset: -100px;
}
.FNMG_img:hover {
    outline: 0px solid rgba(27, 40, 56, 0.85) !important;
    outline-offset: 0px;
}
`;
document.head.appendChild(FNMG_Stylesheet);

var words_list = ['test'];
var authors_list = ['123','1233','12121','Pixelmaker','966','711919','qq711919','mengxin','大象'];
var block_chinese = true;
var remove_mod = true;

function print(msg) {
    console.log(`[SWC] ${msg}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function FilterMod(listNodes) {
    console.log(`[SWC] Filtering ${listNodes.length} mods`);
    listNodes.forEach(newNode => {
        var mod_author = newNode.querySelectorAll('div.workshopItemAuthorName a')[0].innerText;
        var mod_name = newNode.querySelectorAll('div.workshopItemTitle')[0].innerText;

        if(block_chinese) {
            if(mod_author.match(/[\u3400-\u9FBF]/) || mod_name.match(/[\u3400-\u9FBF]/)) {
                ProcessMod(mod_name,mod_author,newNode);
                return;
            }
        }

        if(authors_list.indexOf(mod_author) != -1) {
            ProcessMod(mod_name,mod_author,newNode);
            return;
        }

        words_list.forEach(word => {
            if(mod_name.match(new RegExp( word, 'gi' ))) {
                ProcessMod(mod_name,mod_author,newNode);
                return;
            }
        });
    });

}

function ProcessMod(mod_name, mod_author, node) {
    console.log(`[SWC] Removed "${mod_name}" by "${mod_author}"`);
    if(remove_mod) {
        node.remove();
    } else {
        node.querySelector("img.workshopItemPreviewImage ").classList.add("FNMG_img");
    }

}

function FilterAllMods(dom_object) {
    var list_mods = dom_object.querySelectorAll('div.workshopBrowseItems div.workshopItem');
    FilterMod(list_mods);
}

(async function () {
    await sleep(4000);
    console.log("[SWC] Starting...");
    FilterAllMods(document);
})();
