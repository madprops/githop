App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"
App.root_url = "https://github.com/"
App.max_results = 1000
App.history_months = 12
App.max_title_length = 250
App.max_favorites = 250
App.ls_favorites = "favorites_v1"
App.ls_last_mode = "last_mode_v1"

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
  {name: "Home", link: "https://github.com", title: "Got to the homepage"},
]