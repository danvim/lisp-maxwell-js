import { parser } from './lezer/parser.js'
import {
  foldInside,
  foldNodeProp,
  indentNodeProp,
  LanguageSupport,
  LRLanguage,
} from '@codemirror/language'
import { completeFromList } from '@codemirror/autocomplete'
import { symbolsMap } from '../lib/parser.js'

const parserWithMetadata = parser.configure({
  props: [
    indentNodeProp.add({
      List: (context) => context.column(context.node.from) + context.unit,
    }),
    foldNodeProp.add({
      List: foldInside,
    }),
  ],
})

export const lispLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    commentTokens: { line: ';;' },
  },
})

export const lispCompletion = lispLanguage.data.of({
  autocomplete: completeFromList(
    Object.keys(symbolsMap).map((keyword) => ({
      label: keyword,
      type: 'keyword',
    })),
  ),
  closeBrackets: {
    brackets: ['(', '[', '{', '"'],
  },
})

export function lisp() {
  return new LanguageSupport(lispLanguage, [lispCompletion])
}
