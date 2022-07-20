App.editor_on = false

// Used for performance measuring
App.date_start = Date.now()

App.setup_settings()
App.setup_buttons()
App.get_favorites()
App.set_filter_placeholder()
App.start_item_observer()
App.setup_events()
App.setup_filter()
App.setup_list()
App.focus_filter()

// Do the history search
browser.history.search({
  text: App.settings.homepage,
  maxResults: App.settings.max_results,
  startTime: Date.now() - (1000 * 60 * 60 * 24 * 30 * App.settings.history_months)
}).then(App.setup_items)