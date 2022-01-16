$(document).ready(function(){
    var tables = null;
    var currentSum = null;
    var results = {
        correct: 0,
        incorrect: 0,
        skipped: 0
    };

    function addTimesTableNumber(number, checked) {
        var template = $("#templates #timestable").html();
        template = template.replace(/{number}/g, number);

        $(".tables").append($(template));
        $(`.tables input[value='${number}']`).prop("checked", checked);
    }

    function shouldBeChecked(number) {
        return tables[number];
    }

    function loadTimesTables() {
        var saved = window.localStorage.getItem("timestables");
        if (saved) {
            return JSON.parse(saved);
        }

        var defaultTimesTables = {};
        for (var i = 2; i <= 12; i++){
            defaultTimesTables[i] = true;
        }

        return defaultTimesTables;
    }

    function saveTimesTables() {
        window.localStorage.setItem("timestables", JSON.stringify(tables));
    }

    function addTimesTableNumbers() {
        for (var number = 2; number <= 12; number++) {
            addTimesTableNumber(number, shouldBeChecked(number));
        }
    }

    function updateTableOption() {
        var number = $(this).val();
        if ($(this).prop("checked")){
            tables[number] = true;
        } else {
            delete tables[number];
        }

        saveTimesTables();
        replaceFirstSum();
    }

    function addSum(sum){
        currentSum = sum;
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

    function replaceFirstSum() {
        if (currentSum == null) {
            addSum(getNextSum());
            return;
        }

        var firstExistingSum = $(".sums .sum")[0];
        $(firstExistingSum).remove();
        currentSum = null;
        addSum(getNextSum());
    }

    function getRandomMode() {
        var mode = getRandomNumber(1, 3, null);
        switch (mode){
            case 1: return "?xn=n";
            case 2: return "nx?=n";
            case 3: return "nxn=?";
        }
    }

    function getRandomNumber(min, max, filter) {
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

    function processAnswer(event) {
        if (event.keyCode !== 13) {
            return;
        }

        var answer = $(this).val();

        if (!answer) {
            return;
        }

        var sum = $(this).closest(".sum");
        var input = null;
        sum.find("input").each(function(){
            $(this).prop("disabled", true);

            if (!$(this).prop("readonly")) {
                input = $(this);
            }
        });

        if (answer == currentSum.answer) {
            sum.addClass("correct");
            sum.find(".answer").html("👌");
            results.correct++;
        } else {
            sum.addClass("incorrect");
            sum.find(".answer").html("👎");
            sum.find(".correct-answer").html("Correct answer is " + currentSum.answer);
            results.incorrect++;
        }
        sum.addClass("complete");

        updateTitle();
        addSum(getNextSum());
    }

    function getNextSum() {
        var mode = getRandomMode();
        var filterOption = getRandomNumber(1, 2);
        var first = getRandomNumber(2, 12, filterOption == 1 ? tables : null);
        var second = getRandomNumber(2, 12, filterOption == 2 ? tables : null);

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

    function updateTitle() {
        var title = "Times tables";

        if (results.correct) {
            title += `, Correct: ${results.correct}`;
        }
        if (results.incorrect) {
            title += `, Incorrect: ${results.incorrect}`;
        }
        if (results.skipped) {
            title += `, Skipped: ${results.skipped}`;
        }

        document.title = title.trimEnd();
        return;
    }

    function showAnswer(){
        var answer = $(this);
        var sum = answer.closest(".sum");

        if (sum.hasClass("complete")){
            return;
        }

        answer.html("⭕");
        var theAnswer = currentSum.answer;
        sum.addClass("skipped");
        sum.addClass("complete");
        sum.find("input").each(function() {
            $(this).prop("disabled", true);
            if (!$(this).prop("readonly")) {
                $(this).val(theAnswer);
            }
        });
        
        results.skipped++;
        updateTitle();
        addSum(getNextSum());
    }

    $(".tables").on("click", "input", updateTableOption)
    $(".sums").on("keypress", "input", processAnswer);
    $(".sums").on("click", ".answer", showAnswer);

    tables = loadTimesTables();
    addTimesTableNumbers();
    updateTitle();
    replaceFirstSum();
});