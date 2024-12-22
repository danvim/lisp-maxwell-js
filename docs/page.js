import { parseFromTokens, tokenize } from '../lib/parser.js'
import { getTreeItem } from './getTreeItem.js'

const inputTextArea = document.getElementById('input')
const outputArea = document.getElementById('output')
const treeView = document.getElementById('tree-view')

const processInput = () => {
  const source = inputTextArea.value
  const tokens = tokenize(source)
  const parsed = tokens.length > 0 ? parseFromTokens(tokens) : null

  outputArea.replaceChildren(
    ...tokens.map(([key, , originalContent]) => {
      const elem = document.createElement('span')
      elem.classList.add(key)
      if (key === 'symbol') {
        elem.dataset.symbol = originalContent
      }
      elem.innerText = originalContent
      return elem
    }),
  )

  if (parsed === null) {
    treeView.replaceChildren()
  } else {
    const treeItem = getTreeItem(parsed)

    const rootItem = document.createElement('sl-tree-item')
    rootItem.append(treeItem)
    treeView.replaceChildren(rootItem)
  }
}

processInput()

inputTextArea.addEventListener('input', () => {
  processInput()
})
