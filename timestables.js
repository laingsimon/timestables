class Settings {
    constructor(){
        this.reload();
    }

    save(){
        window.localStorage.setItem("settings", JSON.stringify(this.settings));
    }

    reload(){
        var json = window.localStorage.getItem("settings");
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
            fullscreen: true
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
}

class Random {
    between(min, max, filter) {
        var iteration = 0;

        while (iteration < 100) {
            iteration++;
            var number = Math.floor(Math.random() * (max - min + 1) + min);

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
        var template = $("#templates #sum").html();
        template = template.replace(/{first}/g, sum.first || "");
        template = template.replace(/{second}/g, sum.second || "");
        template = template.replace(/{equals}/g, sum.equals || "");

        if (sum.first) {
            template = template.replace(/class="first/g, "readonly class=\"first");
        }
        if (sum.second) {
            template = template.replace(/class="second/g, "readonly class=\"second");
        }
        if (sum.equals) {
            template = template.replace(/class="equals/g, "readonly class=\"equals");
        }

        var firstExistingSum = $(".sums .sum");
        if (firstExistingSum.length === 0) {
            $(".sums").append($(template));
        } else {
            $(template).insertBefore(firstExistingSum[0])
        }

        var newSum = $($(".sums .sum")[0]);
        newSum.find("input").each(function(){
            if (!$(this).prop("readonly")) {
                $(this).focus();
            }
        });
    }

    addTimesTableNumber(number, checked) {
        var template = $("#templates #timestable").html();
        template = template.replace(/{number}/g, number);

        $(".tables .numbers").append($(template));
        $(`.tables input[value='${number}']`).prop("checked", checked);
    }

    addTimesTableNumbers() {
        for (var number = 2; number <= 12; number++) {
            var shouldBeChecked = this.settings.timesTables[number] || false;
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
        var sum = this.getNextSum();
        this.currentSum = sum;
        this.templates.addSum(sum);
        this.background.updateBackgrounds();
    }

    replaceFirstSum() {
        if (this.currentSum != null) {
            var firstExistingSum = $(".sums .sum")[0];
            $(firstExistingSum).remove();
            this.currentSum = null;
        }

        this.nextSum();
    }

    getNextSum() {
        var mode = this.getRandomMode();
        var filterOption = this.random.between(1, 2);
        var first = this.random.between(2, 12, filterOption == 1 ? this.settings.timesTables : null);
        var second = this.random.between(2, 12, filterOption == 2 ? this.settings.timesTables : null);

        switch (mode) {
            case "?xn=n":
                return {
                    first: null,
                    second: second,
                    equals: first * second,
                    answer: first,
                };
            case "nx?=n":
                return {
                    first: first,
                    second: null,
                    equals: first * second,
                    answer: second,
                };
            case "nxn=?":
                return {
                    first: first,
                    second: second,
                    equals: null,
                    answer: first * second,
                };
        }
    }

    getRandomMode() {
        var mode = this.random.between(1, 3, null);
        switch (mode){
            case 1: return "?xn=n";
            case 2: return "nx?=n";
            case 3: return "nxn=?";
        }
    }

    processAnswer(event) {
        if (event.keyCode !== 13) {
            return;
        }

        var eventTarget = event.currentTarget;
        var answer = $(eventTarget).val();

        if (!answer) {
            return;
        }

        var sum = $(eventTarget).closest(".sum");
        sum.find("input").each(function(){
            $(eventTarget).prop("disabled", true);
        });

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
        var codes = [ '&#x1f603;', '&#x1f607;', '&#x1f609;', '&#x1f60d;' ];
        var random = this.random.between(0, codes.length - 1);
        return codes[random];
    }

    getRandomIncorrectSymbol() {
        var codes = [ '&#x1f615;', '&#x1f612;', '&#x1f61f;' ];
        var random = this.random.between(0, codes.length - 1);
        return codes[random];
    }

    showAnswer(event){
        var eventTarget = event.currentTarget;
        var answer = $(eventTarget);
        var sum = answer.closest(".sum");

        if (sum.hasClass("complete")){
            return;
        }

        answer.html("");
        answer.removeClass("dont-know");
        var theAnswer = this.currentSum.answer;
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
    }
}

class Title {
    constructor(results){
        this.results = results;
    }

    update() {
        var title = "";

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
}

class Results {
    constructor(){
        this.totals = {
            correct: 0,
            incorrect: 0,
            skipped: 0
        }
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
}

class OptionsDialog {
    constructor(settings, sums) {
        this.settings = settings;
        this.sums = sums;

        $(".tables .numbers").on("click", "input", this.updateTableOption.bind(this))
        $(".chose-tables").click(this.showDialog.bind(this));
        $(".dialog-start").click(this.start.bind(this));
        $(".dialog-close").click(this.closeDialog.bind(this));
    }

    enterFullScreen() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

        requestFullScreen.call(docEl);
    }

    exitFullScreen() {
        var doc = window.document;

        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        cancelFullScreen.call(doc);
    }

    updateTableOption(event) {
        var currentTarget = event.currentTarget;

        var number = $(currentTarget).val();
        if ($(currentTarget).prop("checked")){
            this.settings.timesTables[number] = true;
        } else {
            delete this.settings.timesTables[number];
        }
    }

    start() {
        this.sums.clear();
        this.closeDialog();
    }

    showDialog() {
        var tables = $(".tables");
        var sums = $(".sums");
        var choseTables = $(".chose-tables");

        $(".show-correct-answer input").prop("checked", this.settings.showCorrectAnswer);
        $(".show-fullscreen input").prop("checked", this.settings.showFullScreen);
        tables.show();
        sums.hide();
        choseTables.hide();
    }

    closeDialog() {
        var tables = $(".tables");
        var sums = $(".sums");
        var choseTables = $(".chose-tables");

        if (!Object.keys(this.settings.timesTables).length) {
            alert("You must select at least one number");
            return;
        }

        choseTables.show();
        sums.show();
        tables.hide();
        this.settings.showCorrectAnswer = $(".show-correct-answer input").prop("checked");
        this.settings.showFullScreen = $(".show-fullscreen input").prop("checked");
        this.settings.save();
        this.updateTableChoserText();
        this.sums.replaceFirstSum();
        if (this.settings.showFullScreen) {
            this.enterFullScreen();
        }
    }

    updateTableChoserText() {
        var chosenTables = "";

        var selectedTimesTables = Object.keys(this.settings.timesTables);
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

        $(".chose-tables").html("Selected: " + chosenTables);
    }

    shortenSelectedTables(selectedTables) {
        var numberRange = null;

        var numbers = [];
        for (var index = 0; index < selectedTables.length; index++){
            var currentNumber = Number.parseInt(selectedTables[index]);
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
            var element = $(this);
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
    var random = new Random();
    var settings = new Settings();
    var results = new Results();
    var title = new Title(results);
    var templates = new Templates(settings);
    var background = new Background(random);
    var sums = new Sums(settings, templates, title, results, random, background);
    var options = new OptionsDialog(settings, sums);

    options.updateTableChoserText();
    templates.addTimesTableNumbers();
    title.update();
    background.start(5000);

    options.showDialog();
});