export default class Machine {
  constructor(roulette, isFollowСursor, onWorkingEnd) {
    this.roulette = roulette
    this.delay = 200
    this.isFollowСursor = isFollowСursor
    this.commands = []
    this.stop = false
    this.isWorking = false
    this.step = undefined

    this.endWorking = onWorkingEnd

    this.backup_word = Array.from(this.roulette.word)
    this.backup_offset = this.roulette.offset
    this.backup_startPos = this.roulette.startPos
  }

  programm(next = 0) {
    if (this.commands.length == 0) return
    this.step = next
    if (this.stop) return
    if (next >= this.commands.length - 1) {
      return this._endWorking()
    }
    this.isWorking = true
    let [nextCommand, repeat] = this.commands[next]
    this.commands[next][1] -= 1
    nextCommand.Undo()
    setTimeout(() => {
      if (repeat <= 1) next += 1
      return this.programm(next)
    }, this.delay)
  }

  doNextStep() {
    if (this.commands.length == 0) return this._endWorking()
    if (this.step === undefined) this.step = 0
    let [nextCommand, repeat] = this.commands[this.step]
    this.commands[this.step][1] -= 1
    if (repeat <= 1) this.step += 1
    nextCommand.Undo()
    if (this.step >= this.commands.length - 1) return this._endWorking()
  }

  doPreviousStep() {
    if (this.step > 0) this.step -= 1
    let [prevCommand, repeat] = this.commands[this.step]
    prevCommand.Rendo()
    if (this.step == 0) return (this.isWorking = false)
  }

  _endWorking() {
    this.isWorking = false
    return this.endWorking.forEach((func) => func())
  }

  moveLeft(repeat=1) {
    return new moveLeft(this.roulette, repeat, this.isFollowСursor)
  }

  moveRight(repeat=1) {
    return new moveRight(this.roulette, repeat, this.isFollowСursor)
  }

  writeLetter(repeat=1, letter) {
    return new writeLetter(this.roulette, repeat, letter)
  }

  readCurrentSymbol() {
    let symbol = this.roulette.getActiveCeilSymbol()
    if ([undefined, "", " "].includes(symbol)) return ""
    return symbol
  }
}



class command {
  constructor (repeated) {
    this.repeated = repeated
  }

  Undo () {}
  Rendo () {}
}

class moveLeft extends command {
  constructor(roulette, repeated, isFollowСursor) {
    super(repeated)
    this.roulette = roulette
    this.isFollowСursor = isFollowСursor
  }

  Undo() {
    let indexOfActive = this.roulette.startPos - this.roulette.offset - 1
    this.roulette.startPos -= 1
    this.roulette.updateActiveCeil()
    if (indexOfActive <= 0 || this.isFollowСursor) {
      this.roulette.move(true)
    }
  }
  Rendo() {
    let indexOfActive = this.roulette.startPos - this.roulette.offset - 1
    this.roulette.startPos += 1
    this.roulette.updateActiveCeil()
    if (indexOfActive + 1 >= this.roulette.grid__roulette.children.length || this.isFollowСursor) {
      this.roulette.move(false)
    }
  }
}

class moveRight extends command {
  constructor(roulette, repeated, isFollowСursor) {
    super(repeated)
    this.roulette = roulette
    this.isFollowСursor = isFollowСursor
  }

  Undo() {
    let indexOfActive = this.roulette.startPos - this.roulette.offset - 1
    this.roulette.startPos += 1
    this.roulette.updateActiveCeil()
    if (indexOfActive + 1 >= this.roulette.grid__roulette.children.length || this.isFollowСursor) {
      this.roulette.move(false)
    }
  }
  Rendo() {
    let indexOfActive = this.roulette.startPos - this.roulette.offset - 1
    this.roulette.startPos -= 1
    this.roulette.updateActiveCeil()
    if (indexOfActive <= 0 || this.isFollowСursor) {
      this.roulette.move(true)
    }
  }
}

class writeLetter extends command {
  constructor(roulette, repeated, letter) {
    super(repeated)
    this.roulette = roulette
    this.Writedletter = letter
    this.lastSymbol = ""
  }

  Undo(letter=this.Writedletter) {
    let symbol = this.roulette.getActiveCeilSymbol()
    if (symbol == undefined || symbol == "" || symbol == " ") symbol =  ""
    this.lastSymbol = symbol

    if (letter == "_") return
    this.roulette.updateWord(letter, this.roulette.startPos - this.roulette.offset - 1)
  }
  Rendo() {
    this.Undo(this.lastSymbol)
  }
}