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
    if (App.favorites[i].url === item.dataset.url) {
      App.favorites.splice(i, 1)
      break
    }
  }

  item.dataset.favorite = "yes"
  item.classList.add("favorite")
  
  let o = {}
  o.title = item.textContent
  o.url = item.dataset.url
  App.favorites.unshift(o)
  App.favorites = App.favorites.slice(0, App.max_favorites)
  App.save_favorites()

  if (App.active_button.mode === "favorites") {
    this.do_filter()
  }
}

// Remove a favorite item
App.remove_favorite = function (item) {
  item.dataset.favorite = "no"
  item.classList.remove("favorite")

  for (let i=0; i<App.favorites.length; i++) {
    let it = App.favorites[i]

    if (it.url === item.dataset.url) {
      App.favorite.splice(i, 1)
      App.save_favorites()
      break
    }
  }

  if (App.active_button.mode === "favorites") {
    this.do_filter()
  }
}