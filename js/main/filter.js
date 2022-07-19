// Filter the list with the filter's value
App.do_filter = function (value = "") {
  let filter_start = Date.now()
  App.selected_item = undefined

  if (value) {
    App.el("#filter").value = value
  } else {
    value = App.el("#filter").value
  }

  let favorite_urls

  if (App.selected_button.mode === "favorites") {
    favorite_urls = App.favorites.map(x => x.url)

    if (favorite_urls.length === 0) {
      App.hide_all_items()
      return
    }
  }

  let mode
  let path
  let level
  let hours

  if (App.selected_button.mode === "all") {
    mode = "all"
  } else if (App.selected_button.mode === "favorites") {
    mode = "favorites"
  } else if (App.selected_button.level) {
    mode = "level"
    level = parseInt(App.selected_button.level)
  }  else if (App.selected_button.hours) {
    mode = "hours"
    hours = parseInt(App.selected_button.hours)
  } else if (App.selected_button.path) {
    mode = "path"
    path = App.selected_button.path.toLowerCase()
  } else {
    return
  }

  let words = value.toLowerCase().split(" ").filter(x => x !== "")
  let selected = false

  function matches (item) {
    return words.every(x => item.text.toLowerCase().includes(x)) || 
           words.every(x => item.url.includes(x))
  }

  for (let item of App.items) {
    let includes

    if (mode === "all") {
      includes = matches(item)
    } 
    
    else if (mode === "favorites") {
      includes = favorite_urls.includes(item.url) && matches(item)
    } 
    
    else if (mode === "level") {
      if (App.count(item.clean_url, "/") !== level) {
        App.hide_item(item)
        continue
      }

      includes = matches(item)
    } 
    
    else if (mode === "hours") {
      let h = App.get_hours(item.date)
      includes = h <= hours && matches(item)
    } 
    
    else if (mode === "path") {
      includes = item.url.toLowerCase().includes(path) && matches(item)
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