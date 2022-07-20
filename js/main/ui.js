// Arrange items depending on space
App.setup_ui = function () {
  let width = App.el("#buttons_container").offsetWidth

  if (width < 250) {
    App.el("#top_container").classList.add("top_container_row")
    App.el("#buttons_container").classList.add("buttons_container_row")
  }
}