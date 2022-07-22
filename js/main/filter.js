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

  {
    if (App.get_tag_mode("mode").includes("favorites")) {
      modes.push("favorites")
      favorite_urls = App.favorites.map(x => x.url)
    }
  }

  {
    let m = App.get_tag_mode("path")
  
    if (m.length > 0) {
      modes.push("path")
      path = m[0]
    }
  }

  {
    let m = App.get_tag_mode("title")

    if (m.length > 0) {
      modes.push("title")
      title = m[0]
    }    
  }

  {
    let m = App.get_tag_mode("hours")

    if (m.length > 0) {
      modes.push("hours")
      hours = m[0]
    }    
  }
  
  {
    let m = App.get_tag_mode("level")

    if (m.length > 0) {
      modes.push("level")
      level = m[0]
    }
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