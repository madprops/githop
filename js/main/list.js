// When results are found
App.on_results = function (items) {
  let added = []
  let used_urls = App.link_map.map(x => x.url)
  let base_url = App.unslash(App.root_url)
  let favorite_urls = App.favorites.map(x => x.url)
  App.items = []

  for (let i=0; i<items.length; i++) {
    let item = items[i]

    if (!item.url.startsWith(App.root_url)) {
      continue
    }

    if (used_urls.includes(item.url)) {
      continue
    }

    let url = App.unslash(item.url)

    if (url === base_url) {
      continue
    }

    let clean_url = App.clean_url(url)
    let text = item.title.substring(0, App.max_title_length).trim()

    if (!text || added.includes(text)) {
      continue
    }

    added.push(text)

    let obj = {
      text: text,
      url: url,
      clean_url: clean_url,
      favorite: favorite_urls.includes(url),
      created: false,
      hidden: true,
      index: i,
    }

    App.items.push(obj)
  }

  // Initial filter
  App.do_filter()

  // Check performance
  let d = Date.now() - App.date_start
  console.log(`Time: ${d}`)
  console.log(`Results: ${items.length}`)
}

// Create an item element
App.create_item_element = function (item) {
  let container = document.createElement("div")
  container.classList.add("item")
  container.title = item.url

  if (item.favorite) {
    container.classList.add("favorite")
  }

  let icon = document.createElement("canvas")
  icon.classList.add("item_icon")
  icon.width = 25
  icon.height = 25
  jdenticon.update(icon, App.get_unit(item.clean_url))
  container.append(icon)

  let text = document.createElement("div")
  text.classList.add("item_text")
  text.textContent = item.text
  container.append(text)

  item.element = container
  item.created = true
  container.dataset.index = item.index
  App.el("#list").append(container)
}

// Get next item that is visible
App.get_next_visible_item = function (o_item) {
  let waypoint = false

  for (let i=0; i<App.items.length; i++) {
    let item = App.items[i]

    if (waypoint) {
      if (item.created && !item.hidden) {
        return item
      }
    }

    if (item === o_item) {
      waypoint = true
    }
  }
}

// Get prev item that is visible
App.get_prev_visible_item = function (o_item) {
  let waypoint = false

  for (let i=App.items.length-1; i>=0; i--) {
    let item = App.items[i]

    if (waypoint) {
      if (item.created && !item.hidden) {
        return item
      }
    }

    if (item === o_item) {
      waypoint = true
    }
  }
}

// Hide all items
App.hide_all_items = function () {
  for (let item of App.items) {
    App.hide_item(item)
  }
}

// Filter the list with the filter's value
App.do_filter = function (value = "") {
  let filter_start = Date.now()
  App.selected_item = undefined

  if (value) {
    App.el("#filter").value = value
  } else {
    value = App.el("#filter").value
  }

  for (let button of App.button_map) {
    if (App.active_button.mode === button.mode) {
      App.highlight_button(button)
      break
    }
  }

  let favorite_urls

  if (App.active_button.mode === "favorites") {
    favorite_urls = App.favorites.map(x => x.url)

    if (favorite_urls.length === 0) {
      App.hide_all_items()
      return
    }
  }

  let mode
  let mode_number

  if (App.active_button.mode === "all") {
    mode = "all"
  } else if (App.active_button.mode === "favorites") {
    mode = "favorites"
  } else if (App.is_number(App.active_button.mode)) {
    mode_number = parseInt(App.active_button.mode)
    mode = "level"
  } else if (App.active_button.path) {
    mode = "path"
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
    if (mode === "all") {
      if (!matches(item)) {
        App.hide_item(item)
        continue
      }
    } else if (mode === "favorites") {
      let includes = favorite_urls.includes(item.url) && matches(item)

      if (!includes) {
        App.hide_item(item)
        continue
      }
    } else if (mode === "level") {
      if (App.count(item.url, "/") !== mode_number) {
        App.hide_item(item)
        continue
      }

      if (!matches(item)) {
        App.hide_item(item)
        continue
      }
    } else if (mode === "path") {
      let includes = item.url.includes(App.active_button.path) && matches(item)

      if (!includes) {
        App.hide_item(item)
        continue
      }
    }

    App.show_item(item)

    if (!selected) {
      App.select_item(item)
      selected = true
    }
  }

  // Check performance
  let d = Date.now() - filter_start
  console.log(`Filter Time: ${d}`)
}

// Make item visible
App.show_item = function (item) {
  if (!item.created) {
    App.create_item_element(item)
  }

  if (!item.hidden) {
    return
  }

  item.element.classList.remove("hidden")
  item.hidden = false
}

// Make an item not visible
App.hide_item = function (item) {
  if (!item.created || item.hidden) {
    return
  }

  item.element.classList.add("hidden")
  item.hidden = true
}

// Check if item is hidden
App.is_hidden = function (item) {
  return item.classList.contains("hidden")
}

// Clear filter
App.clear_filter = function () {
  App.el("#filter").value = ""
  App.do_filter()
  App.focus_filter()
}

// Make an item selected
// Unselect all the others
App.select_item = function (s_item, scroll = true) {
  for (let item of App.items) {
    if (item.created) {
      item.element.classList.remove("selected")
    }
  }

  App.selected_item = s_item
  App.selected_item.element.classList.add("selected")

  if (scroll) {
    App.selected_item.element.scrollIntoView({block: "nearest"})
  }
}

// Focus the filter
App.focus_filter = function () {
  App.el("#filter").focus()
}