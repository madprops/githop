// Setup items
App.setup_items = function () {
  App.start_item_observer()
}

// Get items from history
App.get_items = async function () {
  App.items = []

  if (App.settings.show_tabs) {
    let tabs = await browser.tabs.query({currentWindow: true})
    tabs = tabs.filter(x => x.url && x.url.includes(App.settings.homepage))
    App.process_items(tabs, `tabs`)
  }

  if (App.settings.show_history) {
    let history = await browser.history.search({
      text: App.settings.homepage,
      maxResults: App.settings.max_results,
      startTime: Date.now() - (1000 * 60 * 60 * 24 * 30 * App.settings.history_months),
    })

    App.process_items(history, `history`)
  }

  App.after_process()
}

// When results are found
App.process_items = function (items, from) {
  let favorite_urls = App.favorites.map(x => x.url)
  let list = App.el(`#list`)
  let i = App.items.length
  let now = Date.now()

  for (let item of items) {
    let curl = App.pathname(item.url)

    if (App.items.some(x => x.url === item.url)) {
      continue
    }

    let el = document.createElement(`div`)
    el.classList.add(`item`)
    el.classList.add(`hidden`)
    el.dataset.index = i
    App.item_observer.observe(el)

    let obj = {
      index: i,
      title: item.title || curl,
      url: item.url,
      clean_url: curl,
      favorite: favorite_urls.includes(item.url),
      created: false,
      filled: false,
      hidden: true,
      date: item.lastVisitTime || now,
      element: el,
      id: item.id,
      from,
    }

    App.items.push(obj)
    list.append(el)
    i += 1
  }
}

App.after_process = function () {
  // Initial filter
  App.do_filter()
}

// Start intersection observer to check visibility
// Used for lazy-loading components
App.start_item_observer = function () {
  let options = {
    root: App.el(`#list`),
    rootMargin: `0px`,
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
  let icon = document.createElement(`canvas`)
  icon.classList.add(`item_icon`)
  icon.width = 25
  icon.height = 25
  item.element.append(icon)

  let text = document.createElement(`div`)
  text.classList.add(`item_text`)

  let text_content

  if (App.settings.text_mode === `title`) {
    text_content = item.title || item.url
  }
  else if (App.settings.text_mode === `url`) {
    text_content = item.clean_url
  }

  if (item.from === `tabs`) {
    text_content = `${App.settings.tab_icon} ${text_content}`
  }
  else if (item.from === `history`) {
    text_content = `${App.settings.history_icon} ${text_content}`
  }

  text.textContent = text_content.
    substring(0, App.settings.max_text_length).trim()

  item.element.append(text)
  item.created = true
}

// Fully create the item element
App.fill_item_element = function (item) {
  if (App.settings.text_mode === `title`) {
    item.element.title = item.url
  }
  else if (App.settings.text_mode === `url`) {
    item.element.title = item.title
  }

  if (App.settings.max_favorites > 0 && item.favorite) {
    item.element.classList.add(`favorite`)
  }

  let icon = App.el(`.item_icon`, item.element)
  jdenticon.update(icon, App.get_unit(item.clean_url).toLowerCase())

  item.filled = true
  App.log(`Element created`)
}

// Get next item that is visible
App.get_next_visible_item = function (o_item) {
  let waypoint = false

  for (let i = 0; i < App.items.length; i++) {
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

  for (let i = App.items.length - 1; i >= 0; i--) {
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

  item.element.classList.remove(`hidden`)
}

// Make an item not visible
App.hide_item = function (item) {
  item.hidden = true

  if (!item.created) {
    return
  }

  item.element.classList.add(`hidden`)
}

// Make an item selected
// Unselect all the others
App.select_item = function (s_item, scroll = true) {
  for (let item of App.items) {
    if (item.created) {
      item.element.classList.remove(`selected`)
    }
  }

  App.selected_item = s_item
  App.selected_item.element.classList.add(`selected`)

  if (scroll) {
    App.selected_item.element.scrollIntoView({block: `nearest`})
  }
}

// Resolve how to open an item
App.resolve_open = function (item) {
  if (item.from === `tabs`) {
    App.focus_tab(item.id)
    window.close()
  }
  else if (App.settings.new_tab) {
    App.open_tab(item.url)
  }
  else {
    App.change_url(item.url)
  }
}

// Focus an open tab
App.focus_tab = async function (id) {
  await browser.tabs.update(id, {active: true})
}