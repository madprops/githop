const App = {}

// Settings
App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"
App.root_url = "https://github.com/"
App.max_results = 1000
App.history_months = 12
App.max_title_length = 250
App.max_visited = 250
App.ls_visited = "visited_v3"

App.link_map = [
  {name: "Homepage", url: "https://github.com"},
  {name: "Notifications", url: "https://github.com/notifications"},
  {name: "Issues", url: "https://github.com/issues"},
  {name: "Pulls", url: "https://github.com/pulls"},
  {name: "Gists", url: "https://gist.github.com/mine"},
  {name: "Market", url: "https://github.com/marketplace"},
  {name: "Explore", url: "https://github.com/explore"},
]

App.button_map = [
  {name: "All", mode: "all"},
  {name: "Visited", mode: "visited", title: "Middle click to forget items"},
  {name: "Issues", mode: "issues", path: "/issues/"},
  {name: "Commits", mode: "commits", path: "/commit/"},
  {name: "Pulls", mode: "pulls", path: "/pull/"},
  {name: "Tags", mode: "tags", path: "/tag/"},
  {name: "1", mode: "1", title: "Path Level 1"},
  {name: "2", mode: "2", title: "Path Level 2"},
  {name: "3", mode: "3", title: "Path Level 3"},
]

// DOM elements
App.links  = document.querySelector("#links")
App.filter = document.querySelector("#filter")
App.buttons = document.querySelector("#buttons")
App.list = document.querySelector("#list")

// Used for performance measuring
App.date_start = Date.now()

// When results are found
App.on_results = function (items) {
  let added = []
  let used_urls = App.link_map.map(x => x.url)
  let base_url = App.unslash(App.root_url)

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

// Escape non alphanumeric chars
App.escape_special_chars = function (s) {
  return s.replace(/[^A-Za-z0-9]/g, "\\$&")
}

// Remove slash at the end
App.unslash = function (url) {
  return url.replace(/\/$/, "").trim()
}

// Remove root url from the start of a url
App.clean_url = function (url) {
  let escaped = App.escape_special_chars(App.root_url)
  let regex = new RegExp(`^${escaped}`, "i")
  return url.replace(regex, "")
}

// Get first part of a url
App.get_unit = function (curl) {
  return curl.split("/")[0].split("?")[0].split("#")[0]
}

// Check if string is a number
App.is_number = function (s) {
  let regex = new RegExp("^[0-9]+$")

  if (s.match(regex)) {
    return true
  } else {
    return false
  }
}

// Set the filter placeholder
App.set_placeholder = function () {
  let s = App.name

  if (App.description) {
    s += ` - ${App.description}`
  }

  App.filter.placeholder = s
}

// Get an array with all list items
App.get_items = function () {
  return Array.from(list.querySelectorAll(".item"))
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
// Open a new tab with a url
App.open_tab = function (url) {
  browser.tabs.create({url: url})
  window.close()
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
    App.filter.value = value
  } else {
    value = App.filter.value
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
    } else {
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
  App.filter.value = ""
  App.do_filter()
}

// Add links to the top
App.make_links = function () {
  for (let link of App.link_map) {
    let el = document.createElement("div")
    el.textContent = link.name
    el.classList.add("link")
    el.classList.add("action")
    el.title = link.url

    // Avoid reference problems
    let url = link.url

    el.addEventListener("click", function () {
      App.open_tab(url)
    })

    links.append(el)
  }
}

// Add buttons next to the filter
App.make_buttons = function () {
  for (let button of App.button_map) {
    let el = document.createElement("button")
    el.textContent = button.name
    el.classList.add("button")
    el.classList.add("action")

    if (button.title) {
      el.title = button.title
    }

    // Avoid reference problems
    let btn = button

    el.addEventListener("click", function (e) {
      App.active_button = btn
      App.do_filter()
      App.filter.focus()
    })

    buttons.append(el)
  }

  App.active_button = App.button_map[0]
}

// Move to the next button
App.cycle_buttons = function (direction) {
  let map = App.button_map.slice(0)

  if (direction === "left") {
    map.reverse()
  }

  let waypoint = false
  let first
  
  for (let button of map) {
    if (!first) {
      first = button
    }

    if (waypoint) {
      App.active_button = button
      App.do_filter()
      return
    }

    if (App.active_button.mode === button.mode) {
      waypoint = true
    }
  }

  if (first) {
    App.active_button = first
    App.do_filter()
  }  
}

// Get button elements
App.get_buttons = function () {
  return Array.from(buttons.querySelectorAll(".button"))
}

// Highlight the active button
App.highlight_button = function (btn) {
  for (let button of App.get_buttons()) {
    if (button.textContent === btn.name) {
      button.classList.add("highlighted")
    } else {
      button.classList.remove("highlighted")
    }
  }
}

// Centralized function to get localStorage objects
App.get_local_storage = function (ls_name) {
  let obj

  if (localStorage[ls_name]) {
    try {
      obj = JSON.parse(localStorage.getItem(ls_name))
    } catch (err) {
      localStorage.removeItem(ls_name)
      obj = null
    }
  } else {
    obj = null
  }

  return obj
}

// Centralized function to save localStorage objects
App.save_local_storage = function (ls_name, obj) {
  localStorage.setItem(ls_name, JSON.stringify(obj))
}

// Get visited local storage
App.get_visited = function () {
  App.visited = App.get_local_storage(App.ls_visited)

  if (App.visited === null) {
    App.visited = []
  }
}

// Saves the visited localStorage object
App.save_visited = function () {
  App.save_local_storage(App.ls_visited, App.visited)
}

// Add a visited item
App.add_visited = function (item) {
  App.remove_visited(item)
  
  let o = {}
  o.title = item.textContent
  o.url = item.dataset.url
  App.visited.unshift(o)
  App.visited = App.visited.slice(0, App.max_visited)
  App.save_visited()
}

// Remove a visited item
App.remove_visited = function (item) {
  for (let i=0; i<App.visited.length; i++) {
    let it = App.visited[i]

    if (it.url === item.dataset.url) {
      App.visited.splice(i, 1)
      App.save_visited()
      return
    }
  }
}

// When another key is pressed
document.addEventListener("keydown", function (e) {
  App.filter.focus()

  if (e.key === "Enter") {
    if (selected_item) {
      App.add_visited(selected_item)
      App.open_tab(selected_item.dataset.url)
    }

    e.preventDefault()
  } else if (e.key === "ArrowUp") {
    let item = App.get_prev_visible_item(selected_item)

    if (item) {
      App.select_item(item)
    }

    e.preventDefault()
  } else if (e.key === "ArrowDown") {
    let item = App.get_next_visible_item(selected_item)

    if (item) {
      App.select_item(item)
    }

    e.preventDefault()
  } else if (e.key === "Tab") {
    if (e.shiftKey) {
      App.cycle_buttons("left")
    } else {
      App.cycle_buttons("right")
    }

    e.preventDefault()
  }
})

// When a user types something
App.filter.addEventListener("input", function (e) {
  App.do_filter()
})

// When list items are clicked
App.list.addEventListener("click", function (e) {
  if (e.target.closest(".item")) {
    let item = e.target.closest(".item")
    App.add_visited(item)
    App.open_tab(item.dataset.url)
  }
})

// When list items are clicked
App.list.addEventListener("auxclick", function (e) {
  if (e.target.closest(".item")) {
    let item = e.target.closest(".item")
    
    if (e.button === 1) {
      if (App.active_button.mode === "visited") {
        App.remove_visited(item)
        item.remove()
      }
    }
  }
})

// When list items get hovered
App.list.addEventListener("mouseover", function (e) {
  if (e.target.closest(".item")) {
    let item = e.target.closest(".item")
    App.select_item(item, false)
  }
})

// START PROGRAM ----

// Place the links at the top
App.make_links()

// Place the buttons
App.make_buttons()

// Do the history search
browser.history.search({
  text: App.root_url,
  maxResults: App.max_results,
  startTime: Date.now() - (1000 * 60 * 60 * 24 * 30 * App.history_months)
}).then(App.on_results)

// Get visited local storage object
App.get_visited()

// Set filter placeholder
App.set_placeholder()

// Focus the filter
App.filter.focus()