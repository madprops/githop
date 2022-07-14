const root_url = "https://github.com/"
const filter = document.querySelector("#filter")
const list = document.querySelector("#list")

let selected_item

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

function escape_special_chars (s) {
  return s.replace(/[^A-Za-z0-9]/g, "\\$&")
}

function get_items () {
  return Array.from(list.querySelectorAll(".item"))
}

function select_item (el) {
  for (let item of get_items()) {
    item.classList.remove("selected")
  }

  el.classList.add("selected")
  el.scrollIntoView({block: "center"})
  selected_item = el
}

function open_tab (url) {
  browser.tabs.create({url: url}) 
}

function get_next_visible_item (el) {
  let waypoint = false
  let items = get_items()

  for (let item of items) {
    if (waypoint) {
      if (item.style.display !== "none") {
        return item
      }
    }

    if (item === el) {
      waypoint = true
    }
  }
}

function get_prev_visible_item (el) {
  let waypoint = false
  let items = get_items()
  items.reverse()

  for (let item of items) {
    if (waypoint) {
      if (item.style.display !== "none") {
        return item
      }
    }

    if (item === el) {
      waypoint = true
    }
  }
}

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

filter.addEventListener("input", function (e) {
  do_filter()
})

filter.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (selected_item) {
      open_tab(selected_item.dataset.url)
      window.close()
    }
  } else if (e.key === "ArrowUp") {
    let el = get_prev_visible_item(selected_item)

    if (el) {
      select_item(el)
    }
  } else if (e.key === "ArrowDown") {
    let el = get_next_visible_item(selected_item)

    if (el) {
      select_item(el)
    }
  }
})

list.addEventListener("click", function (e) {
  if (e.target.closest(".item")) {
    let el = e.target.closest(".item")
    open_tab(el.dataset.url)
    window.close()
    return
  }
})

browser.history.search({
  text: root_url,
  maxResults: 25
}).then(on_results)

filter.focus()