// Arrange items depending on space
// Set the dark or light theme
App.setup_ui = function () {
  let top = App.el("#top_container")

  if (top.scrollWidth > top.clientWidth) {
    App.el("#top_container").classList.add("top_container_column")
  }

  if (App.settings.theme === "light") {
    App.set_css_var("font_color", "#000000")
    App.set_css_var("background_color", "#ffffff")
    App.set_css_var("selected_background_color", "#dbdbdb")
    App.set_css_var("filter_background_color", "#ffffff")
    App.set_css_var("filter_font_color", "#000000")
    App.set_css_var("button_font_color", "#000000")
    App.set_css_var("favorite_outline", "purple")
  }
  else {
    App.set_css_var("font_color", "#ffffff")
    App.set_css_var("background_color", "#252933")
    App.set_css_var("selected_background_color", "#2B303B")
    App.set_css_var("filter_background_color", "#2B303B")
    App.set_css_var("filter_font_color", "#ffffff")
    App.set_css_var("button_font_color", "#ffffff")
    App.set_css_var("favorite_outline", "gold")
  }
}

// Set css variable
App.set_css_var = function (name, value) {
  document.documentElement.style.setProperty(`--${name}`, value)
}