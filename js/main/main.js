App.editor_on = false

// Used for performance measuring
App.date_start = Date.now()

// Get the settings
App.get_settings()

// Place the buttons
App.make_buttons()

// Get favorites local storage object
App.get_favorites()

// Get last button local storage object
App.get_last_button()

// Set filter placeholder
App.set_placeholder()

// Start the mouse and kb events
App.start_events()

// Start the intersection observer
App.start_observer()

// Focus the filter
App.focus_filter()

// Do the history search
browser.history.search({
  text: App.settings.homepage,
  maxResults: App.settings.max_results,
  startTime: Date.now() - (1000 * 60 * 60 * 24 * 30 * App.settings.history_months)
}).then(App.on_results)