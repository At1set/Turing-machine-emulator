export default class Table {
  constructor() {}

  static newCeilSize = `
    <td class="states-table__state table-state">
      <div class="table-state__content"><input type="text" value="" maxlength="3"></div>
      <button>...</button>
    </td>
  `
  static newCeilStateTransitions = `
    <td class="table-state__transitionCeil"><input type="text" maxlength="7"></td>
  `

  static getStateInputs() {
    return Array.from(document.querySelectorAll(".table-state input"))
  }

  static getWordInputs() {
    let inputs = []
    let wordCeils = document.querySelectorAll(".states-table tbody tr")
    wordCeils = Array.from(wordCeils).slice(0, -1)
    wordCeils.forEach((e) => {
      inputs.push(e.children[0].querySelector("input"))
    })
    return inputs
  }

  static getAllRows() {
    const allRows = Array.from(
      document.querySelector(".states-table__table").querySelectorAll("tr")
    )
    return allRows.slice(2, -1)
  }

  static getRowAt(index) {
    const allRows = this.getAllRows()
    if (Math.abs(index) > allRows.length) return null
    return index >= 0 ? allRows[index] : allRows[allRows.length + index]
  }

  static getAllColumns() {
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

  static getColumnAt(index) {
    const allColumns = this.getAllColumns()
    if (Math.abs(index) > allColumns.length) return null
    return index >= 0 ? allColumns[index] : allColumns[allColumns.length + index]
  }
}