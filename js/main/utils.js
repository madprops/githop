// Escape non alphanumeric chars
App.escape_special_chars = function (s) {
  return s.replace(/[^A-Za-z0-9]/g, "\\$&")
}

// Remove slash at the end
App.unslash = function (url) {
  return url.replace(/\/$/, "").trim()
}

// Remove root url from the start of a url
App.clean_url = function (url) {
  let escaped = App.escape_special_chars(App.root_url)
  let regex = new RegExp(`^${escaped}`, "i")
  return url.replace(regex, "")
}

// Get first part of a url
App.get_unit = function (curl) {
  return curl.split("/")[0].split("?")[0].split("#")[0]
}

// Check if string is a number
App.is_number = function (s) {
  let regex = new RegExp("^[0-9]+$")

  if (s.match(regex)) {
    return true
  } else {
    return false
  }
}

// Set the filter placeholder
App.set_placeholder = function () {
  let s = App.name

  if (App.description) {
    s += ` - ${App.description}`
  }

  App.filter.placeholder = s
}

// Open a new tab with a url
App.open_tab = function (url) {
  browser.tabs.create({url: url})
  window.close()
}

// Centralized function to get localStorage objects
App.get_local_storage = function (ls_name) {
  let obj

  if (localStorage[ls_name]) {
    try {
      obj = JSON.parse(localStorage.getItem(ls_name))
    } catch (err) {
      localStorage.removeItem(ls_name)
      obj = null
    }
  } else {
    obj = null
  }

  return obj
}

// Centralized function to save localStorage objects
App.save_local_storage = function (ls_name, obj) {
  localStorage.setItem(ls_name, JSON.stringify(obj))
}