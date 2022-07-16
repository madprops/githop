// Settings
const root_url = "https://github.com/"
const max_results = 1000
const history_months = 12
const max_title_length = 250
const links_map = [
  {name: "Homepage", url: "https://github.com"},
  {name: "Notifications", url: "https://github.com/notifications"},
  {name: "Issues", url: "https://github.com/issues"},
  {name: "Pulls", url: "https://github.com/pulls"},
  {name: "Gists", url: "https://gist.github.com/mine"},
  {name: "Market", url: "https://github.com/marketplace"},
  {name: "Explore", url: "https://github.com/explore"},
]
const buttons_map = [
  {name: "Clear", callback: function () {
    clear_filter()
  }},
  {name: "1", callback: function () {
    do_filter(slash_filter("1"))
  }},
  {name: "2", callback: function () {
    do_filter(slash_filter("2"))
  }},
  {name: "3", callback: function () {
    do_filter(slash_filter("3"))
  }},
  {name: "Issues", callback: function () {
    do_filter(slash_filter("issues"))
  }},
  {name: "Commits", callback: function () {
    do_filter(slash_filter("commit"))
  }},
  {name: "Pulls", callback: function () {
    do_filter(slash_filter("pull"))
  }},
  {name: "Tags", callback: function () {
    do_filter(slash_filter("tag"))
  }},      
]

// DOM elements
const links  = document.querySelector("#links")
const filter = document.querySelector("#filter")
const buttons = document.querySelector("#buttons")
const list = document.querySelector("#list")

// Used on Enter
// Has a white border
let selected_item

// Used for performance measuring
let date_start = Date.now()

// When results are found
function on_results (items) {
  let added = []
  let used_urls = links_map.map(x => x.url)
  let base_url = unslash(root_url)

  for (let item of items) {    
    if (!item.url.startsWith(root_url)) {
      continue
    }

    if (used_urls.includes(item.url)) {
      continue
    }

    let url = unslash(item.url)

    if (url === base_url) {
      continue
    }

    let text = item.title.substring(0, max_title_length)

    if (!text || added.includes(text)) {
      continue
    }
    
    let el = document.createElement("div")
    el.classList.add("item")
    el.textContent = text
    el.dataset.url = url
    el.dataset.clean_url = clean_url(url)
    el.title = url

    list.append(el)
    added.push(text)
  }

  // Initial filter
  do_filter()

  // Check performance
  let d = Date.now() - date_start
  console.log(`Time: ${d}`)
  console.log(`Results: ${items.length}`)
}

// Escape non alphanumeric chars
function escape_special_chars (s) {
  return s.replace(/[^A-Za-z0-9]/g, "\\$&")
}

// Remove slash at the end
function unslash (url) {
  return url.replace(/\/$/, "").trim()
}

// Remove root url from the start of a url
function clean_url (url) {
  let escaped = escape_special_chars(root_url)
  let regex = new RegExp(`^${escaped}`, "i")
  return url.replace(regex, "")
}

// Create a slashed filter search
function slash_filter (s) {
  let regex = new RegExp("^\\/\\w+\\/", "")
  let v = filter.value.replace(regex, "").trim()
  return `/${s}/ ${v}`
}

// Check if string is a number
function is_number (s) {
  const regex = new RegExp("^[0-9]+$")
  
  if (s.match(regex)) {
    return true
  } else {
    return false
  }
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
function do_filter (value = "") {
  selected_item = undefined

  if (!value) {
    value = filter.value
  } else {
    filter.value = value
  }

  let words = value.toLowerCase().split(" ").filter(x => x !== "")
  let selected = false
  
  for (let item of get_items()) {
    let url = item.dataset.clean_url
    let text = item.textContent.toLowerCase()
    
    if (words[0] && words[0].startsWith("/") && words[0].endsWith("/")) {
      let tail = words.slice(1)
      let u = words[0].split("/")[1]

      if (is_number(u)) {
        let num_slashes = url.split("/").length

        if (num_slashes !== parseInt(u)) {
          hide_item(item)
          continue
        }
        
        let includes = tail.every(x => text.includes(x))

        if (!includes) {
          hide_item(item)
          continue
        }
      } else {
        let includes = url.includes(words[0]) && tail.every(x => text.includes(x))

        if (!includes) {
          hide_item(item)
          continue
        }
      }
    } else {
      let includes = words.every(x => text.includes(x)) || words.every(x => url.includes(x))

      if (!includes) {
        hide_item(item)
        continue
      }
    }

    show_item(item)

    if (!selected) {
      select_item(item)
      selected = true
    }
  }
}

// Make item visible
function show_item (item) {
  item.style.display = "initial"
}

// Make an item not visible
function hide_item (item) {
  item.style.display = "none"
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
    el.title = link.url
    
    // Avoid reference problems
    let url = link.url

    el.addEventListener("click", function () {
      open_tab(url)
    })

    links.append(el)
  }
}

// Add buttons next to the filter
function create_buttons () {
  for (let button of buttons_map) {
    let el = document.createElement("button")
    el.textContent = button.name
    el.classList.add("button")
    el.classList.add("action")

    // Avoid reference problems
    let callback = button.callback
    
    el.addEventListener("click", function (e) {
      callback()
      filter.focus()
    })

    buttons.append(el)
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

// Place the buttons
create_buttons()

// Do the history search
browser.history.search({
  text: root_url,
  maxResults: max_results,
  startTime: Date.now() - (1000 * 60 * 60 * 24 * 30 * history_months)
}).then(on_results)

// Focus the filter
filter.focus()