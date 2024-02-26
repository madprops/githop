Currently a [Firefox addon](https://addons.mozilla.org/en-US/firefox/addon/githop/).

Find visited GitHub locations quickly using different filters.

All the information is gathered from the browser's history, it does zero network requests.

![](https://i.imgur.com/jlnofQx.jpg)

## Usage

Use your mouse or keyboard. Use the filter to search for a specific item.

The filter works by checking the titles and urls.

Use the different buttons to refine your search.

Click or press Enter to go to an item's url.

Middle-clicking an item opens it in a new tab without closing the app.

## Buttons
These are used to refine the searches.
For instance a button might specify that the url of items must contain "/commit/".
More than 1 button can be active at a time by Shift-Clicking them.
For instance you can have "Tag", "Day", and "2" active.
Which would match the /tag/ path, 24 hours, and level 2.
If more of the same type are selected, for instance Commits and Issues (path),
it will check as an AND (it matches if Commits and Issues paths are present).
All of these can be added, removed, or customized.

## All Button

De-activate all buttons and clear the filter.

## Home Button

Go to the homepage (https://github.com or whatever is configured).

## ? Button

Open the settings editor. Also can be used to see the current version.

## Icons

Each item gets an icon based on the first level of the url.

For instance Bob/repo1 and Bob/repo2 will have the same icon,
because they're both from Bob.

Icons are generated lazily, only when they get into view,
making it load faster.

Clicking the icons makes an item a "favorite", making it appear in the Favorites list. When an item is a favorite it gets a yellow circular border around its icon:

![](https://i.imgur.com/OQnZUAQ.jpg)

## Responsive

If there's space, the top will be displayed in a single row:

![](https://i.imgur.com/hP0PVBN.jpg)

## Settings

Clicking the "?" button reveals the settings editor.

This can be used to make GitHop work with another source instead of GitHub.

It can easily be adjusted to work with GitLab instead, for example.

This can also be used to add/remove custom buttons.

For instance you can have a Blender button with a "/blender/" path.

![](https://i.imgur.com/40uN0Ad.jpg)

>homepage (string)

Them main/root website. This will be used to get the results from the history. This will open a tab to that location when the Home button is clicked.

>max_results (integer)

Maximum results to fetch from the history. The amount displayed can be less since some items get filtered.

>history_months (integer)

How far behind in history to search for results. This could be limited by max_results and vice-versa.

>text_mode (string)

What text to show in the items. Either "title" or "url".

>max_text_length (integer)

How long the text in the items can be. Number of characters.

>max_favorites (integer)

How many favorite items to keep stored.
Favorite items will only show if the items are still in the browser history.
Setting this to 0 will remove the Favorites feature all together.

>new_tab (boolean)

If true items will be opened in a new tab.

By default this is false, which means items open on the same tab.

>buttons (list of objects)

A list of custom buttons. For instance:

```json
"buttons": [
  {"name": "Tags", "path": "/tag/"},
  {"name": "Day", "hours": 24},
  {"name": "1", "level": 1}
]
```

Buttons can have these modes.

>path

This will match items that contain the defined path inside the URL.
For instance /code/ will match something/code/myrepo/etc

>title

This will match with the title content.
This is the visible text on the items.

>hours

This will match items that were visited before the hours defined.
For instance an item visited 30 minutes ago will match with hours: 1.
An item visited 3 hours ago won't match that.

>level

This will match items that contain the right number of slashes.
For instance aa/bb/cc will match a level of 3.

Modes can be combined for more precise results:

```json
{
  "name": "Test",
  "path": "/cat/",
  "hours": 24,
  "level": 2
}
```

### JSON

Settings must be valid json.
If there's a parsing error, a message with the specific error will show.
Invalid json will be attempted to be fixed automatically, but won't work in all cases.

## Intersection Observer

Instead of fully building all the items in the list, an intersection observer is used
to detect when an item becomes visible, to fill it with the remaining heavy components.
This makes loading times faster.