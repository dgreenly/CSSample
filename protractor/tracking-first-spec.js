
var loginPage = require('./LoginPageObject.js')

describe('TrackingFirst QA Create Pattern', function() {
  
  it('should go to the login page', function() {
    loginPage.gotoQA();
    loginPage.login('dgreenepic@gmail.com', 'Tet50p@@l');
  });

  it('should create a custom pattern', function() {

    //Just some test code, this page has divs on it depending on how many reports
    var divsOnPage = element.all(by.css('div'));
    //expect(divsOnPage.count()).toBe(93);

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
    browser.driver.sleep(1000);
    firstCreateCustomPatternButton.click();

    browser.driver.sleep(4000);
    browser.switchTo().frame('configure_pattern_frame');
    var customizePatternPage = element.all(by.cssContainingText('h3', 'Customize a Pattern'));
    expect(customizePatternPage.count()).toBe(1);

    element(by.css('.add-custom-elements-button')).click();
    browser.driver.sleep(1000);

    element(by.cssContainingText('li', 'Constant')).click();
    browser.driver.sleep(1000);

    element(by.name('label')).sendKeys('Auto_Test');
    browser.driver.sleep(1000);

    element(by.css('.success')).click();
    browser.driver.sleep(1000);

    element(by.name('pattern-name')).sendKeys('_TestName2');
    browser.driver.sleep(1000);

    element(by.css('div.pattern-name-control-buttons > .button')).click();
    browser.driver.sleep(7000);

    expect(element(by.cssContainingText('h2', 'Complete the Codes and Commit to Database')));
    //element(by.css('.handsontableInput')).sendKeys('HolyMoly');
    //element(by.css('.dataTable')).sendKeys('HolyMoly'); 

    var classification_table = element(by.id('classification_table'));
    expect(classification_table.isDisplayed()).toEqual(true);

    browser.driver.sleep(1000);

    //Get the classification table and navigate to the cells which are html td tags
    var tabledata = element.all(by.css(".ht_master"));
    var rows =tabledata.all(by.tagName("tr"));
    var cells = rows.all(by.tagName("td"));

    //cells.get(1).click();
    //cells.get(1).click();
    //browser.driver.sleep(1000);

    //var count = 0;
    //var dataToBeEntered = 'BAM';

/*
    for (var i = 0; i <= cells.length; i++) {
        
        console.log(i);
        var cell = cells.get(i);

        browser.driver.sleep(1000);
        console.log(dataToBeEntered);

        browser.actions().
            mouseDown(cells.get(i)).
            sendKeys(dataToBeEntered).
            mouseUp().
            perform();
}*/

/*
    rows.all(by.tagName("td")).then(function(items){

        count++;
        dataToBeEntered += count;

        browser.driver.sleep(1000);

        console.log(count);
        console.log(dataToBeEntered);

        browser.actions().
            mouseDown(items[count]).
            sendKeys(dataToBeEntered).
            //mouseUp().
            perform();

    });
    */

    browser.actions().
    mouseDown(cells.get(1)).
    sendKeys("BAM").
    mouseUp().
    perform();

    browser.actions().
    mouseDown(cells.get(2)).
    sendKeys("BAM2").
    mouseUp().
    perform();

    browser.actions().
    mouseDown(cells.get(3)).
    sendKeys("BAM3").
    mouseUp().
    perform();

    browser.actions().
    mouseDown(cells.get(4)).
    sendKeys("BAM4").
    mouseUp().
    perform();

    browser.actions().
    mouseDown(cells.get(5)).
    sendKeys("").
    mouseUp().
    perform();

     browser.actions().
    mouseDown(cells.get(6)).
    sendKeys("BAM6").
    mouseUp().
    perform();

     browser.actions().
    mouseDown(cells.get(7)).
    sendKeys("BAM7").
    mouseUp().
    perform();

     browser.actions().
    mouseDown(cells.get(8)).
    sendKeys("BAM8").
    mouseUp().
    perform();

     browser.actions().
    mouseDown(cells.get(9)).
    sendKeys("BAM9").
    mouseUp().
    perform();
    

    //This drags the selection from the first cell in the classification table to the 3rd.
    //This code WORKS
    //browser.actions().
    //mouseDown(cells.get(1)).
    //mouseMove(cells.get(3)).
    //mouseUp().
    //perform();

    cells.get(1).click();

    browser.actions().
    dragAndDrop(cells.get(1), cells.get(5)).
    perform();

    element.all(by.cssContainingText('span', 'Submit')).click();
    //browser.driver.sleep(1000);

    browser.wait(function() {
            return element((by.cssContainingText('.popover .yes', 'Yes'))).isDisplayed();
        }, 1000);

    element(by.cssContainingText('.popover .yes', 'Yes')).click();

     browser.wait(function() {
            return element((by.id('success-modal'))).isDisplayed();
        }, 1000);

    expect(element((by.id('success-modal'))).isDisplayed());


    //expect(cells.get(0).getText()).toEqual("something");
    //expect(cells.get(1).getText()).toEqual("something");
    //expect(cells.get(2).getText()).toEqual("something");

/*
    var items = element(by.id('classification_table')).element(by.css('.ht_master')).element(by.css('tbody')).element(by.css('td'));
    var row = element.all(by.repeater('item in items.list')).first();
    var cells = row.all(by.tagName('td'));

    var cellTexts = cells.map(function (elm) {
        return elm.getText();
    });
*/
    //expect(cellTexts).toEqual(["The first text", "The second text", "The third text"]);


    //var allTableDataElements = element.all(by.id('classification_table')).element(by.css('.ht_master')).element(by.css('tbody')).element(by.css('td')).get(0);
    //let allTableDataElements = element(by.id('classification_table')).$$$$$$$('td');
    //allTableDataElements.get(0).click();
    browser.driver.sleep(4000);

    //expect(allTableDataElements.count()).toBe(99);
    //allTableDataElements.get(1).click();
    //allTableDataElements.get(1).sendKeys('BAM!!!');
    //expect(allTableDataElements.count()).toBe(88);

    //element(by.css('.htAutocomplete')).sendKeys('HolyMoly');

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