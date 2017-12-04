
var loginPage = require('./LoginPageObject.js')

describe('TrackingFirst QA Create Pattern', function() {
  
  it('should go to the login page', function() {
    loginPage.gotoQA();
    loginPage.login('dgreenepic@gmail.com', 'Tet50p@@l');
  });

  it('should create a custom pattern', function() {

    //Just some test code, this page has 89 divs on it
    var divsOnPage = element.all(by.css('div'));
    expect(divsOnPage.count()).toBe(89);

    //Verifying there is only one Campaigns Suite for Bosch Sandbox
     var boschCampaigns = element.all(by.cssContainingText('span', 'Sandbox - Bosch » Campaigns'));
     expect(boschCampaigns.count()).toBe(1);
     boschCampaigns.click();

     //Not sure why this is giving back a count of 14 (Using the class below gives the correct count of 3)
     var boschCreatePattern = element.all(by.cssContainingText('div', 'Create Custom Pattern'));
     expect(boschCreatePattern.count()).toBe(14);

     //Use this to find the css class of title, which is the existing pattern names
     var patternName = element.all(by.cssContainingText('.title', 'DateChange'));
     expect(patternName.count()).toBe(1);

     //Use this to find the css class of title, which is the existing pattern names
     var customPatternButtons = element.all(by.cssContainingText('.button', 'Create Custom Pattern'));
     expect(customPatternButtons.count()).toBe(3);

     var firstCreateCustomPatternButton = element.all(by.cssContainingText('.button', 'Create Custom Pattern')).first();
     browser.driver.sleep(2000);
     firstCreateCustomPatternButton.click();

     browser.driver.sleep(3000);
     browser.switchTo().frame('configure_pattern_frame');
     var customizePatternPage = element.all(by.cssContainingText('h3', 'Customize a Pattern'));
     expect(customizePatternPage.count()).toBe(1);

     element(by.css('.add-custom-elements-button')).click();
     browser.driver.sleep(2000);

     element(by.cssContainingText('li', 'Constant')).click();
     browser.driver.sleep(1000);

     element(by.name('label')).sendKeys('RR_');
     browser.driver.sleep(1000);

     element(by.css('.success')).click();
     browser.driver.sleep(2000);

     element(by.name('pattern-name')).sendKeys('testName1');
     browser.driver.sleep(2000);

    });
    

    // browser.wait(EC.visibilityOf(page.firstIframe),10000).ten(function() {
        // switch to first iframe
    //    browser.driver.switchTo().frame(page.firstIframe.getWebElement());
        // verify content is displayed
    //    expect(page.content.isDisplayed()).toBeTruthy();
    //});


/*

     var customizePatternPage = element.all(by.cssContainingText('div.twelve > h3.main-header-widget', 'Customize a Pattern'));
     expect(customizePatternPage.count()).toBe(4);

     var confirmButton = element.all(by.cssContainingText('.success', 'Confirm'));
     expect(confirmButton.count()).toBe(55);
     */

     //expect(customizePatternPage.getText()).toContain('Customize a Pattern');;

    //<h3 class="main-header-widget">  
        //Customize a Pattern
    //</h3>

     //For some reason it is giving an element not visible error with this call.
     //element(by.cssContainingText('.button', 'Create Custom Pattern')).click();
      
      //var EC = protractor.ExpectedConditions;
      //var patternButton = element(by.cssContainingText('.button', 'Create Custom Pattern'));
      //browser.wait(EC.visibilityOf(patternButton), 10000);
      //patternButton.click();

      

    
     //element(by.findButtonByExactText('Create Custom Pattern')).click();
    
     //browser.driver.sleep(2000);

    //for (var i = 0; i < 1; ++i) {
    //    console.log("in loop");
    //    browser.driver.sleep(1000);
    //    console.log(divsOnPage.get(i).getText());
    //}

    
    //expect(name.getText()).toEqual('Jane Doe');

    //element(by.partialLinkText('Create Custom Pattern')).click();
    
    //element(by.partialLinkText('constant')).click();



  });