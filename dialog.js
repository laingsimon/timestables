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

        $(".tables .numbers").on("click", "input", this.updateTableOption.bind(this))
        $(".chose-tables").click(this.showDialog.bind(this));
        $(".dialog-start").click(this.start.bind(this));
        $(".dialog-close").click(this.closeDialog.bind(this));
    }

    updateTableOption(event) {
        let currentTarget = event.currentTarget;

        let number = $(currentTarget).val();
        if ($(currentTarget).prop("checked")){
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
        let tables = $(".tables");
        let sums = $(".sums");
        let choseTables = $(".chose-tables");

        $(".show-correct-answer input").prop("checked", this.settings.showCorrectAnswer);
        $(".show-fullscreen input").prop("checked", this.settings.showFullScreen);
        $(".multiplication input").prop("checked", this.settings.multiplication);
        $(".division input").prop("checked", this.settings.division);
        $(".show-time input").prop("checked", this.settings.showTime);
        tables.show();
        sums.hide();
        choseTables.hide();
        $(".dialog-close").toggle(this.sums.count() >= 1);
    }

    closeDialog() {
        let tables = $(".tables");
        let sums = $(".sums");
        let choseTables = $(".chose-tables");

        if (!Object.keys(this.settings.timesTables).length) {
            alert("You must select at least one number");
            return;
        }

        choseTables.show();
        sums.show();
        tables.hide();
        this.settings.showCorrectAnswer = $(".show-correct-answer input").prop("checked");
        this.settings.showFullScreen = $(".show-fullscreen input").prop("checked");
        this.settings.multiplication = $(".multiplication input").prop("checked");
        this.settings.division = $(".division input").prop("checked");
        this.settings.showTime = $(".show-time input").prop("checked");
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

        $(".chose-tables").html("⚙ " + chosenTables);
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