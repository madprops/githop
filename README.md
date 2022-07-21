Currently a [Firefox addon](https://addons.mozilla.org/en-US/firefox/addon/githop/).

Find GitHub locations quickly using your browser's history.

![](https://i.imgur.com/3PHqOaG.jpg)

## Usage

Use your mouse or keyboard. Use the filter to search for a specific item.

The filter works by checking the titles and urls.

Buttons like "Commits" focus on certain kinds of items by matching against a url substring like "/commit/" plus the filter you enter.

Buttons 1, and 2 refer to path levels. 
For instance aa/bb is a 2-level path.

The Day button shows items that were visited in the last 24 hours.

## Icons

Each item gets an icon based on the first level of the url.

For instance Bob/repo1 and Bob/repo2 will have the same icon,
because they're both from Bob.

Icons are generated lazily, only when they get into view,
making it load faster.

Clicking the icons makes an item a "favorite", making it appear in the Favorites list. When an item is a favorite it gets a yellow circular border around its icon:

![](https://i.imgur.com/OQnZUAQ.jpg)

All the information is gathered from the browser's history, it does zero network requests.

## Editor

Clicking the "?" button reveals the settings editor.

This can be used to make GitHop work with another source instead of GitHub.

It can easily be adjusted to work with GitLab instead, for example.

This can also be used to add/remove custom buttons.

For instance you can have a Blender button with a "/blender/" path.

![](https://i.imgur.com/zcPdb5b.jpg)

## Modes

Buttons can have multiple modes.

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

### Combining Modes

Modes can be combined for more precise results:

```
{
  "name": "Test",
  "path": "/cat/",
  "hours": 24,
  "level": 2
}
```

## Responsive

If there's space, the top will be displayed in a single row:

![](https://i.imgur.com/8ldaRZS.jpg)

## Settings

>homepage

Them main/root website. This will be used to get the results from the history. This will open a tab to that location when the Home button is clicked.

>max_results

Maximum results to fetch from the history. The amount displayed can be less since some items get filtered.

>history_months

How far behind in history to search for results. This could be limited by max_results and vice-versa.

>text_mode

What text to show in the items. Either "title" or "url".

>max_text_length

How long the text in the items can be.

>max_favorites

How many favorite items to keep stored.
Favorite items will only show if the items are still in the browser history.

>buttons

A list of custom buttons. For instance:

```
"buttons": [
  {name: "Tags", path: "/tag/"},
  {name: "Day", hours: 24},
  {name: "1", level: 1}
]
```

Check the `Modes` section above to see how to configure buttons.

### JSON

Settings must be valid json. 
If there's a parsing error, a message with the specific error will show.