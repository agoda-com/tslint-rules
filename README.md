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

## `disallowed-in-tests`
Prints out a warning, that this CallExpression should not be used in the TEST files, and should get refactored if possible.

### name
name of the call expression you want to ban in the test files.
* if that callExpression is a function, just simple give the function name.
* if that callExpression is a method, give use please write down the full path `"object.method"`

### Message
warning message you would like to give to the particular callExpression.

Example:
```js
//myFile.test.tsx

it('all elements are loaded correctly', (done) => {
    const wrapper = mount(<SomeComponent {...someComponentParams} />);
    // not allowed
    setTimeout(
        () => {
            expect(...)
        }, 0);
});
```
Example usage:
```js
{
    "disallowed-in-tests": [
      true,
      {"name": "setTimeout", "message": "no setTimeout allow in test files"}
    ]
}
```

## `no-mount-and-snapshot`
Prints out a warning, that you should not be using `mount` and `toMatchSnapshot` in the same test case.

Example
```js
//myFile.test.tsx

// not allowed
it('all elements are loaded correctly', () => {
    const wrapper = mount(<SomeComponent {...someComponentParams} />);
    expect(enzymeToJson(wrapper)).toMatchSnapshot();
});

// allowed
it('all elements are loaded correctly', () => {
    const wrapper = shallow(<SomeComponent {...someComponentParams} />);
    expect(enzymeToJson(wrapper)).toMatchSnapshot();
});

// allowed
it('all elements are loaded correctly', () => {
    const wrapper = mount(<SomeComponent {...someComponentParams} />);
    expect(wrapper.find(myComponent).length).toBe(1);;
});
```
Example usage:
```js
"no-mount-and-snapshot": true,
```
