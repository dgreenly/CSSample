
describe('Girona Hello World Test', function() {
  it('should got to the admin page', function() {

    //By Default Protractor waits for Angular to load, but we are not an angular app
    //So we simply have to turn off the timeout waiting for Angular.
    browser.waitForAngularEnabled(false);
    browser.get('http://192.168.99.100/');

    //Protactor API Cheatsheet
    //https://gist.github.com/javierarques/0c4c817d6c77b0877fda
    expect(browser.getTitle()).toEqual('TrackingFirst');

    //element(by.partialLinkText('Link')).click();
    element(by.findButtonByExactText('Link To Admin (replace with authentication)')).click();
    expect(browser.getTitle()).toEqual('TrackingFirst');


    element(by.findButtonByExactText('Get Numbers')).click();

    //element(by.partialLinkText('Get Numbers')).click();
    //Need to give the button press some time. 
    //There are ways to wait for the specific item to show up first
    browser.driver.sleep(1000);

    //expect(row.element(by.css('li')).getAttribute('src').getText()).toMatch(/someImg.png/);//fail with null
    var listsOnPage = element.all(by.css('li'));
    expect(listsOnPage.count()).toBe(8);

    var one = element.all(by.cssContainingText('li', '1'));
    var two = element.all(by.cssContainingText('li', '2'));
    var three = element.all(by.cssContainingText('li', '3'));
    var four = element.all(by.cssContainingText('li', '4'));
    var five = element.all(by.cssContainingText('li', '5'));

    expect(one.count()).toBe(1);
    expect(two.count()).toBe(1);
    expect(three.count()).toBe(1);
    expect(four.count()).toBe(1);
    expect(five.count()).toBe(1);

    element(by.partialLinkText('Other')).click();
    expect(browser.getTitle()).toEqual('TrackingFirst');
    //expect(row.element(by.css('div')).getAttribute('class').getText()).toMatch(/vueAdminOtherView/);
    //expect(textOnPage.count()).toBe(8);



    //var foo = element(by.id('foo'));
    //expect(foo.getText()).toEqual('Inner text');
    //expect(element(by.text('4')).isPresent()).toBe(true);


    //element(by.id('username')).sendKeys('dgreenepic@gmail.com');
    //element(by.id('password')).sendKeys('');
    //element(by.id('_submit')).click();

    //expect(browser.getTitle()).toEqual('Tracking First | Report Suites');

    //element(by.css('[value="add"]')).click();

    //var todoList = element.all(by.repeater('todo in todoList.todos'));
    //expect(todoList.count()).toEqual(3);
    //expect(todoList.get(2).getText()).toEqual('write first protractor test');

    // You wrote your first test, cross it off the list
    //todoList.get(2).element(by.css('input')).click();
    //var completedAmount = element.all(by.css('.done-true'));
    //expect(completedAmount.count()).toEqual(2);
  });
});