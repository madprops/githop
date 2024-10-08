// Information
App.name = `GitHop`

// localStorage settings
App.ls_favorites = `favorites_v1`
App.ls_button_state = `button_state_v1`
App.ls_settings = `settings_v1`

// Setup the settings editor
App.start_nice_editor = function () {
  App.nice_editor = ace.edit(`editor`)

  App.nice_editor.session.setOptions({
    mode: `ace/mode/json`,
    tabSize: 2,
  })

  App.el(`#editor_done`).addEventListener(`click`, function () {
    let value = App.nice_editor.getValue()

    if (App.original_editor_value === value) {
      App.hide_editor()
      return
    }

    try {
      let obj = JSON.parse(value)

      if (App.check_setting_types(obj, true)) {
        App.nice_editor.focus()
        return
      }

      App.save_settings(obj, true)
    }
    catch (err) {
      try {
        // Try to repair the json
        let repaired = App.json_repair(value)
        let obj = JSON.parse(repaired)

        if (App.check_setting_types(obj, true)) {
          App.nice_editor.focus()
          return
        }

        App.save_settings(obj, true)
      }
      catch (err) {
        alert(err)
        App.nice_editor.focus()
      }

      return
    }
  })

  App.el(`#editor_defaults`).addEventListener(`click`, function () {
    if (confirm(`Restore defaults?`)) {
      App.save_settings(App.default_settings, true)
    }
  })

  App.el(`#editor_help`).addEventListener(`click`, function () {
    App.show_help()
  })
}

// Show the editor
App.show_editor = function () {
  App.editor_on = true

  if (!App.nice_editor) {
    App.start_nice_editor()
  }

  let manifest = browser.runtime.getManifest()
  let ver = manifest.version
  let info = `${App.name} v${ver}`
  let editor_info = App.el(`#editor_info`)
  editor_info.textContent = info

  App.el(`#main`).classList.add(`hidden`)
  App.el(`#editor_container`).classList.remove(`hidden`)

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
  App.el(`#main`).classList.remove(`hidden`)
  App.el(`#editor_container`).classList.add(`hidden`)
}

// These buttons are always present
App.buttons_core = {
  "Favorites": {name: `Favorites`, mode: `favorites`, tooltip: `Favorite items. Click the icons to toggle`},
}

App.setup_settings = function () {
  App.default_settings = {}
  App.default_settings.theme = `dark`
  App.default_settings.homepage = `https://github.com`
  App.default_settings.max_results = 1000
  App.default_settings.history_months = 12
  App.default_settings.text_mode = `title`,
  App.default_settings.max_text_length = 250
  App.default_settings.max_favorites = 200
  App.default_settings.new_tab = false
  App.default_settings.show_tabs = true
  App.default_settings.show_history = true
  App.default_settings.tab_icon = `\uD83D\uDFE2`
  App.default_settings.history_icon = ``
  App.default_settings.buttons = [
    {name: `Commits`, path: `/commit/`},
    {name: `Issues`, path: `/issues/`},
    {name: `Discussions`, path: `/discussions/`},
    {name: `Pulls`, path: `/pull/`},
    {name: `Tags`, path: `/tag/`},
    {name: `Day`, hours: 24},
    {name: `1`, level: 1},
    {name: `2`, level: 2},
  ],

  App.get_settings()
}

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
      App.log(`Setting '${p}' set to default`)
      save = true
    }
  }

  for (let p in App.settings) {
    if (App.default_settings[p] === undefined) {
      App.settings[p] = undefined
      App.log(`Setting '${p}' removed`)
      save = true
    }
  }

  if (App.check_setting_types(App.settings)) {
    save = true
  }

  if (save) {
    App.settings = App.order_settings(App.settings)
    App.save_settings(App.settings)
  }

  let buttons = []

  if (App.settings.max_favorites > 0) {
    buttons.push(App.buttons_core.Favorites)
  }

  buttons.push(...App.settings.buttons)
  App.buttons = structuredClone(buttons)
}

// Save settings obj
App.save_settings = function (obj, restart = false) {
  App.save_local_storage(App.ls_settings, obj)

  if (restart) {
    alert(`Setting changes saved successfully.`)
    window.close()
  }
}

// Order the settings object
App.order_settings = function (obj) {
  return {
    theme: obj.theme,
    homepage: obj.homepage,
    max_results: obj.max_results,
    history_months: obj.history_months,
    text_mode: obj.text_mode,
    max_text_length: obj.max_text_length,
    max_favorites: obj.max_favorites,
    show_tabs: obj.show_tabs,
    show_history: obj.show_history,
    tab_icon: obj.tab_icon,
    history_icon: obj.history_icon,
    new_tab: obj.new_tab,
    buttons: obj.buttons,
  }
}

// Show a help message about the editor
App.show_help = function () {
  let s = ``

  s += `theme: Can be "light" or "dark".\n`
  s += `------------------------------\n`
  s += `homepage: Root url of items. Used to search in the history.\n`
  s += `------------------------------\n`
  s += `max_results: How many items (max) to fetch from history.\n`
  s += `------------------------------\n`
  s += `history_months: How deep the history search can be, in months.\n`
  s += `------------------------------\n`
  s += `text_mode: Can be "title" or "url".\n`
  s += `This is the displayed text in items.\n`
  s += `------------------------------\n`
  s += `max_text_length: How long the displayed text can be.\n`
  s += `------------------------------\n`
  s += `max_favorites: How many favorites to remember.\n`
  s += `0 disables Favorites entirely.\n`
  s += `------------------------------\n`
  s += `show_tabs: Show tab items in the list.\n`
  s += `show_history: Show history items in the list.\n`,
  s += `------------------------------\n`
  s += `buttons: Custom filter buttons.\n`
  s += `They use the following modes:\n`
  s += `path: Substring of the URL.\n`
  s += `title: Substring of the title.\n`
  s += `hours: Visited before these hours ago.\n`
  s += `level: Path level (aa/bb == 2).\n`
  s += `new_tab: Open in a new tab.\n`

  alert(s.trim())
}

// Check setting types
App.check_setting_types = function (obj, do_alert = false) {
  let changed = false

  for (let key in obj) {
    let the_type = typeof App.default_settings[key]

    if (typeof obj[key] !== the_type) {
      let msg = `Invalid type for ${key}. It should be ${the_type}.`

      if (do_alert) {
        alert(msg)
        return true
      }

      obj[key] = App.default_settings[key]
      App.log(msg)
      changed = true
    }
  }

  return changed
}