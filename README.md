# Denver-A7.github.io

One-page personal portfolio, hosted on GitHub Pages. Plain HTML, CSS and JavaScript — no frameworks, no build step.

## Layout

```
index.html            Single page: skip link, header, main (hero, work, writing, about, contact), footer
css/
  tokens.css          Design tokens (colors, type scale, spacing, motion variables)
  base.css            Reset, document defaults, typography, layout primitives
  components.css      Nav, buttons, cards, section styles, footer
  motion.css          Animations, transitions, reduced-motion overrides
js/
  data.js             Site content (projects, writing, skills, links)
  cursor.js           Custom cursor ring
  main.js             Nav, theme toggle, rendering from data.js
assets/               Images and other static files
```

## Running locally

Open `index.html` in a browser, or serve the folder with any static file server.
