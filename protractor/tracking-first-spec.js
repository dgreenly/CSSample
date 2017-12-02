
describe('TrackingFirst QA Create Pattern', function() {
  it('should go to the login page', function() {

    expect(browser.getTitle()).toEqual('Tracking First | Report Suites');

    element(by.css('div')).click();

    var divsOnPage = element.all(by.css('div'));
    expect(divsOnPage.count()).toBe(89);

     console.log('something');

     browser.driver.sleep(2000);

    for (var i = 0; i < 1; ++i) {
        console.log("in loop");
        browser.driver.sleep(1000);
        console.log(divsOnPage.get(i).getText());
    }

    
    //expect(name.getText()).toEqual('Jane Doe');

    //element(by.partialLinkText('Create Custom Pattern')).click();
    
    //element(by.partialLinkText('constant')).click();



  });
});