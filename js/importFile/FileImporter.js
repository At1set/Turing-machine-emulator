import ConfigObject from "./ConfigObject.js"
import Table from "../Table.js"

import JsonParser from "./JsonParser.js"
import TxtParser from "./TxtParser.js"

export default class FileImporter {
  constructor(roulette, blockedSymbols) {
    this.roulette = roulette
    this.jsonParser = new JsonParser(blockedSymbols)
  }

  applayConfig(file, fileContent) {
    let result = null
    if (file.type === "application/json") result = this.jsonParser.parse(fileContent)
    else if (file.type === "text/plain") result = TxtParser.parse(fileContent)
    console.log(result.config);
    if (result.error) return window.alert("Произошла ошибка при попытке импорта!")
  }
}