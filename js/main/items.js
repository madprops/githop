// When results are found
App.setup_items = function (items) {
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

    let el = document.createElement("div")
    el.classList.add("item")
    el.classList.add("hidden")
    el.dataset.index = i
    App.item_observer.observe(el)

    let obj = {
      index: i,
      text: text,
      url: url,
      clean_url: clean_url,
      date: item.lastVisitTime,
      favorite: favorite_urls.includes(url),
      created: false,
      filled: false,
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

// Start intersection observer to check visibility
// Used for lazy-loading components
App.start_item_observer = function () {
  let options = {
    root: App.el("#list"),
    rootMargin: "0px",
    threshold: 0.1,
  }
  
  App.item_observer = new IntersectionObserver(function (entries) {
    for (let entry of entries) {
      if (!entry.isIntersecting) {
        continue
      }

      let item = App.items[entry.target.dataset.index]

      if (item.created && !item.hidden && !item.filled) {
        App.fill_item_element(item)
      }
    }
  }, options)
}

// Create an item element
App.create_item_element = function (item) {
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

// Fully create the item element
App.fill_item_element = function (item) {
  let days = Math.round(App.get_hours(item.date) / 24)
  let s = App.plural(days, "day", "days")
  let title = `${item.url} (Visited ${s} ago)`
  item.element.title = title

  if (item.favorite) {
    item.element.classList.add("favorite")
  }

  let icon = App.el(".item_icon", item.element)
  jdenticon.update(icon, App.get_unit(item.clean_url))

  item.filled = true
  console.log("Element created")
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

// Get the item of a favorite
App.get_item_by_url = function (url) {
  for (let item of App.items) {
    if (item.url === url) {
      return item
    }
  }
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