// Add buttons next to the filter
App.make_buttons = function () {
  for (let button of App.button_map) {
    let el = document.createElement("button")
    el.textContent = button.name
    el.classList.add("button")
    el.classList.add("action")

    if (button.title) {
      el.title = button.title
    }

    // Avoid reference problems
    let btn = button

    el.addEventListener("click", function (e) {
      App.active_button = btn
      App.do_filter()
      App.filter.focus()
    })

    buttons.append(el)
  }

  App.active_button = App.button_map[0]
}

// Move to the next button
App.cycle_buttons = function (direction) {
  let map = App.button_map.slice(0)

  if (direction === "left") {
    map.reverse()
  }

  let waypoint = false
  let first
  
  for (let button of map) {
    if (!first) {
      first = button
    }

    if (waypoint) {
      App.active_button = button
      App.do_filter()
      return
    }

    if (App.active_button.mode === button.mode) {
      waypoint = true
    }
  }

  if (first) {
    App.active_button = first
    App.do_filter()
  }  
}

// Get button elements
App.get_buttons = function () {
  return Array.from(buttons.querySelectorAll(".button"))
}

// Highlight the active button
App.highlight_button = function (btn) {
  for (let button of App.get_buttons()) {
    if (button.textContent === btn.name) {
      button.classList.add("highlighted")
    } else {
      button.classList.remove("highlighted")
    }
  }
}