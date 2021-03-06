/**
 * @file Contains main program
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */
/* global SVG */



(function($) {
  "use strict";

  /**
   * Main program
   */
  SnowProfile.main = function() {
    if (SVG.supported) {
      var i;
      SnowProfile.init();
    } else {
      alert('Your browser does not support SVG, required by the snow profile editor');
    }
  };
  
  // Initialize the live editor one time on document ready 
  var isInitialized;
  $(document).ready(function() {
    if(!isInitialized) 
    {
      SnowProfile.main();
      isInitialized = true;
      
      // Run initialization code for snowpits with already existing information
      // Loop and check for existence of snowpack layers and count them, break when finished
      var layers = 0;
      while (true) {
        // special case for first layer, which exist even on new pits, so we check for a value
        if (layers === 0){
          if ($.trim($("[id^=edit-field-layer-und-" + layers + "-field-bottom-depth-und-0-value]").val()).length) {
            layers++;
          } else {
            break;
          }
        } else {
          // otherwise we check for field existance
          if ($("[id^=edit-field-layer-und-" + layers + "-field-bottom-depth-und-0-value]").length) {
            layers++;
          } else {
            break;
          }
        }
      }
      // Add layers to live graph to match form - first layer added at 0, change later 
      SnowProfile.newLayer(0);
      if (layers > 0){
        // Set up hardness values for first layer 
        SnowProfile.snowLayers[0].handleTouchState(true);
        SnowProfile.snowLayers[0].features().hardness($("[id^=edit-field-layer-und-0-field-hardness-und]").val());
        if ($("[id^=edit-field-layer-und-0-field-use-multiple-hardnesses-und]").is(":checked")) {
            SnowProfile.snowLayers[0].slopeHandleTouchState(true);
            SnowProfile.snowLayers[0].features().hardness2($("[id^=edit-field-layer-und-0-field-hardness2-und]").val());
          }
        SnowProfile.snowLayers[0].draw();
        // Initialize any additional layers 
        for (var i = 1; i < layers; i++) { //not initializing last layer, change later maybe?
          if (SnowProfile.depthRef === 's'){
            SnowProfile.newLayer($("[id^=edit-field-layer-und-" + i + "-field-height-und-0-value]").val());
          }
          else if (SnowProfile.depthRef === 'g'){
            SnowProfile.newLayer(SnowProfile.pitDepth - $("[id^=edit-field-layer-und-" + i + "-field-height-und-0-value]").val());
          }
          SnowProfile.snowLayers[i].handleTouchState(true);
          SnowProfile.snowLayers[i].features().hardness($("[id^=edit-field-layer-und-" + i + "-field-hardness-und]").val());
          if ($("[id^=edit-field-layer-und-" + i + "-field-use-multiple-hardnesses-und]").is(":checked")) {
            SnowProfile.snowLayers[i].slopeHandleTouchState(true);
            SnowProfile.snowLayers[i].features().hardness2($("[id^=edit-field-layer-und-" + i + "-field-hardness2-und]").val());
          }
          SnowProfile.snowLayers[i].draw();
          SnowProfile.snowLayers[i-1].draw();
        }
      }
    }
    
    // Testing form for new layers to add new layers to live profile
    $(document).ajaxComplete(function() {
      // get the next index to test if AJAX resulted in that layer being added to form
      var nextIndex = SnowProfile.snowLayers.length;
      var maxIndex = nextIndex - 1;
      // test for existence of some element in that layer of the form...in this case bottom depth is fine
      if ($("[id^=edit-field-layer-und-" + nextIndex + "-field-bottom-depth-und-0-value]").length) {
        // add new layer if the form updated, use different depth values depending on depthRef
        if (SnowProfile.depthRef === 's'){
          SnowProfile.newLayer($("[id^=edit-field-layer-und-" + maxIndex + "-field-bottom-depth-und-0-value]").val());
        }
        else if (SnowProfile.depthRef === 'g'){
          SnowProfile.newLayer(SnowProfile.pitDepth - $("[id^=edit-field-layer-und-" + maxIndex + "-field-bottom-depth-und-0-value]").val());
        }
      }
    });
  });
  
  
  // Behaviors related to Live Graph Editor
  Drupal.behaviors.sp_livegraph = {
      
    attach: function (context, settings) {
      // Listen for text changes to form and update live graph appropriately
      $('#edit-field-layer', context).once('livegraph_connected', function () {
        $('#edit-field-layer', context).delegate( 'input', 'change', function (event) {
          // Find layer number - starts at 0, corresponds directly to SnowProfile.snowLayers[] index but not to .length
          var layerString = $(this).parents("div[class*='layer_num_']")[0].className.split(" ")[1].split("_")[2];
          var layerNum = parseInt(layerString, 10);
            
          // Top Depth was changed
          if($(this).parents('.field-name-field-height').length)
          {
            // Update layer depth value
            if (SnowProfile.depthRef === "s") 
              SnowProfile.snowLayers[layerNum].depth($(this).val());
            else if (SnowProfile.depthRef === "g")
              SnowProfile.snowLayers[layerNum].depth(SnowProfile.pitDepth - $(this).val());
            
            // Draw
            SnowProfile.snowLayers[layerNum].draw();
            // If not the top layer, redraw the layer above
            if(layerNum != 0){
              SnowProfile.snowLayers[layerNum - 1].draw();
            }
            SnowProfile.layout();
          }
          // Bottom Depth was changed
          if($(this).parents('.field-name-field-bottom-depth').length)
          {
            // If not last layer, update the layer below depth value
            if((layerNum + 1) != SnowProfile.snowLayers.length){
              if (SnowProfile.depthRef === "s") 
                SnowProfile.snowLayers[(layerNum + 1)].depth($(this).val());
              else if (SnowProfile.depthRef === "g")
                SnowProfile.snowLayers[(layerNum + 1)].depth(SnowProfile.pitDepth - $(this).val());
              // Draw
              SnowProfile.snowLayers[(layerNum + 1)].draw();
              SnowProfile.snowLayers[layerNum].draw();
            }
            SnowProfile.layout();
          }
          // Stop Event 
          event.stopPropagation();
        });
        // Hardness was changed
        $('#edit-field-layer', context).delegate( 'select', 'change', function (event) {
          var layerString = $(this).parents("div[class*='layer_num_']")[0].className.split(" ")[1].split("_")[2];
          var layerNum = parseInt(layerString, 10);
          // Primary Hardness Selector
          if($(this).parents('.field-name-field-hardness').length)
          {
            SnowProfile.snowLayers[layerNum].handleTouchState(true);
            SnowProfile.snowLayers[layerNum].features().hardness($(this).val());
            if(!(SnowProfile.snowLayers[layerNum].slopeHandleTouchState())){
              SnowProfile.snowLayers[layerNum].features().hardness2($(this).val());
            }
            SnowProfile.snowLayers[layerNum].draw();
          }
          // Secondary Hardness Selector
          if($(this).parents('.field-name-field-hardness2').length)
          {
            SnowProfile.snowLayers[layerNum].slopeHandleTouchState(true);
            SnowProfile.snowLayers[layerNum].features().hardness2($(this).val());
            SnowProfile.snowLayers[layerNum].draw();
          }
        });
      });
      
    } // end attach
  }; // end behaviors.snowpilot.sp_livegraph    
	
})(jQuery);

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
