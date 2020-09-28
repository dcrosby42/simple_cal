
const isDefined = x => typeof x !== 'undefined'
const isNull = x => typeof x === null
const notNull = x => typeof x !== null
const exists = x => isDefined(x) && notNull(x)

export { isDefined, isNull, notNull, exists }