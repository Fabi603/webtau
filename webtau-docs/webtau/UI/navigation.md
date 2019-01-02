# Open

To open a page use `browser.open`. Browser will load a page only if the current url doesn't match the passed one. 

:include-file: doc-artifacts/snippets/navigation/open.groovy {commentsType: 'inline'}

Note: relative url will be automatically expanded to the full url based on the [configuration](UI/basic-configuration)

# Reopen

Use `brower.reopen` to force open the page even if the page url already matches the passed one.

:include-file: doc-artifacts/snippets/navigation/reopen.groovy {commentsType: 'inline'}

# Refresh

Use `browser.refresh` to refresh current page.

:include-file: doc-artifacts/snippets/navigation/refresh.groovy {commentsType: 'inline'}

# Restart

Use `browser.restart` to restart a browser and open last opened url.  

:include-file: doc-artifacts/snippets/navigation/restart.groovy

Note: restarting creates a clean instance of a browser. Local storage is going to be reset. 