export default class Roulette {
  static Instance = null

  constructor(grid__roulette, indexOfActiveCeil) {
    if (Roulette.Instance) return Roulette.Instance
    this.grid__roulette = grid__roulette
    this.lastFocus = 0
    this.word = []
    this.dictionary = []
    this.states = ["q0", "q1", "q2", "q3", "q4", "q5"]
    this.leftLetterPos = 0
    this.offset = 0
    this.startPos = 1 + indexOfActiveCeil
    Roulette.Instance = this
  }

  move(left) {
    if (left) this.offset -= 1
    else this.offset += 1
    this.updateActiveCeil()
    this.updateWord()
  }

  removeActiveCeil() {
    Array.from(this.grid__roulette.children).forEach((e, index) =>
      e.classList.remove("_current")
    )
  }

  updateActiveCeil(index) {
    this.removeActiveCeil()
    const elements = Array.from(this.grid__roulette.children)
    if (index != undefined) {
      elements[index].classList.add("_current")
      this.startPos = index + this.offset + 1
      return
    }

    let indexOfActive = this.startPos - this.offset - 1
    if (indexOfActive >= 0 && indexOfActive < elements.length) {
      elements[indexOfActive].classList.add("_current")
      return indexOfActive
    }
  }

  updateWord(letter, index, isBackSpace = false, isInsert = false) {
    if (this.word.length == 0 && letter === undefined && !isBackSpace) return
    if (letter !== undefined || isBackSpace) {
      let letterPos = index + this.offset
      if (letterPos >= 0) {
        if (isBackSpace) {
          this.word[letterPos] = ""
        } else if (isInsert) this.word.splice(index, 0, letter)
        else this.word[index + this.offset] = letter
      } else {
        letterPos = this.leftLetterPos - letterPos
        this.word = [...Array.from({ length: letterPos }), ...this.word]
        this.word[0] = letter
        this.offset += letterPos
        this.startPos += letterPos
      }
      if (this.leftLetterPos > letterPos) this.leftLetterPos = letterPos
    }

    const elements = Array.from(this.grid__roulette.children)
    elements.forEach((e, index) => {
      let current_letter = this.word[index + this.offset]
      e.querySelector("input").value = current_letter ?? ""
    })
  }

  getActiveCeilSymbol() {
    return this.word[this.startPos - 1]
  }

  getActiveCeil() {
    return this.startPos - this.offset - 1
  }

  clearGrid() {
    Array.from(this.grid__roulette.children).forEach((e) => {
      e.querySelector("input").value = ""
    })
    return (this.word = [])
  }

  restoreRoulette(backup_word, backup_offset, backup_startPos) {
    this.clearGrid()
    this.word = backup_word
    this.offset = backup_offset
    this.startPos = backup_startPos

    this.updateActiveCeil()
    this.updateWord()
  }
}