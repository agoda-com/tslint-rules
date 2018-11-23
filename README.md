[![npm](https://img.shields.io/npm/v/agoda-tslint.svg)](https://www.npmjs.com/package/agoda-tslint)
[![build](https://travis-ci.org/agoda-com/agoda-tslint.svg?branch=master)](https://travis-ci.org/agoda-com/agoda-tslint)
# agoda-tslint
A set of TSLint rules used on some Agoda projects.

## `do-not-use`
Prints out a warning, that this function / method should not be used, and should get refactored if possible

A list of banned functions or methods in the following format:
* marking functions as not cool:
  * just the name of the function: `"functionName"`
  * the name of the function in an array with one element: `["functionName"]`
  * an object in the following format: `{"name": "functionName", "message": "optional explanation message"}`
* marking  methods as not cool:
  * an array with the object name, method name and optional message: `["functionName", "methodName", "optional message"]`
  * an object in the following format: `{"name": ["objectName", "methodName"], "message": "optional message"}`
    * you can also ban deeply nested methods: `{"name": ["foo", "bar", "baz"]}` bans `foo.bar.baz()`
    * the first element can contain a wildcard (`*`) that matches everything. `{"name": ["*", "forEach"]}` bans
      `[].forEach(...)`, `$(...).forEach(...)`, `arr.forEach(...)`, etc.

Example:
```js
[].forEach(e => doSomething()); // -> not allowed
```

Example usage:
```json
"do-not-use": [
    true,
    {name: ["*", "forEach"], message: "Please refactor and use regular loops instead"},
],
```

## `root-relative-imports`
Prevents traversing upwards in directory structure when importing files, forcing the use of root relative imports instead.

Example:
```js
import { MyComponent } from './MyComponent'; // -> allowed
import { MyComponent } from './Child/MyComponent'; // -> allowed
import { MyComponent } from 'components/MyComponent'; // -> allowed
import { MyComponent } from '../components/MyComponent'; // -> not allowed
```

Example usage:
```js
"root-relative-imports": true,
```
