/**
 * @file Mocha tests for the handles
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

var sw = require('../node_modules/selenium-webdriver'),
  com = require('./lib'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing');
  var SnowProfile = {},
    diagramLoc,
    driver;

// Test the handles
test.describe('Handles:', function() {

  test.before(function() {
    driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build();
    chai.use(chaiWebdriver(driver));

    // Load the test page
    driver.get(com.testURL);

    // Get configuration SnowProfile.Cfg from the page JS
    driver.executeScript('return window.SnowProfile.Cfg')
      .then(function(done) {
        SnowProfile.Cfg = done;
      });

    // Get location of the diagram
    // @TODO replace references to getLocation()
    driver.findElement(
      sw.By.css('#snow_profile_diagram svg'))
      .getLocation()
      .then(function(elmt) {
        diagramLoc = elmt;
      });

  });  // test.before(

  /**
   * Test suite for initial conditions of a fresh page
   */
  test.describe('handles starting conditions', function() {

    test.before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    test.it('page should have 3 handles', function() {
      chai.expect('rect.snow_profile_handle').dom.to.have.count(3);
    });

    // All handles should start out at HANDLE_INIT_X
    // @TODO replace references to getLocation()
    test.it('handles should start at HANDLE_INIT_X', function() {
      driver.findElements(
        sw.By.css('rect.snow_profile_handle'))
        .then(function(done) {
          done.forEach(function(promise) {
            promise.getLocation().then(function(done) {
              chai.expect(done.x).to.equal(SnowProfile.Cfg.HANDLE_INIT_X +
                diagramLoc.x);
            });
          });
        });
      });

  });

  /**
   * Test handle drag and drop operation
   */
  test.describe('drag and drop handles', function() {

    test.before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    // Move handles around, test where they end up
    test.it('dragNdrop top handle to hardness 4F', function() {
      com.moveHandle(sw, driver, 0, 0, '4F');
      com.testHandle(sw, driver, chai, 0, 0, '4F');
    });
    test.it('dragNdrop second handle to depth 10, hardness 1F', function() {
      com.moveHandle(sw, driver, 1, 10, '1F');
      com.testHandle(sw, driver, chai, 1, 10, '1F');
    });
    test.it('dragNdrop third handle to depth 20, hardness P', function() {
      com.moveHandle(sw, driver, 2, 20, 'P');
      com.testHandle(sw, driver, chai, 2, 20, 'P');
    });
    test.it('dragNdrop second handle to depth 30, hardness 1F', function() {
      com.moveHandle(sw, driver, 1, 30, '1F');
      com.testHandle(sw, driver, chai, 1, 19.8, '1F');
    });
    test.it('dragNdrop second handle to depth 0, hardness 1F', function() {
      com.moveHandle(sw, driver, 1, 0, '1F');
      com.testHandle(sw, driver, chai, 1, 0, '1F');
    });
    test.it('dragNdrop second handle to depth 10, hardness F-', function() {
      com.moveHandle(sw, driver, 1, 10, 'F-');
      com.testHandle(sw, driver, chai, 1, 10, 'F-');
    });
    test.it('dragNdrop second handle to depth 10, hardness I', function() {
      com.moveHandle(sw, driver, 1, 10, 'I');
      com.testHandle(sw, driver, chai, 1, 10, 'I');
    });
    test.it('create a fourth layer at depth 40, hardness K', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 3, 40, 'K');
      com.testHandle(sw, driver, chai, 3, 40, 'K');
    });
  }); // test.describe('drag and drop handles',

  // When done, kill the browser
  test.after(function() {
    driver.quit();
  }); // test.after(

}); // test.decribe('Snow Profile diagram handles'

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
