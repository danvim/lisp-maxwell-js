import {
  Compartment,
  EditorSelection,
  EditorState,
  Prec,
} from '@codemirror/state'
import { EditorView } from 'codemirror'
import { lisp } from './lispLanguage.js'
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup'
import { atomoneInit } from '@uiw/codemirror-theme-atomone'
import { gutter, GutterMarker, keymap } from '@codemirror/view'
import { lEval, NIL, T } from '../lib/lisp.js'
import { parse } from '../lib/parser.js'
import { print } from '../lib/print.js'
import { L } from '../lib/helper.js'

const createNewPromptHistory = () => ({
  in: '',
  out: null,
  inView: null,
  outView: null,
})

let historyPointer = 0
let latestPrompt = createNewPromptHistory()
let loadedHistory = latestPrompt
const promptHistory = [latestPrompt]

const createEditor = (parent, { isEditable, doc, isUser }) => {
  const userMarker = new (class extends GutterMarker {
    toDOM(_view) {
      const arrowElem = document.createElement('sl-icon')
      arrowElem.setAttribute('name', isUser ? 'chevron-right' : 'chevron-left')
      arrowElem.classList.add(
        'repl-marker',
        isUser ? 'user-marker' : 'out-marker',
      )
      return arrowElem
    }
  })()

  const loadHistory = (view) => {
    if (promptHistory[historyPointer] === loadedHistory) {
      return
    }
    loadedHistory = promptHistory[historyPointer]
    const doc = promptHistory[historyPointer].in
    console.log('loading history', historyPointer, {
      from: 0,
      to: view.state.doc.length,
      insert: doc,
    })
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: doc,
      },
      selection: EditorSelection.cursor(doc.length),
    })
  }

  const editable = new Compartment()
  const getEditableExtensions = (isEditable) => [
    basicSetup({
      foldGutter: false,
      lineNumbers: false,
      highlightActiveLine: isEditable,
      highlightSelectionMatches: isEditable,
      drawSelection: isEditable,
      dropCursor: isEditable,
      bracketMatching: isEditable,
      highlightActiveLineGutter: isEditable,
    }),
    EditorView.editable.of(isEditable),
    gutter({
      class: 'cm-mygutter',
      lineMarker: (view, line) => {
        return line.top === 0 ? userMarker : null
      },
    }),
    EditorView.editorAttributes.of({ class: isEditable ? 'editable' : '' }),
    Prec.highest(
      keymap.of(
        isEditable
          ? [
              {
                key: 'Enter',
                run: (view) => {
                  const program = view.state.doc.toString()
                  latestPrompt.in = program
                  latestPrompt.inView = createEditor(historyElem, {
                    isEditable: false,
                    doc: latestPrompt.in,
                    isUser: true,
                  })
                  try {
                    const results = lEval(parse(program), L([T, T], [NIL, NIL]))
                    latestPrompt.out = print(results).toString()
                  } catch (e) {
                    latestPrompt.out = e.stack
                  }
                  latestPrompt.outView = createEditor(historyElem, {
                    isEditable: false,
                    doc: latestPrompt.out,
                    isUser: false,
                  })
                  view.dispatch({
                    changes: {
                      from: 0,
                      to: view.state.doc.length,
                      insert: '',
                    },
                  })
                  latestPrompt = createNewPromptHistory()
                  promptHistory.push(latestPrompt)
                  historyPointer = promptHistory.length - 1
                  loadedHistory = latestPrompt
                  return true
                },
              },
              {
                any: (view, event) => {
                  const currentLine = view.state.doc.lineAt(
                    view.state.selection.main.head,
                  ).number
                  const maxLineI = view.state.doc.lines
                  if (event.key === 'ArrowUp') {
                    if (currentLine === 1) {
                      historyPointer = Math.max(0, historyPointer - 1)
                      loadHistory(view)
                      return true
                    }
                  } else if (event.key === 'ArrowDown') {
                    if (currentLine === maxLineI) {
                      historyPointer = Math.min(
                        promptHistory.length - 1,
                        historyPointer + 1,
                      )
                      loadHistory(view)
                      return true
                    }
                  }
                },
              },
            ]
          : [],
      ),
    ),
  ]
  const setEditable = (view, isEditable) => {
    view.dispatch({
      effects: editable.reconfigure(getEditableExtensions(isEditable)),
    })
  }

  const state = EditorState.create({
    doc,
    extensions: [
      atomoneInit({
        settings: {
          fontFamily: 'Jetbrains Mono, monospace',
          fontSize: '0.85rem',
        },
      }),
      lisp(),
      editable.of(getEditableExtensions(isEditable)),
      EditorState.tabSize.of(2),
    ],
  })

  const view = new EditorView({
    state,
    parent,
  })

  return [view, setEditable]
}

const historyElem = document.getElementById('history')
const userPromptElem = document.getElementById('user-prompt')
const [view, setEditable] = createEditor(userPromptElem, {
  isEditable: true,
  doc: latestPrompt.in,
  isUser: true,
})
window.s = (isEditable) => setEditable(view, isEditable)
