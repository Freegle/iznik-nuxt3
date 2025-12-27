source "https://rubygems.org"

gem "fastlane"
gem "abbrev"  # Required for Ruby 3.4+ compatibility
gem "nkf"     # Required for Ruby 3.4+ compatibility (provides kconv module)

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
