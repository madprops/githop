// Information
App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"

// localStorage settings
App.ls_favorites = "favorites_v1"
App.ls_last_button = "last_button_v1"
App.ls_settings = "settings_v1"

// Go to homepage
App.go_home = function () {
  App.open_tab(App.settings.homepage)
}

// Show the editor
App.show_editor = function () {
  App.editor_on = true
  let manifest = browser.runtime.getManifest()
  let ver = manifest.version
  let info = `GitHop v${ver}`
  editor_info.textContent = info
  App.el("#main").classList.add("hidden")
  App.el("#editor_container").classList.remove("hidden")
  let editor = App.el("#editor")
  editor.value = JSON.stringify(App.settings, undefined, 2)
  editor.setSelectionRange(0, 0)
  editor.focus()
}

// Hide the editor
App.hide_editor = function () {
  App.editor_on = false
  App.el("#main").classList.remove("hidden")
  App.el("#editor_container").classList.add("hidden")
}

// These buttons are always present
App.buttons_core = {
  "All": {name: "All", mode: "all", title: "Show all items"},
  "Favorites": {name: "Favorites", mode: "favorites", title: "Favorite items. Click the icons to toggle"},
  "Home": {name: "Home", mode: "home", title: "Go to the Homepage", alt: true},
  "About": {name: "?", mode: "about", title: "Open the Editor", alt: true},

}

// Basic information
App.default_settings = {}
App.default_settings.homepage = "https://github.com"

// Max results to fetch from the history
App.default_settings.max_results = 1000

// How far back to search for results
App.default_settings.history_months = 12

// Limits
App.default_settings.max_title_length = 250
App.default_settings.max_favorites = 250

// Configurable buttons
App.default_settings.buttons = [
  {name: "Commits", path: "/commit/"},
  {name: "Issues", path: "/issues/"},
  {name: "Pulls", path: "/pull/"},
  {name: "Tags", path: "/tag/"},
  {name: "1", level: 1},
  {name: "2", level: 2},
]

// Get the saved settings
App.get_settings = function () {
  App.settings = App.get_local_storage(App.ls_settings)

  if (App.settings === null) {
    App.settings = App.default_settings
  }

  App.buttons = [
    App.buttons_core.All,
    App.buttons_core.Favorites,
    ...App.settings.buttons,
    App.buttons_core.Home,
    App.buttons_core.About,
  ]

  App.el("#editor_save").addEventListener("click", function () {
    try {
      let obj = JSON.parse(editor.value)
      App.save_settings(obj)
    } catch (err) {
      alert("Parsing error.")
      return
    }
  })

  App.el("#editor_defaults").addEventListener("click", function () {
    if (confirm("Restore defaults?")) {
      App.save_settings(App.default_settings)
    }
  })

  App.el("#editor_cancel").addEventListener("click", function () {
    App.hide_editor()
  })
}

// Save settings obj
App.save_settings = function (obj) {
  App.save_local_storage(App.ls_settings, obj)
  alert("Settings saved. Restart the app.")
  window.close()
}