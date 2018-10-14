(function() {
    'use strict';

    var inserted = 0;
    var loaded   = 0;
    var last_pct = 0;
    var last_ts  = Date.now();
    var css = null;

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
    var width = "2";
    var place = "top";

    browser.storage.local.get("color").then((item) => color = hexToRgbA(item.color || "#FF0000"), onError);
    browser.storage.local.get("width").then((item) => width = item.width || "2", onError);
    browser.storage.local.get("place").then((item) => place = item.place || "top", onError);

    function updateProgress() {
        if (document.body != null) {
            if (css == null) {
                css = document.createElement('style');
                css.type = 'text/css';
                css.appendChild(document.createTextNode(`
                    html:before {
                        background: linear-gradient(90deg, ${color}, ${color} 1%, rgba(0,0,0,0) 1%, rgba(0,0,0,0));
                    }
                `));
                if (place == "top") {
                    css.appendChild(document.createTextNode(`
                        html:before {
                            position: fixed;
                            content: "";
                            z-index: 2147483647;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: ${width}px;
                        }
                    `));
                } else if (place == "bottom"){
                    css.appendChild(document.createTextNode(`
                        html:before {
                            position: fixed;
                            content: "";
                            z-index: 2147483647;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: ${width}px;
                        }
                    `));
                } else {
                    console.log(`Unexpected place: ${place}`);
                }
                document.body.appendChild(css);
            }
            const pct = 100 - (inserted - loaded) * 100 / inserted;
            const ts = Date.now()
            if (pct < 100 && pct > last_pct && ts > last_ts + 50) {
                last_pct = pct;
                last_ts = ts;
                css.firstChild.replaceWith(document.createTextNode(`
                    html:before {
                        background: linear-gradient(90deg, ${color}, ${color} ${pct}%, rgba(0,0,0,0) ${pct}%, rgba(0,0,0,0));
                    }
                `));
            }
        }
    }

    function onLoadHandler(node) {
        loaded++;
        updateProgress()
        if (node.self == node && css != null) { // i.e. the window is loaded
            css.firstChild.replaceWith(document.createTextNode(`
                html:before {
                    background: linear-gradient(90deg, ${color}, ${color} 100%, rgba(0,0,0,0) 100%, rgba(0,0,0,0));
                    transition: opacity 0.85s ease-out;
                    opacity: 0;
                }
            `));
            setTimeout(function() { css.remove() }, 850);
        }
    }

    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName == "BODY") {
                    inserted++;
                    node.addEventListener( "load", () => onLoadHandler(node), listenerCfg);
                    updateProgress();
                } else if (((node.nodeName == "SCRIPT" ||
                            node.nodeName == "VIDEO"  || node.nodeName == "IMG"    ||
                            node.nodeName == "IFRAME" || node.nodeName == "FRAME") && node.src != "" ) ||
                            (node.nodeName == "LINK" && node.rel == "stylesheet" && window.matchMedia(node.media))
                ) {
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
