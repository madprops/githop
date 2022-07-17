// Get favorite local storage
App.get_favorite = function () {
  App.favorite = App.get_local_storage(App.ls_favorite)

  if (App.favorite === null) {
    App.favorite = []
  }
}

// Saves the favorite localStorage object
App.save_favorite = function () {
  App.save_local_storage(App.ls_favorite, App.favorite)
}

// Add a favorite item
App.add_favorite = function (item) {
  // Remove from list first
  for (let i=0; i<App.favorite.length; i++) {
    if (App.favorite[i].url === item.dataset.url) {
      App.favorite.splice(i, 1)
      break
    }
  }

  item.dataset.favorite = "yes"
  item.classList.add("favorite")
  
  let o = {}
  o.title = item.textContent
  o.url = item.dataset.url
  App.favorite.unshift(o)
  App.favorite = App.favorite.slice(0, App.max_favorite)
  App.save_favorite()

  if (App.active_button.mode === "favorites") {
    this.do_filter()
  }
}

// Remove a favorite item
App.remove_favorite = function (item) {
  item.dataset.favorite = "no"
  item.classList.remove("favorite")

  for (let i=0; i<App.favorite.length; i++) {
    let it = App.favorite[i]

    if (it.url === item.dataset.url) {
      App.favorite.splice(i, 1)
      App.save_favorite()
      break
    }
  }

  if (App.active_button.mode === "favorites") {
    this.do_filter()
  }
}