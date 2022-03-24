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
class Title {
    constructor(results, screen){
        this.results = results;
        this.screen = screen;

        let enterFullScreen = document.getElementsByClassName("enter-fullscreen")[0];
        let exitFullScreen = document.getElementsByClassName("exit-fullscreen")[0];
        enterFullScreen.addEventListener("click", this.enterFullScreen.bind(this));
        exitFullScreen.addEventListener("click", this.exitFullScreen.bind(this));

        let fullScreenChanged = function() {
            let isFullScreen = document.fullscreenElement;
            enterFullScreen.style.display = isFullScreen ? "none" : "initial";
            exitFullScreen.style.display = isFullScreen ? "initial" : "none";
        };

        document.addEventListener('fullscreenchange', fullScreenChanged, false);
        document.addEventListener('mozfullscreenchange', fullScreenChanged, false);
        document.addEventListener('MSFullscreenChange', fullScreenChanged, false);
        document.addEventListener('webkitfullscreenchange', fullScreenChanged, false);
    }

    enterFullScreen() {
        this.screen.enterFullScreen();
    }

    exitFullScreen() {
        this.screen.exitFullScreen();
    }

    update() {
        let title = "";

        if (this.results.correct) {
            if (title !== "") {
                title += " "
            }
            title += `👍 x ${this.results.correct}`;
        }
        if (this.results.incorrect) {
            if (title !== "") {
                title += " "
            }
            title += `👎 x ${this.results.incorrect}`;
        }
        if (this.results.skipped) {
            if (title !== "") {
                title += " "
            }
            title += `❔ x ${this.results.skipped}`;
        }

        if (title === "") {
            title = "Times tables";
        }

        document.getElementsByClassName("title")[0].innerHTML = title;
        return;
    }

    reset() {
        this.results.reset();
        this.update();
    }
}
