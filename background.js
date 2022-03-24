/*
Copyright (C) 2022 Simon Laing (https://github.com/laingsimon/timestables)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
class Background {
    constructor(random) {
        this.interval = null;
        this.random = random;
    }

    start(delay) {
        this.delay = delay || this.delay;
        let handler = this.updateBackgrounds.bind(this);

        this.stop();
        this.interval = window.setInterval(handler, delay);
        handler();
    }

    stop() {
        if (this.interval) {
            window.clearInterval(this.interval);
        }
    }

    updateBackgrounds() {
        let updateBackground = this.updateBackground.bind(this);

        let backgrounds = document.getElementsByClassName("background");
        for (let index = 0; index < backgrounds.length; index++) {
            let element = backgrounds[index];
            if (element.closest("#templates") != null) {
                return;
            }

            updateBackground(element);
        }
    }

    updateBackground(element) {
        let backgroundFixed = element.getAttribute("data-background-fixed");
        if (backgroundFixed === "null") {
            backgroundFixed = null;
        }

        if (backgroundFixed) {
            return;
        }

        let backgroundOnce = element.getAttribute("data-background-once");
        if (backgroundOnce === "null") {
            backgroundOnce = null;
        }
        let width = 60;
        let height = 30;
        let content = this.getContent(width, height);

        let charWidth = 40;
        let lineHeight = 80;

        let svg = `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='${height * lineHeight}px' width='${((width * 2) - 1) * charWidth}px'>
                     <style>
                       div {
                         color: #ffffff;
                         opacity: 0.2;
                         font-size: 80px;
                         font-family: Monospace;
                         white-space: nowrap;
                         overflow: clip;

                         transform: rotate(40deg);
                         transform-origin: center;
                       }
                     </style>
                     <foreignObject height='100%' width='100%'><div xmlns="http://www.w3.org/1999/xhtml">${content}</div></foreignObject>
                   </svg>`;
        let encodedSvg = btoa(svg);

        element.style.backgroundImage = `url("data:image/svg+xml;base64,${encodedSvg}")`;
        element.setAttribute("data-background-fixed", backgroundOnce);
    }

    getContent(width, height) {
        let content = "";

        for (let line = 0; line < height; line++) {
            content += `${this.getLine(width)}<br />`;
        }

        return content;
    }

    getLine(width) {
        let selection = [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "x", "=" ];
        let content = "";

        for (let index = 0; index < width; index++) {
            let selectionIndex = this.random.between(0, selection.length - 1);
            let character = selection[selectionIndex];
            if (content !== "") {
                content += " ";
            }

            content += character;
        }

        return content;
    }
}