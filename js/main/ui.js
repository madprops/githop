// Arrange items depending on space
App.setup_ui = function () {
  let width_1 = App.el("#filter_container").offsetWidth
  let width_2 = App.el("#buttons_container").offsetWidth
  let width_3 = App.el("#main").offsetWidth

  if (width_1 + width_2 < width_3) {
    App.el("#top_container").classList.add("top_container_row")
  }
}