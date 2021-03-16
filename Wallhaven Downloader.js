// ==UserScript==
// @name         Wallhaven Downloader
// @version      0.8
// @namespace    WallhavenDownloader
// @description  Add Download Button to wallhaven "Thumbs"
// @author        ZeroDrako
// @include      http://wallhaven.cc/*
// @include      https://wallhaven.cc/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
// @icon         https://wallhaven.cc/favicon.ico
// ==/UserScript==
/* globals $ */
/* global saveAs*/

console.log("[WHD] Starting...");

var continueScroll = true;
var automatic = false;
var homePage = window.location.href;
var listImages = [], totImages = 0, datainfo = [];
var partialImages = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

String.prototype.allReplace = function(obj) {
    var retStr = this;
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

function decodeURLRecursively(url) {
    if (url.indexOf('%') !== -1) {
        return decodeURLRecursively(decodeURIComponent(url));
    }
    if (url.indexOf('+') !== -1) {
        return decodeURLRecursively(url.replace("+", " "));
    }
    return url;
}

function downloadImage(){
    console.log("[WHD] Downloading one image.");
    var idDiv = (this.id).replace('WHD_','');
    var source = $('#'+idDiv+' > img')[0].src;
    var extension = "";
    try {
        extension = $('#'+idDiv+' > div.thumb-info > span')[1].getAttribute("class");
    }
    catch(Exception) {
        extension = "";
    }
    source = source.allReplace({"th.":"w." , "/small/":"/full/"});
    source = source.splice(source.lastIndexOf("/")+1, 0, "wallhaven-")
    if(extension != "") {
        source = source.replace(/\.\w{3,4}$/,"."+extension);
    }
    var name = decodeURLRecursively(source.split("/").pop());
    console.log("[WHD] Downloading image from: "+ source);
    GM_download({
        url: source,
        name: name,
        onreadystatechange: function(res) {
            if (res.readyState === 4 && res.status === 404) {
                console.log("[WHD] Error (HTTP 404 Not Found) downloading file: " + source);
            }
            if (res.readyState === 4 && res.status === 200) {
                console.log("[WHD] File Saved");
            }
            console.log(res);
        },
        onprogress: function(res) {
            //console.log(res);
        },
        onerror: function(res) {
            console.log("[WHD] Unknown Error: " + res);
        }
    });
}

async function downloadAllImages() {
    console.log("[WHD] Downloading all images this tab");
    await sleep(1000);
    var pages = $('section.thumb-listing-page header h2 span');
    var totalpages = $('#thumbs section.thumb-listing-page');
    var inipag = 1, finpag = 1, index = 1;
    var totalimg = $('figure.thumb').length;
    var jdownloadercrawljob = "[";
    var fileName = (document.title).allReplace({'Wallpaper Search: #':'', ' - wallhaven.cc':''});
    //if (typeof pages !== 'undefined') {
    var pageslength = pages.length, totalpageslength = totalpages.length;
    if(pageslength !== 0) {
        if (pageslength !== totalpageslength) {
            inipag = totalpageslength - pageslength;
            finpag = totalpageslength;
        } else {
            inipag = (pages[0].innerHTML);
            finpag = (pages[pageslength-1].innerHTML);
        }
    }
    console.log("[WHD] Pages from " + inipag + " to " +finpag);
    console.log("[WHD] Generating crawljob file");
    var info = "File Name:\t\t" + fileName + ".crawljob\n"
               + "Home Page:\t\t" + homePage + "\n"
               + "Start Page:\t\t" + inipag + "\n"
               + "Final Page:\t\t" + finpag + "\n"
               + "Total Images:\t" + totalimg;
    $('figure.thumb').each(async function(){
        var idDiv = (this.id).replace('WHD_','');
        var source = $('img',this)[0].getAttribute("data-src");
        var extension = "";
        try {
            extension = $('#'+idDiv+' > div.thumb-info > span')[1].getAttribute("class");
        }
        catch(Exception) {
            extension = "";
        }
        source = source.allReplace({"th.":"w." , "/small/":"/full/"});
        source = source.splice(source.lastIndexOf("/")+1, 0, "wallhaven-");
        if(extension != "") {
            source = source.replace(/\.\w{3,4}$/,"."+extension);
        }
        var name = decodeURLRecursively(source.split("/").pop());
        console.log("[WHD] Adding file: " + name);
        jdownloadercrawljob += '{'+
            '"overwritePackagizerEnabled" : true,'+
            '"addOfflineLink" : true,'+
            '"filename" : "'+name+'",'+
            '"text" : "'+source+'",'+
            '"packageName" : "'+fileName+'",'+
            '"deepAnalyseEnabled" : false,'+
            '"setBeforePackagizerEnabled" : false'+
            '}';
        if(index < totalimg)
        {
            jdownloadercrawljob += ",";
        }
        index++;
    });
    jdownloadercrawljob += "]";
    console.log("[WHD] Saving crawljob file");
    var blobCrawjob = new Blob([jdownloadercrawljob], {type: "text/plain;charset=utf-8"});
    saveAs(blobCrawjob, fileName + ".crawljob");
    console.log("[WHD] Saving Info file");
    var blobInfo = new Blob([info], {type: "text/plain;charset=utf-8"});
    saveAs(blobInfo, fileName + ".info.txt");
    console.log("[WHD] Done!");
}

function downloadAllPages() {
    var baseURL = (homePage.replace(/(\&page=(\d)+)$/,'')) + "&page=";
    datainfo.push(baseURL);
    var fileName = (document.title).allReplace({'Wallpaper Search: #':'', ' - wallhaven.cc':''});
    datainfo.push(fileName);
    console.log("[WHD] Downloading all Images from all Pages for: "+fileName);
    var aux = 1 , numPages = 1;
    console.log("[WHD] Getting number of pages...");
    var request = new GM_xmlhttpRequest({
        url: baseURL + 2,
        method: "GET",
        responseType: 'text',
        synchronous: true,
        onreadystatechange: function(res) {
            if (res.readyState === 4 && res.status === 404) {
                console.log('Fail at \'downloadAllPages > GM_xmlhttpRequest\' >>> ' + baseURL + 2);
                return;
            }
            if (res.readyState === 4 && res.status === 200) {
                var parser = new DOMParser();
                var dom = parser.parseFromString(res.responseText, "text/html");
                totImages = String(($('#main header h1', dom)[0].innerHTML).match(/\d+,?\d+/));
                console.log(totImages);
                totImages = parseInt(totImages.replace(",",""));
                if ($("section.thumb-listing-page header h2", dom).length !== 0) {
                    var numPages = 1;
                    var h2 = $("section.thumb-listing-page header h2", dom)[0].innerHTML;
                    numPages = parseInt(h2.substring(h2.lastIndexOf('/')+1));
                }
                if ( (typeof(numPages) === "undefined") || (numPages < 1)) {
                    numPages = 1;
                }
                console.log("[WHD] Number fo pages:\t" + numPages);
                console.log("[WHD] Number of Images:\t" + totImages);
                datainfo.push(numPages);
                for (var inx = 1; inx <= numPages; inx++ )
                {
                    getAllImagesFromPages(baseURL + inx);
                }
                waitingForImages();
            }
        }
    });
}

function getAllImagesFromPages(source) {
    console.log("[WHD] Donwloading data from page: " + source);
    //await sleep(1000);
    GM_xmlhttpRequest({
        url: source,
        method: "GET",
        responseType: 'text',
        timeout: 200000,
        onabort: function(res)
        {
            console.log("Abort:" + res);
        },
        ontimeout: function(res)
        {
            console.log("TimeOut:" + res);
        },
        onerror: function(res)
        {
            console.log("Error:" + res);
        },
        onreadystatechange: function(res) {
            if (res.readyState === 4 && res.status === 404) {
                console.log('Fail at \'downloadAllPages > GM_xmlhttpRequest\' >>> ' + source);
                return;
            }
            if (res.readyState === 4 && res.status === 200) {
                var parser = new DOMParser();
                var dom = parser.parseFromString(res.responseText, "text/html");
                partialImages = 0;
                $('#thumbs section.thumb-listing-page figure', dom).each(function(){
                    var figure = this;
                    var imageUrl = $('img',figure)[0].getAttribute('data-src');
                    var extension = "";
                    try {
                        extension = $('div.thumb-info span span',figure)[0].innerHTML
                    }
                    catch(Exception) {
                        extension = "";
                    }
                    var tmpurl = imageUrl.allReplace({"th.":"w." , "/small/":"/full/"});
                    var imgLink = tmpurl = tmpurl.splice(tmpurl.lastIndexOf("/")+1, 0, "wallhaven-");
                    if(extension != "") {
                        imgLink = imgLink.replace(/\.\w{3,4}$/,"."+extension.toLowerCase());
                    }
                    var name = decodeURLRecursively(imageUrl.split("/").pop());
                    listImages.push([name,imgLink]);
                    partialImages++;
                });
                console.log("[WHD] Adding " + partialImages +" images from:: " +source);
            }
        }
    });
}

async function waitingForImages() {
    console.log("[WHD] Waiting to find all the images on pages...");
    while(true){
        await sleep(1000);
        if(listImages.length === totImages) {
           console.log("[WHD] All the images found");
            DonwloadAllPagesImages();
           break;
        }
    }
}

function DonwloadAllPagesImages() {
    console.log("[WHD] Creating crawlhob file");
    var index = 1, jdownloadercrawljob = "[";
    var totImages = listImages.length;
    var info = "File Name:\t\t" + datainfo[1] + ".crawljob\n"
               + "Home Page:\t\t" + (datainfo[0]).replace('&page=','') + "\n"
               + "Start Page:\t\t" + 1 + "\n"
               + "Final Page:\t\t" + datainfo[2] + "\n"
               + "Total Images:\t" + totImages;
    listImages.forEach(function(element){
        //console.log(aux + "\t" + element[0] + "\t" + element[1]);
        jdownloadercrawljob += '{'+
            '"overwritePackagizerEnabled" : true,'+
            '"addOfflineLink" : true,'+
            '"filename" : "'+element[0]+'",'+
            '"text" : "'+element[1]+'",'+
            '"packageName" : "'+datainfo[1]+'",'+
            '"deepAnalyseEnabled" : false,'+
            '"setBeforePackagizerEnabled" : false'+
            '}';
        if(index < totImages)
        {
            jdownloadercrawljob += ",";
        }
        index++;
    });
    jdownloadercrawljob += "]";
    console.log("[WHD] Donwloading crawljob file");
    var blobCrawjob = new Blob([jdownloadercrawljob], {type: "text/plain;charset=utf-8"});
    saveAs(blobCrawjob, datainfo[1] + ".crawljob");
    console.log("[WHD] Donwloading Info file");
    var blobInfo = new Blob([info], {type: "text/plain;charset=utf-8"});
    saveAs(blobInfo, datainfo[1] + ".info.txt");
    console.log("[WHD] Done!");
}

function addFoundImages(newPageToSearch) {
    $('#thumbs section.thumb-listing-page img',newPageToSearch).each(function(){
        listImages.push(this.getAttribute('data-src'));
    });
}

function mutationEvent() {
    var obs = new MutationObserver(function(mutations, observer) {
        for (var i = 0; i < mutations.length; ++i) {
            for (var j = 0; j < mutations[i].addedNodes.length; ++j) {
                var nodeSearch = mutations[i].addedNodes[j];
                var className = nodeSearch.getAttribute('class');
                if(className.indexOf("thumb-listing-page") !== -1) {
                    addDownloadIcon(nodeSearch);
                }
            }
        }
    });
    obs.observe(($('#thumbs')[0]), {
        childList: true
    });
}

function addDownloadIcon(nodeSearch) {
    $('figure.thumb',nodeSearch).each(function(){
        var nodeWorking = this;
        var this_id = nodeWorking.getAttribute("data-wallpaper-id");
        var a_element = document.createElement("a");
        this.setAttribute('id',this_id);
        a_element.setAttribute('id', 'WHD_' + this_id);
        a_element.setAttribute('class' , 'thumb-btn');
        a_element.setAttribute('title', 'Download Image');
        a_element.setAttribute('style','right: 20.20em;background-color: #5595ff;cursor:pointer;');
        a_element.innerHTML = '<i class="fas fa-fw fa-download"></i>';
        a_element.addEventListener('click', downloadImage);
        if(this.childElementCount > 1) {
            var chilnode = nodeWorking.childNodes[1];
            nodeWorking.insertBefore(a_element, chilnode );
        } else {
            nodeWorking.appendChild(a_element);
        }
    });
}

async function ScrollEndDownload() {
    //automatic = true;
    var doclHeigh = document.body.scrollHeight, count = 1;
    while(continueScroll)
    {
        await sleep(500);
        window.scrollTo(0,document.body.scrollHeight);
        if ($("footer.pagination-notice").length !== 0) {
            continueScroll = false;
            downloadAllImages();
            return;
        }
        if(doclHeigh === document.body.scrollHeight) {
            if(count > 3) {
                continueScroll = false;
                downloadAllImages();
                return;
            }
            count++;
        }
    }
}

function addDownloadAllIcon() {
    //var titleBar = $('#searchbar');
    var downAll = document.createElement("span");
    downAll.setAttribute('class','userpanel-buttons');
    downAll.setAttribute('id','WHD_ALL_'+this.id);
    downAll.setAttribute('style','cursor:pointer;');
    downAll.innerHTML = '<a class="userpanel-dropdown-toggle notifications-toggle extended"><i class="fas fa-fw fa-download"></i></a></span>';
    //downAll.addEventListener('click', askToScroll);
    downAll.addEventListener('mouseover', function(){$('#WHD_ALL_PANEL')[0].setAttribute('class','userpanel-dropdown extended')});
    //downAll.addEventListener('mouseout', function(){$('#WHD_ALL_PANEL')[0].setAttribute('class','userpanel-dropdown expanded')});
    var panelAll = document.createElement("aside")
    panelAll.setAttribute('class','userpanel-dropdown collapsed');
    panelAll.setAttribute('id','WHD_ALL_PANEL');
    panelAll.setAttribute('style','right: 12.80px;width: 13em;height: 12.5em;');
    panelAll.innerHTML = '<div class="dropdown-header"><h4>Downloads</h4></div>';
    var dropdownbody = document.createElement("div");
    dropdownbody.setAttribute('class','dropdown-body');
    dropdownbody.setAttribute('style','height: 155px;');
    var dropdowncontentA = document.createElement("div");
    dropdowncontentA.setAttribute('class','dropdown-content');
    dropdowncontentA.setAttribute('style','cursor:pointer;');
    dropdowncontentA.innerHTML = '<span class="userpanel-buttons" id="WHD_ALL_THISPAGE"><a class="userpanel-dropdown-toggle notifications-toggle extended"><i class="fas fa-fw fa-download"><label style="padding-left: 20px;cursor:pointer;">Download this Page</label></i></a></span>';
    dropdowncontentA.addEventListener('click', downloadAllImages);
    var dropdowncontentB = document.createElement("div");
    dropdowncontentB.setAttribute('class','dropdown-content');
    dropdowncontentB.setAttribute('style','cursor:pointer;');
    dropdowncontentB.innerHTML = '<span class="userpanel-buttons" id="WHD_ALL_ALLPAGES"><a class="userpanel-dropdown-toggle notifications-toggle extended"><i class="fas fa-fw fa-download"><label style="padding-left: 20px;cursor:pointer;">Download All Pages</label></i></a></span>';
    dropdowncontentB.addEventListener('click', downloadAllPages);
    var dropdowncontentC = document.createElement("div");
    dropdowncontentC.setAttribute('class','dropdown-content');
    dropdowncontentC.setAttribute('style','cursor:pointer;');
    dropdowncontentC.innerHTML = '<span class="userpanel-buttons" id="WHD_ALL_SCROLL"><a class="userpanel-dropdown-toggle notifications-toggle extended"><i class="fas fa-fw fa-download"><label style="padding-left: 20px;cursor:pointer;">Scroll & Download All</label></i></a></span>';
    dropdowncontentC.addEventListener('click', ScrollEndDownload);
/*
    var dropdownfooter = document.createElement("div");
    dropdownfooter.setAttribute('class','dropdown-footer');
    dropdownfooter.innerHTML = '<a>wallhaven.cc</a>';
*/
    dropdownbody.appendChild(dropdowncontentA);
    dropdownbody.appendChild(dropdowncontentB);
    dropdownbody.appendChild(dropdowncontentC);
    panelAll.appendChild(dropdownbody);
    $('#userpanel')[0].appendChild(downAll);
    $('#userpanel')[0].appendChild(panelAll);
    $(document).on('click','body *',function(){$('#WHD_ALL_PANEL')[0].setAttribute('class','userpanel-dropdown collapsed')});
}

function master() {
    /*
    var styleSheet = document.createElement("link");
    styleSheet.id = "4chanDownloaderStyle";
    styleSheet.rel = "stylesheet";
    styleSheet.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
    document.head.appendChild(styleSheet);
    */
    addDownloadAllIcon();
    addDownloadIcon();
    mutationEvent();
}

master();
