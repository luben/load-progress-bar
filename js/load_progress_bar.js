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
        isRainbow: false,
        rainbow_size: 3.0,
        width: "2",
        opacity: "0.75",
        place: "top",
        smooth: "no"
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
        let isRainbow = settings.isRainbow;
        let rainbow_size = settings.rainbow_size;
        let opacity = settings.opacity;
        let transition = ((settings.smooth == "yes") ? "right 0.5s linear, " : "");

        let cssStyles =
        `
        html:before {
            background: ${color};
            opacity: ${opacity};
            transition: ${transition} opacity 0.85s ease-out;
            position: fixed;
            content: "";
            z-index: 2147483647;
            ${settings.place}: 0;
            left: 0;
            height: ${settings.width}px;
        `;
        if(isRainbow){
            cssStyles +=
            `
                background: linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3, #f30059, #ff2400);
                background-size: ${rainbow_size*100}% ${rainbow_size*100}%;

                -webkit-animation: rainbow 18s ease infinite;
                -z-animation: rainbow 18s ease infinite;
                -o-animation: rainbow 18s ease infinite;
                  animation: rainbow 18s ease infinite;}

                @-webkit-keyframes rainbow {
                    0%{background-position:0% 82%}
                    50%{background-position:100% 19%}
                    100%{background-position:0% 82%}
                }
                @-moz-keyframes rainbow {
                    0%{background-position:0% 82%}
                    50%{background-position:100% 19%}
                    100%{background-position:0% 82%}
                }
                @-o-keyframes rainbow {
                    0%{background-position:0% 82%}
                    50%{background-position:100% 19%}
                    100%{background-position:0% 82%}
                }
                @keyframes rainbow {
                    0%{background-position:0% 82%}
                    50%{background-position:100% 19%}
                    100%{background-position:0% 82%}
                }
            `;
        }
        cssStyles += `}`;
        css.appendChild(document.createTextNode(cssStyles));
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
            observer.disconnect();
            css.firstChild.replaceWith(document.createTextNode(`
                html:before {
                    right: 0;
                }
            `));
            setTimeout(function() {
                css.firstChild.replaceWith(document.createTextNode(`
                    html:before {
                        right: 0;
                        opacity: 0 !important;
                    }
                `));
                setTimeout(function() {
                    css.firstChild.replaceWith(document.createTextNode(`
                        html:before {
                            z-index: -2147483646;
                        }`)
                    )}, 850);
            }, 150);
        }
    }

})();
