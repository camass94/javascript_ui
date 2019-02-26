# Note that while this file is in our config folder, it is
# symlinked to our site folders, so paths are relative from there

# Require gems and Compass plugins
# require 'rgbapng'
# require 'compass-fancybox-plugin'
#require 'compass-growl'

# General
output_style = :expanded
relative_assets = true
# project_path = File.dirname(__FILE__) + '/ui/'
#env_file = project_path + 'environment.rb'
#add_import_path project_path + '../all/public/assets/styles/src/'
#lib_dir = project_path + '../../system/lib/'

# Sass Paths
http_path = '/'
http_javascripts_path = http_path + 'js/'
http_stylesheets_path = http_path + 'css/'
http_images_path = http_path + 'img/'
http_fonts_path = http_path + 'fonts/'

# Sass Directories
# javascripts_dir = 'js/'
# css_dir = 'css/'
# sass_dir = 'scss/'
# images_dir = 'img/'
# fonts_dir = 'fonts/'

# Enable Debugging (Line Comments, FireSass)
# Invoke from command line: compass watch -e development --force
if environment == :development
	line_comments = true
	sass_options = { :debug_info => true }
end
