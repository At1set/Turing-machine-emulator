import Roulette from "./Roulette.js"

export default class Table {
  static Instance = null

  constructor() {
    if (Table.Instance) return Table.Instance
    this.lastModalWindowIndex = undefined
    Table.Instance = this
  }

  static newCeilSize = `
    <td class="states-table__state table-state">
      <div class="table-state__content"><input type="text" value="" maxlength="3"></div>
      <button>...</button>
    </td>
  `
  static newCeilStateTransitions = `
    <td class="table-state__transitionCeil"><input type="text" maxlength="7"></td>
  `

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
    if (Math.abs(index) > allRows.length) return null
    return index >= 0 ? allRows[index] : allRows[allRows.length + index]
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
    if (Math.abs(index) > allColumns.length) return null
    return index >= 0 ? allColumns[index] : allColumns[allColumns.length + index]
  }

  changeTableState(left, index, isDelete = false) {
    const tableState = document.querySelector(
      ".states-table thead tr:last-child"
    )
    const tableStateTransitions = this.getAllRows()

    // Переменная ячейки, где заголовок "Состояния"
    const stateCeil = document.querySelector(
      ".states-table thead tr th:last-child"
    )

    stateCeil.setAttribute("colspan", +stateCeil.getAttribute("colspan") + 1)
    const newCeilState = Table.newCeilSize
    const newCeilStateTransitions = Table.newCeilStateTransitions

    // Если колонок состояний > 2
    if (isDelete && tableState.children.length > 2) {
      tableState.removeChild(tableState.children[index + 1])
      tableStateTransitions.forEach((e) => {
        e.removeChild(e.children[index + 1])
      })
    } else if (isDelete) {
      const lastColumn = this.getColumnAt(0)
      if (lastColumn) {
        lastColumn.forEach((input) => (input.value = ""))
      }
    }
    if (isDelete) return Roulette.Instance.states.splice(index, 1)

    if (left === undefined) {
      tableState.insertAdjacentHTML("beforeend", newCeilState)
      Roulette.Instance.states.length += 1
      tableStateTransitions.forEach((e) => {
        e.insertAdjacentHTML("beforeend", newCeilStateTransitions)
      })
    } else {
      let pos = left ? "beforebegin" : "afterend"
      tableState.children[index + 1].insertAdjacentHTML(pos, newCeilState)
      if (left) Roulette.Instance.states.unshift(undefined)
      else Roulette.Instance.states.length += 1
      tableStateTransitions.forEach((e) => {
        e.children[index + 1].insertAdjacentHTML(pos, newCeilStateTransitions)
      })
    }
    this.lastModalWindowIndex = undefined
  }

  changeWordTable(isDelete = false) {
    let lastTransitionsRow = document.querySelectorAll(".states-table tbody tr")
    // Если рядов > 2 (1й не учитывается)
    let removeingElement = lastTransitionsRow[lastTransitionsRow.length - 2]
    if (isDelete && lastTransitionsRow.length > 2) {
      document
        .querySelector(".states-table tbody")
        .removeChild(removeingElement)
      // Если остался последний ряд
    } else if (isDelete)
      return removeingElement
        .querySelectorAll("input")
        .forEach((input) => (input.value = ""))

    lastTransitionsRow = lastTransitionsRow[lastTransitionsRow.length - 2]
    let isTableTransitionsClear = false
    if (!lastTransitionsRow) {
      isTableTransitionsClear = true
      lastTransitionsRow = document.querySelectorAll(
        ".states-table tbody tr"
      )[0]
    }
    let newRow = document.createElement("tr")
    newRow.innerHTML += `<td class="word-table__input"><input type="text" maxlength="1" value=""></td>`
    for (let i = 0; i <= Roulette.Instance.states.length - 1; i++) {
      newRow.innerHTML += `<td class="table-state__transitionCeil"><input type="text" maxlength="7" value=""></td>`
    }

    if (isTableTransitionsClear) lastTransitionsRow.insertAdjacentElement("beforeBegin", newRow)
    else lastTransitionsRow.insertAdjacentElement("afterend", newRow)
  }
}