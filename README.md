# yastjson
Yastjson is **Y**et **A**nother f**A**st **JSON**, which provide you a high-performaince `JSON.parse` method instead of the native function in Node.js.

Installation:

```
npm install

npm test
```

Usage:

```
const YJSON = require('yastjson');

let jsonString = '{a:1}';
let obj = YJSON.parse(jsonString);
console.log(obj);
```

You will get the object, just like use `JSON.parse`.