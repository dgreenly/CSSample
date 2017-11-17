exports.config = {
  framework: 'jasmine',
   onPrepare: function() {
    var jasmineReporters = require('path_of_installed_jasmine-reporters-plugin');
    //update proper path, in my case its ('/usr/local/lib/node_modules/jasmine-reporters')
    jasmine.getEnv().addReporter(
        new jasmineReporters.JUnitXmlReporter(null, true, true, '/test/e2e/JasmineReporter')
    );},
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['tracking-first-spec.js'],
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