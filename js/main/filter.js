// Filter the list with the filter's value
App.do_filter = function (value = "") {
  let filter_start = Date.now()
  App.selected_item = undefined

  if (value) {
    App.el("#filter").value = value
  } else {
    value = App.el("#filter").value.trim()
  }

  let path
  let level
  let hours
  let title
  let modes = []
  let favorite_urls

  if (App.selected_button.mode === "all") {
    modes.push("all")
  } 
  
  if (App.selected_button.mode === "favorites") {
    modes.push("favorites")
  } else if (App.get_tag_mode("mode") === "favorites") {
    modes.push("favorites")
  }

  if (modes.includes("favorites")) {
    favorite_urls = App.favorites.map(x => x.url)
  }

  if (App.selected_button.path) {
    modes.push("path")
    path = App.selected_button.path.toLowerCase()
  } else {
    let mode = App.get_tag_mode("path")

    if (mode) {
      modes.push("path")
      path = mode
    }
  }

  if (App.selected_button.title) {
    modes.push("title")
    title = App.selected_button.title.toLowerCase()
  } else {
    let mode = App.get_tag_mode("title")

    if (mode) {
      modes.push("title")
      title = mode
    }    
  }

  if (App.selected_button.hours) {
    modes.push("hours")
    hours = parseInt(App.selected_button.hours)
  } else {
    let mode = App.get_tag_mode("hours")

    if (mode) {
      modes.push("hours")
      hours = mode
    }    
  }
  
  if (App.selected_button.level) {
    modes.push("level")
    level = parseInt(App.selected_button.level)
  } else {
    let mode = App.get_tag_mode("level")

    if (mode) {
      modes.push("level")
      level = mode
    }
  }

  if (modes.length === 0) {
    return
  }

  let words = value.toLowerCase().split(" ").filter(x => x !== "")
  let selected = false

  function matches (item) {
    return words.every(x => item.title.toLowerCase().includes(x)) || 
           words.every(x => item.url.includes(x))
  }

  function check_modes (item) {
    if (!matches(item)) {
      return false
    }

    if (modes.includes("favorites")) {
      if (!favorite_urls.includes(item.url)) {
        return false
      }
    }

    if (modes.includes("level")) {  
      if (App.count(item.clean_url, "/") !== level) {
        return false
      }
    } 
    
    if (modes.includes("hours")) {
      let h = App.get_hours(item.date)

      if (h > hours) {
        return false
      }
    } 
    
    if (modes.includes("path")) {
      if (!item.url.toLowerCase().includes(path)) {
        return false
      }
    }

    if (modes.includes("title")) {
      if (!item.title.toLowerCase().includes(title)) {
        return false
      }
    }

    return true
  }

  for (let item of App.items) {
    if (check_modes(item)) {
      App.show_item(item)

      if (!selected) {
        App.select_item(item)
        selected = true
      }      
    } else {
      App.hide_item(item)
      continue
    }
  }

  // Check performance
  let d = Date.now() - filter_start
  App.log(`Filter Time: ${d}`)
}

// Clear filter
App.clear_filter = function () {
  App.el("#filter").value = ""
  App.do_filter()
  App.focus_filter()
}

// Focus the filter
App.focus_filter = function () {
  App.el("#filter").focus()
}

// Prepare filter buttons
App.setup_filter = function () {
  // When a user types something
  App.el("#filter").addEventListener("input", function (e) {
    if (App.editor_on) {
      return
    }

    App.do_filter()
  })

  // When the filter clear button is pressed
  App.el("#filter_btn_clear").addEventListener("click", function () {
    App.clear_filter()
  })

  // When the filter home button is pressed
  App.el("#filter_btn_home").addEventListener("click", function () {
    App.open_tab(App.settings.homepage)
  })

  // When the filter editor button is pressed
  App.el("#filter_btn_editor").addEventListener("click", function () {
    App.show_editor()
  })
  
  App.focus_filter()
}