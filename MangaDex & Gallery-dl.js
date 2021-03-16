// ==UserScript==
// @name         MangaDex & Gallery-dl
// @version      1.2
// @description  A easy way to create command to use in gallery-dl
// @icon         https://mangadex.org/images/misc/navbar.svg
// @author       ZeroDrako
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @run-at       document-end
// @match        https://mangadex.org/title/*
// @compatible   firefox
// @compatible   chrome
// ==/UserScript==

GM_addStyle("#jdownload_all_icon:before{content: '\\f019';} .jdl1:before{content: '\\f019'; cursor:pointer;} .jdl2:before{content: '\\f019';cursor:default !important;} .jdl2:hover{color:#999 !important;} .gallery-dl_input{background-color:#fff !important; border-color:#dee2e6 !important; border-style:solid !important; border-width:1px !important; width:50px !important; text-align: center !important; color:#000 !important; height: 24px !important; margin-bottom:6px !important;} .gallery-dl_input_groups{background-color:#fff!important;border-color:#dee2e6!important;border-style:solid!important;border-width:1px!important;width:350px!important;text-align:center!important;color:#000!important;height:24px!important;margin-bottom:6px!important}");

function gallery_all()
{
    var gall_from = 0
    var gall_to = 99999
    var gall_gr = ""
    var to_clipboard = "gallery-dl --chapter-filter "
    var main_url = (window.location.href).match(/http.+\/title\/\d+/gi,'')
    var language = document.getElementById("gallery_dl_language").value

    if(document.getElementById("gallery_dl_from").value != "")
    {
        gall_from = document.getElementById("gallery_dl_from").value
    }

    if(document.getElementById("gallery_dl_to").value != "")
    {
        gall_to = document.getElementById("gallery_dl_to").value
    }

    if(document.getElementById("gallery_dl_group").value != ""){
        gall_gr = document.getElementById("gallery_dl_group").value
    }

    to_clipboard += "\"lang == '" + language + "'"

    if(document.getElementById("gallery_dl_from").value != "" || document.getElementById("gallery_dl_to").value !== "")
    {
        to_clipboard += " and " + gall_from + " <= chapter < " + gall_to
    }
    to_clipboard += "\""
    if(gall_gr != "") {
        to_clipboard += "  --filter \"group == ["
        var groups = gall_gr.split('|')
        var size = groups.length
        for (let index = 0; index < size; index++) {
            var g = groups[index].trim()
            var h = g.replaceAll(/[\\"']/g, "\\$&")
            to_clipboard += "'" + h + "'"
            if(index+1 < size)
            {
                to_clipboard += ","
            }
        }
    to_clipboard += "]\""
    }
    to_clipboard += " \"" + main_url + "\""
    GM_setClipboard(to_clipboard)
}

document.getElementById("upload_button").insertAdjacentHTML( 'beforebegin', '<button style="margin-right:3px;" id="gallery-dl" class="btn btn-secondary"><span id="jdownload_all_icon" class="fa-fw fas"></span>&nbsp;<span id="gallery-dl_text">Copy</span></button> From: <input id="gallery_dl_from" class="gallery-dl_input" type="text"></input> To: <input id="gallery_dl_to" class="gallery-dl_input" type="text"></input> Language: <input id="gallery_dl_language" class="gallery-dl_input" type="text" value="en"></input></input> Group: <input id="gallery_dl_group" class="gallery-dl_input_groups" type="text" value=""></input><br>' );
document.getElementById("gallery-dl").addEventListener("click", gallery_all)

