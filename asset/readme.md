# iCF

## Overview

The ICF (UI Framework) is an internal project intended to the the starting point for all UI web development projects at iCrossing.
More information and future features are documented at [https://confluence.icrossing.com/display/TCE/ICF+-+iCrossing+UI+Framework](https://confluence.icrossing.com/display/TCE/ICF+-+iCrossing+UI+Framework)

## Dependencies

iCF requires the following software be installed on your workstation.

* Node.js - [http://nodejs.org/](http://nodejs.org/)
* bower - [https://github.com/bower/bower](https://github.com/bower/bower)
* Grunt CLI - [https://github.com/gruntjs/grunt-cli](https://github.com/gruntjs/grunt-cli)
* Sass - [http://sass-lang.com/install](http://sass-lang.com/install)
* Compass - [http://compass-style.org/install/](http://compass-style.org/install/)
* FontForge - [http://fontforge.github.io/en-US/downloads/windows/](Windows Version)  [http://fontforge.github.io/en-US/downloads/mac/](Mac Version)

**Optional**

* n - [https://github.com/visionmedia/n](https://github.com/visionmedia/n)
	Node version manager

## Installation

**Step 1.**

Install all required software listed above.


**Step 2. (optional)**

If you already have node and the n version manager installed you can run the following to update node to the latest stable version.

	n stable

**Step 3. (optional)**

If you already have grunt-cli and/or bower installed you can run the following to update the packages to their latests versions.

	npm update -g grunt-cli
	npm update -g bower

**Step 4.**

Install npm packages:

	npm install

ATTENTION WINDOWS USERS - you wont be able to install the grunt-kssnode module.  Please remove the following line from package.json:

"grunt-kssnode": "~0.2.7",

**Step 5.**

Install bower packages:

	bower install

That's it. You should be ready to get your code on!

## Usage

Working on an icf project is easy. Your code goes in ui/:

* Styles are developed as SASS in the scss/ folder. Create a new folder for each section, with a corresponding "main" scss file. For example scss/home/home.scss will become /css/home/home.css. Partials begin with an underscore (ex: _hero.scss) and won't be compiled to a CSS.
* JavaScript is developed using AMD in the js/ folder. Follow a similar convention to styles: main files are name {section_name}.main.js, partials begin with an underscore.
* UI images (for buttons and such) are kept separate from content in the img directory. Use Compass for spriting.
* Content should be kept in the /content directory.

### Building Stuff

#### Development

iCF has a built-in web server with livereload capabilites. Changes to HTML, JavaScript, or Sass files will automatically be rebuild and reloaded. Running this command will start the web server and automatically launch your default browser with the site loaded.

	grunt

#### Production

Run the grunt build command to build the project and copy everything to the **dist/** folder.

	grunt build

### Validating (linting) Code

#### JavaScript and CSS

Run the following command:

	grunt lint

#### JavaScript Only

Run one of the following command:

	grunt jshint:all (includes non-app files like Gruntfile.js)

	or

	grunt jshint:app

#### CSS Only

Run the following command:

	grunt csslint:dev

### Optimization

Code is automatically optimized during a distribution build (grunt build)/

### Generating/Viewing Documentation


#### All Docs (JS and CSS Styleguide)

Running the following command will re-generate all of the documentation and launch the docs in a browser window running at port 9000.

	grunt docs

#### JS Docs

Run the following command:

	grunt jsdocs

#### CSS Styleguide

Run the following command:

	grunt styleguide

