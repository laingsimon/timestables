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
            division: false
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
}

class Random {
    between(min, max, filter) {
        let iteration = 0;

        while (iteration < 100) {
            iteration++;
            let number = Math.floor(Math.random() * (max - min + 1) + min);

            if (!filter) {
                return number;
            }

            if (filter[number]) {
                return number;
            }
        }

        throw new Error(`Unable to get a random number between ${min} and ${max}`);
    }
}

class Templates {
    constructor(settings) {
        this.settings = settings;
    }

    addSum(sum){
        let template = $("#templates #sum").html();
        template = template.replace(/{first}/g, sum.first || "");
        template = template.replace(/{second}/g, sum.second || "");
        template = template.replace(/{equals}/g, sum.equals || "");
        template = template.replace(/{operator}/g, sum.operator || "");

        if (sum.first) {
            template = template.replace(/class="first/g, "readonly class=\"first");
        }
        if (sum.second) {
            template = template.replace(/class="second/g, "readonly class=\"second");
        }
        if (sum.equals) {
            template = template.replace(/class="equals/g, "readonly class=\"equals");
        }

        let firstExistingSum = $(".sums .sum");
        if (firstExistingSum.length === 0) {
            $(".sums").append($(template));
        } else {
            $(template).insertBefore(firstExistingSum[0])
        }

        let newSum = $($(".sums .sum")[0]);
        newSum.find("input").each(function(){
            if (!$(this).prop("readonly")) {
                $(this).focus();
            }
        });

        return newSum[0];
    }

    addTimesTableNumber(number, checked) {
        let template = $("#templates #timestable").html();
        template = template.replace(/{number}/g, number);

        $(".tables .numbers").append($(template));
        $(`.tables input[value='${number}']`).prop("checked", checked);
    }

    addTimesTableNumbers() {
        for (let number = 2; number <= 12; number++) {
            let shouldBeChecked = this.settings.timesTables[number] || false;
            this.addTimesTableNumber(number, shouldBeChecked);
        }
    }
}

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

        let currentTime = new Date();
        let durationMs = currentTime.valueOf() - this.sumStart.valueOf();
        let decimalPlaces = 2;
        let roundingFactor = Math.pow(10, decimalPlaces - 1);
        let durationSeconds = Math.round((durationMs / 1000) * roundingFactor) / roundingFactor;

        let sum = $(eventTarget).closest(".sum");
        sum.find("input").each(function(){
            $(eventTarget).prop("disabled", true);
        });

        sum.find(".duration").text(durationSeconds + "s");

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
}

class Title {
    constructor(results){
        this.results = results;
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

        $(".title").html(title);
        return;
    }

    reset() {
        this.results.reset();
        this.update();
    }
}

class Results {
    constructor(){
        this.reset();
    }

    get correct(){
        return this.totals.correct;
    }
    set correct(value) {
        this.totals.correct = value;
    }

    get incorrect(){
        return this.totals.incorrect;
    }
    set incorrect(value) {
        this.totals.incorrect = value;
    }

    get skipped(){
        return this.totals.skipped;
    }
    set skipped(value) {
        this.totals.skipped = value;
    }

    reset() {
        this.totals = {
            correct: 0,
            incorrect: 0,
            skipped: 0
        };
    }
}

class OptionsDialog {
    constructor(settings, sums, title) {
        this.settings = settings;
        this.sums = sums;
        this.title = title;

        $(".tables .numbers").on("click", "input", this.updateTableOption.bind(this))
        $(".chose-tables").click(this.showDialog.bind(this));
        $(".dialog-start").click(this.start.bind(this));
        $(".dialog-close").click(this.closeDialog.bind(this));
    }

    enterFullScreen() {
        let doc = window.document;
        let docEl = doc.documentElement;

        let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

        requestFullScreen.call(docEl);
    }

    exitFullScreen() {
        let doc = window.document;

        let cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        cancelFullScreen.call(doc);
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
        tables.show();
        sums.hide();
        choseTables.hide();
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
        this.settings.save();
        this.updateTableChoserText();
        this.sums.replaceFirstSum();
        if (this.settings.showFullScreen) {
            this.enterFullScreen();
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

        $(".background").each(function() {
            let element = $(this);
            if (element.closest("#templates").length > 0) {
                return;
            }

            updateBackground(element);
        });
    }

    updateBackground(element) {
        let backgroundOnce = element.data("background-once");
        let backgroundFixed = element.data("background-fixed");

        if (backgroundFixed) {
            return;
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

        element.css("background-image", `url("data:image/svg+xml;base64,${encodedSvg}")`);
        element.data("background-fixed", backgroundOnce);
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

$(document).ready(function(){
    let random = new Random();
    let settings = new Settings();
    let results = new Results();
    let title = new Title(results);
    let templates = new Templates(settings);
    let background = new Background(random);
    let sums = new Sums(settings, templates, title, results, random, background);
    let options = new OptionsDialog(settings, sums, title);

    options.updateTableChoserText();
    templates.addTimesTableNumbers();
    title.update();
    background.start(5000);

    options.showDialog();
});