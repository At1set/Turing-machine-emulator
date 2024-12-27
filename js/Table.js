export default class Table {
  constructor() {}

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
}