// Filter the list with the filter's value
App.do_filter = function (value = "") {
  let filter_start = Date.now()
  App.selected_item = undefined

  if (value) {
    App.el("#filter").value = value
  } else {
    value = App.el("#filter").value
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
    favorite_urls = App.favorites.map(x => x.url)

    if (favorite_urls.length === 0) {
      App.hide_all_items()
      return
    }
  } 
  
  if (App.selected_button.level) {
    modes.push("level")
    level = parseInt(App.selected_button.level)
  }
  
  if (App.selected_button.hours) {
    modes.push("hours")
    hours = parseInt(App.selected_button.hours)
  } 
  
  if (App.selected_button.path) {
    modes.push("path")
    path = App.selected_button.path.toLowerCase()
  }

  if (App.selected_button.title) {
    modes.push("title")
    title = App.selected_button.title.toLowerCase()
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
    let includes

    if (modes.includes("all")) {
      includes = matches(item)
    } 
    
    else if (modes.includes("favorites")) {
      includes = favorite_urls.includes(item.url) && matches(item)
    } 
    
    else {
      includes = check_modes(item)
    }
    
    if (includes) {
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
  console.log(`Filter Time: ${d}`)
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

// Set the filter placeholder
App.set_filter_placeholder = function () {
  let s = App.name

  if (App.description) {
    s += ` - ${App.description}`
  }

  App.el("#filter").placeholder = s
}