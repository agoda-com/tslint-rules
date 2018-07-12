[![npm](https://img.shields.io/npm/v/tslint-refactor.svg)](https://www.npmjs.com/package/tslint-refactor)

# tslint-refactor
TSLint rules to help with code cleanup. 
Idea behind having additional rules apart from the built-in tslint `ban` rule is to enable different levels for different issues in your code.

## do-not-use
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

Example usage:
```js
"do-not-use": [
    true,
    {name: ["*", "forEach"], message: "Please refactor and use regular loops instead"},
],
```
