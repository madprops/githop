// Editor open or not
App.editor_on = false

// Used for performance measuring
App.date_start = Date.now()

// Setup functions
App.setup_settings()
App.setup_buttons()
App.setup_favorites()
App.setup_events()
App.setup_filter()
App.setup_list()
App.setup_items()

// Start
App.get_items()