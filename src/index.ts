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

import * as debounce from "debounce";

const Prism: any = PrismJS;

export class nanoEditor {

	public container: HTMLElement;
	private _text: HTMLTextAreaElement;
	private _pre: HTMLPreElement;
	private _code: HTMLElement;
	private _tab: string = "    ";
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

		this.focusInput();
		this.listenForInput();
		this.setLanguage(language);
		this.renderOutput(theCode);
		this.listenerForScroll();
	}

	public canEdit(setTo: boolean) {
		if (setTo === true) {
			this._text.style.display = "block";
			this._pre.style.pointerEvents = "none";
		} else {
			this._text.style.display = "none";
			this._pre.style.pointerEvents = "all";
		}
	}

	public setValue(code: string) {
		this._text.value = code;
		this.renderOutput(code);
	}

	public setLanguage(language: string) {

		switch(language) {
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
		this._pre.classList.add(`language-${language}`);
		this._code.classList.add(`language-${language}`);
		Prism.highlightElement(this._code);
	}

	public onChange(callback: (val: string) => void) {
		this._changeListener = callback;
	}

	private listenForInput() {
		const self = this;

		let isTab: boolean = false;

		const onChange = function (e: KeyboardEvent) {

			// stolen directly from https://github.com/kazzkiq/CodeFlask.js/blob/master/src/codeflask.js
			if (e.keyCode === 9) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				var input = this,
					selectionDir = input.selectionDirection,
					selStartPos = input.selectionStart,
					selEndPos = input.selectionEnd,
					inputVal = input.value;

				var beforeSelection = inputVal.substr(0, selStartPos),
					selectionVal = inputVal.substring(selStartPos, selEndPos),
					afterSelection = inputVal.substring(selEndPos);

				if (selStartPos !== selEndPos && selectionVal.length >= self._tab.length) {


					var currentLineStart = selStartPos - beforeSelection.split('\n').pop().length,
						startIndentLen = self._tab.length,
						endIndentLen = self._tab.length;

					//Unindent
					if (e.shiftKey) {
						var currentLineStartStr = inputVal.substr(currentLineStart, self._tab.length);
						//Line start whit indent
						if (currentLineStartStr === self._tab) {

							startIndentLen = -startIndentLen;

							//Indent is in selection
							if (currentLineStart > selStartPos) {
								selectionVal = selectionVal.substring(0, currentLineStart) + selectionVal.substring(currentLineStart + self._tab.length);
								endIndentLen = 0;
							}
							//Indent is in start of selection
							else if (currentLineStart == selStartPos) {
								startIndentLen = 0;
								endIndentLen = 0;
								selectionVal = selectionVal.substring(self._tab.length);
							}
							//Indent is before selection
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
					//Indent
					else {
						beforeSelection = beforeSelection.substr(0, currentLineStart) + self._tab + beforeSelection.substring(currentLineStart, selStartPos);
						selectionVal = selectionVal.replace(/\n/g, '\n' + self._tab);
					}

					//Set new indented value
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

		// Firefox fix
		this._text.addEventListener("keydown", function(e) {
			isTab = false;
			if (e.keyCode === 9) {
				isTab = true;
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		});
		this._text.addEventListener("keypress", function(e) { 
			if (!isTab) { 
				return true
			} 
			e.preventDefault(); 
			e.stopPropagation(); 
			return false;
		}); 
		const debounceChange = debounce(onChange, 30);
		this._text.addEventListener("input", debounceChange);
		this._text.addEventListener("keyup", debounceChange);
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
		this._text.addEventListener("scroll", function () {
			parent._pre.scrollTop = this.scrollTop;
		});
	}

	private renderOutput(value: string) {
		const entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#39;",
			"/": "&#x2F;",
			"`": "&#x60;",
			"=": "&#x3D;"
		};

		const htmlSet = value.replace(/[&<>"'`=\/]/gmi, (s) => entityMap[s]) + "\n";
		this._code.innerHTML = htmlSet;
		if (this._changeListener) {
			this._changeListener(value);
		}
		Prism.highlightElement(this._code);
	}

	private focusInput() {
		this._text.focus();
		this._text.selectionStart = 0;
		this._text.selectionEnd = 0;
	}
}