# yastjson
Yastjson is **Y**et **A**nother fA**s**t **JSON**, which provide you a high-performaince `JSON.parse` method instead of the native function in Node.js.

## Installation:

```
npm install yastjson

npm test
```

or

clone [github repository](https://github.com/zhuyingda/yastjson)

## Usage:

```
const YJSON = require('yastjson');

let jsonString = '{a:1}';
let obj = YJSON.parse(jsonString);
console.log(obj);
```

You will get the object, just like using `JSON.parse`.