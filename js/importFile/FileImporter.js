import Table from "../Table.js"
import Roulette from "../Roulette.js"

import JsonParser from "./JsonParser.js"
import TxtParser from "./TxtParser.js"

export default class FileImporter {
  constructor(roulette) {
    this.roulette = roulette
    this.jsonParser = new JsonParser()
  }

  applayConfig(file, fileContent) {
    let result = null
    if (file.type === "application/json") result = this.jsonParser.parse(fileContent)
    else if (file.type === "text/plain") result = TxtParser.parse(fileContent)
    console.log(result);
    const { config, error } = result
    if (error || !config) return window.alert(`Произошла ошибка при попытке импорта: ${result.error?.message}`)
    clearAll()
    Table.Instance.setDictionary()
    Roulette.Instance.dictionary = config.dictionary

  }
}

function clearAll() {
  Table.Instance.clearColumns()
  Table.Instance.clearRows()
  Roulette.Instance.dictionary = []
  Roulette.Instance.states = [null]
}