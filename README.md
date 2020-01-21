# sincerify [![Build Status](https://travis-ci.org/valango/sincerify.svg?branch=master)](https://travis-ci.org/valango/sincerify) [![Code coverage](https://codecov.io/gh/valango/sincerify/branch/master/graph/badge.svg)](https://codecov.io/gh/valango/sincerify)

This is a debugging help tool. Making some API sincere means that whenever an exception gets thrown,
a dedicated callback is invoked.
You can set debugger breakpoint in callback code and this is the main purpose here.

Callback parameters contain some information about exception context, so you can be more specific
about when you want the debugger halt.

Sincerify's sole purpose is debugging support and it is not advisable to use it for any other purposes
(like error logging). Besides, if `process.env.NODE_ENV === 'production'`, then it does nothing.

## Examples
```javascript
const assert = require('assert')
const sincerify = require('sincerify')
const fs = require('fs')

const sfs = sincerify(fs, myFsCallback)

//  myFsCallback will be invoked on any exception from sfs calls, just before
// exception is thrown. Great for logging or debugging.
 
sfs.sincereCallback = null
//  No special behavior after that.

sfs.sincereCallback = someOtherFunction

```

**`sincerify`**`(srcAPI [, dstAPI] [, name] [, callback] [, exclude])`
* `srcAPI: Object `- Original API to be sincerified.
* `dstAPI: Object `- a new API object will be created by default.
* `name: string `- name for callback hook added to dstAPI; default: 'sincereCallback'
* `callback: function `- callback to be set; default: _`undefined`_.
* `exclude: string[]|RegExp `- if present, then function members with matching names will not be wrapped.
* **_Returns_**: `Object` - the dstAPI instance or new object.

Important
1. This function does nothing in production mode
1. Only enumerable properties of srcAPI are processed. For class methods, use sincere npm package.
