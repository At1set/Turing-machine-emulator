export default class Parser {
  constructor () {}
  static parseReactionsTable() {
    if (!this.checkIsAllStatesNamed()) return false
    let reactionsArr = []
    let tableStateTransitions = document.querySelectorAll(".states-table tbody tr")
    tableStateTransitions = Array.from(tableStateTransitions).slice(0, -1)
    tableStateTransitions.forEach((row) => {
      let reactionsRow = []
      Array.from(row.querySelectorAll("td")).slice(1).forEach((e) => {
        reactionsRow.push(e.querySelector("input").value)
      })
      reactionsArr.push(reactionsRow)
    })
    return reactionsArr
  }
  
  static checkIsAllStatesNamed() {
    let statesTable = document.querySelectorAll(".states-table__table thead tr:last-child td")
    let blockedValues = [""]
    let isGood = true
    statesTable.forEach((state) => {
      let state__input = state.querySelector(".table-state__content input")
      if (blockedValues.includes(state__input.value)) {
        state__input.classList.add("_wrong")
        setTimeout(() => {
          state__input.classList.remove("_wrong")
        }, 1000);
        isGood = false
      }
    })
    if (!isGood) {
      setTimeout(() => {
        alert("Для начала заполните все названия состояний!")
      }, 1000);
    }
    return isGood
  }

  static parseConfigFile(value) {
    const result = {
      states: []
    }
    value.split("\n").forEach(string => {

    })
  }
}