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
window.addEventListener("load", function(){
    let screen = new Screen();
    let random = new Random();
    let settings = new Settings();
    let results = new Results();
    let title = new Title(results, screen);
    let templates = new Templates(settings);
    let background = new Background(random);
    let sums = new Sums(settings, templates, title, results, random, background);
    let options = new OptionsDialog(settings, sums, title, screen);

    options.updateTableChoserText();
    templates.addTimesTableNumbers();
    title.update();
    background.start(5000);

    options.showDialog();
});