import { NIL } from './lisp.js'

export const L = (...a) => {
  if (a.length === 0) return NIL
  const [h, ...t] = a
  return [h, L(...t)]
}

export const unL = (aList) => {
  if (aList === NIL) return []
  return [aList[0]].concat(unL(aList[1]))
}

/** Convert JS list into Lisp List representation, assuming JS array of 2 elems is a Lisp pair. */
export const $ = (arr) =>
  L(...arr.map(item =>
    Array.isArray(item)
      ? $(item)
      : item
  ))

/** Inverse of a2L. Converts Lisp list representation into JS arrays */
export const reader = (results) => {
  if (Array.isArray(results)) {
    return unL(results).map(reader)
  }
  return results
}
