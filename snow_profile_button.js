/**
  @file Holds code to define a button object constructed from KineticJS shapes
  to get more control over the size and location of the button than we can
  get by using an HTML <button>button</button>.
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
 */

/* global SnowProfile */

/**
  @classdesc Define a button constructed from KineticJS shapes.
  @constructor
  @param {string} text - Text to appear inside the button.
  KineticJS stage.
 */
SnowProfile.Button = function(text) {
  "use strict";

  var self = this;

  /**
    Define the text of the button
    @type {Object}
    @private
   */
  this.text = new Kinetic.Text({
    x: SnowProfile.BUTTON_X,
    text: text,
    fontFamily: "sans-serif",
    fontSize: 12,
    padding: 4,
    stroke: "#000",
    strokeWidth: 1,
    align: "center"
  });

  /**
    Define a rectangle around the text
    @type {Object}
    @private
   */
  this.rect =  new Kinetic.Rect({
    x: SnowProfile.BUTTON_X,
    width: self.text.getWidth(),
    height: self.text.getHeight(),
    cornerRadius: 4,
    stroke: "#000",
    strokeWidth: 1,
    fill: "#fff"
  });
  this.rect.setOffsetX(this.rect.getWidth() / 2);
  this.text.setOffsetX(this.rect.getWidth() / 2);
  SnowProfile.kineticJSLayer.add(self.rect);
  SnowProfile.kineticJSLayer.add(self.text);
  SnowProfile.stage.draw();

  /**
    Reposition the button on the Y axis
    @param {number} y - New vertical position of the center of the button
                        on the KineticJS stage.
    @FIXME incorporate the Y position calculation above.
   */
  this.setY = function(y) {
    self.text.setY(y);
    self.text.setOffsetY((this.rect.getHeight() / 2) - 2);
    self.rect.setY(y);
    self.rect.setOffsetY(this.rect.getHeight() / 2);
    SnowProfile.stage.draw();
  };

  /**
    Destroy the button
   */
  this.destroy = function() {
    self.text.off('click');
    self.text.destroy();
    self.rect.destroy();
    SnowProfile.stage.draw();
  };

  // Listen for "SnowProfileHideControls" events
  $(document).bind("SnowProfileHideControls", function(evt) {
    self.text.setVisible(false);
    self.rect.setVisible(false);
    SnowProfile.stage.draw();
  });

  // Listen for "SnowProfileShowControls" events
  $(document).bind("SnowProfileShowControls", function(evt) {
    self.text.setVisible(true);
    self.rect.setVisible(true);
    SnowProfile.stage.draw();
  });

  // Listen for mouse clicks on this button, then emit a custom event
  // which identifies which button was clicked.
  this.text.on('click', function(evt) {
    $.event.trigger("SnowProfileButtonClick", {buttonObj: self});
  });
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End: