import { globalOptions } from "../index.js"

export default class ConfigObject {
  constructor () {
    this.blockedSymbols = globalOptions.blockedSymbols

    this.Roulette = {
      word: [],
      leftLetterPos: 0,
      offset: 0,
      startPos: 1
    }

    this.Table = {
      dictionary: [],
      states: [],
      rows: []
    }

    this.letterLength = 1
    this.stateLength = 3

    this.ConfigErrors = {
      emptyTableObject: ()               => {throw new Error("Объект Table не может быть пустым!")}, 
      missedTableProperty: (property)    => {throw new Error(`Вы не указали в объекте Table важное свойство: [${property}]!`)},
      notArrayError:   (property)        => {throw new TypeError(`Свойство ${property} должно быть массивом!`)},
      emptyArrayError: (property)        => {throw new Error(`Массив ${property} не может быть пустым!`)},
      dictionaryError: (element)         => {throw new Error(`Неправильный элемент в массиве алфавита: ${element}. Длина буквы алфавита не может быть больше ${this.letterLength}!`)},
      statesError:     (element)         => {throw new Error(`Неправильный элемент в массиве состояний: ${element}. Длина состояния не моет быть больше ${this.stateLength}!`)},
      rowsError:       (element, reason) => {throw new Error(`Неправильный элемент в массиве строк таблицы: ${element}.${reason && " " + reason}`)},
      transitionError:   (element, reason)=> {throw new Error(`Неправильный элемент в ячейке перехода. ${reason}}`)},
      undefinedWordLetter:   (letter)    => {throw new Error(`Неправилая буква в массиве word. Обнаружен неизвестный символ. Буква \"${letter}\" не указана в массиве dictionary!`)},
      notIntegerError:   (property)      => {throw new TypeError(`Свойство ${property} должно быть целым числом!`)},
    }
  }

  validateTable(table) {
    const result = {
      config: this,
      error: null
    }
    try {
      this.Table = table
      // validateTablePropertys.call(this, table)
      // validateDictionary.call(this, table.dictionary)
      // validateStates.call(this, table.states)
      // validateRows.call(this, table.rows)
    } catch (error) {
      result.error = error
      return result
    }
    return result
  }

  validateRoulette (roulette) {
    const result = {
      config: this,
      error: null
    }
    if (Object.keys(roulette).length === 0) return result
    for (let key in this.Roulette) {
      if (roulette.hasOwnProperty(key)) {
        try {
          if (key === "word") validateWord.call(this, roulette[key])
          else if (["leftLetterPos", "offset", "startPos"].includes(key)) validateRouletteNumber.call(this, key, roulette[key])
        } catch (error) {
          result.error = error
          return result
        }
      }
    }
    return result
  }
}

function validateTablePropertys(table) {
  const table_propertys = Object.keys(table)
  if (table_propertys.length === 0) this.ConfigErrors.emptyTableObject()
  if (!table_propertys.includes("dictionary")) this.ConfigErrors.missedTableProperty("dictionary")
  if (!table_propertys.includes("states")) this.ConfigErrors.missedTableProperty("states")
  if (!table_propertys.includes("rows")) this.ConfigErrors.missedTableProperty("rows")
}

export function validateDictionary(dictionary) {
  if (!Array.isArray(dictionary)) this.ConfigErrors.notArrayError("dictionary")
  if (dictionary.length < 1) this.ConfigErrors.emptyArrayError("dictionary")
  for (let i = 0; i < dictionary.length; i++) {
    const element = dictionary[i];
    if (this.blockedSymbols.includes(element)) throw new Error(`Нельзя использовать в массиве dictionary в качестве буквы запрещенный символ \" ${element}\ "!`)
    if (element.length > this.letterLength) this.ConfigErrors.dictionaryError(element);
  }
  return this.Table.dictionary = dictionary
}

function validateStates(states) {
  if (!Array.isArray(states)) this.ConfigErrors.notArrayError("states")
  if (states.length < 1) this.ConfigErrors.emptyArrayError("states")
  for (let i = 0; i < states.length; i++) {
    const element = states[i]
    if (element.length > this.stateLength) this.ConfigErrors.statesError(element)
  }
  this.Table.states = states
}

function validateRows(rows) {
  if (!Array.isArray(rows)) this.ConfigErrors.notArrayError("rows")
  if (rows.length < 1) this.ConfigErrors.emptyArrayError("rows")
  if (rows.length !== this.Table.dictionary.length) throw new Error("Количество строк таблицы переходов rows не соответствует количеству букв алфавита!");
  function isValidTransition(element) {
    const regex = /^.{1,3} . [rRlLsS]$/g
    return regex.test(element)
  }
  rows.forEach(row => {
    if (!Array.isArray(row)) throw new TypeError(`Массив rows должен содержать массивы строк таблицы переходов!`);
    if (row.length < 1) throw new TypeError("Массив rows не может содержать пустые строки!")
    if (row.length !== this.Table.states.length) throw new Error("Количество столбцов таблицы переходов rows не соответствует количеству состояний!");
    for (let i = 0; i < row.length; i++) {
      const element = row[i]
      if (typeof element !== 'string') throw new TypeError(`Элемент таблицы массива rows ${element} не является строкой!`);
      if (!isValidTransition(element)) this.ConfigErrors.rowsError(element)
      const [state, letter, command] = element.split(" ")
      // Проверяем состояние, букву и инструкцию 
      if (!["T", "F"].includes(state) && !this.Table.states.includes(state)) this.ConfigErrors.transitionError(
        element,
        `Обнаружен неизвестный символ. Состояние \"${state}\" не указано в массиве states!`
      )
      if (!["_"].includes(letter) && !this.Table.dictionary.includes(letter)) this.ConfigErrors.transitionError(
        element,
        `Обнаружен неизвестный символ. Буква \"${letter}\" не указана в массиве dictionary!`
      )

      this.Table.rows.push(row)
    }
  });
}

function validateWord(word) {
  if (!Array.isArray(word)) this.ConfigErrors.notArrayError(word)
  if (word.length === 0) return
  word.forEach((letter) => {
    if (!this.Table.dictionary.includes(letter))
      this.ConfigErrors.undefinedWordLetter(letter)
  })
  return this.Roulette.word = word
}

function validateRouletteNumber(key, property) {
  if (!Number.isInteger(property)) this.ConfigErrors.notIntegerError(key)
  return this.Roulette[key] = property
}

// let blockedSymbols = [",", ".", "<", ">", ";", "/", "|", "\\", ":", "'", "+", "-", " ", "`", '"', "" ]
// config = new ConfigObject(blockedSymbols)
// const Roulette = {
//   word: ["a", "b"],
//   startPos: 0
// }
// const Table = {
//   states: ["q0"],
//   dictionary: ["a", "b"],
//   rows: [["q0 _ S"], ["q0 _ S"]]
// }

// console.log(config.validateTable(Table))
// console.log(config.validateRoulette(Roulette));