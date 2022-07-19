// Add buttons next to the filter
App.make_buttons = function () {
  let buttons = App.el("#buttons")

  for (let button of App.buttons) {
    let el = document.createElement("button")
    el.textContent = button.name
    el.classList.add("button")
    
    if (button.alt) {
      el.classList.add("button_2")
      el.classList.add("actionbox")
    }

    if (button.title) {
      el.title = button.title
    } else {
      if (button.path) {
        el.title = `Matches ${button.path}`
      } else if (button.level) {
        el.title = `Path Level ${button.level}`
      } else if (button.hours) {
        let s = App.plural(button.hours, "hour", "hours")
        el.title = `Visited in the last ${s}`
      }
    }

    // Avoid reference problems
    let btn = button

    el.addEventListener("click", function (e) {
      if (btn.alt) {
        if (btn.mode === "home") {
          App.go_home()
        } else if (btn.mode === "about") {
          App.show_editor()
        }
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
  let map = App.buttons.slice(0)

  if (direction === "left") {
    map.reverse()
  }

  let waypoint = false
  let selected
  let first
  
  for (let button of map) {
    if (button.alt) {
      continue
    }

    if (!first) {
      first = button
    }

    if (waypoint) {
      selected = button
      break
    }

    if (App.selected_button.name === button.name) {
      waypoint = true
    }
  }

  if (!selected && first) {
    selected = first
  }

  if (selected) {
    App.do_button_select(selected)
    App.clear_filter()
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
  App.highlight_button(button)
  App.last_button = button.name
  App.save_last_button()
}

// Get remembered mode state
App.get_last_button = function () {
  App.last_button = App.get_local_storage(App.ls_last_button)

  if (App.last_button === null) {
    App.last_button = ""
  }

  let found = false

  for (let button of App.buttons) {
    if (button.name === App.last_button) {
      App.do_button_select(button)
      found = true
      break
    }
  }

  if (!found) {
    App.do_button_select(App.buttons[0])
  }
}

// Saves the last mode localStorage object
App.save_last_button = function () {
  App.save_local_storage(App.ls_last_button, App.last_button)
}