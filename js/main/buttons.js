// Add buttons next to the filter
App.make_buttons = function () {
  let buttons = App.el("#buttons")

  for (let button of App.button_map) {
    let el = document.createElement("button")
    el.textContent = button.name
    el.classList.add("button")
    
    if (button.link || button.callback) {
      el.classList.add("button_2")
      el.classList.add("actionbox")
    }

    if (button.title) {
      el.title = button.title
    }

    // Avoid reference problems
    let btn = button

    el.addEventListener("click", function (e) {
      if (btn.link) {
        App.open_tab(btn.link)
      } else if (btn.callback) {
        btn.callback()
      } else {
        App.do_button_select(btn)
        App.clear_filter()
      }
    })

    buttons.append(el)
  }
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
    if (button.link || button.callback) {
      continue
    }

    if (!first) {
      first = button
    }

    if (waypoint) {
      App.do_button_select(button)
      App.do_filter()
      return
    }

    if (App.selected_button.mode === button.mode) {
      waypoint = true
    }
  }

  if (first) {
    App.do_button_select(first)
    App.do_filter()
  }  
}

// Get button elements
App.get_buttons = function () {
  return App.els(".button", App.el("#buttons"))
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

// Activates a button
App.do_button_select = function (button) {
  App.selected_button = button
  App.last_mode = button.mode
  App.save_last_mode()
}

// Get remembered mode state
App.get_last_mode = function () {
  App.last_mode = App.get_local_storage(App.ls_last_mode)

  if (App.last_mode === null) {
    App.last_mode = ""
  }

  let found = false

  for (let button of App.button_map) {
    if (button.mode === App.last_mode) {
      App.do_button_select(button)
      found = true
      break
    }
  }

  if (!found) {
    App.do_button_select(App.button_map[0])
  }
}

// Saves the last mode localStorage object
App.save_last_mode = function () {
  App.save_local_storage(App.ls_last_mode, App.last_mode)
}