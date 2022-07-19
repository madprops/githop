// Get favorite local storage
App.get_favorites = function () {
  App.favorites = App.get_local_storage(App.ls_favorites)

  if (App.favorites === null) {
    App.favorites = []
  }
}

// Saves the favorite localStorage object
App.save_favorites = function () {
  App.save_local_storage(App.ls_favorites, App.favorites)
}

// Add a favorite item
App.add_favorite = function (item) {
  // Remove from list first
  for (let i=0; i<App.favorites.length; i++) {
    if (App.favorites[i].url === item.url) {
      App.favorites.splice(i, 1)
      break
    }
  }

  item.favorite = true
  item.element.classList.add("favorite")
  
  let o = {}
  o.title = item.title
  o.url = item.url
  App.favorites.unshift(o)

  let removed = App.favorites.slice(App.settings.max_favorites)
  App.favorites = App.favorites.slice(0, App.settings.max_favorites)

  // Remove items that are no longer favorite
  for (let r of removed) {
    let r_item = App.get_item_by_url(r.url)

    if (r_item) {
      r_item.favorite = false
      r_item.element.classList.remove("favorite")
    }
  }

  App.save_favorites()

  if (App.selected_button.mode === "favorites") {
    this.do_filter()
  }
}

// Remove a favorite item
App.remove_favorite = function (item) {
  item.favorite = false
  item.element.classList.remove("favorite")

  for (let i=0; i<App.favorites.length; i++) {
    let it = App.favorites[i]

    if (it.url === item.url) {
      App.favorites.splice(i, 1)
      App.save_favorites()
      break
    }
  }

  if (App.selected_button.mode === "favorites") {
    this.do_filter()
  }
}