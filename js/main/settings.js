App.name = "GitHop"
App.description = "Type to filter - Enter to select - Tab to cycle"
App.root_url = "https://github.com/"
App.max_results = 1000
App.history_months = 12
App.max_title_length = 250
App.max_visited = 250
App.ls_visited = "visited_v3"

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
  {name: "All", mode: "all"},
  {name: "Visited", mode: "visited", title: "Middle click to forget items"},
  {name: "Issues", mode: "issues", path: "/issues/"},
  {name: "Commits", mode: "commits", path: "/commit/"},
  {name: "Pulls", mode: "pulls", path: "/pull/"},
  {name: "Tags", mode: "tags", path: "/tag/"},
  {name: "1", mode: "1", title: "Path Level 1"},
  {name: "2", mode: "2", title: "Path Level 2"},
  {name: "3", mode: "3", title: "Path Level 3"},
]