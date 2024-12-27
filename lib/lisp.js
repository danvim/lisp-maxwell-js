import { guardType } from "./guards.js"
import { UnboundVariableError } from "./errors.js"

/**
 * @param fn Function
 * @param x arguments
 * @param a {any[]|symbol} context
 * @return {*|[*,*]|symbol}
 */
export const lApply = (fn, x, a = NIL) => {
  if (atom(fn)) {
    switch (fn) {
      case CAR:
        return caar(x)
      case CDR:
        return cdar(x)
      case CONS:
        return cons(car(x), cadr(x))
      case ATOM:
        return atom(car(x)) ? T : NIL
      case EQ:
        return car(x) === cadr(x) ? T : NIL
      /* Start additional symbols */
      case $PLUS:
        return sum(x)
      case $MINUS:
        return subtract(x)
      case $MULTIPLY:
        return multiply(x)
      case $DIVIDE:
        return divide(x)
      case MOD:
        return mod(x)
      case REM:
        return guardType(car(x), 'number') % guardType(cadr(x), 'number')
      /* End additional symbols */
      default:
        return lApply(lEval(fn, a), x, a)
    }
  } else if (car(fn) === LAMBDA) {
    return lEval(caddr(fn), pairlis(cadr(fn), x, a))
  } else if (car(fn) === LABEL) {
    return lApply(caddr(fn), cdr(x), cons(cons(cadr(fn), caddr(fn)), a))
  }
  throw new Error('What is this?')
}

export const lEval = (e, a) => {
  if (atom(e)) {
    if (typeof e === 'string' || typeof e === 'number') {
      return e
    }
    const h = assoc(e, a)
    if (h === NIL) {
      throw new UnboundVariableError(e)
    }
    return cdr(h)
  } else if (atom(car(e))) {
    if (car(e) === QUOTE) return cadr(e)
    else if (car(e) === COND) return evcon(cdr(e), a)
    else return lApply(car(e), evlis(cdr(e), a), a)
  } else {
    return lApply(car(e), evlis(cdr(e), a), a)
  }
}

const car = (L) => L[0] ?? NIL
const caar = (L) => L[0]?.[0] ?? NIL
const cdr = (L) => L[1] ?? NIL
const cdar = (L) => L[0]?.[1] ?? NIL
const cadr = (L) => L[1]?.[0] ?? NIL
const caddr = (L) => L[1]?.[1]?.[0] ?? NIL
const cadar = (L) => L[0]?.[1]?.[0] ?? NIL
export const cons = (L1, L2) => [L1, L2]
const atom = (x) => !Array.isArray(x)

const pairlis = (keys, values, alist) => {
  if (keys === NIL || values === NIL) {
    return alist
  }
  return cons(
    cons(car(keys), car(values)),
    pairlis(cdr(keys), cdr(values), alist),
  )
}
/**
 * Returns value from an associated list by key `'((a 1) (b 2) (c 3)`
 */
const assoc = (key, alist) => {
  const h = car(alist)
  if (alist === NIL) {
    return NIL
  } else if (car(h) === key) {
    return h
  } else {
    return assoc(key, cdr(alist))
  }
}
const evlis = (m, a) => {
  if (m === NIL) return NIL
  return cons(lEval(car(m), a), evlis(cdr(m), a))
}
const evcon = (c, a) => {
  if (lEval(caar(c), a) === T) {
    return lEval(cadar(c), a)
  }
  return evcon(cdr(c), a)
}

const sum = (alist) => {
  const a = car(alist)
  const b = cdr(alist)
  if (a === NIL) return 0
  if (b === NIL) return guardType(a, 'number')
  return guardType(a, 'number') + sum(b)
}

const subtract = (alist) => {
  const a = car(alist)
  const b = cdr(alist)
  if (b === NIL) return -guardType(a, 'number')
  return guardType(a, 'number') - sum(b)
}

const multiply = (alist) => {
  const a = car(alist)
  const b = cdr(alist)
  if (a === NIL) return 1
  if (b === NIL) return guardType(a, 'number')
  return guardType(a, 'number') * multiply(b)
}

const divide = (alist) => {
  const a = car(alist)
  const b = cdr(alist)
  if (b === NIL) return 1 / guardType(a, 'number')
  return guardType(a, 'number') / multiply(b)
}

const mod = (alist) => {
  const a = guardType(car(alist), 'number')
  const b = guardType(cadr(alist), 'number')
  return a - b * Math.floor(a / b)
}

export const T = Symbol('t')
export const COND = Symbol('cond')
export const QUOTE = Symbol('quote')
export const NIL = Symbol('nil')
export const CAR = Symbol('car')
export const CDR = Symbol('cdr')
export const CONS = Symbol('cons')
export const ATOM = Symbol('atom')
export const EQ = Symbol('eq')
export const LAMBDA = Symbol('lambda')
export const LABEL = Symbol('label')

export const $PLUS = Symbol('+')
export const $MINUS = Symbol('-')
export const $MULTIPLY = Symbol('*')
export const $DIVIDE = Symbol('/')
export const MOD = Symbol('mod')
export const REM = Symbol('rem')

/*
 * Atom:
 * numbers
 * symbols
 * strings
 * characters
 * booleans: T, NIL
 * empty list, same as NIL
 * */
