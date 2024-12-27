import { print } from './print.js'

export class TypeError extends Error {
  constructor(thing, expectedType) {
    super(`Unhandled TYPE-ERROR

The value
  ${print(thing)}
is not of type
  ${expectedType}`)
  }
}

export class UnboundVariableError extends Error {
  constructor(thing) {
    super(`Unhandled UNBOUND-VARIABLE

The variable ${print(thing)} is unbound.`)
  }
}
