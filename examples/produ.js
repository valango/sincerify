/**
 * @module produ
 * @version 1.0.0
 */
'use strict'

process.env.NODE_ENV = 'development'

const sincerify = require('../index')

let trapped = []

const f0 = () => {
  throw new Error('F0')
}

const hook = (error, dst, fn, args) => {
  trapped.push({ error, dst, fn, args })
}

const f1 = sincerify(f0, hook)

f1('aaa')
