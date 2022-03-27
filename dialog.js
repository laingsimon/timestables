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
class OptionsDialog {
    constructor(settings, sums, title, screen) {
        this.settings = settings;
        this.sums = sums;
        this.title = title;
        this.screen = screen;

        let onClick = function(event) {
            if (event.target.tagName !== "INPUT") {
                return;
            }

            this.updateTableOption({
                currentTarget: event.target
            });
        };

        let tablesElement = document.getElementsByClassName("tables")[0];
        let numbersElement = tablesElement.getElementsByClassName("numbers")[0];
        numbersElement.addEventListener("click", onClick.bind(this));

        document.getElementsByClassName("chose-tables")[0].addEventListener("click", this.showDialog.bind(this));
        document.getElementsByClassName("dialog-start")[0].addEventListener("click", this.start.bind(this));
        document.getElementsByClassName("dialog-close")[0].addEventListener("click", this.closeDialog.bind(this));
    }

    updateTableOption(event) {
        let currentTarget = event.currentTarget;

        let number = currentTarget.value;
        if (currentTarget.checked){
            this.settings.timesTables[number] = true;
        } else {
            delete this.settings.timesTables[number];
        }
    }

    start() {
        this.sums.clear();
        this.title.reset();
        this.closeDialog();
    }

    showDialog() {
        this.setChecked("show-correct-answer", this.settings.showCorrectAnswer);
        this.setChecked("show-fullscreen", this.settings.showFullScreen);
        this.setChecked("multiplication", this.settings.multiplication);
        this.setChecked("division", this.settings.division);
        this.setChecked("show-time", this.settings.showTime);
        this.setChecked("disable-animation", this.settings.disableAnimation);

        document.getElementsByClassName("tables")[0].style.display = "initial";
        document.getElementsByClassName("sums")[0].style.display = "none";
        document.getElementsByClassName("chose-tables")[0].style.display = "none";

        document.getElementsByClassName("dialog-close")[0].style.display = this.sums.count() >= 1
         ? "initial"
         : "none";
    }

    closeDialog() {
        if (!Object.keys(this.settings.timesTables).length) {
            alert("You must select at least one number");
            return;
        }

        document.getElementsByClassName("chose-tables")[0].style.display = "initial";
        document.getElementsByClassName("sums")[0].style.display = "initial";
        document.getElementsByClassName("tables")[0].style.display = "none";
        this.settings.showCorrectAnswer = this.isChecked("show-correct-answer");
        this.settings.showFullScreen = this.isChecked("show-fullscreen");
        this.settings.multiplication = this.isChecked("multiplication");
        this.settings.division = this.isChecked("division");
        this.settings.showTime = this.isChecked("show-time");
        this.settings.disableAnimation = this.isChecked("disable-animation");
        this.settings.save();
        this.updateTableChoserText();
        this.sums.replaceFirstSum();
        if (this.settings.showFullScreen) {
            this.screen.enterFullScreen();
            this.title.update();
        } else {
            this.screen.exitFullScreen();
        }
    }

    setChecked(labelClassName, setting) {
        let label = document.getElementsByClassName(labelClassName)[0];
        let input = label.getElementsByTagName("input")[0];
        input.checked = setting;
    }

    isChecked(labelClassName) {
        let label = document.getElementsByClassName(labelClassName)[0];
        let input = label.getElementsByTagName("input")[0];
        return input.checked;
    }

    updateTableChoserText() {
        let chosenTables = "";

        let selectedTimesTables = Object.keys(this.settings.timesTables);
        this.shortenSelectedTables(selectedTimesTables).forEach(function(range) {
            if (chosenTables) {
                chosenTables += range.last ? " & " : ", ";
            }

            if (range.from == range.to) {
                chosenTables += `${range.from}`;
            } else {
                chosenTables += `${range.from}...${range.to}`;
            }
        });

        document.getElementsByClassName("chose-tables")[0].innerHTML = "⚙ " + chosenTables;
    }

    shortenSelectedTables(selectedTables) {
        let numberRange = null;

        let numbers = [];
        for (let index = 0; index < selectedTables.length; index++){
            let currentNumber = Number.parseInt(selectedTables[index]);
            if (numberRange && currentNumber == numberRange.to + 1) {
                numberRange.to = currentNumber;
                continue;
            }
            if (numberRange) {
                numbers.push(numberRange);
            }

            numberRange = {
                from: currentNumber,
                to: currentNumber
            };
        }

        if (numberRange) {
            numberRange.last = true;
            numbers.push(numberRange);
        }

        return numbers;
    }
}