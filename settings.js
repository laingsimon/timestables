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

class Settings {
    constructor(){
        this.reload();
    }

    save(){
        window.localStorage.setItem("settings", JSON.stringify(this.settings));
    }

    reload(){
        let json = window.localStorage.getItem("settings");
        this.settings = json ? JSON.parse(json) : this.getDefaultSettings();
    }

    getDefaultSettings(){
        return {
            timesTables: {
                2: true, 3: true, 4: true, 5: true,
                6: true, 7: true, 8: true, 9: true,
                10: true, 11: true, 12: true
            },
            showCorrectAnswer: true,
            fullscreen: true,
            multiplication: true,
            division: false,
            showTime: true,
            checkForUpdates: true
        };
    }

    get timesTables(){
        return this.settings.timesTables;
    }

    get showCorrectAnswer(){
        return this.settings.showCorrectAnswer;
    }

    set showCorrectAnswer(value) {
        this.settings.showCorrectAnswer = value;
    }

    get showFullScreen() {
        return this.settings.showFullScreen;
    }

    set showFullScreen(value) {
        this.settings.showFullScreen = value;
    }

    get division() {
        return this.settings.division;
    }

    set division(value) {
        this.settings.division = value;
    }

    get multiplication() {
        return this.settings.multiplication;
    }

    set multiplication(value) {
        this.settings.multiplication = value;
    }

    get showTime(){
        return this.settings.showTime;
    }

    set showTime(value) {
        this.settings.showTime = value;
    }

    get disableAnimation(){
        return this.settings.disableAnimation;
    }

    set disableAnimation(value) {
        this.settings.disableAnimation = value;
    }

    get checkForUpdates(){
        return this.settings.checkForUpdates;
    }

    set checkForUpdates(value) {
        this.settings.checkForUpdates = value;
    }
}
