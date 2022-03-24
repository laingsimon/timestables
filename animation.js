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
class CompletedAnimation {
    constructor(element) {
        this.html = $(element).html();
        this.tick = 1;
        this.handle = null;
        this.maxTicks = 0;
        this.ghostElement = null;
        this.element = element;
        this.fontSize = Number.parseInt($(element).css("font-size").replace(/px/g, ""));
        this.increasePerTick = 1;

        let rect = this.element.getClientRects()[0];
        this.referenceRect = {
            centreY: rect.top + (rect.height / 2),
            centreX: rect.left + (rect.width / 2)
        };
    }

    start(durationSeconds, delayBetweenUpdates, maxFontSize) {
        durationSeconds = durationSeconds || 0.5;
        delayBetweenUpdates = delayBetweenUpdates || 5;
        maxFontSize = maxFontSize || 150;

        let ticksPerSecond = 1000 / delayBetweenUpdates;
        this.maxTicks = 1 + (ticksPerSecond * durationSeconds);
        this.increasePerTick = (maxFontSize - this.fontSize) / this.maxTicks;

        this.addGhostElement();
        this.handle = window.setInterval(this.animate.bind(this), delayBetweenUpdates);
        this.animate();
    }

    stop() {
        if (this.handle) {
            window.clearInterval(this.handle);
            this.handle = null;
        }

        this.removeGhostElement();
    }

    animate() {
        this.tick++;

        if (this.tick > this.maxTicks || this.ghostElement == null) {
            this.stop();
            return;
        }

        let opacityPercent = 1 - (this.tick / this.maxTicks);

        $(this.ghostElement).css("font-size", this.fontSize + (this.increasePerTick * this.tick) + "px");
        $(this.ghostElement).css("opacity", opacityPercent);
        $(this.ghostElement).show();

        let ghostRect = this.ghostElement.getClientRects()[0];

        $(this.ghostElement).css("top", this.referenceRect.centreY - (ghostRect.width / 2));
        $(this.ghostElement).css("left", this.referenceRect.centreX - (ghostRect.height / 2));
    }

    addGhostElement() {
        let element = document.createElement("div");
        element.setAttribute("class", "answer-animation");
        element.innerHTML = this.html;
        document.body.appendChild(element);

        this.ghostElement = element;
    }

    removeGhostElement() {
        if (this.ghostElement) {
            $(this.ghostElement).remove();
            this.ghostElement = null;
        }
    }
}