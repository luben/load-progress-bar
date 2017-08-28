(function() {
    'use strict';

    var inserted = 0;
    var loaded   = 0;

    const listenerCfg = {"once": true, "capture": true, "passive": true};

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    function hexToRgbA(hex){
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length == 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= "0x" + c.join("");
            return "rgba("+[(c>>16)&255, (c>>8)&255, c&255].join(",")+",1)";
        }
        return "rgba(255,0,0,1)";
    }

    var color = "rgba(255,0,0,1)";
    var width = "1";
    let getColor = browser.storage.local.get("color").then((item) => color = hexToRgbA(item.color || "#FF0000"), onError);
    let getWidth = browser.storage.local.get("width").then((item) => width = item.width || "1", onError);

    function updateProgress() {
        if (document.body != null) {
            const pct = 100 - (inserted - loaded) * 100 / inserted;
            if (pct <= 100) {
                const gradient = `linear-gradient(90deg, ${color}, ${color} ${pct}%, rgba(0,0,0,0) ${pct}%, rgba(0,0,0,0))`;
                document.body.style.borderImageSource = gradient;
            }
        }
    }

    function onLoadHandler(node) {
        loaded++;
        updateProgress()
        if (node.self == node) { // i.e. it's window
            document.body.style.borderTopWidth = "0";
        }
    }

    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName == "BODY") {
                    inserted++;
                    node.addEventListener( "load", () => onLoadHandler(node), listenerCfg);
                    node.style.borderImageSlice = "1";
                    node.style.borderTopStyle = "solid";
                    node.style.borderTopWidth = `${width}px`;
                    updateProgress();
                } else if ((node.nodeName == "SCRIPT" ||
                            node.nodeName == "VIDEO"  || node.nodeName == "IMG"    ||
                            node.nodeName == "IFRAME" || node.nodeName == "FRAME") && node.src != "" ) {
                    inserted++;
                    node.addEventListener( "error",   () => onLoadHandler(node), listenerCfg);
                    node.addEventListener( "abort",   () => onLoadHandler(node), listenerCfg);
                    node.addEventListener( "load",    () => onLoadHandler(node), listenerCfg);
                    updateProgress();
                } else if (node.nodeName == "LINK" && node.rel == "stylesheet" && window.matchMedia(node.media)) {
                    inserted++;
                    node.addEventListener( "error",   () => onLoadHandler(node), listenerCfg);
                    node.addEventListener( "abort",   () => onLoadHandler(node), listenerCfg);
                    node.addEventListener( "load",    () => onLoadHandler(node), listenerCfg);
                    updateProgress();
                }
            });
        });
    });
    window.addEventListener( "load", () => onLoadHandler(window), listenerCfg);
    observer.observe(document, {childList: true, subtree: true});
})();
