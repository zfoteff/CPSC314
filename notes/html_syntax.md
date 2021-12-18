HTML Syntax
===============
# HTML document structure
## Tags
* tag is a markup instruction identified by \<TAG_NAME>
  * ex. \<br/>
  * Some tags need to be terminated with a closing tag styled like this \</TAG_NAME>, while some like \<br/> are self terminating

## Basic structure of every HTML page
```HTML
<!--
  Multi-line comment in HTML
-->
<!-- In-line HTML comment -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
  </head>
  <body>
    Hello, World!
  </body>
</html>
```

* Head tag: contains all metadata and scripts for the page
  * Will contain all necessary page info
  * \<style rel=url> allows for css to change how html pages are rendered
  * \<script> tag allows for JavaScript to be included into HTML document
  * \<link rel=url> tag allows for external documents to be included into these documents
    * Can be css and JavaScript documents
  * \<noscript> tag that will disable scripting on a page
* Body tag: All rendered HTML content
