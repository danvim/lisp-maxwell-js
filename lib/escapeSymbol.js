const symbolRequiresEscape = (name) =>
  name.match(/[ '"]|^([+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)$/) !== null

export const escapeSymbol = (name) =>
  symbolRequiresEscape(name) ? `|${name.replaceAll('|', '\\|')}|` : name
