App.editor_on = false

// Used for performance measuring
App.date_start = Date.now()

App.setup_settings()
App.setup_buttons()
App.get_favorites()
App.start_item_observer()
App.setup_events()
App.setup_filter()
App.setup_list()
App.focus_filter()
App.get_items()