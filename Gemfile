source "https://rubygems.org"

# Same Jekyll + plugin versions GitHub Pages uses to build the live site
# (https://pages.github.com/versions/), so local builds match production.
gem "github-pages", "~> 232", group: :jekyll_plugins

# `jekyll serve` needs webrick on Ruby 3+
gem "webrick", "~> 1.8"

# Windows: timezone data + native file watching for `jekyll serve`
platforms :windows do
  gem "tzinfo-data"
  gem "wdm", "~> 0.2"
end
