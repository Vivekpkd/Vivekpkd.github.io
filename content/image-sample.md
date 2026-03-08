---
title: "Markdown Image Sample"
category: "Basics"
date: "Mar 08, 2026"
type: "Tutorial"
tags: ["Markdown", "Tutorial"]
---

# How to use Images in Markdown

To add an image with a specific size, use this syntax:

![Sample Image](images/site.jpg){: width="300px" height="200px" }

### Breakdown:
1. `!`: Starts the image tag.
2. `[Sample Image]`: Alt text.
3. `(images/site.jpg)`: Path to the image file.
4. `{: width="300px" height="200px" }`: **Custom attributes** where you can set width, height, or CSS classes.

### Other Options:
- **Only Width**: `![Alt](url){: width="50%" }`
- **Only Height**: `![Alt](url){: height="100px" }`
- **Using CSS classes**: `![Alt](url){: .my-custom-class }`
