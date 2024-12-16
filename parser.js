import { ATOM, CAR, CDR, COND, cons, CONS, EQ, LABEL, LAMBDA, NIL, QUOTE, T } from './lisp.js'

const tokenRes = {
  bl: /\(/y,
  br: /\)/y,
  barredSymbol: /\|((?:[^|]|\\\|)*[^\\])\|/y,
  string: /"((?:[^"]|\\")*[^\\])"/y,
  number: /([+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)/y,
  quote: /'/y,
  symbol: /([^()\s]+)/y,
  space: /(\s+)/y
}

// Requires unescaping only \|
const barredSymbol = /\|((?:[^|]|\\\|)*[^\\])\|/
const unescapeBars = s => s.replaceAll('\\|', '|')
const symbolEscapeChars = /(\\[\w'"])/
const numberMatcher = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/

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
      .filter(([key, matches]) => matches !== null)
      .toSorted((a, b) => a[1].index - b[1].index)

    if (matches.length === 0) {
      break
    }

    const [key, match] = matches[0]

    if (key !== 'space') {
      tokens.push([key, match[1]])
    }

    lastIndex += match[0].length
  }

  return tokens
}

export const parse = (parts, i = 0) => {
  if (i > parts.length - 1) {
    return null
  }
  const [type, content] = parts[i]
  if (type === 'bl') {
    if (i + 1 <= parts.length) {
      if (parts[i + 1][0] === 'br') {
        // empty list
        return NIL
      } else {
        const {next: thing, i: nextI} = parse(parts, i + 1)
        const nextParse = parse(parts, nextI + 1)
        return {
          next: [thing, nextParse ? nextParse.next : NIL],
          i: nextParse?.i ?? nextI
        }
      }
    } else {
      throw new Error('Cannot open bracket at last position')
    }
  } else if (type === 'br') {
    return { next: NIL, i }
  } else if (type === 'quote') {
    if (i + 1 <= parts.length) {
      const {next: thing, i: nextI} = parse(parts, i + 1)
      return {
        next: [cons(QUOTE, [thing[0], NIL]), thing[1]],
        i: nextI
      }
    } else {
      throw new Error('Cannot use quote at last position')
    }
  } else {
    // symbol
    let thing = null
    if (type === 'number') {
      thing = parseFloat(content)
    } else if (type === 'barredSymbol') {
      thing = content
    } else if (type === 'string') {
      thing = { type: 'string', content }
    } else if (type === 'symbol') {
      thing = symbolsMap[content] ?? content
    }
    const nextParse = parse(parts, i + 1)
    return {
      next: [
        thing,
        nextParse?.next ?? NIL
      ],
      i: nextParse?.i ?? i
    }
  }
}

export const fromSource = (source) => parse(tokenize(source)).next[0]

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