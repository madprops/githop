// Information
App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"

// localStorage settings
App.ls_favorites = "favorites_v1"
App.ls_last_button = "last_button_v1"
App.ls_settings = "settings_v1"

// Go to homepage
App.go_home = function () {
  App.open_tab(App.settings.root_url)
}

// Show about info & config
App.show_editor = function () {
  let list = App.el("#list")
  let editor_container = App.el("#editor_container")
  let editor_info = App.el("#editor_info")
  let editor = App.el("#editor")
  let manifest = browser.runtime.getManifest()
  let ver = manifest.version
  let info = `This is GitHop v${ver}. You can edit the settings below.`
  editor_info.textContent = info

  if (App.editor_on) {
    try {
      let obj = JSON.parse(editor.value)
      App.save_local_storage(App.ls_settings, obj)
      alert("Settings saved. Restart the app.")
      window.close()
    } catch (err) {
      alert("Parsing error.")
      return
    }
  } else {
    App.editor_on = true
    list.classList.add("hidden")
    editor_container.classList.remove("hidden")
    editor.value = JSON.stringify(App.settings, undefined, 2)
  }
}

App.button_map_core = {
  "All": {name: "All", mode: "all", title: "Show all items"},
  "Favorites": {name: "Favorites", mode: "favorites", title: "Favorite items. Click the icons to toggle."},
  "Home": {name: "Home", mode: "home", title: "Go to the homepage", alt: true},
  "About": {name: "?", mode: "about", title: "About & Configure", alt: true},

}

// Basic information
App.default_settings = {}
App.default_settings.root_url = "https://github.com/"

// Max results to fetch from the history
App.default_settings.max_results = 1000

// How far back to search for results
App.default_settings.history_months = 12

// Limits
App.default_settings.max_title_length = 250
App.default_settings.max_favorites = 250

// name: The label in the button
// mode: Filtering mode
// Special modes: "all" and "favorites" --
// title: Show as a tooltip when hovered
// path: Use a url substring when filtering
// level: Use a path level when filtering
// link: Open a link in a new tab when clicked
// callback: Run a function when clicked
App.default_settings.button_map = [
  {name: "Commits", path: "/commit/", title: "Matches /commit/"},
  {name: "Issues", path: "/issues/", title: "Matches /issues/"},
  {name: "Pulls", path: "/pull/", title: "Matches /pull/"},
  {name: "Tags", path: "/tag/", title: "Matches /tag/"},
  {name: "1", level: 1, title: "Path Level 1"},
  {name: "2", level: 2, title: "Path Level 2"},
]

// Get the saved settings
App.get_settings = function () {
  App.settings = App.get_local_storage(App.ls_settings)

  if (App.settings === null) {
    App.settings = App.default_settings
  }

  App.button_map = [
    App.button_map_core.All,
    App.button_map_core.Favorites,
    ...App.settings.button_map,
    App.button_map_core.Home,
    App.button_map_core.About,
  ]
}