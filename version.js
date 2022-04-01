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
class Version {
    baseUrl = "https://app.timestables.xyz";

    constructor(settings) {
        this.settings = settings;
    }

    check() {
        this.getText(`${this.baseUrl}/versions`, this.checkVersion.bind(this));
    }

    checkVersion(url, text) {
        if (!text) {
            return;
        }

        let versions = text.trim().split('\n');
        console.log(`Latest deployed versions: ${versions}`);

        if (versions.length == 0) {
            return;
        }

        let latestVersion = versions[versions.length - 1];
        console.log(`Latest deployed version: ${latestVersion} of ${versions.length} versions`);

        let currentVersionUrl = document.location.href.toString();
        let latestVersionUrl = `${this.baseUrl}/${latestVersion}/app/`;
        console.log(`Current version: ${currentVersionUrl}, latest version: ${latestVersionUrl}`);

        if (currentVersionUrl === latestVersionUrl) {
            return;
        }

        if (confirm(`You're not running the latest version, would you like to use it?`)) {
            document.location.href = this.baseUrl; /* let the root-site redirect redirect them to the latest version */
        }
    }

    getText(url, callback) {
        if (!window.XMLHttpRequest) {
            // code for IE6, IE5
            console.log("URL content retrieval not supported");
            return;
        }

        // code for IE7+, Firefox, Chrome, Opera, Safari
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange=function()
        {
            if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
                callback(url, xmlhttp.responseText);
            }
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
}