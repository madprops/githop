// Add buttons next to the filter
App.make_buttons = function () {
  let buttons = App.el("#buttons")

  for (let button of App.buttons) {
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
      App.do_button_select(btn)
      App.clear_filter()
    })

    el.addEventListener("auxclick", function (e) {
      if (e.button === 1) {
        App.tag_button(btn)
        App.do_filter()
        App.focus_filter()
      }
    })

    button.element = el
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

// Highlight the active button
App.highlight_button = function (btn) {
  for (let button of App.buttons) {
    button.element.classList.remove("tagged")

    if (button.element.textContent === btn.name) {
      button.element.classList.add("highlighted")
      button.element.scrollIntoView({block: "nearest"})
    } else {
      button.element.classList.remove("highlighted")
    }
  }
}

// Activates a button
App.do_button_select = function (button) {
  App.selected_button = button
  App.highlight_button(button)
  App.last_button = button.name
  App.save_last_button()

  for (let btn of App.buttons) {
    btn.tagged = false
  }
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

// Prepare buttons
App.setup_buttons = function () {
  App.make_buttons()
  App.get_last_button()

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

// Enable a button tag
App.tag_button = function (button) {
  if (button.tagged) {
    button.element.classList.remove("tagged")
  } else {
    button.element.classList.add("tagged")
  }

  button.tagged = !button.tagged
}

// Get tag mode
App.get_tag_mode = function (mode) {
  for (let button of App.buttons) {
    if (button.tagged) {
      if (mode in button) {
        return button[mode]
      }
    }
  }
}