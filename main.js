import { CAR, CONS, lApply, LAMBDA, LABEL, COND, EQ, NIL, QUOTE, CDR, T, ATOM } from './lisp.js'
import { $, L, reader } from './helper.js'
import { fromSource, parse, tokenize } from './parser.js'

console.log(reader(
  lApply(
    $([LAMBDA, ['x', 'y'],
      [CONS, [CAR, 'x'], 'y']]),
    $([['a', 'b'], ['c', 'd']])
  )
))

console.log(reader(
  lApply(
    $([LAMBDA, ['x'],
      [EQ, 'x', [QUOTE, T]]]),
    $([T])
  )
))

console.log(reader(
  lApply(
    $([LABEL, 'reverse',
      [LAMBDA, ['ls', 'new'],
        [COND, [['null?', 'ls'], 'new'],
          [[QUOTE, T], ['reverse', [CDR, 'ls'], [CONS, [CAR, 'ls'], 'new']]]]]]),
    $(['reverse', ['a', 'b', 'c', 'd', 'e'], []]),
    L(['null?', $([LAMBDA, ['x'], [EQ, 'x', [QUOTE, NIL]]])])
  )
))

console.log(reader(
  lApply(
    $([LABEL, 'equal', [LAMBDA, ['x', 'y'], [COND,
      [[ATOM, 'x'], [COND, [[ATOM, 'y'], [EQ, 'x', 'y']], [[QUOTE, T], [QUOTE, NIL]]]],
      [['equal', [CAR, 'x'], [CAR, 'y']], ['equal', [CDR, 'x'], [CDR, 'y']]],
      [[QUOTE, T], [QUOTE, NIL]]
    ]]]),
    $(['equal', [1, 2, 3], [1, 2, 3]])
  )
))

const equalProgram = fromSource(
  // language=lisp
  `(label equal (lambda (x y) (cond
  ((atom x) (cond ((atom y) (eq x y)) ((quote t) (quote nil))))
  ((equal (car x) (car y)) (equal (cdr x) (cdr y)))
  ((quote t) (quote nil))
)))`
)

console.log(reader(fromSource(
  // language=lisp
  `(label equal (lambda (x y) (cond
    ((atom x) (cond ((atom y) (eq x y)) ('t 'nil)))
    ((equal (car x) (car y)) (equal (cdr x) (cdr y)))
    ('t 'nil)
  )))`
)))

console.log(reader(
  lApply(
    equalProgram,
    // language=lisp
    fromSource('(equal (1 2 3) (4 5 6))')
  )
))

// language=lisp
console.log(reader(fromSource(`('t 't 't)`)))

// language=lisp
console.log(reader(fromSource(`(x 't)`)))

// language=lisp
console.log(reader(fromSource(`(lambda (x) (eq x 'nil))`)))

console.log(reader(
  lApply(
    // language=lisp
    fromSource(`(lambda (x) (eq x 'nil))`),
    // language=lisp
    fromSource('(t)')
  )
))