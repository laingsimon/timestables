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
        this.intervalHandle = null;

        let newVersionPrompt = document.getElementsByClassName("new-version-prompt")[0];
        let checkForUpdatesInput = newVersionPrompt.getElementsByClassName("check-for-updates")[0];
        checkForUpdatesInput.checked = this.settings.checkForUpdates;
        checkForUpdatesInput.addEventListener("click", this.checkForUpdatesChanged.bind(this));

        let ignoreUpdateLink = newVersionPrompt.getElementsByClassName("ignore-update")[0];
        ignoreUpdateLink.addEventListener("click", this.ignoreUpdate.bind(this));
    }

    ignoreUpdate() {
        let newVersionPrompt = document.getElementsByClassName("new-version-prompt")[0];
        newVersionPrompt.style.display = "none";
    }

    checkForUpdatesChanged(event) {
        let input = event.target;
        let shouldCheckForUpdates = input.checked;
        this.settings.checkForUpdates = shouldCheckForUpdates;
        this.settings.save();

        this.configureCheckForUpdates();
    }

    check() {
        this.getText(`${this.baseUrl}/versions`, this.checkVersion.bind(this));
    }

    checkVersion(_, text) {
        if (!text) {
            return;
        }

        let versions = text.trim().split('\n');
        if (versions.length == 0) {
            return;
        }

        let latestVersion = versions[versions.length - 1];
        let currentVersionUrl = document.location.href.toString();
        let latestVersionUrl = `${this.baseUrl}/${latestVersion}/`;
        console.log(`Current version: ${currentVersionUrl}, latest version: ${latestVersionUrl}`);

        if (currentVersionUrl === latestVersionUrl) {
            return;
        }

        let newVersionPrompt = document.getElementsByClassName("new-version-prompt")[0];
        newVersionPrompt.style.display = "initial";
    }

    configureCheckForUpdates(checkFrequencyMinutes) {
        this.checkFrequencyMinutes = checkFrequencyMinutes || this.checkFrequencyMinutes;
        let checkForUpdates = this.shouldCheckForUpdates();

        if (!checkForUpdates && this.intervalHandle != null) {
            window.clearInterval(this.intervalHandle);
            this.intervalHandle = null;
            return;
        }

        if (this.intervalHandle == null && checkForUpdates) {
            if (this.checkFrequencyMinutes) {
                let minutes = 1000 * 60;
                this.intervalHandle = window.setInterval(this.check.bind(this), minutes * this.checkFrequencyMinutes);
            }
        }
    }

    shouldCheckForUpdates() {
        return this.settings.checkForUpdates !== false;
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