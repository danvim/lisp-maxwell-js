import { describe, test } from 'node:test'
import * as assert from 'node:assert'
import {
  $PLUS,
  ATOM,
  CAR,
  CDR,
  COND,
  CONS,
  EQ,
  LAMBDA,
  lApply,
  LET,
  LET_STAR,
  lEval,
  NIL,
  QUOTE,
  T,
} from './lisp.js'
import { L } from './helper.js'
import { UnboundVariableError } from './errors.js'

const x = Symbol('x')
const y = Symbol('y')

describe('apply', () => {
  describe('CAR', () => {
    test('returns the head elements when present', () => {
      assert.strictEqual(lApply(CAR, L(L(1, 2))), 1)
    })
    test('returns NIL when there is no element', () => {
      assert.strictEqual(lApply(CAR, L(L())), NIL)
    })
  })

  describe('CDR', () => {
    test('returns the tail elements when present', () => {
      assert.deepStrictEqual(lApply(CDR, L(L(1, 2, 3))), L(2, 3))
    })
    test('returns NIL when there is no element', () => {
      assert.strictEqual(lApply(CDR, L(L(1))), NIL)
      assert.strictEqual(lApply(CDR, L(L())), NIL)
    })
  })

  describe('CONS', () => {
    test('forms a pair', () => {
      assert.deepStrictEqual(lApply(CONS, L(1, 2)), [1, 2])
    })
    test('forms a list when the second element is NIL', () => {
      assert.deepStrictEqual(lApply(CONS, L(1, NIL)), L(1))
    })
    test('inserts a new element into a list', () => {
      assert.deepStrictEqual(lApply(CONS, L(1, L(2, 3))), L(1, 2, 3))
    })
  })

  describe('ATOM', () => {
    test('returns T when argument is not a pair', () => {
      assert.deepEqual(lApply(ATOM, L(1)), T)
      assert.deepEqual(lApply(ATOM, L(NIL)), T)
      assert.deepEqual(lApply(ATOM, L(T)), T)
      assert.deepEqual(lApply(ATOM, L(CONS)), T)
    })

    test('returns NIL when argument is a pair', () => {
      assert.deepEqual(lApply(ATOM, L([1, 2])), NIL)
      assert.deepEqual(lApply(ATOM, L(L(1, 2, 3))), NIL)
    })
  })

  describe('EQ', () => {
    test('atoms equals returns T without context', () => {
      assert.strictEqual(lApply(EQ, L(1, 1)), T)
    })
    test('atoms unequal returns NIL without context', () => {
      assert.strictEqual(lApply(EQ, L(1, 2)), NIL)
    })
  })

  describe('function is unknown atom', () => {
    test('function value is evaluated from context and then applies to arguments', () => {
      const mySymbol = Symbol('mySymbol')
      assert.strictEqual(lApply(mySymbol, L(NIL), L([mySymbol, ATOM])), T)
    })
    test('function that does not exist in context should throw exception', () => {
      assert.throws(() => lApply('unknownSymbol', L(), L()))
    })
  })

  describe('lambda', () => {
    test('returns evaluation result from lambda expression binding argument to parameter symbol', () => {
      assert.strictEqual(lApply(L(LAMBDA, L(x), x), L(12)), 12)
    })

    test('multiple parameter bindings and function call expressions are evaluated', () => {
      assert.deepStrictEqual(
        lApply(L(LAMBDA, L(x, y), L(CONS, x, y)), L(1, 2)),
        [1, 2],
      )
    })

    test('parameter bound variable value should shadow variable value in context', () => {
      assert.strictEqual(
        lApply(L(LAMBDA, L(x), x), L('localValue'), L([x, 'shadowedValue'])),
        'localValue',
      )
    })
  })
})

describe('eval', () => {
  describe('binding', () => {
    test('should return bound argument', () => {
      assert.strictEqual(lEval(x, L([x, 1])), 1)
    })
    test('should throw if symbol not found', () => {
      assert.throws(() => lEval(x, L()), UnboundVariableError)
    })
  })
  describe('special forms', () => {
    test('quote should return the unevaluated form', () => {
      const content = L(ATOM, T)
      assert.strictEqual(lEval(L(QUOTE, content)), content)
    })
    describe('cond', () => {
      test('should evaluate and return branch when condition is true', () => {
        assert.strictEqual(
          lEval(
            L(
              COND,
              L(L(QUOTE, NIL), Symbol('unbound variable')),
              L(L(QUOTE, T), 12),
            ),
          ),
          12,
        )
      })
    })
    describe('let', () => {
      test('should bind values to variables in parallel', () => {
        assert.deepStrictEqual(
          lEval(
            L(
              LET,
              L(L(x, L($PLUS, 1, x)), L(y, L($PLUS, 2, x))),
              L(CONS, x, y),
            ),
            L([x, 1]),
          ),
          [2, 3],
        )
      })
    })
    describe('let*', () => {
      test('should bind values to variables in sequence', () => {
        assert.deepStrictEqual(
          lEval(
            L(
              LET_STAR,
              L(L(x, L($PLUS, 1, x)), L(y, L($PLUS, 2, x))),
              L(CONS, x, y),
            ),
            L([x, 1]),
          ),
          [2, 4],
        )
      })
    })
  })
})
