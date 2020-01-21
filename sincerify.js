//  This code should not run in production mode!
'use strict'

const ME = 'sincerify'
const CB_NAME = 'sincereHook'
const E_DBL = ME + ': attempt to redefine %s'

const native = require('assert')
// const format = require('util').format

const nativeOK = (native.strict || native).ok

module.exports = native

if (!native.strict) module.exports.strict = native

const wrapFunc = (fn, cbName) => {
  const _ = (...args) => {
    try {
      return fn.apply(fn, args)
    } catch (error) {
      _[cbName] && _[cbName](error, fn, fn, args)
      throw error
    }
  }
  return _
}

const wrapMember = (dst, fn, cbName) => {
  return (...args) => {
    try {
      return fn.apply(dst, args)
    } catch (error) {
      dst[cbName] && dst[cbName](error, dst, fn, args)
      throw error
    }
  }
}

const wrapObject = (src, dst, cbName, exclude, anyFunc) => {
  for (const key of Object.keys(src)) {
    const v = dst[key] = src[key]

    if (v instanceof Function) {
      if (!anyFunc && key >= 'A' && key < 'a') continue
      if (!exclude) continue
      if (exclude instanceof RegExp) {
        if (exclude.test(key)) continue
      } else if (exclude.indexOf(key) >= 0) continue
      dst[key] = wrapMember(dst, v, cbName)
    }
  }
  return dst
}

const replace = (srcAPI, dstAPI, callback, cbName, exclude, anyFunc) => {
  if (typeof srcAPI === 'function') {
    if (!dstAPI) dstAPI = wrapFunc(srcAPI, cbName)
  } else if (!dstAPI) dstAPI = {}

  dstAPI[cbName] = callback
  return wrapObject(srcAPI, dstAPI, cbName, exclude, anyFunc)
}

// srcAPI, dstAPI = undefined, callback = undefined, name = undefined, exclude = undefined
module.exports = (srcAPI, ...args) => {
  let dstAPI, callback, name, exclude, anyFunc

  for (let i = 0, v; (v = args[i]) !== undefined; ++i) {
    if (!v && typeof v !== 'boolean') continue

    if (v instanceof RegExp || Array.isArray(v)) {
      nativeOK(!exclude, E_DBL, 'exclude') || (exclude = v)
    } else if (typeof v === 'string') {
      nativeOK(!name, E_DBL, 'name') || (name = v)
    } else if (typeof v === 'function') {
      nativeOK(!name, E_DBL, 'callback') || (callback = v)
    } else if (typeof v === 'object') {
      nativeOK(!name, E_DBL, 'dstAPI') || (dstAPI = v)
    } else if (typeof v === 'boolean') {
      nativeOK(!anyFunc, E_DBL, 'anyFunc') || (anyFunc = v)
    } else {
      throw TypeError(ME + ':bad argument #' + (i + 1))
    }
  }
  if (!name) name = CB_NAME

  return replace(srcAPI, dstAPI, callback, name, exclude, anyFunc)
}
