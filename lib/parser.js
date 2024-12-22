import {
  ATOM,
  CAR,
  CDR,
  COND,
  CONS,
  EQ,
  LABEL,
  LAMBDA,
  NIL,
  QUOTE,
  T,
} from './lisp.js'
import { L } from './helper.js'

const tokenRes = {
  bl: /\(/y,
  br: /\)/y,
  barredSymbol: /\|((?:[^|]|\\\|)*[^\\])\|/y,
  string: /"((?:[^"]|\\")*[^\\]|)"/y,
  number: /([+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)/y,
  quote: /'/y,
  symbol: /([^()\s]+)/y,
  space: /(\s+)/y,
}

// Requires unescaping only \|
const unescapeBarredSymbols = (s) => s.replaceAll('\\|', '|')
const unescapeSymbols = (s) => s.replaceAll(/\\(.)/g, '$1')

export const tokenize = (source) => {
  const tokens = []
  let lastIndex = 0

  while (true) {
    const matches = Object.entries(tokenRes)
      .map(([key, re]) => {
        re.lastIndex = lastIndex
        const matches = re.exec(source)
        return [key, matches]
      })
      .filter(([, matches]) => matches !== null)
      .toSorted((a, b) => a[1].index - b[1].index)

    if (matches.length === 0) {
      break
    }

    const [key, match] = matches[0]

    tokens.push([key, match[1], match[0]])

    lastIndex += match[0].length
  }

  return tokens
}

export const parseRecurse = (
  parts,
  i = 0,
  parseSymbols = new Map(Object.entries(symbolsMap)),
) => {
  if (i > parts.length) {
    throw new Error('Expected more tokens')
  }
  if (i === parts.length) {
    return null
  }
  const [type, content] = parts[i]
  if (type === 'space') {
    return parseRecurse(parts, i + 1, parseSymbols)
  } else if (type === 'bl') {
    if (i + 1 <= parts.length) {
      const { next: thing, i: nextI } = parseRecurse(parts, i + 1, parseSymbols)
      const nextParse = parseRecurse(parts, nextI, parseSymbols)
      if (nextParse === null) {
        // EOF
        return {
          next: [thing, NIL],
          i,
        }
      }
      return {
        next: [thing, nextParse.next],
        i: nextParse.i,
      }
    } else {
      throw new Error('Cannot open bracket at last position')
    }
  } else if (type === 'br') {
    return { next: NIL, i: i + 1 }
  } else if (type === 'quote') {
    if (i + 1 <= parts.length) {
      const { next: thing, i: nextI } = parseRecurse(parts, i + 1, parseSymbols)
      return {
        next: [L(QUOTE, thing[0]), thing[1]],
        i: nextI,
      }
    } else {
      throw new Error('Cannot use quote at last position')
    }
  } else {
    // symbol
    let thing = null
    if (type === 'number') {
      thing = parseFloat(content)
    } else if (type === 'string') {
      thing = content
    } else if (type === 'symbol') {
      thing = upsertSymbol(unescapeSymbols(content), parseSymbols)
    } else if (type === 'barredSymbol') {
      thing = upsertSymbol(unescapeBarredSymbols(content), parseSymbols)
    }
    const nextParse = parseRecurse(parts, i + 1, parseSymbols)
    if (nextParse === null) {
      // EOF
      return {
        next: [thing, NIL],
        i,
      }
    }
    return {
      next: [thing, nextParse.next],
      i: nextParse.i,
    }
  }
}

export const parse = (source) => parseFromTokens(tokenize(source))
export const parseFromTokens = (tokens) => parseRecurse(tokens).next[0]

const symbolsMap = {
  t: T,
  cond: COND,
  quote: QUOTE,
  nil: NIL,
  car: CAR,
  cdr: CDR,
  cons: CONS,
  atom: ATOM,
  eq: EQ,
  lambda: LAMBDA,
  label: LABEL,
}

const upsertSymbol = (content, symbolsMap) => {
  const symbol = symbolsMap.get(content)
  if (symbol) {
    return symbol
  }
  const newSymbol = Symbol(content)
  symbolsMap.set(content, newSymbol)
  return newSymbol
}
