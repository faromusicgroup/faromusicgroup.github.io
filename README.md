# Faro Music Group website

Live at https://www.faromusicgroup.com, built by GitHub Pages from `main`.

## Local development

The `Gemfile` pins the `github-pages` gem, so local builds use the same Jekyll
and plugin versions as the live site (Ruby 3.3, Jekyll 3.10). Gems install into
`vendor/bundle` inside this folder, so they never clash with other projects.

One-time setup (Windows):

```sh
winget install RubyInstallerTeam.RubyWithDevKit.3.3   # then open a new terminal
bundle config set --local path vendor/bundle
bundle install
```

On macOS/Linux, install Ruby 3.3 (e.g. with `rbenv`) and run the same two `bundle` commands.

Run the site at http://127.0.0.1:4000 (reloads the browser on save):

```sh
bundle exec jekyll serve --livereload
```

Add `--future` to preview a song whose post date is in the future
(`_config.yml` has `future: false`, so those are hidden until their date).

### Cover thumbnails

`scripts/generate_thumbnails.sh` creates `images/covers/thumbs/*.webp` from the
covers. It needs ImageMagick (`winget install ImageMagick.ImageMagick`).

## Songs: lyrics and chords

Each song is a post in `_posts/`. In its front matter:

- `lang: es` (or `en`, `ca`, …): the song's language. Chords show in Do Re Mi
  by default, or in ABC for `en`; visitors can switch.
- `lyrics: >-` followed by the lyrics, indented, with a blank line between
  lines and two between sections (no blank line right after `lyrics: >-`).
- Chords go inline, right before the syllable they fall on: `C[FA]uando vuelva`.
  Write them in Do Re Mi (`[FA]`, `[SIb]`, `[FA#m]`, songbook-style `[FAsm]`) or
  ABC (`[F]`, `[Bb]`, `[F#m]`). A line of only chords is an instrumental part:
  `[SOL RE MIm DO (x2)]`. Songs without chords simply show the lyrics.
- `credit:` (optional): a source line shown under the lyrics, e.g.
  `credit: Oración de San Alfonso María de Ligorio`.

The **PDF** button prints the song as a chord sheet (`_includes/song-sheet.html`,
`_sass/components/_sheet.scss`). On songs with chords it first asks: with chords
(in the key and notation chosen on the page) or lyrics only. Visitors then
choose "Save as PDF".

The **Songbook** page (`songbook.html`, in the menu) prints every published song,
oldest first, with a cover and contents. It is rebuilt with the site, so new
songs and chords appear in it automatically.

---

# (WIP) Phantom - Jekyll Theme

A Jekyll version of the "Phantom" theme by [HTML5 UP](https://html5up.net/).

![Phantom Theme](images/phantom.jpg "Phantom Theme")

# How to Use

For those unfamiliar with how Jekyll works, check out [https://jekyllrb.com/](https://jekyllrb.com/) for all the details, 
or read up on just the basics of [front matter](https://jekyllrb.com/docs/frontmatter/), [writing posts](https://jekyllrb.com/docs/posts/), 
and [creating pages](https://jekyllrb.com/docs/pages/).

- **GitLab**: Simply fork this repository and start editing the `_config.yml` file!
- **GitHub**: Fork this reposity and create a branch named `gh-pages`, then start editing the `_config.yml` file!

# Added Features

I've integrated lots of nice Jekyll features into the theme, such as:
* [Formspree.io](https://formspree.io/) contact form integration - just add your email to the `_config.yml` and it works!
* Your social profiles are linked from usernames you enter in `_config.yml`. Only social profiles buttons you enter in `config.yml` show up on the site footer.
* Site logo support - Easily set any image or [Font Awesome icon](http://fontawesome.io/icons/) as your logo. If you enter a Font Awesome icon class in `_config.yml` it will override the default image used as the site logo.
* **Coming soon**: Featured images and thumbnails in front matter for the homepage posts grid.
* **Coming soon**: Easy featured image settings in `_config.yml` - choose to have Jekyll use a set height for featured images or have it display the entire image, pushing the page content further down.

# Issues

If you would like to report a bug, ask a question, request a feature, feel free to do so on [the GitLab repository](https://gitlab.com/andrewbanchich/phantom-jekyll-theme) and I will be more than happy to help!

Alternatively, you can open an issue via email by emailing [incoming+andrewbanchich/phantom-jekyll-theme@incoming.gitlab.com](mailto:incoming+andrewbanchich/phantom-jekyll-theme@incoming.gitlab.com).

The GitHub repository is simply a mirror of the GitLab repository.

# Credits

Original README from HTML5 UP:

```
Phantom by HTML5 UP
html5up.net | @ajlkn
Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)


This is Phantom, a simple design built around a grid of large, colorful, semi-interactive
image tiles (of which you can have as many or as few as you like). Makes use of some
SVG and animation techniques I've been experimenting with on that other project of mine
you may have heard about (https://carrd.co), and includes a handy generic page for whatever.

Demo images* courtesy of Unsplash, a radtastic collection of CC0 (public domain) images
you can use for pretty much whatever.

(* = not included)

AJ
aj@lkn.io | @ajlkn


Credits:

	Demo Images:
		Unsplash (unsplash.com)

	Icons:
		Font Awesome (fortawesome.github.com/Font-Awesome)

	Other:
		jQuery (jquery.com)
		html5shiv.js (@afarkas @jdalton @jon_neal @rem)
		Misc. Sass functions (@HugoGiraudel)
		Respond.js (j.mp/respondjs)
		Skel (skel.io)
```

Repository [Jekyll logo](https://github.com/jekyll/brand) icon licensed under a [Creative Commons Attribution 4.0 International License](http://choosealicense.com/licenses/cc-by-4.0/).
