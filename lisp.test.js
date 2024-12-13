import { describe, test } from 'node:test'
import * as assert from 'node:assert'
import { EQ, lApply, lEval, NIL, T } from './lisp.js'
import { L } from './helper.js'

describe('apply', () => {
  describe('EQ', () => {
    test('atoms equals returns T without context', () => {
      assert.strictEqual(lApply(EQ, L(1, 1)), T)
    })
    test('atoms unequal returns NIL without context', () => {
      assert.strictEqual(lApply(EQ, L(1, 2)), NIL)
    })
  })
})

describe('eval', () => {
  describe('binding', () => {
    test('should return bound argument', () => {
      assert.strictEqual(lEval('x', L(['x', 1])), 1)
    })
    test('should return NIL if symbol not found', () => {
      assert.strictEqual(lEval('x', L()), NIL)
    })
  })
})