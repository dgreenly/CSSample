var env = require('./environment.js');

exports.config = {
  framework: 'jasmine',

   //onPrepare function is used for elements that every .js file that will 
   //get run will need.  The Login functionality needs to be put in here
   onPrepare: function() {

      //baseUrl: 'https://qa.trackingfirst.com', //env.baseUrl + '/ng1/',

      //This is a custom function for finding buttons with text that is 
      //passed in.     
      by.addLocator('findButtonByExactText',
          function(buttonText, opt_parentElement, opt_rootSelector) {
        // This function will be serialized as a string and will execute in the
        // browser. The first argument is the text for the button. The second
        // argument is the parent element, if any.
        var using = opt_parentElement || document,
            buttons = using.querySelectorAll('.btn'); //This works great

        // Return an array of buttons with the text.
        return Array.prototype.filter.call(buttons, function(button) {
          return button.textContent === buttonText;
        });
      });

      //Run the login functionality here so that all the subsequest test scripts
      //do not need to do this everytime to get in.
      browser.waitForAngularEnabled(false);
      browser.get(env.baseUrl);

      //element(by.model('todoList.todoText')).sendKeys('write first protractor test');

      //expect(browser.getTitle()).toEqual('Login | Tracking First');
      element(by.id('username')).sendKeys('dgreenepic@gmail.com');
      element(by.id('password')).sendKeys('Tet50p@@l');
      element(by.id('_submit')).click();

      


    //var jasmineReporters = require('path_of_installed_jasmine-reporters-plugin');
    //update proper path, in my case its ('/usr/local/lib/node_modules/jasmine-reporters')
    //jasmine.getEnv().addReporter(
    //    new jasmineReporters.JUnitXmlReporter(null, true, true, '/test/e2e/JasmineReporter')
    //);
  },
  seleniumAddress: 'http://localhost:4444/wd/hub',
  //Specs are going to execute in alpha order.  Look at the Suites functionality in protractor.
  //Also Look at this for login for all specs/suites.
  //https://stackoverflow.com/questions/40642536/protractor-executing-login-scripts-prior-to-launching-my-test-specs
  specs: ['tracking-first-spec.js'],
  //specs: ['tf-girona-spec.js'],
  capabilities: {
	browserName: 'chrome',
	chromeOptions: {
	     args: [ "--headless", "--disable-gpu", "--window-size=800,600" ]
	   }
  },



  //Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
      onComplete: null,
      isVerbose: false,
      showColors: true,
      includeStackTrace: true
  }
/*
capabilities: {
  browserName: 'firefox',
  
  'moz:firefoxOptions': {
     args: [ "--headless" ]
   }
}*/


  //,
   //multiCapabilities: [{
   // browserName: 'firefox'
  //}, {
  //  browserName: 'chrome'
  //}]

/*
  baseUrl: env.baseUrl + '/ng1/',

  onPrepare: function() {
    browser.driver.get(env.baseUrl + '/ng1/login.html');

    browser.driver.findElement(by.id('username')).sendKeys('Jane');
    browser.driver.findElement(by.id('password')).sendKeys('1234');
    browser.driver.findElement(by.id('clickme')).click();

    // Login takes some time, so wait until it's done.
    // For the test app's login, we know it's done when it redirects to
    // index.html.
    return browser.driver.wait(function() {
      return browser.driver.getCurrentUrl().then(function(url) {
        return /index/.test(url);
      });
    }, 10000);
  }

*/

};