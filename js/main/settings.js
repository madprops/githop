App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"
App.root_url = "https://github.com/"

// Max results to fetch from the history
App.max_results = 1000

// How far back to search for results
App.history_months = 12

App.max_title_length = 250
App.max_favorites = 250

// localStorage settings
App.ls_favorites = "favorites_v1"
App.ls_last_mode = "last_mode_v1"

// Show About info in an alert window
App.show_about = function () {
  let manifest = browser.runtime.getManifest()
  let ver = manifest.version
  let s = `This is GitHop v${ver}`
  alert(s)
}

// name: The label in the button
// mode: Filtering mode
// Special modes: "all" and "favorites" --
// title: Show as a tooltip when hovered
// path: Use a url substring when filtering
// level: Use a path level when filtering
// link: Open a link in a new tab when clicked
// callback: Run a function when clicked
App.button_map = [
  {name: "All", mode: "all", title: "Show all items"},
  {name: "Favorites", mode: "favorites", title: "Favorite items. Click the icons to toggle."},
  {name: "Commits", mode: "commits", path: "/commit/", title: "Matches /commit/"},
  {name: "Issues", mode: "issues", path: "/issues/", title: "Matches /issues/"},
  {name: "Pulls", mode: "pulls", path: "/pull/", title: "Matches /pull/"},
  {name: "Tags", mode: "tags", path: "/tag/", title: "Matches /tag/"},
  {name: "1", mode: "1", level: 1, title: "Path Level 1"},
  {name: "2", mode: "2", level: 2, title: "Path Level 2"},
  {name: "3", mode: "3", level: 3, title: "Path Level 3"},
  {name: "Home", link: "https://github.com", title: "Go to GitHub"},
  {name: "?", callback: App.show_about, title: "About"},
]