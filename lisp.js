/**
 * @param fn Function
 * @param x arguments
 * @param a {any[]|symbol} context
 * @return {*|[*,*]|symbol}
 */
export const lApply = (fn, x, a = NIL) => {
  if (atom(fn)) {
    switch (fn) {
      case CAR: return caar(x)
      case CDR: return cdar(x)
      case CONS: return cons(car(x), cadr(x))
      case ATOM: return atom(car(x)) ? T : NIL
      case EQ: return car(x) === cadr(x) ? T : NIL
      default: return lApply(lEval(fn, a), x, a)
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
    const h = assoc(e, a)
    if (h === NIL) {
      throw new Error(`Variable ${typeof e === 'symbol' ? e.description : e} is unbounded`)
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

const car = L => L[0] ?? NIL
const caar = L => L[0]?.[0] ?? NIL
const cdr = L => L[1] ?? NIL
const cdar = L => L[0]?.[1] ?? NIL
const cadr = L => L[1]?.[0] ?? NIL
const caddr = L => L[1]?.[1]?.[0] ?? NIL
const cadar = L => L[0]?.[1]?.[0] ?? NIL
export const cons = (L1, L2) => [L1, L2]
const atom = x =>
  !Array.isArray(x)

const pairlis = (keys, values, alist) => {
  if (keys === NIL || values === NIL) {
    return alist
  }
  return cons(cons(car(keys), car(values)), pairlis(cdr(keys), cdr(values), alist))
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

export const T = Symbol('T')
export const COND = Symbol('COND')
export const QUOTE = Symbol('QUOTE')
export const NIL = Symbol('NIL')
export const CAR = Symbol('CAR')
export const CDR = Symbol('CDR')
export const CONS = Symbol('CONS')
export const ATOM = Symbol('ATOM')
export const EQ = Symbol('EQ')
export const LAMBDA = Symbol('LAMBDA')
export const LABEL = Symbol('LABEL')


/*
* Atom:
* numbers
* symbols
* strings
* characters
* booleans: T, NIL
* empty list, same as NIL
* */