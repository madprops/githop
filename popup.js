// Settings
const root_url = "https://github.com/"
const max_results = 1000
const history_months = 12
const remove_get_parameters = true
const remove_hash_parameters = true
const initial_filter_level = 2
const links_map = [
  {name: "Homepage", url: "https://github.com"},
  {name: "Notifications", url: "https://github.com/notifications"},
  {name: "Issues", url: "https://github.com/issues"},
  {name: "Pulls", url: "https://github.com/pulls"},
]
const filter_buttons_map = [
  {name: "Clear", callback: function () {
    clear_filter()
  }},
  {name: "Unit", callback: function () {
    do_filter(1)
  }},
  {name: "Repos", callback: function () {
    do_filter(2)
  }},
]

// DOM elements
const links  = document.querySelector("#links")
const filter = document.querySelector("#filter")
const filter_buttons = document.querySelector("#filter_buttons")
const list = document.querySelector("#list")

// Used on Enter
// Has a white border
let selected_item

// When results are found
function on_results (items) {
  let added = []
  let escaped = escape_special_chars(root_url)
  let regex = new RegExp(`^${escaped}`, "i")
  let used_urls = links_map.map(x => x.url)

  for (let item of items) {    
    if (!item.url.startsWith(root_url)) {
      continue
    }

    if (used_urls.includes(item.url)) {
      continue
    }

    let url_text = item.url.replace(regex, "")
    url_text = remove_trailing_slash(url_text)
    url_text = decodeURI(remove_params(url_text))

    if (!url_text || added.includes(url_text)) {
      continue
    }
    
    let c = document.createElement("div")
    c.classList.add("item")
    
    let url_el = document.createElement("div")
    url_el.classList.add("item_url")
    url_el.textContent = url_text
    
    let title_el = document.createElement("div")
    title_el.classList.add("item_title")
    title_el.textContent = item.title

    c.append(url_el)
    c.append(title_el)
    c.dataset.url = remove_params(item.url)

    list.append(c)
    added.push(url_text)
  }

  // Start with an n-level filter
  do_filter(initial_filter_level)
}

// Escape non alphanumeric chars
function escape_special_chars (s) {
  return s.replace(/[^A-Za-z0-9]/g, "\\$&")
}

// Remove parameters from a URL
function remove_params (url) {
  let s = url
  
  if (remove_get_parameters) {
    s = url.split("?")[0]
  }

  if (remove_hash_parameters) {
    s = s.split("#")[0]
  }

  return s
}

// Remove slash at the end
function remove_trailing_slash (url) {
  return url.replace(/\/$/, "").trim()
}

// Get an array with all list items
function get_items () {
  return Array.from(list.querySelectorAll(".item"))
}

// Make an item selected
// Unselect all the others
function select_item (s_item, scroll = true) {
  for (let item of get_items()) {
    item.classList.remove("selected")
  }

  s_item.classList.add("selected")
  selected_item = s_item

  if (scroll) {
    s_item.scrollIntoView({block: "nearest"})
  }
}
// Open a new tab with a url
function open_tab (url) {
  browser.tabs.create({url: url})
  window.close()
}

// Get next item that is visible
function get_next_visible_item (o_item) {
  let waypoint = false
  let items = get_items()

  for (let item of items) {
    if (waypoint) {
      if (item.style.display !== "none") {
        return item
      }
    }

    if (item === o_item) {
      waypoint = true
    }
  }
}

// Get prev item that is visible
function get_prev_visible_item (o_item) {
  let waypoint = false
  let items = get_items()
  items.reverse()

  for (let item of items) {
    if (waypoint) {
      if (item.style.display !== "none") {
        return item
      }
    }

    if (item === o_item) {
      waypoint = true
    }
  }
}

// Filter the list with the filter's value
// Use a level of 0 to ignore level check
function do_filter (level = 0) {
  selected_item = undefined
  let words = filter.value.toLowerCase().split(" ").filter(x => x !== "")
  let selected = false

  for (let item of get_items()) {
    let item_text = item.textContent.toLowerCase()
    let includes = words.every(x => item_text.includes(x))

    if (level > 0) {
      if (item.querySelector(".item_url").textContent.split("/").length !== level) {
        includes = false
      }
    }

    if (includes) {
      item.style.display = "initial"

      if (!selected) {
        select_item(item)
        selected = true
      }
    } else {
      item.style.display = "none"
    }
  }
}

// Clear filter
function clear_filter () {
  filter.value = ""
  do_filter()
}

// Add links to the top
function create_links () {
  for (let link of links_map) {
    let el = document.createElement("div")
    el.textContent = link.name
    el.classList.add("link")
    el.classList.add("action")
    
    // Avoid reference problems
    let url = link.url

    el.addEventListener("click", function () {
      open_tab(url)
    })

    links.append(el)
  }
}

// Add buttons next to the filter
function create_filter_buttons () {
  for (let button of filter_buttons_map) {
    let el = document.createElement("button")
    el.textContent = button.name
    el.classList.add("filter_button")
    el.classList.add("action")

    // Avoid reference problems
    let callback = button.callback
    
    el.addEventListener("click", function (e) {
      callback()
      filter.focus()
    })

    filter_buttons.append(el)
  }
}

// When a user types something
filter.addEventListener("input", function (e) {
  do_filter()
})

// When another key is pressed
document.addEventListener("keydown", function (e) {
  filter.focus()

  if (e.key === "Enter") {
    if (selected_item) {
      open_tab(selected_item.dataset.url)
    }

    e.preventDefault()
  } else if (e.key === "ArrowUp") {
    let item = get_prev_visible_item(selected_item)

    if (item) {
      select_item(item)
    }

    e.preventDefault()
  } else if (e.key === "ArrowDown") {
    let item = get_next_visible_item(selected_item)

    if (item) {
      select_item(item)
    }

    e.preventDefault()
  }
})

// When list items are clicked
list.addEventListener("click", function (e) {
  if (e.target.closest(".item")) {
    let item = e.target.closest(".item")
    open_tab(item.dataset.url)
  }
})

// When list items get hovered
list.addEventListener("mouseover", function (e) {
  if (e.target.closest(".item")) {
    let item = e.target.closest(".item")
    select_item(item, false)
  }
})

// START PROGRAM ----

// Place the links at the top
create_links()

// Place the filter buttons
create_filter_buttons()

// Do the history search
browser.history.search({
  text: root_url,
  maxResults: max_results,
  startTime: Date.now() - (1000 * 60 * 60 * 24 * 30 * history_months)
}).then(on_results)

// Focus the filter
filter.focus()