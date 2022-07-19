App.start_events = function () {
  let filter = App.el("#filter")
  let list = App.el("#list")
  let filter_clear = App.el("#filter_clear")

  // When another key is pressed
  document.addEventListener("keydown", function (e) {
    if (App.editor_on) {
      return
    }

    App.focus_filter()

    if (e.key === "Enter") {
      if (App.selected_item) {
        App.open_tab(App.selected_item.url)
      }

      e.preventDefault()
    } else if (e.key === "ArrowUp") {
      let item = App.get_prev_visible_item(App.selected_item)

      if (item) {
        App.select_item(item)
      }

      e.preventDefault()
    } else if (e.key === "ArrowDown") {
      let item = App.get_next_visible_item(App.selected_item)

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
  filter.addEventListener("input", function (e) {
    if (App.editor_on) {
      return
    }

    App.do_filter()
  })

  // When list items are clicked
  list.addEventListener("click", function (e) {
    if (e.target.closest(".item")) {
      let el = e.target.closest(".item")
      let item = App.items[el.dataset.index]

      if (e.target.closest(".item_icon")) {
        if (item.favorite) {
          App.remove_favorite(item)
        } else {
          App.add_favorite(item)
        }
      } else if (e.target.closest(".item_title")) {
        App.open_tab(item.url)
      }
    }
  })

  // When list items are clicked
  list.addEventListener("auxclick", function (e) {
    if (e.target.closest(".item")) {
      let el = e.target.closest(".item")
      let item = App.items[el.dataset.index]
      App.open_tab(item.url, false)
    }
  })

  // When list items get hovered
  list.addEventListener("mouseover", function (e) {
    if (e.target.closest(".item")) {
      let el = e.target.closest(".item")
      let item = App.items[el.dataset.index]
      App.select_item(item, false)
    }
  })

  // When the filter clear button is pressed
  filter_clear.addEventListener("click", function () {
    App.clear_filter()
  })
}