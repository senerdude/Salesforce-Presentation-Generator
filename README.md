# Salesforce Presentation Generator

With this framework you can easily develope/generate presentations for Salesforce and Veeva. 

- Debug/Preview mode generate working web version of slides. 
- Automatically optimize, generate slides with screenshots and zip them for ready to upload.
- Optionally optimize all images

<h1>Requirements/Installation for MacOSX</h1>
<p>NodeJS, PhantomJS, Brew, imagemagick, graphicsmagick</p>

- Install NodeJS : https://nodejs.org/en/
- Install PhantomJS : http://phantomjs.org/
- Install Brew
	
	Note : If your MAC OSX Version is Yosemite (10.10.5) then follow these instructions; https://danielmiessler.com/blog/installing-homebrew-yosemite/

	    $ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	    $ ruby doctor
	    
- Install imagemagick and graphicsmagick.

	    $ brew install imagemagick
	    $ brew install graphicsmagick
	    
- Install Required NPM Packages

	    $ npm install
	    
<h1>Configuration</h1>

Edit gulpfile.js properties

	    * Edit Project Properties
	    * Edit Hidden Presentations if exist or left as emty array.
	    * Edit Scripts array.

<h1>Commands</h1>
	    
	    * Debug Mode : gulp
	    * Build Project : gulp build
	    * Optimize & Build project : gulp build-optimize
	    * Delete Output files : gulp clean
