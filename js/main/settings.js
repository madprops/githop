// Information
App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"

// localStorage settings
App.ls_favorites = "favorites_v1"
App.ls_last_button = "last_button_v1"
App.ls_settings = "settings_v1"

// Setup the settings editor
App.setup_editor = function () {
  App.nice_editor = ace.edit("editor")

  App.nice_editor.session.setOptions({
    mode: "ace/mode/json",
    tabSize: 2,
  })
}

// Show the editor
App.show_editor = function () {
  App.editor_on = true
  
  let manifest = browser.runtime.getManifest()
  let ver = manifest.version
  let info = `${App.name} v${ver}`
  editor_info.textContent = info
  
  App.el("#main").classList.add("hidden")
  App.el("#editor_container").classList.remove("hidden")
  
  let value = JSON.stringify(App.settings, undefined, 2)
  
  App.nice_editor.setValue(value)
  App.nice_editor.clearSelection()
  App.nice_editor.gotoLine(1)
  App.nice_editor.focus()

  App.original_editor_value = App.nice_editor.getValue()
}

// Hide the editor
App.hide_editor = function () {
  App.editor_on = false
  App.el("#main").classList.remove("hidden")
  App.el("#editor_container").classList.add("hidden")
}

// These buttons are always present
App.buttons_core = {
  "All": {name: "All", mode: "all", tooltip: "Show all items"},
  "Favorites": {name: "Favorites", mode: "favorites", tooltip: "Favorite items. Click the icons to toggle"},
  "Home": {name: "Home", mode: "home", tooltip: "Go to the Homepage", alt: true},
  "About": {name: "?", mode: "about", tooltip: "Open the Editor", alt: true},
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
  {name: "Day", hours: 24},
  {name: "1", level: 1},
  {name: "2", level: 2},
]

// Get the saved settings
App.get_settings = function () {
  App.settings = App.get_local_storage(App.ls_settings)

  if (App.settings === null) {
    App.settings = App.default_settings
  }

  let save = false

  for (let p in App.default_settings) {
    if (App.settings[p] === undefined) {
      App.settings[p] = App.default_settings[p]
      console.log(`Setting '${p}' set to default`)
      save = true
    }
  }

  for (let p in App.settings) {
    if (App.default_settings[p] === undefined) {
      App.settings[p] = undefined
      console.log(`Setting '${p}' removed`)
      save = true
    }
  }

  if (save) {
    App.save_settings(App.settings)
  }

  App.buttons = [
    App.buttons_core.All,
    App.buttons_core.Favorites,
    ...App.settings.buttons,
    App.buttons_core.Home,
    App.buttons_core.About,
  ]

  App.el("#editor_done").addEventListener("click", function () {
    if (App.original_editor_value === App.nice_editor.getValue()) {
      App.hide_editor()
      return
    }

    try {
      let value = App.nice_editor.getValue()
      let obj = JSON.parse(value)
      App.save_settings(obj, true)
    } catch (err) {
      alert(err)
      return
    }
  })

  App.el("#editor_defaults").addEventListener("click", function () {
    if (confirm("Restore defaults?")) {
      App.save_settings(App.default_settings, true)
    }
  })

  App.el("#editor_help").addEventListener("click", function () {
    App.show_help()
  })
}

// Save settings obj
App.save_settings = function (obj, restart = false) {
  App.save_local_storage(App.ls_settings, obj)

  if (restart) {
    alert("Changes saved.")
    window.close()
  }
}

// Show a help message about the editor
App.show_help = function () {
  let s = ""

  s += "Button modes:\n"
  s += "path = Substring of the URL\n"
  s += "title = Substring of the title\n"
  s += "hours = Visited before these hours ago\n"
  s += "level = Path level (aa/bb = 2)\n"

  alert(s)
}