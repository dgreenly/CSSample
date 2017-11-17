
describe('TrackingFirst QA Test 1', function() {
  it('should got to the login page', function() {

    //By Default Protractor waits for Angular to load, but we are not an angular app
    //So we simply have to turn off the timeout waiting for Angular.
    browser.waitForAngularEnabled(false);
    browser.get('https://qa.trackingfirst.com');

    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');

    expect(browser.getTitle()).toEqual('Login | Tracking First');
    element(by.id('username')).sendKeys('dgreenepic@gmail.com');
    element(by.id('password')).sendKeys('Tet50p@@l');
    element(by.id('_submit')).click();

    expect(browser.getTitle()).toEqual('Tracking First | Report Suites');

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