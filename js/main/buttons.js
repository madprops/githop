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

// Get button elements
App.get_buttons = function () {
  return App.els(".button", App.el("#buttons"))
}

// Highlight the active button
App.highlight_button = function (btn) {
  for (let button of App.get_buttons()) {
    if (button.textContent === btn.name) {
      button.classList.add("highlighted")
      button.scrollIntoView({block: "nearest"})
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

// Prepare buttons
App.setup_buttons = function () {
  App.make_buttons()
  App.get_last_button()

  let buttons = App.el("#buttons")
  let left = App.el("#buttons_scroll_left")
  let right = App.el("#buttons_scroll_right")

  buttons.addEventListener("wheel", function (e) {
    let direction = e.deltaY > 0 ? "down" : "up"

    if (direction === "down") {
      App.scroll_buttons_right()
    } else if (direction === "up") {
      App.scroll_buttons_left()
    }
  })

  left.addEventListener("click", function () {
    App.scroll_buttons_left()
  })

  right.addEventListener("click", function () {
    App.scroll_buttons_right()
  })

  if (buttons.scrollWidth <= buttons.clientWidth) {
    left.classList.add("hidden")
    right.classList.add("hidden")
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