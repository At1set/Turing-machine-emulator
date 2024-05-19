export default class Machine {
  constructor(roulette) {
    this.roulette = roulette
    this.delay = 400
    this.commands = []
    this.stop = false
    this.isWorking = false
    this.step = undefined
    
    this.backup_word = Array.from(this.roulette.word)
    this.backup_offset = this.roulette.offset
    this.backup_startPos = this.roulette.startPos
  }

  programm(next = 0) {
    if (this.stop) return this.step = next
    if (next > this.commands.length - 1) {
      this.step = undefined
      return (this.isWorking = false)
    }
    this.isWorking = true
    let [nextCommand, repeat] = this.commands[next]
    this.commands[next][1] -= 1
    nextCommand()
    setTimeout(() => {
      if (repeat <= 1) next += 1
      return this.programm(next)
    }, this.delay)
  }

  moveLeft() {
    let indexOfActive = this.roulette.startPos - this.roulette.offset -1
    this.roulette.startPos -= 1
    this.roulette.updateActiveCeil()
    if (indexOfActive + 1 < this.roulette.grid__roulette.children.length) {
      this.roulette.move(true)
    }
  }

  moveRight() {
    let indexOfActive = this.roulette.startPos - this.roulette.offset - 1
    this.roulette.startPos += 1
    this.roulette.updateActiveCeil()
    if (indexOfActive + 1 >= this.roulette.grid__roulette.children.length) {
      this.roulette.move(false)
    }
  }

  writeLetter(letter) {
    if (letter == "_") return
    this.roulette.updateWord(letter, this.roulette.startPos-this.roulette.offset-1)
  }

  readCurrentSymbol() {
    let symbol = this.roulette.getActiveCeilSymbol()
    if (symbol == undefined || symbol == "" || symbol == " ") return "0"
    return symbol
  }
}