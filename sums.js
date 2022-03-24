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
class Sums{
    constructor(settings, templates, title, results, random, background){
        this.settings = settings;
        this.currentSum = null;
        this.templates = templates;
        this.random = random;
        this.title = title;
        this.results = results;
        this.background = background;

        $(".sums").on("keypress", "input", this.processAnswer.bind(this));
        $(".sums").on("click", ".answer", this.showAnswer.bind(this));
    }

    nextSum(){
        let sum = this.getNextSum();
        this.currentSum = sum;
        this.startTime = this.startTime || new Date();
        this.sumStart = new Date();
        let sumElement = this.templates.addSum(sum);
        this.background.updateBackground($(sumElement));
    }

    replaceFirstSum() {
        if (this.currentSum != null) {
            let firstExistingSum = $(".sums .sum")[0];
            $(firstExistingSum).remove();
            this.currentSum = null;
        }

        this.nextSum();
    }

    getNextSum() {
        let mode = this.getRandomMode();
        let filterOption = this.random.between(1, 2);
        let first = this.random.between(2, 12, filterOption == 1 ? this.settings.timesTables : null);
        let second = this.random.between(2, 12, filterOption == 2 ? this.settings.timesTables : null);
        let bigger = first >= second ? first : second;
        let smaller = first < second ? first : second;

        switch (mode) {
            case "?×n=n":
                return {
                    operator: "×",
                    first: null,
                    second: second,
                    equals: first * second,
                    answer: first,
                };
            case "n×?=n":
                return {
                    operator: "×",
                    first: first,
                    second: null,
                    equals: first * second,
                    answer: second,
                };
            case "n×n=?":
                return {
                    operator: "×",
                    first: first,
                    second: second,
                    equals: null,
                    answer: first * second,
                };


            case "?÷n=n":
                return {
                    operator: "÷",
                    first: null,
                    second: smaller,
                    equals: bigger,
                    answer: bigger * smaller,
                };
            case "n÷?=n":
                return {
                    operator: "÷",
                    first: bigger * smaller,
                    second: null,
                    equals: bigger,
                    answer: smaller,
                };
            case "n÷n=?":
                return {
                    operator: "÷",
                    first: bigger * smaller,
                    second: smaller,
                    equals: null,
                    answer: bigger,
                };
        }
    }

    getRandomMode() {
        let range = {
            min: this.settings.multiplication ? 1 : 4,
            max: this.settings.division ? 6 : 3
        };

        let mode = this.random.between(range.min, range.max, null);
        switch (mode){
            case 1: return "?×n=n";
            case 2: return "n×?=n";
            case 3: return "n×n=?";

            case 4: return "?÷n=n";
            case 5: return "n÷?=n";
            case 6: return "n÷n=?";
        }
    }

    processAnswer(event) {
        if (event.keyCode !== 13) {
            return;
        }

        let eventTarget = event.currentTarget;
        let answer = $(eventTarget).val();

        if (!answer) {
            return;
        }

        let sum = $(eventTarget).closest(".sum");
        sum.find("input").each(function(){
            $(eventTarget).prop("disabled", true);
        });

        if (this.settings.showTime) {
            let currentTime = new Date();
            let durationMs = currentTime.valueOf() - this.sumStart.valueOf();
            let decimalPlaces = 2;
            let roundingFactor = Math.pow(10, decimalPlaces - 1);
            let durationSeconds = Math.round((durationMs / 1000) * roundingFactor) / roundingFactor;

            sum.find(".duration").text(durationSeconds + "s");
        }

        if (answer == this.currentSum.answer) {
            sum.addClass("correct");
            sum.find(".answer").html(this.getRandomCorrectSymbol());
            this.results.correct++;
        } else {
            sum.addClass("incorrect");
            sum.find(".answer").html(this.getRandomIncorrectSymbol());
            sum.find(".correct-answer").html("Correct answer is " + this.currentSum.answer);
            if (this.settings.showCorrectAnswer) {
                sum.find(".correct-answer").show();
            }
            this.results.incorrect++;
        }
        sum.addClass("complete");

        this.title.update();
        this.nextSum();

        new CompletedAnimation(sum.find(".answer")[0]).start();
    }

    getRandomCorrectSymbol(){
        let codes = [ '&#x1f603;', '&#x1f607;', '&#x1f609;', '&#x1f60d;' ];
        let random = this.random.between(0, codes.length - 1);
        return codes[random];
    }

    getRandomIncorrectSymbol() {
        let codes = [ '&#x1f615;', '&#x1f612;', '&#x1f61f;' ];
        let random = this.random.between(0, codes.length - 1);
        return codes[random];
    }

    showAnswer(event){
        let eventTarget = event.currentTarget;
        let answer = $(eventTarget);
        let sum = answer.closest(".sum");

        if (sum.hasClass("complete")){
            return;
        }

        answer.html("");
        answer.removeClass("dont-know");
        let theAnswer = this.currentSum.answer;
        sum.addClass("skipped");
        sum.addClass("complete");
        sum.find("input").each(function() {
            $(this).prop("disabled", true);
            if (!$(this).prop("readonly")) {
                $(this).val(theAnswer);
            }
        });

        this.results.skipped++;
        this.title.update();
        this.nextSum();
    }

    clear() {
        $(".sums .sum").each(function() { $(this).remove(); });
        this.startTime = null;
    }

    count() {
        return $(".sums .sum").length;
    }
}
