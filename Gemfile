source "https://rubygems.org"

gem "fastlane"
gem "abbrev"  # Required for Ruby 3.4+ compatibility
gem "kconv"   # Required for Ruby 3.4+ compatibility (used by CFPropertyList)

plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
