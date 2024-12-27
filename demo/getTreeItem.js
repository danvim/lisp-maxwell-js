import { NIL } from '../lib/lisp.js'
import { print } from '../lib/print.js'
import { escapeSymbol } from '../lib/escapeSymbol.js'

export const getTreeItem = (value) => {
  const nodes = document.createDocumentFragment()

  const label = document.createElement('span')
  label.classList.add('label')

  const typeTag = document.createElement('sl-tag')
  typeTag.variant = 'primary'
  typeTag.size = 'small'
  label.append(typeTag)
  nodes.append(label)

  if (Array.isArray(value)) {
    const arr = arrayFromLispList(value)

    typeTag.append(`list (${arr.length})`)

    const listPreview = document.createElement('span')
    listPreview.classList.add('preview')
    listPreview.append(print(value, 2))

    label.append(listPreview)

    arr.forEach((item, i) => {
      const nodeElem = document.createElement('sl-tree-item')

      const indexIndicator = document.createElement('sl-tag')
      indexIndicator.size = 'small'
      indexIndicator.append(i.toString())

      nodeElem.append(indexIndicator, ' ')
      nodeElem.append(getTreeItem(item))
      nodes.append(nodeElem)
    })
    return nodes
  } else {
    typeTag.variant = 'warning'
    typeTag.append(typeof value)

    nodes.append(
      typeof value === 'symbol'
        ? escapeSymbol(value.description)
        : typeof value === 'string'
          ? `"${value}"`
          : value,
    )

    return nodes
  }
}

const arrayFromLispList = (pair) => {
  if (pair === NIL) {
    return []
  } else if (Array.isArray(pair)) {
    const rest = arrayFromLispList(pair[1])
    return [pair[0], ...(Array.isArray(rest) ? rest : [rest])]
  } else {
    return pair
  }
}
