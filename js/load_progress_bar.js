(function() {
    'use strict';

    var inserted = 0;
    var loaded   = 0;
    var last_pct = 1;
    var last_ts  = 0;
    var finished = false;
    var setup_done = false;
    var css = null;

    // load settings
    var settings;
    browser.storage.local.get({
        color: "#FF0000",
        width: "2",
        place: "top",
        smooth: "yes"
    }).then((item) => {
        if (css != null) {
            setupCss(item)
        } else {
            settings = item
        }
    }, onError);

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

    function setupCss(settings) {
        setup_done = true;
        let color = hexToRgbA(settings.color);
        let transition = ((settings.smooth == "yes") ? "right 0.5s linear, " : "");
        css.appendChild(document.createTextNode(`
            html:before {
                background: ${color};
                transition: ${transition} opacity 0.85s ease-out;
                position: fixed;
                content: "";
                z-index: 2147483647;
                ${settings.place}: 0;
                left: 0;
                height: ${settings.width}px;
            }
        `));
    }

    function updateProgress() {
        if (document.body != null && !finished) {
            if (css == null) {
                css = document.createElement('style');
                css.type = 'text/css';
                css.appendChild(document.createTextNode(`
                    html:before {
                        right: 99%;
                    }
                `));
                document.body.appendChild(css);
            }
            if (settings != null && !setup_done) {
                setupCss(settings);
            }

            const pct = 100 - (inserted - loaded) * 100 / inserted;
            const ts = Date.now()
            if (pct <= 100 && pct > last_pct && ts >= last_ts + 250) {
                last_pct = pct;
                last_ts = ts;
                const space = 100 - pct;
                css.firstChild.replaceWith(document.createTextNode(`
                    html:before {
                        right: ${space}%;
                    }
                `));
            }
        }
    }

    function onLoadHandler(node) {
        loaded++;
        updateProgress()
        if (!finished && node.self == node && css != null) { // i.e. the window is loaded
            finished = true;
            css.firstChild.replaceWith(document.createTextNode(`
                html:before {
                    right: 0;
                }
            `));
            setTimeout(function() {
                css.firstChild.replaceWith(document.createTextNode(`
                    html:before {
                        right: 0;
                        opacity: 0;
                    }
                `));
                setTimeout(function() { css.remove() }, 850);
            }, 250);
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
