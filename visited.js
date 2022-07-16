// Centralized function to get localStorage objects
App.get_local_storage = function (ls_name) {
  let obj

  if (localStorage[ls_name]) {
    try {
      obj = JSON.parse(localStorage.getItem(ls_name))
    } catch (err) {
      localStorage.removeItem(ls_name)
      obj = null
    }
  } else {
    obj = null
  }

  return obj
}

// Centralized function to save localStorage objects
App.save_local_storage = function (ls_name, obj) {
  localStorage.setItem(ls_name, JSON.stringify(obj))
}

// Get visited local storage
App.get_visited = function () {
  App.visited = App.get_local_storage(App.ls_visited)

  if (App.visited === null) {
    App.visited = []
  }
}

// Saves the visited localStorage object
App.save_visited = function () {
  App.save_local_storage(App.ls_visited, App.visited)
}

// Add a visited item
App.add_visited = function (item) {
  App.remove_visited(item)
  
  let o = {}
  o.title = item.textContent
  o.url = item.dataset.url
  App.visited.unshift(o)
  App.visited = App.visited.slice(0, App.max_visited)
  App.save_visited()
}

// Remove a visited item
App.remove_visited = function (item) {
  for (let i=0; i<App.visited.length; i++) {
    let it = App.visited[i]

    if (it.url === item.dataset.url) {
      App.visited.splice(i, 1)
      App.save_visited()
      return
    }
  }
}