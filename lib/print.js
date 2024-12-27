import { NIL } from './lisp.js'
import { escapeSymbol } from './escapeSymbol.js'

const printListItem = (list, depth = -1) =>
  list === NIL
    ? ''
    : !Array.isArray(list)
      ? '. ' + print(list, depth)
      : (print(list[0], depth) + ' ' + printListItem(list[1], depth)).trim()

export const print = (value, depth = -1) =>
  typeof value === 'symbol'
    ? escapeSymbol(value.description)
    : typeof value === 'string'
      ? `"${value}"`
      : Array.isArray(value)
        ? depth === 0
          ? '(...)'
          : '(' + printListItem(value, depth - 1) + ')'
        : value
