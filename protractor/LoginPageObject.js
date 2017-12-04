'use strict';  
  
module.exports = {  
      
    gotoQA: function() {  
        browser.waitForAngularEnabled(false);
        browser.get('https://qa.trackingfirst.com'); //overrides baseURL  
    },  

    gotoStaging: function() {  
        browser.get('https://stage.trackingfirst.com'); //overrides baseURL  
        browser.waitForAngular(false);  
    },  
      
    login: function(userId, password) {  
        element(by.id('username')).sendKeys(userId);
        element(by.id('password')).sendKeys(password);
        element(by.id('_submit')).click();
        expect(browser.getTitle()).toEqual('Tracking First | Report Suites');
    }  
};