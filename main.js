import {
  ATOM,
  CAR,
  CDR,
  COND,
  CONS,
  EQ,
  LABEL,
  LAMBDA,
  lApply,
  NIL,
  QUOTE,
  T,
} from './lisp.js'
import { $, L, reader } from './helper.js'
import { parse } from './parser.js'

const x = Symbol('x')
const y = Symbol('y')

console.log(
  reader(
    lApply(
      $([LAMBDA, [x, y], [CONS, [CAR, x], y]]),
      $([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    ),
  ),
)

console.log(reader(lApply($([LAMBDA, [x], [EQ, x, [QUOTE, T]]]), $([T]))))

const reverse = Symbol('reverse')
const nullQ = Symbol('null?')
const ls = Symbol('ls')
const newV = Symbol('new')

console.log(
  reader(
    lApply(
      $([
        LABEL,
        reverse,
        [
          LAMBDA,
          [ls, newV],
          [
            COND,
            [[nullQ, ls], newV],
            [
              [QUOTE, T],
              [reverse, [CDR, ls], [CONS, [CAR, ls], newV]],
            ],
          ],
        ],
      ]),
      $([reverse, ['a', 'b', 'c', 'd', 'e'], []]),
      L([nullQ, $([LAMBDA, [x], [EQ, x, [QUOTE, NIL]]])]),
    ),
  ),
)

const equal = Symbol('equal')

console.log(
  reader(
    lApply(
      $([
        LABEL,
        equal,
        [
          LAMBDA,
          [x, y],
          [
            COND,
            [
              [ATOM, x],
              [
                COND,
                [
                  [ATOM, y],
                  [EQ, x, y],
                ],
                [
                  [QUOTE, T],
                  [QUOTE, NIL],
                ],
              ],
            ],
            [
              [equal, [CAR, x], [CAR, y]],
              [equal, [CDR, x], [CDR, y]],
            ],
            [
              [QUOTE, T],
              [QUOTE, NIL],
            ],
          ],
        ],
      ]),
      $([equal, [1, 2, 3], [1, 2, 3]]),
    ),
  ),
)

const equalProgram = parse(
  // language=lisp
  `(label equal (lambda (x y) (cond
  ((atom x) (cond ((atom y) (eq x y)) ((quote t) (quote nil))))
  ((equal (car x) (car y)) (equal (cdr x) (cdr y)))
  ((quote t) (quote nil))
)))`,
)

console.log(
  reader(
    parse(
      // language=lisp
      `(label equal (lambda (x y) (cond
    ((atom x) (cond ((atom y) (eq x y)) ('t 'nil)))
    ((equal (car x) (car y)) (equal (cdr x) (cdr y)))
    ('t 'nil)
  )))`,
    ),
  ),
)

console.log(
  reader(
    lApply(
      equalProgram,
      // language=lisp
      parse('(equal (1 2 3) (4 5 6))'),
    ),
  ),
)

// language=lisp
console.log(reader(parse(`('t 't 't)`)))

// language=lisp
console.log(reader(parse(`(x 't)`)))

// language=lisp
console.log(reader(parse(`(lambda (x) (eq x 'nil))`)))

console.log(
  reader(
    lApply(
      // language=lisp
      parse(`(lambda (x) (eq x 'nil))`),
      // language=lisp
      parse('(t)'),
    ),
  ),
)
