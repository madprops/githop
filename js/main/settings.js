App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"
App.root_url = "https://github.com/"
App.max_results = 1000
App.history_months = 12
App.max_title_length = 250
App.max_favorites = 250
App.ls_favorites = "favorites_v1"
App.ls_last_mode = "last_mode_v1"

App.link_map = [
  {name: "Homepage", url: "https://github.com"},
  {name: "Notifications", url: "https://github.com/notifications"},
  {name: "Issues", url: "https://github.com/issues"},
  {name: "Pulls", url: "https://github.com/pulls"},
  {name: "Gists", url: "https://gist.github.com/mine"},
  {name: "Market", url: "https://github.com/marketplace"},
  {name: "Explore", url: "https://github.com/explore"},
]

App.button_map = [
  {name: "All", mode: "all", title: "Show all items"},
  {name: "Favorites", mode: "favorites", title: "Favorite items. Click the icons to toggle."},
  {name: "Commits", mode: "commits", path: "/commit/", title: "Matches /commit/"},
  {name: "Issues", mode: "issues", path: "/issues/", title: "Matches /issues/"},
  {name: "Pulls", mode: "pulls", path: "/pull/", title: "Matches /pull/"},
  {name: "Tags", mode: "tags", path: "/tag/", title: "Matches /tag/"},
  {name: "1", mode: "1", title: "Path Level 1"},
  {name: "2", mode: "2", title: "Path Level 2"},
  {name: "3", mode: "3", title: "Path Level 3"},
]