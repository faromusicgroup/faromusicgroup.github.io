# coding: utf-8

Gem::Specification.new do |spec|
  spec.name          = "faro"
  spec.version       = "1.2"
  spec.authors       = ["faro"]
  spec.email         = ["faro.official.group@gmail.com"]

  spec.summary       = %q{faro music group | official}
  spec.homepage      = "https://faromusicgroup.com"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r{^(assets|_layouts|_includes|_sass|LICENSE|README)}i) }

  spec.add_development_dependency "jekyll", "~> 4.0"
  spec.add_development_dependency "bundler", "~> 2.2"
end
