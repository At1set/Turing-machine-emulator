import Roulette from "./Roulette.js";
import Parser from "./Parser.js"

window.onload = () => {
  const grid__roulette = document.querySelector(".grid__roulette")
  const grid__arrowLeft = document.querySelector(".grid__arrow_left")
  const grid__arrowRight = document.querySelector(".grid__arrow_right")
  let roulette = undefined

  function resize_roulette(e, isInitial = false) {
    const width = document.body.clientWidth
    let count_of_ceils = Math.floor((width - 60) / 60)
    if (count_of_ceils > 30) count_of_ceils = 30
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
    if (isInitial) roulette = new Roulette(grid__roulette)
  }
  resize_roulette(null, true)

  window.addEventListener("resize", (e) => {
    resize_roulette()
    roulette.updateActiveCeil()
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

  grid__roulette.querySelectorAll("input").forEach((e, index) => {
    e.addEventListener("input", (e) => {
      if (e.target.value == "") return roulette.updateWord(e.target.value, index, true)
      roulette.updateWord(e.target.value, index)
    })
  })
  let roulette_lastFocus = undefined
  grid__roulette.querySelectorAll("input").forEach((e, index) => {
    e.addEventListener("focusin", (e) => {
      grid__roulette.querySelectorAll(".grid__item").forEach((e) => {
        e.classList.remove("_focus")
      })
      e.target.closest(".grid__item").classList.add("_focus")
      roulette_lastFocus = index
    })
  })

  const insertButton = document.querySelector(".grid__insertWord button")
  const wordInput = document.querySelector(".grid__insertWord input")
  let wordInput__lastValue = ""
  wordInput.addEventListener("input", (e) => {
    if (e.inputType === "deleteContentForward") return
    if (e.inputType === "deleteContentBackward") return
    let blockedSymbols = dictionary_input(undefined, undefined, undefined, true)
    let isBlockedSymbol = false
    for (let charIndex in blockedSymbols) {
      if (blockedSymbols[charIndex] == " ") continue
      if (e.target.value.includes(blockedSymbols[charIndex])) {
        isBlockedSymbol = true
        break
      }
    }
    if (isBlockedSymbol) return e.target.value = wordInput__lastValue
    wordInput__lastValue = e.target.value
  })

  insertButton.addEventListener("click", (e) => {
    let insertedWord = wordInput.value
    if (insertedWord == "" || roulette_lastFocus==undefined) return
    let dict = updateRouletteDict()
    for (let i = 0; i < insertedWord.length; i++) {
      const symbol = insertedWord[i]
      if (symbol == " ") continue
      if (!dict.includes(symbol)) return alert(`В словаре отсутсвует символ ${symbol}!`)
    }
    for (let charIndex in insertedWord) {
      roulette.updateWord(insertedWord[charIndex], roulette_lastFocus+(+charIndex), false, true)
    }
  })
  // =============== Соварь ===============
  const dictionary = document.querySelector(".grid__abc input")
  const button__setDictionary = document.querySelector(".grid__abc button")

  let dictionary_lastValue = document.querySelector(".grid__abc input").value
  dictionary.addEventListener("input", (e) => {
    dictionary_input(e)
  })
  
  function dictionary_input(e, isFromTable=false, isRemove=false, getBlockedSymbols=false) {
    let blockedSymbols = [",", ".", "<", ">", ";", "/", "|", "\\", ":", "'", "+", "-", " ", "`", "\""]
    if (getBlockedSymbols) return blockedSymbols
    if (isRemove) {
      let dict = updateRouletteDict()
      let index = dict.indexOf(isFromTable)
      if (index == -1) return
      dict.splice(index, 1)
      dictionary.value = dict.join(", ")
      return updateRouletteDict()
    }

    if (e.inputType === "deleteContentForward") {
      return (e.target.value = dictionary_lastValue)
    }
    if (e.inputType === "deleteContentBackward") {
      return e.target.value = e.target.value.substr(0, e.target.value.length - 2)
    }
    
    let letter = e.target.value[e.target.value.length-1]
    if (!isFromTable) dictionary.value = dictionary.value.substr(0, dictionary.value.length - 1)
    if (blockedSymbols.includes(letter)) return false
    let dictHasLetter = dictionary.value.includes(letter)
    if (letter && !dictHasLetter) {
      if (dictionary.value.length > 0) dictionary.value += ", " + letter
      else dictionary.value += letter
    }

    updateRouletteDict()
    dictionary_lastValue = dictionary.value
    return !dictHasLetter
  }

  function updateRouletteDict() {
    let dict = dictionary.value.split(", ")
    roulette.dictionary = dict
    return dict
  }

  button__setDictionary.addEventListener("click", (e) => {
    updateRouletteDict()
    setTableDictionary(roulette.dictionary)
  })

  function setTableDictionary(dict) {
    let clearWorldTable = 
    `
      <tr>
        <td>
          <button class="word-table__button">...</button>
          <div class="word-table__modalWindow _table-modalWindow _table-modalWindow_2">
            <div class="table-modalWindow_2__option table-modalWindow__option">Добавить букву</div>
            <div class="table-modalWindow_2__option table-modalWindow__option">Удалить</div>
          </div>
        </td>
      </tr>
    `
    let tableState = document.querySelector(".states-table tbody")
    tableState.innerHTML = clearWorldTable


    dict.forEach((symbol, index) => {
      changeWorldTable()
      tableState = document.querySelectorAll(".states-table tbody tr")
      let dict_input = tableState[index].querySelector("input")
      dict_input.dataset.lastvalue = symbol
      dict_input.value = symbol
    })
  }
  // =============== Соварь ===============
  // =========== МОДАЛЬНОЕ ОКНО ===========
  const modalWindow = document.querySelector(".table-modalWindow")
  let buttons_CeilStates = document.querySelectorAll(".table-state button")
  let lastModalWindowIndex = undefined
  function openModalWindow(index) {
    if (
      lastModalWindowIndex == index &&
      modalWindow.classList.contains("_active")
    ) {
      updateZIndexStateButtons()
      lastModalWindowIndex = undefined
      return modalWindow.classList.remove("_active")
    }
    const target_button = buttons_CeilStates.item(index)
    const targetButton__style = target_button.getBoundingClientRect()
    const left = targetButton__style.right
    const top = targetButton__style.top

    modalWindow.classList.add("_active")
    modalWindow.style.left = `${left}px`
    modalWindow.style.top = `${top}px`
    lastModalWindowIndex = index

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
        changeTableState(undefined, undefined)
      }
      if (command == "Удалить текущую ячейку") {
        changeTableState(undefined, lastModalWindowIndex, true)
      }
      if (command == "Добавить состояние справа") {
        changeTableState(false, lastModalWindowIndex)
      }
      if (command == "Добавить состояние слева") {
        changeTableState(true, lastModalWindowIndex)
      }
      updateZIndexStateButtons()
      return modalWindow.classList.remove("_active")
    }
    if (e.target.closest(".word-table__modalWindow")) {
      // Обработка команд модального окна №2
      let command = e.target.textContent

      if (command == "Добавить букву") {
        changeWorldTable()
      } else if (command == "Удалить") {
        changeWorldTable(true)
      }

      return modalWindow_worldTable.classList.remove("_active")
    }
  })
  // =========== МОДАЛЬНОЕ ОКНО ===========
  // ===========     ТАБЛИЦА    ===========
  function changeTableState(left, index, isDelete = false) {
    let tableState = document.querySelector(".states-table thead tr:last-child")
    let tableStateTransitions = document.querySelectorAll(
      ".states-table tbody tr"
    )
    tableStateTransitions = Array.from(tableStateTransitions).slice(0, -1)
    let stateCeil = document.querySelector(
      ".states-table thead tr th:last-child"
    )

    stateCeil.setAttribute("colspan", +stateCeil.getAttribute("colspan") + 1)
    let newCeilState = `
      <td class="states-table__state table-state">
        <div class="table-state__content"><input type="text" value="" maxlength="3"></div>
        <button>...</button>
      </td>
    `
    let newCeilStateTransitions = `
      <td class="table-state__transitionCeil"><input type="text" maxlength="7"></td>
    `
    if (isDelete) {
      if (tableState.children.length <= 2) return
      tableState.removeChild(tableState.children[index + 1])
      tableStateTransitions.forEach((e) => {
        e.removeChild(e.children[index + 1])
      })
      roulette.states.splice(index, 1)
      return
    }
    if (left == undefined) {
      tableState.insertAdjacentHTML("beforeend", newCeilState)
      roulette.states.length += 1
      tableStateTransitions.forEach((e) => {
        e.insertAdjacentHTML("beforeend", newCeilStateTransitions)
      })
    } else {
      let pos = left ? "beforebegin" : "afterend"
      tableState.children[index + 1].insertAdjacentHTML(pos, newCeilState)
      if (left) roulette.states.unshift(undefined)
      else roulette.states.length += 1
      tableStateTransitions.forEach((e) => {
        e.children[index+1].insertAdjacentHTML(pos, newCeilStateTransitions)
      })
    }
    lastModalWindowIndex = undefined
  }

  function changeWorldTable(isDelete=false) {
    let lastTransitionsRow = document.querySelectorAll(".states-table tbody tr")
    if (isDelete && lastTransitionsRow.length > 2) {
      let removeingElement = lastTransitionsRow[lastTransitionsRow.length - 2]
      let letter = removeingElement.children[0].querySelector("input").value
      if (letter.length > 0) dictionary_input(undefined, letter, true)
      return document
        .querySelector(".states-table tbody")
        .removeChild(removeingElement)
    } else if (isDelete) return
    lastTransitionsRow = lastTransitionsRow[lastTransitionsRow.length - 2]
    let isTableTransitionsClear = false
    if (!lastTransitionsRow) {
      isTableTransitionsClear = true
      lastTransitionsRow = document.querySelectorAll(".states-table tbody tr")[0]
    }
    let newRow = document.createElement("tr")
    newRow.innerHTML += `<td class="word-table__input"><input type="text" maxlength="1" value=""></td>`
    for (let i = 0; i <= roulette.states.length-1; i++) {
      newRow.innerHTML += `<td class="table-state__transitionCeil"><input type="text" maxlength="7" value=""></td>`
    }

    if (isTableTransitionsClear) return lastTransitionsRow.insertAdjacentElement("beforeBegin", newRow)
    return lastTransitionsRow.insertAdjacentElement("afterend", newRow)
  }
  // ===========     ТАБЛИЦА    ===========

  // ========== МОДАЛЬНОЕ ОКНО №2 =========
  const modalWindow_worldTable = document.querySelector(".word-table__modalWindow")
  const tableStatesWrapper = document.querySelector(".states-table__wrapper")
  function openWorldModalWindow() {
    const modalWindow_worldTable = document.querySelector(".word-table__modalWindow")
    if (!modalWindow_worldTable.classList.contains("_active")) {
      modalWindow_worldTable.classList.add("_active")
      tableStatesWrapper.scrollTo(0, tableStatesWrapper.scrollHeight)
    } else {
      modalWindow_worldTable.classList.remove("_active")
    }
  }
  // ========== МОДАЛЬНОЕ ОКНО №2 =========
  // ========== Ввод в таблице ============
  function getWordInputs() {
    let inputs = []
    let wordCeils = document.querySelectorAll(".states-table tbody tr")
    wordCeils = Array.from(wordCeils).slice(0, -1)
    wordCeils.forEach(e => {
      inputs.push(e.children[0].querySelector("input"))
    });
    return inputs
  }
  document.querySelector(".states-table__table").addEventListener("input", (e) => {
    if (e.target.closest(".word-table__input")) {
      if (e.target.value == "") {
        return dictionary_input(e, e.target.dataset.lastvalue, true)
      }
      if(!dictionary_input(e, e.target.value)) return e.target.value = e.target.value.substr(0, e.target.value.length - 1)
      e.target.dataset.lastvalue = e.target.value
    }
  })
  // ========== Ввод в таблице ============


  let startButton = document.querySelector(".startBlock button")
  startButton.addEventListener("click", (e) => {
    console.log(Parser.parseReactionsTable());
  })
}