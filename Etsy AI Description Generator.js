// ==UserScript==
// @name         Etsy Product Editor
// @namespace    https://www.etsy.com/
// @version      v0.1
// @description  Add's AI Gen to Etsy's Product Form Editor.
// @author       http://github.com/CainDev/
// @match        https://www.etsy.com/your/shops/me/listing-editor/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=etsy.com
// ==/UserScript==

(function () {
    'use strict';

    var api_key = ""; // https://platform.openai.com/api-keys
    var ai_model = "gpt-3.5-turbo";
    var title_delimiter = "|";

    window.addEventListener('load', function () {
        function BuildAIDiv() {
            // Main Host Div
            var AIDiv = document.createElement("div");
            AIDiv.className = "wt-mt-md-6 wt-mt-xs-4";
            //

            // INPUT---------------------
            // AI Title Text Box & Label
            var AITitleLabel = document.createElement("label");
            AITitleLabel.id = "AIDescriptionTitleLabel";
            AITitleLabel.textContent = "AI Title";
            AITitleLabel.htmlFor = "AITitleTextArea";
            AITitleLabel.style.fontWeight = "bold";

            var TitleTextArea = document.createElement("textarea");
            TitleTextArea.id = "AITitleTextArea";
            TitleTextArea.ariaInvalid = false;
            TitleTextArea.ariaRequired = true;
            TitleTextArea.className = "wt-textarea wt-textarea--resize-none";
            TitleTextArea.rows = "1";
            //TitleTextArea.style = "height: 47px !important;";
            TitleTextArea.value = document.getElementById("listing-title-input").value.split("|")[0];

            // AI Tags TextBox
            var TagTextArea = document.createElement("textarea");
            TagTextArea.id = "AITagTextArea";
            TagTextArea.ariaInvalid = false;
            TagTextArea.ariaRequired = true;
            TagTextArea.className = "wt-textarea wt-textarea--resize-none";
            TagTextArea.rows = "1";
            TagTextArea.style = "height: 74px !important;";
            TagTextArea.value = GrabAllTags().join(", ");

            // OUTPUT---------------------
            // AI Text Area Output & Label

            var AIResultsTitle = document.createElement("label");
            AIResultsTitle.id = "AIDescriptionResultsLabel";
            AIResultsTitle.textContent = "AI Results";
            AIResultsTitle.htmlFor = "AIDescriptionTextArea";
            AIResultsTitle.style.fontWeight = "bold";

            var AITextArea = document.createElement("textarea");
            AITextArea.id = "AIDescriptionTextArea";
            AITextArea.ariaInvalid = false;
            AITextArea.ariaRequired = true;
            AITextArea.setAttribute("aria-describedby", "listing-description-helper-text");
            AITextArea.className = "wt-textarea wt-textarea";
            AITextArea.rows = "6";
            AITextArea.style = "height: 250px !important;";

            // ----------------------------

            // AI Description Button
            var GenerateAIDescriptionButton = document.createElement("button");
            GenerateAIDescriptionButton.className = "wt-btn wt-btn--secondary wt-display-flex-xs wt-align-items-center wt-mt-xs-2 wt-flex-basis-xs-auto wt-flex-basis-md-auto";
            GenerateAIDescriptionButton.ariaExpanded = true;
            GenerateAIDescriptionButton.type = "button";
            GenerateAIDescriptionButton.textContent = "Generate AI Description";

            GenerateAIDescriptionButton.onclick = function () {
                MakeChatGPTRequest();
            }

            // Fill New Data Button
            var FillAITitleTagsButton = document.createElement("button");
            FillAITitleTagsButton.className = "wt-btn wt-btn--secondary wt-display-flex-xs wt-align-items-center wt-mt-xs-2 wt-flex-basis-xs-auto wt-flex-basis-md-auto";
            FillAITitleTagsButton.ariaExpanded = true;
            FillAITitleTagsButton.type = "button";
            FillAITitleTagsButton.textContent = "Fill Data";

            FillAITitleTagsButton.onclick = function () {
                FillFormData();
            }

            // ----------------------------
            AIDiv.appendChild(AITitleLabel);
            AIDiv.appendChild(TitleTextArea);
            AIDiv.appendChild(document.createElement("br"));
            AIDiv.appendChild(TagTextArea);
            AIDiv.appendChild(document.createElement("br"));
            AIDiv.appendChild(AIResultsTitle);
            AIDiv.appendChild(AITextArea);
            AIDiv.appendChild(document.createElement("br"));
            AIDiv.appendChild(FillAITitleTagsButton);
            AIDiv.appendChild(GenerateAIDescriptionButton);

            var DescriptionField = document.getElementById("field-description");
            DescriptionField.appendChild(AIDiv);
        }

        function FillFormData() {
            document.getElementById("AITitleTextArea").value = document.getElementById("listing-title-input").value.split(title_delimiter)[0];
            document.getElementById("AITagTextArea").value = GrabAllTags(false).join(", ");
        }

        function GrabAllTags(preload = true) {
            if (preload) {
                var ProductTags = document.getElementsByClassName("wt-list-inline wt-mt-xs-1 wt-action-group")[0].innerText.split("\n");
                ProductTags.pop(); // Remove the 'X Left' from the end of the array.
                return ProductTags;
            }

            var ProductTags = document.getElementsByClassName("wt-list-inline wt-mt-xs-1 wt-action-group")[1].innerText.split("\n");
            ProductTags.pop(); // Remove the 'X Left' from the end of the array.
            return ProductTags;
        }

        function MakeChatGPTRequest() {
            var MessageRequest = [];

            MessageRequest.push(
                "Write me a SEO friendly product description for a " + document.getElementById("AITitleTextArea").value,
                "\n\n",
                "Please use as many keywords as possible: " + document.getElementById("AITagTextArea").value,
                "\n\n",
                "Please use 120 words or less, jovial English and Emojis are fine to use. DO NOT USE HASHTAGS!",
                "\n",
                "Please use English Grammar from the United Kingdom."
            );

            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + api_key
                },
                body: JSON.stringify({
                    model: ai_model,
                    messages: [
                        { role: 'user', content: MessageRequest.join("") }
                    ]
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    console.log(data.choices[0].message.content);
                    document.getElementById("AIDescriptionTextArea").value += data.choices[0].message.content + "\n\n";
                })
                .catch(error => {
                    console.log('Error: ', error);
                });
        }

        function Main() {
            BuildAIDiv();
        }

        Main();
    }, false);
})();