import { styleTags, tags as t } from '@lezer/highlight'

export const highlighting = styleTags({
  'VarName/Symbol': t.function(t.variableName),
  'Property/Symbol': t.propertyName,
  'Operator/Symbol': t.function(t.variableName),
  'Binding/Symbol': t.variableName,
  'DefLike Lambda Let': t.keyword,
  Symbol: t.variableName,
  Number: t.number,
  String: t.string,
  LineComment: t.lineComment,
  'Quote Quote/Symbol': t.keyword,
  '( )': t.punctuation,
})
