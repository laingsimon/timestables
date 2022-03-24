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
class Screen {
    constructor() {
        this.isFullScreen = false;

        let fullScreenChanged = function() {
            this.isFullScreen = document.fullscreenElement;
        };

        document.addEventListener('fullscreenchange', fullScreenChanged, false);
        document.addEventListener('mozfullscreenchange', fullScreenChanged, false);
        document.addEventListener('MSFullscreenChange', fullScreenChanged, false);
        document.addEventListener('webkitfullscreenchange', fullScreenChanged, false);
    }

    enterFullScreen() {
        let doc = window.document;
        let docEl = doc.documentElement;

        let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

        requestFullScreen.call(docEl);
    }

    exitFullScreen() {
        if (!this.isFullScreen) {
            return;
        }

        let doc = window.document;

        let cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        cancelFullScreen.call(doc);
    }
}