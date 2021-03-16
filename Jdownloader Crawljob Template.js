// ==UserScript==
// @name         Jdownloader Crawljob Template
// @version      0.1
// @match        http://*/*
// @grant        none
// ==/UserScript==


[
    {
        "downloadFolder" : null,(null|"String")
        "chunks" : 0,(int)
        "overwritePackagizerEnabled" : true, (true|false)
        "extractAfterDownload" : "UNSET",(null,"UNSET","TRUE","FALSE")
        "priority" : null, (null,"HIGHEST","HIGHER","HIGH","DEFAULT","LOW","LOWER","LOWEST")
        "type" : "NORMAL", ("NORMAL")
        "enabled" : null,(null,"UNSET","TRUE","FALSE")
        "autoStart" : "UNSET",(null,"UNSET","TRUE","FALSE")
        "forcedStart" : "UNSET",(null,"UNSET","TRUE","FALSE")
        "addOfflineLink" : true,(true|false)
        "extractPasswords" : null,(null,["pw1","pw2"])
        "downloadPassword" : null,(null|"String")
        "filename" : null,(null|"String")
        "autoConfirm" : "UNSET", (null,"UNSET","TRUE","FALSE")
        "comment" : null,(null|"String")
        "text" : null,(null|"String")
        "packageName" : null, (null|"String")
        "deepAnalyseEnabled" : false,(true|false)
        "setBeforePackagizerEnabled" : false(true|false)
    }
]
