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

Open `index.html` in a browser, or serve the folder with any static file server, for example `python -m http.server` and then visit `http://localhost:8000`.

## Editing content

All text lives in `index.html`. Search for `[FILL` to find every placeholder that still needs your own words.

| Section | Where | Notes |
| --- | --- | --- |
| Hero headline and intro | `<section id="hero">` | The headline is also the page title, so keep `<title>` and the `og:title` / `twitter:title` tags in the `<head>` in step with it. |
| Hero chart ("Featured result") | `.chart` inside the hero | Each bar has `data-value` and `style="--v: N"` (bar length) and the number beside it has `data-count`. Bar length is `--v` out of 25; if a value can exceed 25, change the `/ 25` in `.chart__bar` in `css/components.css`. |
| Projects | `<section id="work">` | See "Adding a project card" below. |
| Writing | `<section id="writing">` | One `<li class="post">` per post: date, title, summary and link. Replace the `href="#"` with the post URL. |
| About and skills | `<section id="about">` | Skills are `<li class="chip">` items. |
| Contact | `<section id="contact">` | Replace `href="#"` with `mailto:you@example.com` and your LinkedIn URL. Delete the whole `<li class="contact-row">` for anything you do not want to show. |
| Footer | `<footer>` | Name and year. |

Search and social previews are set in the `<head>`: `<title>`, `description`, `canonical`, and the `og:` and `twitter:` tags. If the site address changes, update `canonical`, `og:url`, `og:image`, `twitter:image`, `sitemap.xml` and the `Sitemap:` line in `robots.txt`.

## Adding a project card

1. In `index.html`, copy the whole `<article class="project" data-reveal>` block (a comment marks it) and paste it after the last card. Spacing between cards is automatic.
2. Put the chart or screenshot in `assets/`. Keep `width` and `height` on the `<img>` equal to the file's real pixel size, keep `loading="lazy"`, and write an `alt` that states the result in words.
3. Edit the title, tool chips (`.chips`), summary, stat chips (`.stats`), "What I learned" bullets and buttons. A number that should count up on scroll goes in `<span data-count="34">34</span>`; the plain number stays in the HTML so it still reads without JavaScript.
4. The first link inside `.project__actions` is what the whole card opens when clicked, so put the main link first. Links to other sites need `target="_blank" rel="noopener"` and the visually hidden `(opens in a new tab)` text, as in the existing buttons.
5. Update the "One experiment so far" line in the Work section heading.

On screens wider than 900px the chart sits on its own row with the text in two columns below it (title, tags and summary on the left; stats, bullets and buttons on the right). Below 900px everything stacks in the same order.

## Texture strength

The concrete wall is drawn in `css/base.css` (`body::before`) and its strength is one number, `--tex`, in `css/tokens.css`:

- Dark theme: `--tex: .7` in `:root`.
- Light theme: `--tex: .25` in `:root[data-theme="light"]`.

`0` shows a flat wall colour and `1` is full strength. Text contrast was checked at these two values (worst case about 4.6:1 on the lightest patches), so stronger values can push small grey text below the 4.5:1 minimum. To remove the texture entirely, set both values to `0` and delete the `body::before` block in `css/base.css` so nothing is drawn. The wall colours are `--wall` in the same file.

## Publishing

This repository is a GitHub user site, so it publishes at `https://denver-a7.github.io/`.

1. Fill every `[FILL]` and every `href="#"` (search for both), then open the page once to check it.
2. Commit and push to the `main` branch.
3. On GitHub, open the repository's Settings, then Pages. Under "Build and deployment" choose "Deploy from a branch", branch `main`, folder `/ (root)`, and save.
4. Wait a minute or two for the first deploy, then open the URL. Later pushes redeploy automatically.
5. After the first deploy, test the share card by pasting the URL into a link-preview tool (LinkedIn Post Inspector, or the Facebook Sharing Debugger), and optionally submit `sitemap.xml` in Google Search Console. Update `lastmod` in `sitemap.xml` when you make a significant change.
