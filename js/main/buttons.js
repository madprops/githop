// Add buttons next to the filter
App.make_buttons = function () {
  let buttons = App.el("#buttons")

  for (let button of App.buttons) {
    button.activated = false
    let el = document.createElement("button")
    el.textContent = button.name
    el.classList.add("button")
    
    if (button.tooltip) {
      el.title = button.tooltip
    } else {
      let titles = []

      if (button.path) {
        titles.push(`Path ${button.path}`)
      } 
      
      if (button.level) {
        titles.push(`Level ${button.level}`)
      } 
      
      if (button.hours) {
        titles.push(`Hours ${button.hours}`)
      }

      if (button.title) {
        titles.push(`Title ${button.title}`)
      } 

      el.title = titles.join("   |   ")
    }

    // Avoid reference problems
    let btn = button

    el.addEventListener("click", function (e) {
      App.toggle_activate_button(btn)
      App.do_filter()
      App.focus_filter()
    })

    button.element = el
    buttons.append(el)
  }
}

// Highlight the active button
App.highlight_button = function (btn) {
  for (let button of App.buttons) {
    button.element.classList.remove("activated")

    if (button.element.textContent === btn.name) {
      button.element.classList.add("highlighted")
      button.element.scrollIntoView({block: "nearest"})
    } else {
      button.element.classList.remove("highlighted")
    }
  }
}

// Get remembered mode state
App.get_button_state = function () {
  App.button_state = App.get_local_storage(App.ls_button_state)

  if (App.button_state === null) {
    App.button_state = ""
  }

  for (let name of App.button_state) {
    let btn = App.get_button(name)

    if (btn) {
      App.toggle_activate_button(btn)
    }
  }
}

// Saves the last mode localStorage object
App.save_button_state = function () {
  App.save_local_storage(App.ls_button_state, App.button_state)
}

// Prepare buttons
App.setup_buttons = function () {
  App.make_buttons()
  App.get_button_state()

  let buttons = App.el("#buttons")
  let left = App.el("#buttons_left")
  let right = App.el("#buttons_right")

  buttons.addEventListener("wheel", function (e) {
    let direction = e.deltaY > 0 ? "down" : "up"

    if (direction === "down") {
      App.scroll_buttons_right()
    } else if (direction === "up") {
      App.scroll_buttons_left()
    }
  })

  if (buttons.scrollWidth <= buttons.clientWidth) {
    left.classList.add("hidden")
    right.classList.add("hidden")
  } else {
    left.addEventListener("click", function () {
      App.scroll_buttons_left()
    })
  
    right.addEventListener("click", function () {
      App.scroll_buttons_right()
    })
  }
}

// Scroll buttons to the right
App.scroll_buttons_right = function () {
  App.el("#buttons").scrollLeft += 80
}

// Scroll buttons to the left
App.scroll_buttons_left = function () {
  App.el("#buttons").scrollLeft -= 80
}

// Activate or de-activate a button
App.toggle_activate_button = function (button) {
  if (button.activated) {
    button.element.classList.remove("highlighted")
  } else {
    button.element.classList.add("highlighted")
  }

  button.activated = !button.activated
  App.update_button_state()
}

// Get active mode by checking buttons
App.get_active_mode = function (mode) {
  let modes = []

  for (let button of App.buttons) {
    if (button.activated) {
      if (mode in button) {
        modes.push(button[mode])
      }
    }
  }

  return modes
}

// Update button state
App.update_button_state = function () {
  App.button_state = []

  for (let button of App.buttons) {
    if (button.activated) {
      App.button_state.push(button.name)
    }
  }

  App.save_button_state()
}

// De-activate all buttons
App.deactivate_all_buttons = function () {
  for (let button of App.buttons) {
    if (button.activated) {
      App.toggle_activate_button(button)
    }
  }
}

// Get button by name
App.get_button = function (name) {
  for (let button of App.buttons) {
    if (button.name === name) {
      return button
    }
  }
}