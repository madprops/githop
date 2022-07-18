Currently a [Firefox addon](https://addons.mozilla.org/en-US/firefox/addon/githop/).

Find GitHub locations quickly using your browser's history.

![](https://i.imgur.com/idXGR5V.jpg)

Use your mouse or keyboard. Use the filter to search for a specific item.

The filter works by checking the titles and urls.

Buttons like "Commits" focus on certain kinds of items by matching against a url substring like "/commit/" plus the filter you enter.

Buttons 1, 2, and 3, refer to path levels. 
For instance aa/bb is a 2-level path.

Each item gets an icon based on the first level of the url.

For instance Bob/repo1 and Bob/repo2 will have the same icon,
because they're both from Bob.

Icons are generated lazily, only when they get into view,
making it load faster.

Clicking the icons makes an item a "favorite", making it appear in the Favorites list. When an item is a favorite it gets a yellow circular border around its icon:

![](https://i.imgur.com/OQnZUAQ.jpg)

All the information is gathered from the browser's history, it does zero network requests.