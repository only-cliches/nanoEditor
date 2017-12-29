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
export declare class nanoEditor {
    container: HTMLElement;
    textArea: HTMLTextAreaElement;
    preContainer: HTMLPreElement;
    codeContainer: HTMLElement;
    indent: string;
    private _changeListener;
    constructor(inputSel: string | HTMLElement, language?: string, lineNumbers?: boolean);
    setValue(code: string): void;
    setLanguage(language: string): void;
    onChange(callback: (val: string) => void): void;
    private listenForInput();
    private _removeLang(elem);
    private listenerForScroll();
    private renderOutput(value);
    private focusInput();
}
