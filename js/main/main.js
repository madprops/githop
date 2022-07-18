// Used for performance measuring
App.date_start = Date.now()

// Place the links at the top
App.make_links()

// Place the buttons
App.make_buttons()

// Get favorites local storage object
App.get_favorites()

// Get last mode local storage object
App.get_last_mode()

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
  text: App.root_url,
  maxResults: App.max_results,
  startTime: Date.now() - (1000 * 60 * 60 * 24 * 30 * App.history_months)
}).then(App.on_results)