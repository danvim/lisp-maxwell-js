import { describe, test } from 'node:test'
import * as assert from 'node:assert'
import { parse } from './parser.js'
import { NIL, QUOTE, T } from './lisp.js'
import { $ } from './helper.js'

describe('parser', () => {
  describe('atoms', () => {
    test('nil', () => {
      assert.deepStrictEqual(parse('nil'), NIL)
    })
    test('t', () => {
      assert.deepStrictEqual(parse('t'), T)
    })
    test('unknown symbol', () => {
      const r = parse('mySymbol')
      assert.deepStrictEqual(typeof r, 'symbol')
      assert.deepStrictEqual(r.description, 'mySymbol')
    })
    test('symbol with escaped characters', () => {
      const r = parse('my\\"Symbol\\"')
      assert.deepStrictEqual(typeof r, 'symbol')
      assert.deepStrictEqual(r.description, 'my"Symbol"')
    })
    test('barred symbol', () => {
      const r = parse('|barred \\| \\ \\"|')
      assert.deepStrictEqual(typeof r, 'symbol')
      assert.deepStrictEqual(r.description, 'barred | \\ \\"')
    })
    test('string', () => {
      assert.deepStrictEqual(parse('"string"'), 'string')
    })
    test('number', () => {
      assert.deepStrictEqual(parse('1.23'), 1.23)
    })
    test('quote', () => {
      assert.deepStrictEqual(parse(`'t`), [QUOTE, [T, NIL]])
    })
  })
  describe('list wrapping', () => {
    test('empty list', () => {
      const r = parse('()')
      assert.deepStrictEqual(r, NIL)
    })
    test('1-item list', () => {
      const r = parse('(1)')
      assert.deepStrictEqual(r, [1, NIL])
    })
    test('2-item list', () => {
      const r = parse('(1 2)')
      assert.deepStrictEqual(r, [1, [2, NIL]])
    })
    test('empty nested list', () => {
      const r = parse('(())')
      assert.deepStrictEqual(r, [NIL, NIL])
    })
    test('1-item nested list', () => {
      const r = parse('((1))')
      assert.deepStrictEqual(r, [[1, NIL], NIL])
    })
    test('2-item nested list', () => {
      const r = parse('((1 2))')
      assert.deepStrictEqual(r, [[1, [2, NIL]], NIL])
    })
    test('multiple nested lists', () => {
      const r = parse('((1 2) (3))')
      assert.deepStrictEqual(r, [
        [1, [2, NIL]],
        [[3, NIL], NIL],
      ])
    })
    test('irregular lists', () => {
      const r = parse('((1 2) 4 (5 (3)))')
      assert.deepStrictEqual(r, $([[1, 2], 4, [5, [3]]]))
    })
    test('too many open braces should throw', () => {
      assert.throws(() => parse('((('))
    })
    test('quoted list', () => {
      const r = parse(`'('(1 2) 3 '4)`)
      assert.deepStrictEqual(r, $([QUOTE, [[QUOTE, [1, 2]], 3, [QUOTE, 4]]]))
    })
  })
})
