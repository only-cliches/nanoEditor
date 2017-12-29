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
var Prism = PrismJS;
var debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
var nanoEditor = (function () {
    function nanoEditor(inputSel, language, lineNumbers) {
        if (language === void 0) { language = "markup"; }
        this.indent = "    ";
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
        this.textArea = document.createElement("textarea");
        this.textArea.setAttribute('spellcheck', 'false');
        this.textArea.setAttribute('autocapitalize', 'off');
        this.textArea.setAttribute('autocomplete', 'off');
        this.textArea.setAttribute('autocorrect', 'off');
        this.textArea.classList.add("code-input");
        this.textArea.value = theCode;
        this.container.appendChild(this.textArea);
        this.preContainer = document.createElement("pre");
        this.preContainer.classList.add("code-output");
        if (lineNumbers) {
            this.preContainer.classList.add("line-numbers");
            this.textArea.classList.add("line-numbers");
        }
        this.container.appendChild(this.preContainer);
        this.codeContainer = document.createElement("code");
        this.preContainer.appendChild(this.codeContainer);
        this.focusInput();
        this.listenForInput();
        this.setLanguage(language);
        this.renderOutput(theCode);
        this.listenerForScroll();
    }
    nanoEditor.prototype.setValue = function (code) {
        this.textArea.value = code;
        this.renderOutput(code);
    };
    nanoEditor.prototype.setLanguage = function (language) {
        var self = this;
        this._removeLang(this.preContainer);
        this._removeLang(this.codeContainer);
        this.preContainer.classList.add("language-" + language);
        this.codeContainer.classList.add("language-" + language);
    };
    nanoEditor.prototype.onChange = function (callback) {
        this._changeListener = callback;
    };
    nanoEditor.prototype.listenForInput = function () {
        var self = this;
        var onChange = function (e) {
            if (self._lastE && e.timeStamp - self._lastE < 50) {
                return;
            }
            self._lastE = e.timeStamp;
            if (e.keyCode === 9) {
                e.preventDefault();
                var input = this, selectionDir = input.selectionDirection, selStartPos = input.selectionStart, selEndPos = input.selectionEnd, inputVal = input.value;
                var beforeSelection = inputVal.substr(0, selStartPos), selectionVal = inputVal.substring(selStartPos, selEndPos), afterSelection = inputVal.substring(selEndPos);
                if (selStartPos !== selEndPos && selectionVal.length >= self.indent.length) {
                    var currentLineStart = selStartPos - beforeSelection.split('\n').pop().length, startIndentLen = self.indent.length, endIndentLen = self.indent.length;
                    if (e.shiftKey) {
                        var currentLineStartStr = inputVal.substr(currentLineStart, self.indent.length);
                        if (currentLineStartStr === self.indent) {
                            startIndentLen = -startIndentLen;
                            if (currentLineStart > selStartPos) {
                                selectionVal = selectionVal.substring(0, currentLineStart) + selectionVal.substring(currentLineStart + self.indent.length);
                                endIndentLen = 0;
                            }
                            else if (currentLineStart == selStartPos) {
                                startIndentLen = 0;
                                endIndentLen = 0;
                                selectionVal = selectionVal.substring(self.indent.length);
                            }
                            else {
                                endIndentLen = -endIndentLen;
                                beforeSelection = beforeSelection.substring(0, currentLineStart) + beforeSelection.substring(currentLineStart + self.indent.length);
                            }
                        }
                        else {
                            startIndentLen = 0;
                            endIndentLen = 0;
                        }
                        selectionVal = selectionVal.replace(new RegExp('\n' + self.indent.split('').join('\\'), 'g'), '\n');
                    }
                    else {
                        beforeSelection = beforeSelection.substr(0, currentLineStart) + self.indent + beforeSelection.substring(currentLineStart, selStartPos);
                        selectionVal = selectionVal.replace(/\n/g, '\n' + self.indent);
                    }
                    input.value = beforeSelection + selectionVal + afterSelection;
                    input.selectionStart = selStartPos + startIndentLen;
                    input.selectionEnd = selStartPos + selectionVal.length + endIndentLen;
                    input.selectionDirection = selectionDir;
                }
                else {
                    input.value = beforeSelection + self.indent + afterSelection;
                    input.selectionStart = selStartPos + self.indent.length;
                    input.selectionEnd = selStartPos + self.indent.length;
                }
            }
            self.renderOutput(this.value);
        };
        var bounceChnage = debounce(onChange, 50, false);
        this.textArea.addEventListener("input", bounceChnage);
        this.textArea.addEventListener("keydown", bounceChnage);
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
        this.textArea.addEventListener("scroll", function () {
            parent.preContainer.scrollTop = this.scrollTop;
        });
    };
    nanoEditor.prototype.renderOutput = function (value) {
        var htmlSet = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n";
        this.codeContainer.innerHTML = htmlSet;
        if (this._changeListener) {
            this._changeListener(value);
        }
        Prism.highlightElement(this.codeContainer);
    };
    nanoEditor.prototype.focusInput = function () {
        this.textArea.focus();
        this.textArea.selectionStart = 0;
        this.textArea.selectionEnd = 0;
    };
    return nanoEditor;
}());
exports.nanoEditor = nanoEditor;
