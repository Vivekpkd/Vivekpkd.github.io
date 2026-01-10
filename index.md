---
layout: default
title: Home
---
<section class="hero">
  <h1>{{ site.title }}</h1>
  <p class="lead">{{ site.description }}</p>
</section>

<section class="content">
  <h2>Latest posts</h2>
  {% if site.posts and site.posts != empty %}
  <ul class="posts">
    {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <small class="meta">— {{ post.date | date: "%b %-d, %Y" }}</small>
      <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
    </li>
    {% endfor %}
  </ul>
  {% else %}
  <p>No posts yet — add one to <code>_posts/</code>.</p>
  {% endif %}
</section>