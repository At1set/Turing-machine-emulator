import Table from "../Table.js"
import Roulette from "../Roulette.js"

import JsonParser from "./JsonParser.js"
import TxtParser from "./TxtParser.js"

export default class FileImporter {
  constructor() {}

  static applayConfig(file, fileContent) {
    let result = null
    console.log(file.name);
    if (file.type === "application/json" || file.name.endsWith(".turing")) result = JsonParser.parse(fileContent)
    else if (file.type === "text/plain") result = TxtParser.parse(fileContent)
    console.log(result);
    const { config, error } = result
    if (error || !config) return window.alert(`Произошла ошибка при попытке импорта: ${result.error?.message}`)
    Table.Instance.setStates(config.Table.states)
    Table.Instance.setDictionary(config.Table.dictionary)
    const allRows = Table.Instance.getAllRows().map((row) => {
      return Array.from(row.querySelectorAll("input"))
        .slice(1)
        .map((input) => input)
    })
    allRows.forEach((row, i) => {
      row.forEach((input, j) => {
        const configValue = config.Table.rows[i][j]
        if (!configValue) return
        input.value = configValue
      })
    });

    if (config.Roulette) {
      for (let key in config.Roulette) {
        if (Roulette.Instance.hasOwnProperty(key)) {
          console.log(key, Roulette.Instance[key], config.Roulette[key])
          Roulette.Instance[key] = config.Roulette[key]
        }
      }
      Roulette.Instance.updateWord()
      Roulette.Instance.updateActiveCeil()
    }
  }
}