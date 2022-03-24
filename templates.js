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
class Templates {
    constructor(settings) {
        this.settings = settings;
    }

    addSum(sum){
        let templateElement = document.querySelector("#templates #sum");
        let template = templateElement.innerHTML;
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

        let sumsElement = document.getElementsByClassName("sums")[0];
        let sums = sumsElement.getElementsByClassName("sum");
        let newSumElement = this.getElementFromHtml(template);
        if (sums.length === 0) {
            sumsElement.appendChild(newSumElement);
        } else {
            sumsElement.insertBefore(newSumElement, sums[0]);
        }

        let inputs = newSumElement.getElementsByTagName("input");
        for (let index = 0; index < inputs.length; index++){
            let input = inputs[index];
            if (!input.readOnly){
                input.focus();
            }
        }

        return newSumElement;
    }

    addTimesTableNumber(number, checked) {
        let templatesElement = document.querySelector("#templates #timestable");
        let template = templatesElement.innerHTML;
        template = template.replace(/{number}/g, number);

        let tablesElement = document.getElementsByClassName("tables")[0];
        let numbersElement = tablesElement.getElementsByClassName("numbers")[0];
        let elementToAppend = this.getElementFromHtml(template);
        numbersElement.appendChild(elementToAppend);
        let inputElement = tablesElement.querySelectorAll(`input[value='${number}']`)[0];
        inputElement.checked = checked;
    }

    addTimesTableNumbers() {
        for (let number = 2; number <= 12; number++) {
            let shouldBeChecked = this.settings.timesTables[number] || false;
            this.addTimesTableNumber(number, shouldBeChecked);
        }
    }

    getElementFromHtml(html) {
        let holder = document.createElement("div");
        holder.innerHTML = html;

        return holder.children[0];
    }
}
