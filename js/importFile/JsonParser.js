import ConfigObject from "./ConfigObject.js"

export default class JsonParser {
  constructor() {}

  static parse(fileContent) {
    const config = new ConfigObject()
    let result = {
      config: null,
      error: null,
    }
    try {
      const data = JSON.parse(fileContent)
      if (data.Table) {
        const { error } = config.validateTable(data.Table)
        result.config = config
        if (error) throw error
      } else throw new Error("Отсутсвует описание таблицы!")

      if (data.Roulette) {
        const { error } = config.validateRoulette(data.Roulette)
        result.config = config
        if (error) throw error
      } else config.Roulette = null
    } catch (error) {
      result.error = error
      return result
    }
    return result
  }
}