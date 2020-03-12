# yastjson
[![npm version](https://badge.fury.io/js/yastjson.svg)](https://badge.fury.io/js/yastjson)
[![Build Status](https://travis-ci.org/zhuyingda/yastjson.svg?branch=master)](https://travis-ci.org/zhuyingda/yastjson)

## Overview
Yastjson is **Y**et **A**nother fa**ST** **JSON**, which provide you a high-performaince `JSON.parse` method instead of the native function in Node.js.

## Installation

```
npm install yastjson

npm test
```

or

clone [github repository](https://github.com/zhuyingda/yastjson)

## Usage

```
const YJSON = require('yastjson');

let jsonString = '{a:1}';
let obj = YJSON.parse(jsonString);
console.log(obj);
```

You will get the object, just like using `JSON.parse`.

## Design

### Token Definition
![](https://www.zhuyingda.com/static/img/yastjson-token.svg)

### Lexical Analysis
![](https://www.zhuyingda.com/static/img/yastjson-fsm.svg)

### Syntactic Analysis
![](https://www.zhuyingda.com/static/img/yastjson-bnf.svg)

## License

[GPL-V3](http://www.gnu.org/licenses/)

Copyright (c) 2020-present, Yingda (Sugar) Zhu