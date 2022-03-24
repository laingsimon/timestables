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
