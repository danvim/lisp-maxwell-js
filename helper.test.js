import { test, describe } from 'node:test'
import * as assert from 'node:assert'
import { NIL } from './lisp.js'
import {$} from './helper.js'

describe('$', () => {
  test('Should convert empty array', () => {
    assert.deepEqual($([]), NIL)
  })

  test('Should convert simple array', () => {
    assert.deepEqual($([1, 2]), [1, [2, NIL]])
  })

  test('Should convert nested arrays', () => {
    assert.deepEqual($([1, [2, 3]]), [1, [[2, [3, NIL]], NIL]])
  })
})