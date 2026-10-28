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
  data.js             Hero bar and odometer animation, chart scanline reveal
  cursor.js           Custom cursor ring
  main.js             Nav, theme toggle, reveals, level gauge, clickable cards
assets/               Images, favicon.svg, og-image.png (social preview)
tools/
  og-image.html       Source for assets/og-image.png (render at 1200x630)
sitemap.xml           For search engines
robots.txt            Crawler rules and sitemap location
```

## Running locally

Open `index.html` in a browser, or serve the folder with any static file server.
