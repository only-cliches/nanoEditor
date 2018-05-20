"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PrismJS = require("prismjs");
require("prismjs/components/prism-typescript.js");
require("prismjs/components/prism-sass.js");
require("prismjs/components/prism-less.js");
require("prismjs/components/prism-css.js");
require("prismjs/components/prism-jsx.js");
require("prismjs/components/prism-json.js");
require("prismjs/components/prism-javascript.js");
require("prismjs/components/prism-markup.js");
require("prismjs/plugins/line-numbers/prism-line-numbers.css");
require("prismjs/plugins/line-numbers/prism-line-numbers.js");
require("./style.css");
var debounce = require("debounce");
var Prism = PrismJS;
var nanoEditor = (function () {
    function nanoEditor(inputSel, language, lineNumbers) {
        if (language === void 0) { language = "markup"; }
        this._tab = "    ";
        if (typeof inputSel === "string") {
            this.container = document.getElementById(inputSel.replace("#", ""));
        }
        else {
            this.container = inputSel;
        }
        if (!this.container) {
            throw Error("No container found!");
        }
        var theCode = this.container.innerHTML;
        this.container.innerHTML = "";
        this.container.classList.add("nanoEditor-body");
        this._text = document.createElement("textarea");
        this._text.setAttribute('spellcheck', 'false');
        this._text.setAttribute('autocapitalize', 'off');
        this._text.setAttribute('autocomplete', 'off');
        this._text.setAttribute('autocorrect', 'off');
        this._text.classList.add("code-input");
        this._text.value = theCode;
        this.container.appendChild(this._text);
        this._pre = document.createElement("pre");
        this._pre.classList.add("code-output");
        if (lineNumbers) {
            this._pre.classList.add("line-numbers");
            this._text.classList.add("line-numbers");
        }
        this.container.appendChild(this._pre);
        this._code = document.createElement("code");
        this._pre.appendChild(this._code);
        this.listenForInput();
        this.setLanguage(language);
        this.renderOutput(theCode);
        this.listenerForScroll();
    }
    nanoEditor.prototype.canEdit = function (setTo) {
        if (setTo === true) {
            this._text.style.display = "block";
            this._pre.style.pointerEvents = "none";
        }
        else {
            this._text.style.display = "none";
            this._pre.style.pointerEvents = "all";
        }
    };
    nanoEditor.prototype.setValue = function (code) {
        this._text.value = code;
        this.renderOutput(code);
    };
    nanoEditor.prototype.setLanguage = function (language) {
        switch (language) {
            case "js":
                language = "javascript";
                break;
            case "ts":
            case "tsx":
                language = "typescript";
                break;
        }
        var self = this;
        this._removeLang(this._pre);
        this._removeLang(this._code);
        this._pre.classList.add("language-" + language);
        this._code.classList.add("language-" + language);
        Prism.highlightElement(this._code);
    };
    nanoEditor.prototype.onChange = function (callback) {
        this._changeListener = callback;
    };
    nanoEditor.prototype.listenForInput = function () {
        var self = this;
        var isTab = false;
        var onChange = function (e) {
            if (e.keyCode === 9) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                var input = this, selectionDir = input.selectionDirection, selStartPos = input.selectionStart, selEndPos = input.selectionEnd, inputVal = input.value;
                var beforeSelection = inputVal.substr(0, selStartPos), selectionVal = inputVal.substring(selStartPos, selEndPos), afterSelection = inputVal.substring(selEndPos);
                if (selStartPos !== selEndPos && selectionVal.length >= self._tab.length) {
                    var currentLineStart = selStartPos - beforeSelection.split('\n').pop().length, startIndentLen = self._tab.length, endIndentLen = self._tab.length;
                    if (e.shiftKey) {
                        var currentLineStartStr = inputVal.substr(currentLineStart, self._tab.length);
                        if (currentLineStartStr === self._tab) {
                            startIndentLen = -startIndentLen;
                            if (currentLineStart > selStartPos) {
                                selectionVal = selectionVal.substring(0, currentLineStart) + selectionVal.substring(currentLineStart + self._tab.length);
                                endIndentLen = 0;
                            }
                            else if (currentLineStart == selStartPos) {
                                startIndentLen = 0;
                                endIndentLen = 0;
                                selectionVal = selectionVal.substring(self._tab.length);
                            }
                            else {
                                endIndentLen = -endIndentLen;
                                beforeSelection = beforeSelection.substring(0, currentLineStart) + beforeSelection.substring(currentLineStart + self._tab.length);
                            }
                        }
                        else {
                            startIndentLen = 0;
                            endIndentLen = 0;
                        }
                        selectionVal = selectionVal.replace(new RegExp('\n' + self._tab.split('').join('\\'), 'g'), '\n');
                    }
                    else {
                        beforeSelection = beforeSelection.substr(0, currentLineStart) + self._tab + beforeSelection.substring(currentLineStart, selStartPos);
                        selectionVal = selectionVal.replace(/\n/g, '\n' + self._tab);
                    }
                    input.value = beforeSelection + selectionVal + afterSelection;
                    input.selectionStart = selStartPos + startIndentLen;
                    input.selectionEnd = selStartPos + selectionVal.length + endIndentLen;
                    input.selectionDirection = selectionDir;
                }
                else {
                    input.value = beforeSelection + self._tab + afterSelection;
                    input.selectionStart = selStartPos + self._tab.length;
                    input.selectionEnd = selStartPos + self._tab.length;
                }
                self.renderOutput(this.value);
                return false;
            }
            self.renderOutput(this.value);
        };
        this._text.addEventListener("keydown", function (e) {
            isTab = false;
            if (e.keyCode === 9) {
                isTab = true;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        });
        this._text.addEventListener("keypress", function (e) {
            if (!isTab) {
                return true;
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        var debounceChange = debounce(onChange, 30);
        this._text.addEventListener("input", debounceChange);
        this._text.addEventListener("keyup", debounceChange);
    };
    nanoEditor.prototype._removeLang = function (elem) {
        for (var i = 0; i < elem.classList.length; i++) {
            if (elem.classList.item(i).indexOf("language-") !== -1) {
                elem.classList.remove(elem.classList.item(i));
            }
        }
    };
    nanoEditor.prototype.listenerForScroll = function () {
        var parent = this;
        this._text.addEventListener("scroll", function () {
            parent._pre.scrollTop = this.scrollTop;
        });
    };
    nanoEditor.prototype.renderOutput = function (value) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;",
            "/": "&#x2F;",
            "`": "&#x60;",
            "=": "&#x3D;"
        };
        var htmlSet = value.replace(/[&<>"'`=\/]/gmi, function (s) { return entityMap[s]; }) + "\n";
        this._code.innerHTML = htmlSet;
        if (this._changeListener) {
            this._changeListener(value);
        }
        Prism.highlightElement(this._code);
    };
    nanoEditor.prototype.focusInput = function () {
        this._text.focus();
        this._text.selectionStart = 0;
        this._text.selectionEnd = 0;
    };
    return nanoEditor;
}());
exports.nanoEditor = nanoEditor;
