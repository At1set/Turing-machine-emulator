export default class Roulette {
  constructor(grid__roulette) {
    this.grid__roulette = grid__roulette
    this.word = []
    this.leftLetterPos = 0
    this.offset = 0
    this.startPos = 1
    grid__roulette.firstElementChild.classList.add("_current")
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

  updateWord(letter, index) {
    if (this.word.length == 0 && !letter) return
    if (letter) {
      let letterPos = index + this.offset
      if (letterPos >= 0) {
        this.word[index + this.offset] = letter
      }
      else {
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
}