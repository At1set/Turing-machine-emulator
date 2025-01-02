import Roulette from "./Roulette.js"

export default class Table {
  static Instance = null

  constructor() {
    if (Table.Instance) return Table.Instance
    this.lastModalWindowIndex = undefined
    Table.Instance = this
  }

  static newCeilState = `
    <td class="states-table__state table-state">
      <div class="table-state__content"><input type="text" value="" maxlength="3"></div>
      <button>...</button>
    </td>
  `

  static newCeilStateTransitions = `<td class="table-state__transitionCeil"><input type="text" maxlength="7"></td>`

  static newCeilWord = `<td class="word-table__input"><input type="text" maxlength="1" value=""></td>`

  static clearWordTable = `
    <tr>
      <td>
        <button class="word-table__button">...</button>
        <div class="word-table__modalWindow _table-modalWindow _table-modalWindow_2">
          <div class="table-modalWindow_2__option table-modalWindow__option">Добавить букву</div>
          <div class="table-modalWindow_2__option table-modalWindow__option">Удалить</div>
        </div>
      </td>
    </tr>
  `

  static clearStatesTable = `
    <tr>
      <th scope="col">Алфавит</th>
      <td class="states-table__state table-state">
        <div class="table-state__content"><input type="text" value="" maxlength="3"></div>
        <button style="z-index: 2;">...</button>
      </td>
    </tr>
  `

  static insertColumnPos = {
    left: "beforebegin",
    right: "afterend",
  }

  getStateInputs() {
    return Array.from(document.querySelectorAll(".table-state input"))
  }

  getWordInputs() {
    let inputs = []
    let wordCeils = document.querySelectorAll(".states-table tbody tr")
    wordCeils = Array.from(wordCeils).slice(0, -1)
    wordCeils.forEach((e) => {
      inputs.push(e.children[0].querySelector("input"))
    })
    return inputs
  }

  getAllRows() {
    const allRows = Array.from(
      document.querySelector(".states-table__table").querySelectorAll("tr")
    )
    return allRows.slice(2, -1)
  }

  getRowAt(index) {
    const allRows = this.getAllRows()
    try {
      index = _validateIndex(index, allRows.length)
      index -= 1
    }
    catch (error) {return null}
    return allRows[index]
  }

  getAllColumns() {
    const stateInputs = this.getStateInputs()
    const allRows = this.getAllRows()
    const transitionCeils = allRows.map((td) => {
      return Array.from(td.querySelectorAll("input")).slice(1)
    })

    const res = []

    stateInputs.forEach((stateInput, i) => {
      const newRow = [stateInput]
      transitionCeils.forEach((row) => {
        newRow.push(row[i])
      })
      return res.push(newRow)
    })

    return res
  }

  getColumnAt(index) {
    const allColumns = this.getAllColumns()
    try {
      index = _validateIndex(index, allColumns.length)
      index -= 1
    }
    catch (error) {return null}
    return allColumns[index]
  }

  clearRows() {
    let tableState = document.querySelector(".states-table tbody")
    tableState.innerHTML = Table.clearWordTable
  }

  clearColumns() {
    const allRows = this.getAllRows()
    allRows.forEach((row) => {
      Array.from(row.children).forEach((child, i) => {
        if (i !== 0) row.removeChild(child)
      })
      row.innerHTML += Table.newCeilStateTransitions
    })
    const tableState = document.querySelector(
      ".states-table thead tr:last-child"
    )
    tableState.innerHTML = Table.clearStatesTable
  }

  deleteColumnAt(index=-1) {
    // tr - где находятся все td ячейки с состояниями
    const tableState = document.querySelector(
      ".states-table thead tr:last-child"
    )
    const tableStateTransitions = this.getAllRows()
    const columnsLength = tableState.children.length - 1

    try {index = _validateIndex(index, columnsLength)}
    catch (error) {throw error}

    // Если колонок состояний > 1
    if (columnsLength > 1) {
      tableState.removeChild(tableState.children[index])
      tableStateTransitions.forEach((e) => e.removeChild(e.children[index]))
    } else {
      const lastColumn = this.getColumnAt(0)
      if (lastColumn) lastColumn.forEach((input) => (input.value = ""))
    }
    return Roulette.Instance.states.splice(index - 1, 1)
  }

  addColumn(index, insertColumnPos) {
    if (
      !(
        (insertColumnPos === undefined && index === undefined) ||
        (insertColumnPos !== undefined && index !== undefined)
      )
    )
      throw new TypeError("Переданы неправильные аргументы!")

    // Переменная ячейки, где заголовок "Состояния"
    const stateCeil = document.querySelector(
      ".states-table thead tr th:last-child"
    )
    // tr - где находятся все td ячейки с состояниями
    const tableState = document.querySelector(
      ".states-table thead tr:last-child"
    )

    const tableStateTransitions = this.getAllRows()

    const newCeilState = Table.newCeilState
    const newCeilStateTransitions = Table.newCeilStateTransitions

    if (insertColumnPos !== undefined) {
      // отнимаем от длины 1 и добавляем к index + 1, т.к. мы не учитываем первую колонку (колонка для словаря)
      const columnsLength = tableState.children.length - 1

      try {index = _validateIndex(index, columnsLength)}
      catch (error) {throw error}

      tableState.children[index].insertAdjacentHTML(
        insertColumnPos,
        newCeilState
      )
      tableStateTransitions.forEach((e) => {
        e.children[index].insertAdjacentHTML(
          insertColumnPos,
          newCeilStateTransitions
        )
      })
      if (insertColumnPos === Table.insertColumnPos.left)
        Roulette.Instance.states.unshift(undefined)
      else Roulette.Instance.states.length += 1
    } else {
      tableState.insertAdjacentHTML("beforeend", newCeilState)
      tableStateTransitions.forEach((e) =>
        e.insertAdjacentHTML("beforeend", newCeilStateTransitions)
      )
      Roulette.Instance.states.length += 1
    }
    stateCeil.setAttribute("colspan", +stateCeil.getAttribute("colspan") + 1)
    this.lastModalWindowIndex = undefined
  }

  deleteRowAt(index=-1) {
    const allRows = this.getAllRows()
    const rowsTable = document.querySelector(".states-table tbody")

    try {
      index = _validateIndex(index, allRows.length)
      index -= 1
    }
    catch (error) {throw error}    

    if (allRows.length > 1) {
      rowsTable.removeChild(allRows[index])
      // Если остался последний ряд
    } else {
      const lastRow = this.getRowAt(0)
      return lastRow.querySelectorAll("input").forEach((input) => (input.value = ""))
    }

    // Обновляет словарь из таблицы
    function updateRouletteDict() {
      const tableWordInputs = Table.Instance.getWordInputs()
      Roulette.Instance.dictionary = tableWordInputs.map((input) => input.value)
      return updateInputDict()
    }

    // Обновляет строку инпута из словаря
    function updateInputDict() {
      const dictionary = document.querySelector(".grid__abc input")
      return dictionary.value = Roulette.Instance.dictionary.filter((letter) => letter).join(", ")
    }

    return updateRouletteDict()
  }

  addRow(index, insertRowPos) {
    if (
      !(
        (insertRowPos === undefined && index === undefined) ||
        (insertRowPos !== undefined && index !== undefined)
      )
    )
      throw new TypeError("Переданы неправильные аргументы!")

    const allRows = this.getAllRows()
    const rowsTable = document.querySelector(".states-table tbody")
  }

  changeWordTable() {
    lastTransitionsRow = lastTransitionsRow[lastTransitionsRow.length - 2]
    let isTableTransitionsClear = false
    if (!lastTransitionsRow) {
      isTableTransitionsClear = true
      lastTransitionsRow = document.querySelectorAll(
        ".states-table tbody tr"
      )[0]
    }
    let newRow = document.createElement("tr")
    newRow.innerHTML += Table.newCeilWord
    for (let i = 0; i <= Roulette.Instance.states.length - 1; i++) {
      newRow.innerHTML += Table.newCeilStateTransitions
    }

    if (isTableTransitionsClear) lastTransitionsRow.insertAdjacentElement("beforeBegin", newRow)
    else lastTransitionsRow.insertAdjacentElement("afterend", newRow)
  }
}

function _validateIndex(index, ceilsLength) {
  if (index < 0) index += ceilsLength
  index += 1
  if (index < 1 || index > ceilsLength) throw new RangeError("The index out of column's range")
  return index
}