import { CAR, CONS, lApply, LAMBDA, LABEL, COND, EQ, NIL, QUOTE, CDR, T } from './lisp.js'
import { $, reader } from './helper.js'

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
          [COND, [[EQ, 'ls', [QUOTE, NIL]], 'new'],
                 [[QUOTE, T], ['reverse', [CDR, 'ls'], [CONS, [CAR, 'ls'], 'new']]]]]]),
    $(['reverse', ['a', 'b', 'c', 'd', 'e'], []])
  )
))