import * as PrismJS from "prismjs";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-sass.js";
import "prismjs/components/prism-less.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-markup.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "./style.css";

const Prism: any = PrismJS;

const debounce = function(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

export class nanoEditor {

	public container: HTMLElement;
	public textArea: HTMLTextAreaElement;
	public preContainer: HTMLPreElement;
	public codeContainer: HTMLElement;
	public indent: string = "    ";
	private _lastE: number;
	private _changeListener: (val: string) => void;

	constructor(inputSel: string | HTMLElement, language: string = "markup", lineNumbers?: boolean) {
		if (typeof inputSel === "string") {
			this.container = document.getElementById(inputSel.replace("#", ""));
		} else {
			this.container = inputSel;
		}

		if (!this.container) {
			throw Error("No container found!");
		}

		const theCode = this.container.innerHTML;
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

	public setValue(code: string) {
		this.textArea.value = code;
		this.renderOutput(code);
	}

	public setLanguage(language: string) {
		var self = this;
		this._removeLang(this.preContainer);
		this._removeLang(this.codeContainer);
		this.preContainer.classList.add(`language-${language}`);
		this.codeContainer.classList.add(`language-${language}`);
	}

	public onChange(callback: (val: string) => void) {
		this._changeListener = callback;
	}

	private listenForInput() {
		const self = this;

		const onChange = function (e: KeyboardEvent) {
			if (self._lastE && e.timeStamp - self._lastE < 50) {
				return;
			}
			self._lastE = e.timeStamp;

			// stolen directly from https://github.com/kazzkiq/CodeFlask.js/blob/master/src/codeflask.js
			if (e.keyCode === 9) {

				e.preventDefault();
				var input = this,
					selectionDir = input.selectionDirection,
					selStartPos = input.selectionStart,
					selEndPos = input.selectionEnd,
					inputVal = input.value;

				var beforeSelection = inputVal.substr(0, selStartPos),
					selectionVal = inputVal.substring(selStartPos, selEndPos),
					afterSelection = inputVal.substring(selEndPos);

				if (selStartPos !== selEndPos && selectionVal.length >= self.indent.length) {


					var currentLineStart = selStartPos - beforeSelection.split('\n').pop().length,
						startIndentLen = self.indent.length,
						endIndentLen = self.indent.length;

					//Unindent
					if (e.shiftKey) {
						var currentLineStartStr = inputVal.substr(currentLineStart, self.indent.length);
						//Line start whit indent
						if (currentLineStartStr === self.indent) {

							startIndentLen = -startIndentLen;

							//Indent is in selection
							if (currentLineStart > selStartPos) {
								selectionVal = selectionVal.substring(0, currentLineStart) + selectionVal.substring(currentLineStart + self.indent.length);
								endIndentLen = 0;
							}
							//Indent is in start of selection
							else if (currentLineStart == selStartPos) {
								startIndentLen = 0;
								endIndentLen = 0;
								selectionVal = selectionVal.substring(self.indent.length);
							}
							//Indent is before selection
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
					//Indent
					else {
						beforeSelection = beforeSelection.substr(0, currentLineStart) + self.indent + beforeSelection.substring(currentLineStart, selStartPos);
						selectionVal = selectionVal.replace(/\n/g, '\n' + self.indent);
					}

					//Set new indented value
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

		const bounceChnage = debounce(onChange, 50, false);

		this.textArea.addEventListener("input", bounceChnage);
		this.textArea.addEventListener("keydown", bounceChnage);
	}

	private _removeLang(elem: HTMLElement) {
		for (let i = 0; i < elem.classList.length; i++) {
			if (elem.classList.item(i).indexOf("language-") !== -1) {
				elem.classList.remove(elem.classList.item(i))
			}
		}
	}

	private listenerForScroll() {
		const parent = this;
		this.textArea.addEventListener("scroll", function () {
			parent.preContainer.scrollTop = this.scrollTop;
		});
	}

	private renderOutput(value: string) {
		const htmlSet = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n";
		this.codeContainer.innerHTML = htmlSet;
		if (this._changeListener) {
			this._changeListener(value);
		}
		Prism.highlightElement(this.codeContainer);
	}

	private focusInput() {
		this.textArea.focus();
		this.textArea.selectionStart = 0;
		this.textArea.selectionEnd = 0;
	}
}