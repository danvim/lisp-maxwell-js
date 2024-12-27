import { TypeError } from './errors.js'

export const guardType = (thing, type) => {
  if (typeof thing === type) {
    return thing
  }
  throw new TypeError(thing, type)
}
