// Add links to the top
App.make_links = function () {
  let links = App.el("#links")
  
  for (let link of App.link_map) {
    let el = document.createElement("div")
    el.textContent = link.name
    el.classList.add("link")
    el.classList.add("action")
    el.title = link.url

    // Avoid reference problems
    let url = link.url

    el.addEventListener("click", function () {
      App.open_tab(url)
    })

    links.append(el)
  }
}