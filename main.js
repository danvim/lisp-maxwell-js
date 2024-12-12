import { CAR, CONS, evalquote, L, LAMBDA, reader } from './lisp.js'

console.log(reader(
  evalquote(
    L(LAMBDA, L('x', 'y'),
      L(CONS, L(CAR, 'x'), 'y')),
    L(L('a', 'b'), L('c', 'd'))
  )
))