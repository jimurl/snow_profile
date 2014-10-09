/**
 * @file Mocha tests for the popups
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

var sw = require('../node_modules/selenium-webdriver'),
  common = require('./lib'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing');
  var SnowProfile = {},
    driver;

// Test the popups
test.describe('Popup:', function() {

  /**
   * Initialize, load the test page and read
   * the static configuration variables from the page JS
   */
  test.before(function() {
    driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build();
    chai.use(chaiWebdriver(driver));

    // Load the test page
    driver.get(common.testURL);

    // Get configuration SnowProfile.Cfg from the page JS
    driver.executeScript('return window.SnowProfile.Cfg')
      .then(function(done) {
        SnowProfile.Cfg = done;
      });
  });  // test.before(

  /**
   * Test suite for initial conditions of a fresh page
   */
  test.describe('page initial conditions:', function() {

    test.before(function() {
      // Load the test page
      driver.get(common.testURL);
    });

    test.it('page should have one <svg> element', function() {
      chai.expect('#snow_profile_diagram svg').dom.to.have.count(1);
    });

    test.it('right initial number of buttons', function() {
      chai.expect('g.snow_profile_button')
        .dom.to.have.count((2 * SnowProfile.Cfg.NUM_INIT_LAYERS) + 1);
    });

    test.it('#snow_profile_popup not displayed', function() {
      driver.findElement(sw.By.id('snow_profile_popup'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
  });  // test.describe('page initial conditions

  /**
   * Test suite for initial conditions of popup
   */
  test.describe('popup initial conditions:', function() {

    test.before(function() {
      // Load the test page
      driver.get(common.testURL);
    });

    test.it('click on edit button creates popup', function() {
      driver.findElement(sw.By.xpath(
        "//*[name()='svg']/*[name()='g']/*[name()='g'][@class='snow_profile_button Edit'][1]"
        ))
        .then(function(elmt) {
          elmt.click();
          });
      driver.findElement(sw.By.id('snow_profile_popup'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    test.it('Primary Grain Shape selector is visible', function() {
      driver.findElement(sw.By.id('snow_profile_primary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    test.it('Primary Grain Subshape selector not visible', function() {
      driver.findElement(sw.By.id('snow_profile_primary_grain_subshape_PP'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    test.it('Secondary Grain Shape selector is not visible', function() {
      driver.findElement(sw.By.id('snow_profile_secondary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    test.it('Secondary Grain Subshape selector not visible', function() {
      driver.findElement(sw.By.id('snow_profile_secondary_grain_subshape_PP'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    test.it('Grain Size selector is visible', function() {
      driver.findElement(sw.By.id('snow_profile_grain_size'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    test.it('Comment field is visible', function() {
      driver.findElement(sw.By.id('snow_profile_comment'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
  });  // test.describe('popup initial conditions

  /**
   * Test suite for "Cancel" button operation of popup
   */
  test.describe('popup "Cancel" button operation:', function() {

    test.before(function() {
      // Load the test page
      driver.get(common.testURL);
    });

    test.it('click on edit button creates popup', function() {
      driver.findElement(sw.By.xpath(
        "//*[name()='svg']/*[name()='g']/*[name()='g'][@class='snow_profile_button Edit'][1]"
        ))
        .then(function(elmt) {
          elmt.click();
          });
      driver.findElement(sw.By.id('snow_profile_popup'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    test.it('Cancel button dismisses popup', function() {
      driver.findElement(sw.By.xpath('//button[.="Cancel"]'))
        .then(function(elmt) {
          elmt.click();
        });
    });
    test.it('#snow_profile_popup not displayed', function() {
      driver.findElement(sw.By.id('snow_profile_popup'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
  });  // test.describe('popup "Cancel" button operation

  /**
   * Test suite for Primary Grain Shape operation of popup
   */
  test.describe('popup Primary Grain Shape operation:', function() {

    test.before(function() {
      // Load the test page
      driver.get(common.testURL);
    });

    test.it('Select Primary Grain Shape PP displays PP icon', function() {
      driver.findElement(sw.By.xpath(
        "//*[name()='svg']/*[name()='g']/*[name()='g'][@class='snow_profile_button Edit'][1]"
        ))
        .then(function(elmt) {
          elmt.click();
          });
      driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
        .then(function(elmt) {
          elmt.click();
        });
      driver.findElement(sw.By.id('snow_profile_primary_grain_subshape_PP'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
      driver.findElement(sw.By.id('snow_profile_secondary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
      driver.findElement(sw.By.xpath('//button[.="Done"]'))
        .then(function(elmt) {
          elmt.click();
        });
      driver.findElement(sw.By.css("g.snow_profile_grain_icons image"))
        .then(function(image) {
          image.getAttribute("alt")
          .then(function(altAttr) {
            chai.expect(altAttr).to.equal("PP");
          });
        });
    });
  }); // test.describe('popup Primary Grain Shape operation

  /**
   * Test suite for Primary Grain Subshape operation of popup
   */
  test.describe('popup Primary Grain Subshape operation:', function() {

    test.before(function() {
      // Load the test page
      driver.get(common.testURL);
    });

    test.it('Select stellar displays PPsd icon', function() {
      driver.findElement(sw.By.xpath(
        "//*[name()='svg']/*[name()='g']/*[name()='g'][@class='snow_profile_button Edit'][1]"
        ))
        .then(function(elmt) {
          elmt.click();
          });
      driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
        .then(function(elmt) {
          elmt.click();
        });
      driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_subshape_PP"]/option[@value="PPsd"]'))
        .then(function(elmt) {
          elmt.click();
        });
      driver.findElement(sw.By.xpath('//button[.="Done"]'))
        .then(function(elmt) {
          elmt.click();
        });
      driver.findElement(sw.By.css("g.snow_profile_grain_icons image"))
        .then(function(image) {
          image.getAttribute("alt")
          .then(function(altAttr) {
            chai.expect(altAttr).to.equal("PPsd");
          });
        });
    });
  }); // test.describe('Select stellar displays PPsd icon

  // When done, kill the browser
  test.after(function() {
    driver.quit();
  }); // test.after(

}); // test.decribe('Snow Profile diagram popups'

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
