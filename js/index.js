import Roulette from "./Roulette.js";
import Parser from "./Parser.js"
import Machine from "./Machine.js"
import Table from "./Table.js";
import FileImporter from "./importFile/FileImporter.js";

export const globalOptions = {
  blockedSymbols: [",", ".", "<", ">", ";", "/", "|", "\\", ":", "'", "+", "-", " ", "`", '"', ""]
}

window.onload = () => {
  // =============== Поле рулетки ===============
  let grid__roulette = document.querySelector(".grid__roulette")
  const grid__arrowLeft = document.querySelector(".grid__arrow_left")
  const grid__arrowRight = document.querySelector(".grid__arrow_right")
  let roulette = undefined
  let table = new Table()
  let isFollowСursor = false

  function resize_roulette(e, isInitial = false) {
    const width = document.body.clientWidth
    let count_of_ceils = Math.floor((width - 60) / 60)
    if (count_of_ceils % 2 == 0) count_of_ceils += 1
    if (count_of_ceils > 10) count_of_ceils = 11
    if (width < 767) count_of_ceils = 7
    if (width < 465) count_of_ceils = 5
    if (width < 325) count_of_ceils = 3

    grid__roulette.innerHTML = ""
    for (let i = 0; i < count_of_ceils; i++) {
      grid__roulette.innerHTML += `
        <div class="grid__item">
          <input type="text" maxlength="1" id="${i}">
        </div>
      `
    }
    subscribeRouletteInputs()
    let activeCeil = 0
    if (!isInitial) activeCeil = roulette.getActiveCeil()
    if (isFollowСursor) activeCeil = parseInt(count_of_ceils / 2)
    if (isInitial) {
      roulette = new Roulette(grid__roulette, activeCeil)
      grid__roulette.children[activeCeil].classList.add("_focus", "_current")
    }
  }
  resize_roulette(null, true)

  window.addEventListener("resize", (e) => {
    resize_roulette()
    roulette.updateActiveCeil()
    grid__roulette = document.querySelector(".grid__roulette")
  })

  document
    .querySelector(".input_isCenteredCoursour")
    .addEventListener("change", (e) => {
      isFollowСursor = e.target.checked
      resize_roulette(undefined, true)
      roulette.updateActiveCeil()
      grid__roulette = document.querySelector(".grid__roulette")
    })

  grid__roulette.addEventListener("dblclick", (e) => {
    const element = e.target.closest(".grid__item")
    let elements = Array.from(grid__roulette.children)
    roulette.updateActiveCeil(elements.indexOf(element))
  })

  let isDown = false
  let isWorking = false
  grid__arrowLeft.addEventListener("mousedown", (e) => {
    e.preventDefault()
    if (isWorking) return
    isDown = true
    startMovingRoulette(true)
    grid__roulette.querySelectorAll("input").forEach((e) => {
      e.blur()
    })
  })
  grid__arrowRight.addEventListener("mousedown", (e) => {
    e.preventDefault()
    if (isWorking) return
    isDown = true
    startMovingRoulette(false)
    grid__roulette.querySelectorAll("input").forEach((e) => {
      e.blur()
    })
  })
  grid__arrowLeft.addEventListener("mouseup", (e) => {
    e.preventDefault()
    isDown = false
  })
  grid__arrowRight.addEventListener("mouseup", (e) => {
    e.preventDefault()
    isDown = false
  })
  function startMovingRoulette(left, delay = 200) {
    if (!isDown) return
    isWorking = true
    roulette.move(left)
    setTimeout(() => {
      isWorking = false
      return startMovingRoulette(left, delay)
    }, delay)
  }

  function subscribeRouletteInputs() {
    grid__roulette.querySelectorAll("input").forEach((e, index) => {
      e.addEventListener("input", (e) => {
        if (e.target.value == "")
          return roulette.updateWord(e.target.value, index, true)
        roulette.updateWord(e.target.value, index)
      })
      e.addEventListener("focusin", (e) => {
        grid__roulette.querySelectorAll(".grid__item").forEach((e) => {
          e.classList.remove("_focus")
        })
        e.target.closest(".grid__item").classList.add("_focus")
        roulette.lastFocus = index
      })
    })
  }
  // =============== Поле рулетки ===============

  // =============== Вставка слова ===============
  const wordInput = document.querySelector(".grid__insertWord input")
  const insertButton = document.querySelector(".grid__insertWord button")
  const clearButton = document.querySelector(
    ".grid-insertWord__clearButton button"
  )
  let wordInput__lastValue = ""
  wordInput.addEventListener("input", (e) => {
    if (e.inputType === "deleteContentForward") return
    if (e.inputType === "deleteContentBackward") return
    let blockedSymbols = dictionary_input(undefined, undefined, undefined, true)
    let isBlockedSymbol = false
    for (let charIndex in blockedSymbols) {
      if (blockedSymbols[charIndex] == " " || blockedSymbols[charIndex] === "")
        continue
      if (e.target.value.includes(blockedSymbols[charIndex])) {
        isBlockedSymbol = true
        break
      }
    }
    if (isBlockedSymbol) return (e.target.value = wordInput__lastValue)
    wordInput__lastValue = e.target.value
  })

  insertButton.addEventListener("click", (e) => {
    let insertedWord = wordInput.value
    if (insertedWord == "" || roulette.lastFocus == undefined) return
    let dict = getInputDict()

    for (let i = 0; i < insertedWord.length; i++) {
      const symbol = insertedWord[i]
      if (symbol == " ") continue
      if (!dict.includes(symbol))
        return alert(`В словаре отсутсвует символ ${symbol}!`)
    }
    for (let charIndex in insertedWord) {
      roulette.updateWord(
        insertedWord[charIndex],
        roulette.lastFocus + +charIndex,
        false,
        true
      )
    }
  })

  clearButton.addEventListener("click", (e) => roulette.clearGrid())
  // =============== Вставка слова ===============

  // =============== Соварь ===============
  const dictionary = document.querySelector(".grid__abc input")
  const button__setDictionary = document.querySelector(".grid__abc button")

  let dictionary_lastValue = document.querySelector(".grid__abc input").value
  dictionary.addEventListener("input", (e) => {
    dictionary_input(e)
  })

  function dictionary_input(
    e,
    isFromTable = false, // при isRemove - буква словаря, иначе - bool
    isRemove = false,
    getBlockedSymbols = false
  ) {
    let blockedSymbols = globalOptions.blockedSymbols
    if (getBlockedSymbols) return blockedSymbols
    if (isRemove) {
      let index = roulette.dictionary.indexOf(isFromTable)
      if (index == -1) return
      roulette.dictionary[index] = ""
      return updateInputDict()
    }

    if (e.inputType === "deleteContentForward") {
      return (e.target.value = dictionary_lastValue)
    }
    if (e.inputType === "deleteContentBackward") {
      return (e.target.value = e.target.value.substr(
        0,
        e.target.value.length - 2
      ))
    }

    let letter = e.target.value[e.target.value.length - 1]
    if (!isFromTable)
      dictionary.value = dictionary.value.substr(0, dictionary.value.length - 1)
    if (blockedSymbols.includes(letter)) return false
    let dictHasLetter = dictionary.value.includes(letter)
    if (letter && !dictHasLetter) {
      if (!isFromTable) {
        if (dictionary.value.length > 0) dictionary.value += ", " + letter
        else dictionary.value += letter
      } else {
        const indexInDict = table.getWordInputs().indexOf(e.target)
        roulette.dictionary[indexInDict] = letter
        updateInputDict()
      }
    }

    dictionary_lastValue = dictionary.value
    return !dictHasLetter
  }

  // Обновляет строку инпута из словаря
  function updateInputDict() {
    return (dictionary.value = roulette.dictionary
      .filter((letter) => letter)
      .join(", "))
  }

  // Обновляет словарь из таблицы
  function updateRouletteDict(isWithInputDict = true) {
    const tableWordInputs = table.getWordInputs()
    roulette.dictionary = tableWordInputs.map((input) => input.value)
    if (isWithInputDict) updateInputDict()
  }
  updateRouletteDict()

  function getInputDict() {
    return dictionary.value.split(", ")
  }

  button__setDictionary.addEventListener("click", (e) => {
    setTableDictionary(getInputDict())
  })

  // Функция, из-за которой удаляется весь контент при нажатии на кнопку "Задать словарь"
  function setTableDictionary(dict) {
    let clearWordTable = Table.clearWordTable
    let tableState = document.querySelector(".states-table tbody")
    tableState.innerHTML = clearWordTable

    dict.forEach((symbol, index) => {
      table.changeWordTable()
      tableState = document.querySelectorAll(".states-table tbody tr")
      let dict_input = tableState[index].querySelector("input")
      dict_input.dataset.lastvalue = symbol
      dict_input.value = symbol
    })
    return updateRouletteDict(false)
  }
  // =============== Соварь ===============

  // =========== МОДАЛЬНОЕ ОКНО ===========
  const modalWindow = document.querySelector(".table-modalWindow")
  let buttons_CeilStates = document.querySelectorAll(".table-state button")
  function openModalWindow(index) {
    if (
      table.lastModalWindowIndex == index &&
      modalWindow.classList.contains("_active")
    ) {
      updateZIndexStateButtons()
      table.lastModalWindowIndex = undefined
      return modalWindow.classList.remove("_active")
    }
    const target_button = buttons_CeilStates.item(index)
    const targetButton__style = target_button.getBoundingClientRect()
    const left = targetButton__style.right
    const top = targetButton__style.top

    modalWindow.classList.add("_active")
    modalWindow.style.left = `${left}px`
    modalWindow.style.top = `${top}px`
    table.lastModalWindowIndex = index

    updateZIndexStateButtons()
    target_button.style.zIndex = "10"
  }

  function updateZIndexStateButtons() {
    buttons_CeilStates.forEach((e) => {
      e.style.zIndex = "2"
    })
  }

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".table-modalWindow") &&
      modalWindow.classList.contains("_active") &&
      !e.target.closest(".table-state button")
    ) {
      updateZIndexStateButtons()
      modalWindow.classList.remove("_active")
    } else if (e.target.closest(".table-state button")) {
      modalWindow.classList.add("_active")
      buttons_CeilStates = document.querySelectorAll(".table-state button")
      openModalWindow(Array.from(buttons_CeilStates).indexOf(e.target))
    } else if (e.target.closest(".word-table__button")) {
      openWorldModalWindow()
    }

    if (e.target.closest(".table-modalWindow")) {
      // Обработка команд модального окна
      let command = e.target.textContent
      if (command == "Добавить состояние") {
        table.addColumn()
      }
      if (command == "Удалить текущую ячейку") {
        table.deleteColumnAt(table.lastModalWindowIndex)
      }
      if (command == "Добавить состояние справа") {
        table.addColumn(table.lastModalWindowIndex, Table.insertColumnPos.right)
      }
      if (command == "Добавить состояние слева") {
        table.addColumn(table.lastModalWindowIndex, Table.insertColumnPos.left)
      }
      updateZIndexStateButtons()
      return modalWindow.classList.remove("_active")
    }
    if (e.target.closest(".word-table__modalWindow")) {
      // Обработка команд модального окна №2
      let command = e.target.textContent

      if (command == "Добавить букву") {
        table.changeWordTable()
      } else if (command == "Удалить") {
        table.deleteRowAt()
      }
      return modalWindow_worldTable.classList.remove("_active")
    }
  })
  // =========== МОДАЛЬНОЕ ОКНО ===========
  // ========== МОДАЛЬНОЕ ОКНО №2 =========
  const modalWindow_worldTable = document.querySelector(
    ".word-table__modalWindow"
  )
  const tableStatesWrapper = document.querySelector(".states-table__wrapper")
  function openWorldModalWindow() {
    const modalWindow_worldTable = document.querySelector(
      ".word-table__modalWindow"
    )
    if (!modalWindow_worldTable.classList.contains("_active")) {
      modalWindow_worldTable.classList.add("_active")
      tableStatesWrapper.scrollTo(0, tableStatesWrapper.scrollHeight)
    } else {
      modalWindow_worldTable.classList.remove("_active")
    }
  }
  // ========== МОДАЛЬНОЕ ОКНО №2 =========
  // ========== Ввод в таблице ============
  document
    .querySelector(".states-table__table")
    .addEventListener("input", (e) => {
      // Ввод алфавита
      if (e.target.closest(".word-table__input")) {
        if (e.target.value == "") {
          return dictionary_input(e, e.target.dataset.lastvalue, true)
        }
        if (!dictionary_input(e, e.target.value))
          return (e.target.value = e.target.value.substr(
            0,
            e.target.value.length - 1
          ))
        e.target.dataset.lastvalue = e.target.value
      }
      // Ввод состояний
      if (e.target.closest(".table-state__content")) {
        console.log(e.target)
        let tableStateInputs = table.getStateInputs()
        let inputState_index = tableStateInputs.indexOf(e.target)
        roulette.states[inputState_index] = e.target.value
      }
    })
  // ========== Ввод в таблице ============
  let startButton = document.querySelector(".startBlock button")
  let stopButton = document.querySelector(".startBlock__stop")
  let fullStopButton = document.querySelector(".startBlock__fullStop")
  let nextStepButton = document.querySelector(".startBlock__nextStep")
  let previousStepButton = document.querySelector(".startBlock__previousStep")

  const option_coursorSpeed = document.querySelector(".options__option input")
  const option_coursorSpeedtext = document.querySelector(".options__option p")
  option_coursorSpeed.addEventListener("input", (e) => {
    let value = e.target.value
    option_coursorSpeedtext.textContent = value + "ms"
    cursourSpeed = value
    if (machine !== undefined) machine.delay = cursourSpeed
  })

  // ========== Экспорт настроек ==========
  document.getElementById("export-table").addEventListener("click", exportOptions)

  function exportOptions(e) {
    let link = document.createElement("a")
    link.href = URL.createObjectURL(
      new Blob([JSON.stringify({'1': 'Hello World!'}, null, 4)], {
        type: "json",
      })
    )
    link.download = "options.turing"
    link.click()
  }
  // ========== Экспорт настроек ==========

  // ========== Импорт настроек ==========
  document.getElementById("import-table").addEventListener("click", importOptions)

  function importOptions(e) {
    let input = document.createElement("input")
    input.type = "file"
    input.accept = ".turing,.json,.txt"
    input.onchange = importFile
    input.click()
  }
  
  function importFile(event) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = function (e) {
        const content = e.target.result
        FileImporter.applayConfig(file, content)
      }
      reader.readAsText(file)
    }
  }
  // ========== Импорт настроек ==========

  let machine = undefined
  let cursourSpeed = 500
  let state = 0

  function resetMachine() {
    machine = undefined
    state = 0
  }

  startButton.addEventListener("click", (e) => {
    if (Parser.checkIsAllStatesNamed()) programm_start(e)
  })
  stopButton.addEventListener("click", (e) => {
    programm_pause(e)
  })
  fullStopButton.addEventListener("click", (e) => {
    programm_fullstop(e)
  })
  nextStepButton.addEventListener("click", (e) => {
    programm__next(e)
  })
  previousStepButton.addEventListener("click", (e) => {
    programm__previous(e)
  })

  function change_state(newState) {
    if (![0, "w", "p", "F"].includes(newState)) return
    state = newState
    if (state == 0) {
      startButton.disabled = false
      stopButton.disabled = true
      fullStopButton.disabled = true
      nextStepButton.disabled = false
      previousStepButton.disabled = true
    } else if (state === "w") {
      startButton.disabled = true
      stopButton.disabled = false
      fullStopButton.disabled = false
      nextStepButton.disabled = true
      previousStepButton.disabled = true
    } else if (state == "p") {
      startButton.disabled = false
      // startButton.textContent = "Продолжить"
      stopButton.disabled = true
      fullStopButton.disabled = false
      nextStepButton.disabled = false
      previousStepButton.disabled = false
    } else if (state == "F") {
      startButton.disabled = true
      stopButton.disabled = true
      fullStopButton.disabled = false
      nextStepButton.disabled = true
      previousStepButton.disabled = false
    }
    return state
  }

  function programm_start(e) {
    if (state == "w" || state == "F") return
    if (state == 0) {
      change_state("w")
      machine = createNewMachine()
      machine.commands = getNextMachineProgramm(machine)
      return machine.programm()
    } else if (state == "p") {
      programm_continue(e)
    }
    return
  }

  function programm_continue(e) {
    change_state("w")
    machine.stop = false
    machine.programm(machine.step)
    startButton.disabled = true
    // startButton.textContent = "Запуск"
    return
  }

  function programm_pause(e) {
    if (state == 0 || state == "p" || state == "F") return
    if (state == "w") {
      change_state("p")
      machine.stop = true
      // startButton.textContent = "Продолжить"
    }
    return
  }

  function programm_fullstop(e) {
    if (state == 0) return
    else if (state == "w" || state == "p" || state == "F") {
      change_state(0)
      machine.stop = true
      let backup_word = machine.backup_word
      let backup_offset = machine.backup_offset
      let backup_startPos = machine.backup_startPos
      roulette.restoreRoulette(backup_word, backup_offset, backup_startPos)

      // startButton.textContent = "Запуск"
      return (machine = undefined)
    }
  }

  function programm__next(e) {
    if (state == "w" || state == "F") return
    if (state == 0) {
      change_state("p")
      machine = createNewMachine()
      machine.commands = getNextMachineProgramm(machine)
      machine.doNextStep()
    } else if (state == "p") {
      machine.doNextStep()
    }
  }

  function programm__previous(e) {
    if (state == "w" || state == 0) return
    else if (state == "p" || state == "F") {
      change_state("p")
      machine.doPreviousStep()
      if (machine.step == 0) change_state(0)
    }
  }

  function createNewMachine() {
    const newMachine = new Machine(roulette, isFollowСursor, [
      change_state.bind(this, "F"),
    ])
    newMachine.delay = cursourSpeed
    return newMachine
  }

  function getNextMachineProgramm(machine) {
    let states = roulette.states
    let dictionary = getInputDict()
    let reactions = Parser.parseReactionsTable()

    let currentState = states[0]

    function getNextState(state, symbol) {
      if (symbol == "") symbol = "0"
      let symbol__index = dictionary.indexOf(symbol)
      let state__index = states.indexOf(state)
      if (symbol__index == -1) {
        console.log(`Нет такого символа в алфавите: ${symbol}!`)
        return false
      }
      if (state__index == -1) {
        console.log(`Нет такого состояния: ${state}`)
        return false
      }
      return reactions[symbol__index][state__index]?.split(" ")
    }

    let commands = []
    function walkThrough(currentState, maxIter = 1000) {
      if (maxIter <= 0) return
      let current_letter = machine.readCurrentSymbol()
      let nextStep = getNextState(currentState, current_letter)
      if (!nextStep) return
      let [newState, newLetter, command] = nextStep

      let repeated = 1
      machine.writeLetter(repeated, newLetter).Undo()
      commands.push([
        machine.writeLetter.call(machine, repeated, newLetter),
        repeated,
      ])
      if (command == "r" || command == "R") {
        machine.moveRight().Undo()
        commands.push([machine.moveRight.call(machine, repeated), repeated])
      } else if (command == "l" || command == "L") {
        machine.moveLeft().Undo()
        commands.push([machine.moveLeft.call(machine, repeated), repeated])
      }
      walkThrough(newState, maxIter - 1)
    }

    let backup_word = Array.from(roulette.word)
    let backup_offset = roulette.offset
    let backup_startPos = roulette.startPos

    walkThrough(currentState)

    roulette.restoreRoulette(backup_word, backup_offset, backup_startPos)
    return commands
  }
}