// Start intersection observer to check visibility
// Used for lazy-loading components
App.start_observer = function () {
  let options = {
    root: App.el("#list"),
    rootMargin: "0px",
    threshold: 0.1,
  }
  
  App.observer = new IntersectionObserver(function (entries) {
    for (let entry of entries) {
      if (!entry.isIntersecting) {
        continue
      }

      let item = App.items[entry.target.dataset.index]

      if (item.created && !item.hidden && !item.icon_created) {
        App.create_item_icon(item)
      }
    }
  }, options)
}

// When results are found
App.on_results = function (items) {
  let added = []
  let base_url = App.unslash(App.settings.homepage)
  let favorite_urls = App.favorites.map(x => x.url)
  let list = App.el("#list")
  let i = 0

  App.items = []

  for (let item of items) {

    if (!item.url.startsWith(App.settings.homepage)) {
      continue
    }

    let url = App.unslash(item.url)

    if (url === base_url) {
      continue
    }

    let clean_url = App.clean_url(url)
    let text = item.title.substring(0, App.settings.max_title_length).trim()

    if (!text || added.includes(text)) {
      continue
    }

    added.push(text)

    let el = App.div("item hidden")
    el.dataset.index = i
    App.observer.observe(el)

    let obj = {
      index: i,
      text: text,
      url: url,
      clean_url: clean_url,
      favorite: favorite_urls.includes(url),
      created: false,
      icon_created: false,
      hidden: true,
      element: el
    }
    
    App.items.push(obj)
    list.append(el)

    i += 1
  }

  // Initial filter
  App.do_filter()

  // Check performance
  let d = Date.now() - App.date_start
  console.log(`Time: ${d}`)
  console.log(`Results: ${items.length}`)
  console.log(`Items: ${App.items.length}`)
}

// Create an item element
App.create_item_element = function (item) {
  item.element.title = item.url

  if (item.favorite) {
    item.element.classList.add("favorite")
  }

  let icon = document.createElement("canvas")
  icon.classList.add("item_icon")
  icon.width = 25
  icon.height = 25
  item.element.append(icon)

  let text = document.createElement("div")
  text.classList.add("item_text")
  text.textContent = item.text
  item.element.append(text)

  item.created = true
}

// Create an item's icon
App.create_item_icon = function (item) {
  let icon = App.el(".item_icon", item.element)
  jdenticon.update(icon, App.get_unit(item.clean_url))
  item.icon_created = true
  console.log("Icon created")
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

  if (App.selected_button.mode === "all") {
    mode = "all"
  } else if (App.selected_button.mode === "favorites") {
    mode = "favorites"
  } else if (App.selected_button.level) {
    mode = "level"
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
      if (App.count(item.clean_url, "/") !== App.selected_button.level) {
        App.hide_item(item)
        continue
      }

      if (!matches(item)) {
        App.hide_item(item)
        continue
      }
    } else if (mode === "path") {
      let includes = item.url.toLowerCase().includes(path) && matches(item)

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
  item.hidden = false

  if (!item.created) {
    App.create_item_element(item)
  }

  item.element.classList.remove("hidden")
}

// Make an item not visible
App.hide_item = function (item) {
  item.hidden = true

  if (!item.created) {
    return
  }

  item.element.classList.add("hidden")
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