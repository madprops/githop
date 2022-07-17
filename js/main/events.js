App.start_events = function () {
  let filter = App.el("#filter")
  let list = App.el("#list")
  let filter_clear = App.el("#filter_clear")

  // When another key is pressed
  document.addEventListener("keydown", function (e) {
    App.focus_filter()

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
  filter.addEventListener("input", function (e) {
    App.do_filter()
  })

  // When list items are clicked
  list.addEventListener("click", function (e) {
    if (e.target.closest(".item")) {
      let item = e.target.closest(".item")
      App.add_visited(item)
      App.open_tab(item.dataset.url)
    }
  })

  // When list items are clicked
  list.addEventListener("auxclick", function (e) {
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
  list.addEventListener("mouseover", function (e) {
    if (e.target.closest(".item")) {
      let item = e.target.closest(".item")
      App.select_item(item, false)
    }
  })

  // When the filter clear button is pressed
  filter_clear.addEventListener("click", function () {
    App.clear_filter()
    App.focus_filter()
  })
}