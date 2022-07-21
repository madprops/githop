import JsonRepairError from './JsonRepairError.js'
import {
  insertAtIndex,
  insertBeforeLastWhitespace,
  isAlpha,
  isDigit,
  isDoubleQuote,
  isHex,
  isQuote,
  isSingleQuote,
  isSpecialWhitespace,
  isWhitespace,
  normalizeQuote,
  normalizeWhitespace,
  stripLastOccurrence
} from './stringUtils.js'

// token types enumeration
const DELIMITER = 0
const NUMBER = 1
const STRING = 2
const SYMBOL = 3
const WHITESPACE = 4
const COMMENT = 5
const UNKNOWN = 6

/**
 * @typedef {DELIMITER | NUMBER | STRING | SYMBOL | WHITESPACE | COMMENT | UNKNOWN} TokenType
 */

// map with all delimiters
const DELIMITERS = {
  '': true,
  '{': true,
  '}': true,
  '[': true,
  ']': true,
  ':': true,
  ',': true,

  // for JSONP and MongoDB data type notation
  '(': true,
  ')': true,
  ';': true,

  // for string concatenation
  '+': true
}

// map with all escape characters
const ESCAPE_CHARACTERS = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t'
  // \u is handled by getToken()
}

// TODO: can we unify CONTROL_CHARACTERS and ESCAPE_CHARACTERS?
const CONTROL_CHARACTERS = {
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t'
}

const SYMBOLS = {
  null: 'null',
  true: 'true',
  false: 'false'
}

const PYTHON_SYMBOLS = {
  None: 'null',
  True: 'true',
  False: 'false'
}

let input = '' // current json text
let output = '' // generated output
let index = 0 // current index in text
let c = '' // current token character in text
let token = '' // current token
let tokenType = UNKNOWN // type of current token

/**
 * Repair a string containing an invalid JSON document.
 * For example changes JavaScript notation into JSON notation.
 *
 * Example:
 *
 *     jsonrepair('{name: \'John\'}") // '{"name": "John"}'
 *
 * @param {string} text
 * @return {string}
 */
export default function jsonrepair (text) {
  // initialize
  input = text
  output = ''
  index = 0
  c = input.charAt(0)
  token = ''
  tokenType = UNKNOWN

  // get first token
  processNextToken()

  const rootLevelTokenType = tokenType

  // parse everything
  parseObject()

  // ignore trailing comma
  skipComma()

  if (token === '') {
    // reached the end of the document properly
    return output
  }

  if (rootLevelTokenType === tokenType && tokenIsStartOfValue()) {
    // start of a new value after end of the root level object: looks like
    // newline delimited JSON -> turn into a root level array

    let stashedOutput = ''

    while (rootLevelTokenType === tokenType && tokenIsStartOfValue()) {
      output = insertBeforeLastWhitespace(output, ',')

      stashedOutput += output
      output = ''

      // parse next newline delimited item
      parseObject()

      // ignore trailing comma
      skipComma()
    }

    // wrap the output in an array
    return `[\n${stashedOutput}${output}\n]`
  }

  throw new JsonRepairError('Unexpected characters', index - token.length)
}

/**
 * Get the next character from the expression.
 * The character is stored into the char c. If the end of the expression is
 * reached, the function puts an empty string in c.
 */
function next () {
  index++
  c = input.charAt(index)
  // Note: not using input[index] because that returns undefined when index is out of range
}

/**
 * Special version of the function next, used to parse escaped strings
 */
function nextSkipEscape () {
  next()
  if (c === '\\') {
    next()
  }
}

/**
 * check whether the current token is the start of a value:
 * object, array, number, string, or symbol
 * @returns {boolean}
 */
function tokenIsStartOfValue () {
  return (tokenType === DELIMITER && (token === '[' || token === '{')) ||
    tokenType === STRING ||
    tokenType === NUMBER ||
    tokenType === SYMBOL
}

/**
 * check whether the current token is the start of a key (or possible key):
 * number, string, or symbol
 * @returns {boolean}
 */
function tokenIsStartOfKey () {
  return tokenType === STRING ||
    tokenType === NUMBER ||
    tokenType === SYMBOL
}

/**
 * Process the previous token, and get next token in the current text
 */
function processNextToken () {
  output += token

  tokenType = UNKNOWN
  token = ''

  getTokenDelimiter()

  if (tokenType === WHITESPACE) {
    // we leave the whitespace as it is, except replacing special white
    // space character
    token = normalizeWhitespace(token)
    processNextToken()
  }

  if (tokenType === COMMENT) {
    // ignore comments
    tokenType = UNKNOWN
    token = ''

    processNextToken()
  }
}

function skipComma () {
  if (token === ',') {
    token = ''
    tokenType = UNKNOWN
    processNextToken()
  }
}

// check for delimiters like ':', '{', ']'
function getTokenDelimiter () {
  if (DELIMITERS[c]) {
    tokenType = DELIMITER
    token = c
    next()
    return
  }

  getTokenNumber()
}

// check for a number like "2.3e+5"
function getTokenNumber () {
  if (isDigit(c) || c === '-') {
    tokenType = NUMBER

    if (c === '-') {
      token += c
      next()

      if (!isDigit(c)) {
        throw new JsonRepairError('Invalid number, digit expected', index)
      }
    } else if (c === '0') {
      token += c
      next()
    } else {
      // digit 1-9, nothing extra to do
    }

    while (isDigit(c)) {
      token += c
      next()
    }

    if (c === '.') {
      token += c
      next()

      if (!isDigit(c)) {
        throw new JsonRepairError('Invalid number, digit expected', index)
      }

      while (isDigit(c)) {
        token += c
        next()
      }
    }

    if (c === 'e' || c === 'E') {
      token += c
      next()

      if (c === '+' || c === '-') {
        token += c
        next()
      }

      if (!isDigit(c)) {
        throw new JsonRepairError('Invalid number, digit expected', index)
      }

      while (isDigit(c)) {
        token += c
        next()
      }
    }

    return
  }

  getTokenEscapedString()
}

// get a token string like '\"hello world\"'
function getTokenEscapedString () {
  if (c === '\\' && input.charAt(index + 1) === '"') {
    // an escaped piece of JSON
    next()
    getTokenString(nextSkipEscape)
  } else {
    getTokenString(next)
  }
}

// get a token string like '"hello world"'
function getTokenString (getNext) {
  if (isQuote(c)) {
    const quote = normalizeQuote(c)
    const isEndQuote = isSingleQuote(c) ? isSingleQuote : isDoubleQuote

    token += '"' // output valid double quote
    tokenType = STRING
    getNext()

    // eslint-disable-next-line no-unmodified-loop-condition
    while (c !== '' && !isEndQuote(c)) {
      if (c === '\\') {
        // handle escape characters
        getNext()

        const unescaped = ESCAPE_CHARACTERS[c]
        if (unescaped !== undefined) {
          token += '\\' + c
          getNext()
        } else if (c === 'u') {
          // parse escaped unicode character, like '\\u260E'
          token += '\\u'
          getNext()

          for (let u = 0; u < 4; u++) {
            if (!isHex(c)) {
              throw new JsonRepairError('Invalid unicode character', index - token.length)
            }
            token += c
            getNext()
          }
        } else if (c === '\'') {
          // escaped single quote character -> remove the escape character
          token += '\''
          getNext()
        } else {
          throw new JsonRepairError('Invalid escape character "\\' + c + '"', index)
        }
      } else if (CONTROL_CHARACTERS[c]) {
        // unescaped special character
        // fix by adding an escape character
        token += CONTROL_CHARACTERS[c]
        getNext()
      } else if (c === '"') {
        // unescaped double quote -> escape it
        token += '\\"'
        getNext()
      } else {
        // a regular character
        token += c
        getNext()
      }
    }

    if (normalizeQuote(c) !== quote) {
      throw new JsonRepairError('End of string expected', index - token.length)
    }
    token += '"' // output valid double quote
    getNext()

    return
  }

  getTokenAlpha()
}

// check for symbols (true, false, null)
function getTokenAlpha () {
  if (isAlpha(c)) {
    tokenType = SYMBOL

    while (isAlpha(c) || isDigit(c) || c === '$') {
      token += c
      next()
    }

    return
  }

  getTokenWhitespace()
}

// get whitespaces: space, tab, newline, and carriage return
function getTokenWhitespace () {
  if (isWhitespace(c) || isSpecialWhitespace(c)) {
    tokenType = WHITESPACE

    while (isWhitespace(c) || isSpecialWhitespace(c)) {
      token += c
      next()
    }

    return
  }

  getTokenComment()
}

function getTokenComment () {
  // find a block comment '/* ... */'
  if (c === '/' && input[index + 1] === '*') {
    tokenType = COMMENT

    while (c !== '' && (c !== '*' || (c === '*' && input[index + 1] !== '/'))) {
      token += c
      next()
    }

    if (c === '*' && input[index + 1] === '/') {
      token += c
      next()

      token += c
      next()
    }

    return
  }

  // find a comment '// ...'
  if (c === '/' && input[index + 1] === '/') {
    tokenType = COMMENT

    while (c !== '' && c !== '\n') {
      token += c
      next()
    }

    return
  }

  getTokenUnknown()
}

// something unknown is found, wrong characters -> a syntax error
function getTokenUnknown () {
  tokenType = UNKNOWN

  while (c !== '') {
    token += c
    next()
  }

  throw new JsonRepairError('Syntax error in part "' + token + '"', index - token.length)
}

/**
 * Parse an object like '{"key": "value"}'
 * @return {*}
 */
function parseObject () {
  if (tokenType === DELIMITER && token === '{') {
    processNextToken()

    // TODO: can we make this redundant?
    if (tokenType === DELIMITER && token === '}') {
      // empty object
      processNextToken()
      return
    }

    while (true) {
      // parse key

      if (tokenType === SYMBOL || tokenType === NUMBER) {
        // unquoted key -> add quotes around it, change it into a string
        tokenType = STRING
        token = `"${token}"`
      }

      if (tokenType !== STRING) {
        // TODO: handle ambiguous cases like '[{"a":1,{"b":2}]' which could be an array with two objects or one
        throw new JsonRepairError('Object key expected', index - token.length)
      }
      processNextToken()

      // parse colon (key/value separator)
      if (tokenType === DELIMITER && token === ':') {
        processNextToken()
      } else {
        if (tokenIsStartOfValue()) {
          // we expect a colon here, but got the start of a value
          // -> insert a colon before any inserted whitespaces at the end of output
          output = insertBeforeLastWhitespace(output, ':')
        } else {
          throw new JsonRepairError('Colon expected', index - token.length)
        }
      }

      // parse value
      parseObject()

      // parse comma (key/value pair separator)
      if (tokenType === DELIMITER && token === ',') {
        processNextToken()

        if (tokenType === DELIMITER && token === '}') {
          // we've just passed a trailing comma -> remove the trailing comma
          output = stripLastOccurrence(output, ',')
          break
        }

        if (token === '') {
          // end of json reached, but missing }
          // Strip the missing comma (the closing bracket will be added later)
          output = stripLastOccurrence(output, ',')
          break
        }
      } else {
        if (tokenIsStartOfKey()) {
          // we expect a comma here, but got the start of a new key
          // -> insert a comma before any inserted whitespaces at the end of output
          output = insertBeforeLastWhitespace(output, ',')
        } else {
          break
        }
      }
    }

    if (tokenType === DELIMITER && token === '}') {
      processNextToken()
    } else {
      // missing end bracket -> insert the missing bracket
      output = insertBeforeLastWhitespace(output, '}')
    }

    return
  }

  parseArray()
}

/**
 * Parse an object like '["item1", "item2", ...]'
 */
function parseArray () {
  if (tokenType === DELIMITER && token === '[') {
    processNextToken()

    if (tokenType === DELIMITER && token === ']') {
      // empty array
      processNextToken()
      return
    }

    while (true) {
      // parse item
      parseObject()

      // parse comma (item separator)
      if (tokenType === DELIMITER && token === ',') {
        processNextToken()

        if (tokenType === DELIMITER && token === ']') {
          // we've just passed a trailing comma -> remove the trailing comma
          output = stripLastOccurrence(output, ',')
          break
        }

        if (token === '') {
          // end of json reached, but missing ]
          // Strip the missing comma (the closing bracket will be added later)
          output = stripLastOccurrence(output, ',')
          break
        }
      } else {
        if (tokenIsStartOfValue()) {
          // we expect a comma here, but got the start of a new item
          // -> insert a comma before any inserted whitespaces at the end of output
          output = insertBeforeLastWhitespace(output, ',')
        } else {
          break
        }
      }
    }

    if (tokenType === DELIMITER && token === ']') {
      processNextToken()
    } else {
      // missing end bracket -> insert the missing bracket
      output = insertBeforeLastWhitespace(output, ']')
    }
    return
  }

  parseString()
}

/**
 * Parse a string enclosed by double quotes "...". Can contain escaped quotes
 */
function parseString () {
  if (tokenType === STRING) {
    processNextToken()

    while (tokenType === DELIMITER && token === '+') {
      // string concatenation like "hello" + "world"
      token = '' // don't output the concatenation
      processNextToken()

      if (tokenType === STRING) {
        // concatenate with the previous string
        const endIndex = output.lastIndexOf('"')
        output = output.substring(0, endIndex) + token.substring(1)
        token = ''
        processNextToken()
      }
    }

    return
  }

  parseNumber()
}

/**
 * Parse a number
 */
function parseNumber () {
  if (tokenType === NUMBER) {
    processNextToken()
    return
  }

  parseSymbol()
}

/**
 * Parse constants true, false, null
 */
function parseSymbol () {
  if (tokenType === SYMBOL) {
    // a supported symbol: true, false, null
    if (SYMBOLS[token]) {
      processNextToken()
      return
    }

    // for example replace None with null
    if (PYTHON_SYMBOLS[token]) {
      token = PYTHON_SYMBOLS[token]
      processNextToken()
      return
    }

    // make a copy of the symbol, let's see what comes next
    const symbol = token
    const symbolIndex = output.length
    token = ''
    processNextToken()

    // if (tokenType === DELIMITER && token === '(') {
    if (tokenType === DELIMITER && token === '(') {
      // a MongoDB function call or JSONP call
      // Can be a MongoDB data type like in {"_id": ObjectId("123")}
      // token = '' // do not output the function name
      // processNextToken()

      // next()
      token = '' // do not output the ( character
      processNextToken()

      // process the part inside the brackets
      parseObject()

      // skip the closing bracket ")" and ");"
      if (tokenType === DELIMITER && token === ')') {
        token = '' // do not output the ) character
        processNextToken()

        if (tokenType === DELIMITER && token === ';') {
          token = '' // do not output the semicolon character
          processNextToken()
        }
      }

      return
    }

    // unknown symbol => turn into in a string
    // it is possible that by reading the next token we already inserted
    // extra spaces in the output which should be inside the string,
    // hence the symbolIndex
    output = insertAtIndex(output, `"${symbol}`, symbolIndex)
    while (tokenType === SYMBOL || tokenType === NUMBER) {
      processNextToken()
    }
    output += '"'

    return
  }

  parseEnd()
}

/**
 * Evaluated when the expression is not yet ended but expected to end
 */
function parseEnd () {
  if (token === '') {
    // syntax error or unexpected end of expression
    throw new JsonRepairError('Unexpected end of json string', index - token.length)
  } else {
    throw new JsonRepairError('Value expected', index - token.length)
  }
}
