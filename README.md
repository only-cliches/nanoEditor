# nanoEditor

Super small and simple code editor inspired by CodeFlask.

<img src="https://raw.githubusercontent.com/ClickSimply/nanoEditor/master/preview.png" alt="Demo">

- Includes Typescript typings.
- Plays nice with bablel/ES5 projects.
- Only **10kb gzipped** (including PrismJS dependency).
- Supports HTML, JSX, Typescript, CSS, LESS & SASS out of the box. 
- Line number support.

## Install (Browser)
1. Include the editor CDN in your `<head>` tag.
```html
<script src="https://cdn.jsdelivr.net/npm/nano-editor@0.0.1/dist/nanoEditor.min.js"></script>
```

2. Include a theme from [cdnjs for PrismJS](https://cdnjs.com/libraries/prism) 1.9.0 in your `head` tag.
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.9.0/themes/prism.min.css" />
```

## Install (Webpack / Browserify / etc)

1. Install this lib from npm.
```sh
npm i nano-editor --save
```

2. Import the lib and a prismjs theme into your project.
```js
import { nanoEditor } from "nano-editor";
import "prismjs/themes/prism.css";
```

## Usage / API

The `new nanoEditor()` method accepts three arguments:
1. **Element:** Id or HTML element to attach the editor to.
2. **Type:** The type of code being displayed, defalts to `markdown`.
3. **Line Numbers:** Pass in `true` to see line numbers.

Once you've setup an instance, there are a few public methods you can use:

### .onChange(changeFunction: (value: string) => void)
Accepts a single function as it's argument, the function will get called each time the editor is updated.  The function will also have the editor's value passed into it.

### .setLanguage(language: string)
Change the language of the editor inline.

### .setValue(value: string)
Sets the contents of the editor.

## Example
```html
<div id="#code">
    alert("Dont taze me bro.");
</div>
<script>
    const editor = new nanoEditor("#code", "javascript");
    editor.setValue("alert(Don't move BRO!)");
</script>
```

