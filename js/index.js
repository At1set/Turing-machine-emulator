import Roulette from "./Roulette.js";

window.onload = () => {
  const grid__roulette = document.querySelector(".grid__roulette")
  const grid__arrowLeft = document.querySelector(".grid__arrow_left")
  const grid__arrowRight = document.querySelector(".grid__arrow_right")
  let roulette = undefined;

  function resize_roulette(e, isInitial=false) {
    const width = document.body.clientWidth
    let count_of_ceils = Math.floor((width - 60) / 60)
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
    if (isInitial) roulette = new Roulette(grid__roulette);
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
    if(isWorking) return
    isDown = true
    startMovingRoulette(true)
    grid__roulette.querySelectorAll("input").forEach((e) => {e.blur()})
  })
  grid__arrowRight.addEventListener("mousedown", (e) => {
    e.preventDefault()
    if(isWorking) return
    isDown = true
    startMovingRoulette(false)
    grid__roulette.querySelectorAll("input").forEach((e) => {e.blur()})
  })
  grid__arrowLeft.addEventListener("mouseup", (e) => {
    e.preventDefault()
    isDown = false
  })
  grid__arrowRight.addEventListener("mouseup", (e) => {
    e.preventDefault()
    isDown = false
  })
  function startMovingRoulette(left, delay=200) {
    if (!isDown) return
    isWorking = true
    roulette.move(left)
    setTimeout(() => {
      isWorking = false
      return startMovingRoulette(left, delay)
    }, delay);
  }

  grid__roulette.querySelectorAll("input").forEach((e, index) => {
    e.addEventListener("input", (e) => {
      roulette.updateWord(e.target.value, index)
    })
  })

  const modalWindow = document.querySelector(".table-modalWindow") 
  const buttons_CeilStates = document.querySelectorAll(".table-state button")
  function openModalWindow(index) {
    const target_button = buttons_CeilStates.item(index)
    const left = window.getComputedStyle(modalWindow)
    const top = target_button.getClientRects()[0].top
    

    modalWindow.classList.add("_active")
    modalWindow.style.left = String(left)
    modalWindow.style.top = String(top)
    console.log(modalWindow.style)
  }

  buttons_CeilStates.forEach((e) => {
    e.addEventListener('click', (e) => {
      openModalWindow(Array.from(buttons_CeilStates).indexOf(e.target))
    })
  })
}