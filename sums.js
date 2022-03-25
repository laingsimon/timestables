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

        let onKeyPress = function(event) {
            // input only
            if (event.target.tagName !== "INPUT") {
                return;
            }

            this.processAnswer({
                keyCode: event.keyCode,
                currentTarget: event.target
            });
        }

        let onClick = function(event) {
            //.answer only
            if (event.target.className.indexOf("answer") === -1) {
                return;
            }

            this.showAnswer({
                currentTarget: event.target
            });
        }

        let sumsElement = document.getElementsByClassName("sums")[0];
        sumsElement.addEventListener("keypress", onKeyPress.bind(this));
        sumsElement.addEventListener("click", onClick.bind(this));
    }

    nextSum(){
        let sum = this.getNextSum();
        this.currentSum = sum;
        this.startTime = this.startTime || new Date();
        this.sumStart = new Date();
        let sumElement = this.templates.addSum(sum);
        this.background.updateBackground(sumElement);
    }

    replaceFirstSum() {
        if (this.currentSum != null) {
            let firstExistingSum = this.sumElements()[0];
            if (firstExistingSum) {
                firstExistingSum.remove();
            }
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
        let answer = eventTarget.value;

        if (!answer) {
            return;
        }

        let sum = eventTarget.closest(".sum");
        this.sumInputs(sum).forEach(input => { input.disabled = true });

        if (this.settings.showTime) {
            let currentTime = new Date();
            let durationMs = currentTime.valueOf() - this.sumStart.valueOf();
            let decimalPlaces = 2;
            let roundingFactor = Math.pow(10, decimalPlaces - 1);
            let durationSeconds = Math.round((durationMs / 1000) * roundingFactor) / roundingFactor;

            let durationElement = sum.getElementsByClassName("duration")[0];
            durationElement.innerHTML = durationSeconds + "s";
        }

        let answerElement = sum.getElementsByClassName("answer")[0];
        let wobble = false;
        let repeat = 1;
        if (answer == this.currentSum.answer) {
            sum.className += " correct";
            answerElement.innerHTML = this.getRandomCorrectSymbol();
            this.results.correct++;
            repeat = 3;
        } else {
            sum.className += " incorrect";
            answerElement.innerHTML = this.getRandomIncorrectSymbol();
            let correctAnswerElement = sum.getElementsByClassName("correct-answer")[0];
            correctAnswerElement.innerHTML = "Correct answer is " + this.currentSum.answer;
            if (this.settings.showCorrectAnswer) {
                correctAnswerElement.style.display = "block";
            }
            this.results.incorrect++;
            wobble = true;
        }

        sum.className += " complete";

        this.title.update();
        this.nextSum();

        new CompletedAnimation(answerElement, eventTarget, wobble).start(repeat);
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
        let answer = eventTarget;
        let sum = answer.closest(".sum");
        
        if (sum.className.indexOf("complete") !== -1){
            return;
        }

        answer.innerHTML = "";
        answer.className = answer.className.replace(/dont-know/, "");
        let theAnswer = this.currentSum.answer;
        sum.className += " skipped complete";
        let inputs = this.sumInputs(sum);
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.value = theAnswer;
            }
            input.disabled = true;
        });

        this.results.skipped++;
        this.title.update();
        this.nextSum();
    }

    clear() {
        this.sumElements().forEach(sum => sum.remove());
        this.startTime = null;
    }

    count() {
        return this.sumElements().length;
    }

    sumsContainer() {
        return document.getElementsByClassName("sums")[0];
    }

    sumElements() {
        let sums = this.sumsContainer().getElementsByClassName("sum");
        return this.toArray(sums);
    }

    sumInputs(sumElement) {
        let inputs = sumElement.getElementsByTagName("input");
        return this.toArray(inputs);
    }

    toArray(htmlCollection) {
        let elements = [];

        for (let index = 0; index < htmlCollection.length; index++) {
            let sum = htmlCollection[index];
            elements.push(sum);
        }

        return elements;
    }
}
