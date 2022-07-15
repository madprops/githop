// Settings
const root_url = "https://github.com/"
const max_results = 100

// DOM elements
const filter = document.querySelector("#filter")
const list = document.querySelector("#list")

// Used on Enter
// Has a white border
let selected_item

// When results are found
function on_results (items) {
  let escaped = escape_special_chars(root_url)
  let regex = new RegExp(`^${escaped}`, "i")

  for (let item of items) {
    let el = document.createElement("div")
    let text = item.url.replace(regex, "").replace(/\/$/, "").trim()
    
    if (!text) {
      continue
    }
    
    el.textContent = text
    el.classList.add("item")
    el.dataset.url = item.url
    list.append(el)
  }

  do_filter()
}

// Escape non alphanumeric chars
function escape_special_chars (s) {
  return s.replace(/[^A-Za-z0-9]/g, "\\$&")
}

// Get an array with all list items
function get_items () {
  return Array.from(list.querySelectorAll(".item"))
}

// Make an item selected
// Unselect all the others
function select_item (s_item) {
  for (let item of get_items()) {
    item.classList.remove("selected")
  }

  s_item.classList.add("selected")
  s_item.scrollIntoView({block: "nearest"})
  selected_item = s_item
}
// Open a new tab with a url
function open_tab (url) {
  browser.tabs.create({url: url}) 
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
function do_filter () {
  selected_item = undefined
  let filter_text = filter.value.toLowerCase()
  let selected = false

  for (let item of get_items()) {
    let item_text = item.textContent.toLowerCase()

    if (!item_text.includes(filter_text)) {
      item.style.display = "none"
    } else {
      item.style.display = "initial"

      if (!selected) {
        select_item(item)
        selected = true
      }
    }
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
      window.close()
    }
  } else if (e.key === "ArrowUp") {
    let item = get_prev_visible_item(selected_item)

    if (item) {
      select_item(item)
    }
  } else if (e.key === "ArrowDown") {
    let item = get_next_visible_item(selected_item)

    if (item) {
      select_item(item)
    }
  }
})

// When list items are clicked
list.addEventListener("click", function (e) {
  if (e.target.closest(".item")) {
    let item = e.target.closest(".item")
    open_tab(item.dataset.url)
    window.close()
  }
})

// When list items get hovered
list.addEventListener("mouseover", function (e) {
  if (e.target.closest(".item")) {
    let item = e.target.closest(".item")
    select_item(item)
  }
})

// START PROGRAM ----

// Do the history search
browser.history.search({
  text: root_url,
  maxResults: max_results
}).then(on_results)

// Focus the filter
filter.focus()