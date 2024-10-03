App.setup_list = function () {
  let list = App.el(`#list`)

  // When list items are clicked
  list.addEventListener(`click`, function (e) {
    if (e.target.closest(`.item`)) {
      let el = e.target.closest(`.item`)
      let item = App.items[el.dataset.index]

      if (e.target.closest(`.item_icon`)) {
        if (App.settings.max_favorites > 0) {
          if (item.favorite) {
            App.remove_favorite(item)
          }
          else {
            App.add_favorite(item)
          }
        }
      }
      else if (e.target.closest(`.item_text`)) {
        App.resolve_open(item.url)
      }
    }
  })

  // When list items are clicked
  list.addEventListener(`auxclick`, function (e) {
    if (e.target.closest(`.item`)) {
      let el = e.target.closest(`.item`)
      let item = App.items[el.dataset.index]
      App.open_tab(item.url, false)
    }
  })

  // When list items get hovered
  list.addEventListener(`mouseover`, function (e) {
    if (e.target.closest(`.item`)) {
      let el = e.target.closest(`.item`)
      let item = App.items[el.dataset.index]
      App.select_item(item, false)
    }
  })
}