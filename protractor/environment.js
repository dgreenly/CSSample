module.exports = {
  // The address of a running selenium server.
  //seleniumAddress:
  //  (process.env.SELENIUM_URL || 'http://localhost:4444/wd/hub'),
 
  // Capabilities to be passed to the webdriver instance.
  //capabilities: {
  //  'browserName':
  //    (process.env.TEST_BROWSER_NAME || 'chrome'),
  //  'version':
  //    (process.env.TEST_BROWSER_VERSION || 'ANY')
  //},
 
  baseUrl: 'https://qa.trackingfirst.com',
 
  // These will be made available in browser.params inside tests
  //params: {
  //  "accessToken": "{some-value}"
  //}
};