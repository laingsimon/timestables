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
            showCorrectAnswer: true
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
    constructor(settings, templates, title, results){
        this.settings = settings;
        this.currentSum = null;
        this.templates = templates;
        this.random = new Random();
        this.title = title;
        this.results = results;

        $(".sums").on("keypress", "input", this.processAnswer.bind(this));
        $(".sums").on("click", ".answer", this.showAnswer.bind(this));
    }

    nextSum(){
        var sum = this.getNextSum();
        this.currentSum = sum;
        this.templates.addSum(sum);
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
}

class Title {
    constructor(results){
        this.results = results;
    }

    update() {
        var title = "Times tables";

        if (this.results.correct) {
            title += `, Correct: ${this.results.correct}`;
        }
        if (this.results.incorrect) {
            title += `, Incorrect: ${this.results.incorrect}`;
        }
        if (this.results.skipped) {
            title += `, Skipped: ${this.results.skipped}`;
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
        $(".chose-tables").click(this.toggleTableChooser.bind(this));
        $(".toggle-choser").click(this.toggleTableChooser.bind(this));
    }

    updateTableOption(event) {
        var currentTarget = event.currentTarget;

        var number = $(currentTarget).val();
        if ($(this).prop("checked")){
            this.settings.timesTables[number] = true;
        } else {
            delete this.settings.timesTables[number];
        }
    }

    toggleTableChooser(show) {
        var tables = $(".tables");

        if (show === true || !tables.is(":visible")) {
            $(".show-correct-answer input").prop("checked", this.settings.showCorrectAnswer);
            tables.show();
            return;
        }

        if (!Object.keys(this.settings.timesTables).length) {
            alert("You must select at least one number");
            return;
        }

        tables.hide();
        this.settings.showCorrectAnswer = $(".show-correct-answer input").prop("checked");
        this.settings.save();
        this.updateTableChoserText();
        this.sums.replaceFirstSum();
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

        $(".chose-tables").html("Click to change: " + chosenTables);
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

$(document).ready(function(){
    var settings = new Settings();
    var results = new Results();
    var title = new Title(results);
    var templates = new Templates(settings);
    var sums = new Sums(settings, templates, title, results);
    var options = new OptionsDialog(settings, sums);

    options.updateTableChoserText();
    templates.addTimesTableNumbers();
    title.update();

    options.toggleTableChooser(true);
});