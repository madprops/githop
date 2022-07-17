// When results are found
App.on_results = function (items) {
  let added = []
  let used_urls = App.link_map.map(x => x.url)
  let base_url = App.unslash(App.root_url)
  let list = App.el("#list")

  for (let item of items) {
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

    let curl = App.clean_url(url)
    let text = item.title.substring(0, App.max_title_length)

    if (!text || added.includes(text)) {
      continue
    }

    let c = document.createElement("div")
    c.classList.add("item")
    c.dataset.url = url
    c.dataset.clean_url = curl
    c.title = url

    let i = document.createElement("canvas")
    i.classList.add("item_icon")
    i.width = 25
    i.height = 25
    jdenticon.update(i, App.get_unit(curl))
    c.append(i)

    let t = document.createElement("div")
    t.classList.add("item_text")
    t.textContent = text
    c.append(t)

    list.append(c)
    added.push(text)
  }

  // Initial filter
  App.do_filter()

  // Check performance
  let d = Date.now() - App.date_start
  console.log(`Time: ${d}`)
  console.log(`Results: ${items.length}`)
}

// Get next item that is visible
App.get_next_visible_item = function (o_item) {
  let waypoint = false
  let items = App.get_items()

  for (let item of items) {
    if (waypoint) {
      if (!App.is_hidden(item)) {
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
  let items = App.get_items()
  items.reverse()

  for (let item of items) {
    if (waypoint) {
      if (!App.is_hidden(item)) {
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
  for (let item of App.get_items()) {
    App.hide_item(item)
  }
}

// Filter the list with the filter's value
App.do_filter = function (value = "") {
  let filter_start = Date.now()
  selected_item = undefined

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

  let visited_urls

  if (App.active_button.mode === "visited") {
    visited_urls = App.visited.map(x => x.url)

    if (visited_urls.length === 0) {
      App.hide_all_items()
      return
    }
  }

  let words = value.toLowerCase().split(" ").filter(x => x !== "")
  let selected = false

  for (let item of App.get_items()) {
    let url = item.dataset.clean_url
    let text = item.textContent.toLowerCase()

    if (App.active_button.mode === "all") {
      let includes = words.every(x => text.includes(x)) || words.every(x => url.includes(x))

      if (!includes) {
        App.hide_item(item)
        continue
      }
    } else if (App.active_button.mode === "visited") {
      let includes = visited_urls.includes(item.dataset.url) && words.every(x => text.includes(x))

      if (!includes) {
        App.hide_item(item)
        continue
      }
    } else if (App.is_number(App.active_button.mode)) {
      let num_slashes = url.split("/").length

      if (num_slashes !== parseInt(App.active_button.mode)) {
        App.hide_item(item)
        continue
      }

      let includes = words.every(x => text.includes(x))

      if (!includes) {
        App.hide_item(item)
        continue
      }
    } else if (App.active_button.path) {
      let includes = url.includes(App.active_button.path) && words.every(x => text.includes(x))

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
  item.classList.remove("hidden")
}

// Make an item not visible
App.hide_item = function (item) {
  item.classList.add("hidden")
}

// Check if item is hidden
App.is_hidden = function (item) {
  return item.classList.contains("hidden")
}

// Clear filter
App.clear_filter = function () {
  App.el("#filter").value = ""
  App.do_filter()
}

// Get an array with all list items
App.get_items = function () {
  return App.els(".item", App.el("#list"))
}

// Make an item selected
// Unselect all the others
App.select_item = function (s_item, scroll = true) {
  for (let item of App.get_items()) {
    item.classList.remove("selected")
  }

  s_item.classList.add("selected")
  selected_item = s_item

  if (scroll) {
    s_item.scrollIntoView({block: "nearest"})
  }
}

// Focus the filter
App.focus_filter = function () {
  App.el("#filter").focus()
}