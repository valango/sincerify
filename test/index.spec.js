'use strict'
const ME = 'index'
process.env.NODE_ENV = 'test'

const assert = require('assert')
const AError = assert.AssertionError || Error
const { expect } = require('chai')
const { resolve } = require('path')
const path = resolve('./' + ME + '.js')
let target, trapped

const load = (env) => {
  delete require.cache[path]
  process.env.NODE_ENV = env
  target = require(path)
}

const make = (signature) => () => {
  throw new Error(signature)
}

const hook = (error, inst, fn, args) => trapped.push({ error, inst, fn, args })

const fireTest = (fn, locus, args) => {
  trapped = []
  expect(fn).to.throw(AError)
  expect(trapped.length).to.equal(1, locus + '.length')
  expect(trapped[0].args).to.eql(args, locus + '.args')
}

describe(ME, () => {
  beforeEach(() => {
    trapped = []
  })

  it('production mode should be inert', () => {
    load('production')

    const f0 = make('F')
    const f1 = target(f0, hook)
    expect(f1).to.eql(f0)
    expect(f1).to.throw(Error, 'F')
    expect(trapped).to.eql([])
  })

  describe('non-production mode', () => {
    before(() => load('test'))

    it('should wrap a function', () => {
      const f0 = make('F')
      const f1 = target(f0, hook)
      expect(f0.sincereHook).to.equal(undefined)
      expect(f1.sincereHook).to.equal(hook)
      expect(f1).to.throw(Error, 'F', 1)
      expect(f1).to.throw(Error, 'F', 2)
      expect(trapped.length).to.equal(2)
    })

    it('should wrap \'assert\'', () => {
      const a1 = target(assert, hook)
      expect(() => a1(0, 'A')).to.throw(AError, 'A')
      expect(trapped[0].args).to.eql([0, 'A'], 'args')
      expect(trapped[0].error instanceof AError).to.equal(true, 'instanceof')
      expect(trapped[0].error.message).to.equal('A', 'message')
      expect(trapped[0].fn).to.equal(trapped[0].inst)
      fireTest(() => a1.ok(false), 'ok', [false])
    })
  })
})
