/**
  @file Defines the namespace and configuration for the snow profile editor.
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
  @namespace SnowProfile
 */

var SnowProfile = {};

/**
 * Layout of the snow profile Kinetic stage:
 *
 *       | Top Labels
 * ___________________________________________________________________
 *       |             |          |        |       |
 * Depth |             |          |        |       |
 * Label | Graph       | Controls | Grains | Water | Comment
 *       |             |          |        |       |
 *____________________________________________________________________
 *       | Hardness    |
 *       | Label       |
 */

(function() {
  "use strict";

  SnowProfile = {

   /**
    * Minimum depth that can be set by the user (cm)
    * @type {number}
    */
   MIN_SETTABLE_DEPTH: 50,

    /**
     * Horizontal width in pixels of the depth (vertical) axis label.
     * @const
     */
    DEPTH_LABEL_WD: 70,

    /**
     * Width in pixels available for plotting data.
     * @const
     */
    GRAPH_WIDTH: 350,

    /**
      Width in pixels of the area used by buttons and
      connectors (diagonal lines).
      @const
     */
    CTRLS_WD: 200,

    /**
      Width in pixels of the area used by snow grain description
      @const
     */
    GRAIN_WD: 180,

    /**
      Width in pixels of the area used by snow liquid water description
      @const
     */
    LWC_WD: 70,

    /**
      Width in pixels of the area used by snow layer comment
      @const
     */
    COMMENT_WD: 200,

    /**
     * Vertical height in pixels of the temperature (horizontal) axis label.
     * @const
     */
    TOP_LABEL_HT: 40,

    /**
     * Height in pixels available for plotting data.
     * @const
     */
    GRAPH_HEIGHT: 500,

    /**
      Height in pixels of the text description area for one snow layer
      @const
     */
    DESCR_HEIGHT: 40,

    /**
     * Vertical height in pixels of the hardness (horizontal) axis label.
     * @const
     */
    HARD_LABEL_HT: 40,

    /**
     * Size in pixels of the handle square
     * @const
     */
    HANDLE_SIZE: 11,

    /**
     * Color of the labels and axis lines
     * @const
     */
     LABEL_COLOR: '#003390',

    /**
     * Color of the chart background grid
     * @const
     */
    GRID_COLOR: '#69768C',

    /**
      Maximum snow depth in cm that can be plotted on the graph.

      Snow depth in cm that corresponds to GRAPH_HEIGHT pixels.
      Zero depth always corresponds to zero graph pixels.
      FIXME: we need the concept to calculate ratio of pixels/cm but
        should find a better name for it.
      @const
     */
    MAX_DEPTH:  200,

    /**
      Depth increment in cm to allow when inserting a layer above
      or below another layer.
      @const
      @type {number}
     */
    INS_INCR: 5,

    /**
     * Width in pixels of the image to be generated
     * @const
     * @type {number}
     */
    IMAGE_WD: 800,

    /**
     * KineticJS stage object for the whole program
     */
    stage: null,

    /**
     * KineticJS drawing layer.
     */
    kineticJSLayer: null,

    /**
      Snow stratigraphy snow layers.

      The Layer objects are referenced by this array which is ordered by
      the depth of the layer.  The top layer(depth == 0) is always referenced
      by snowLayers[0].  When a Layer object is created or removed, it is
      spliced into the array so that the order of depths is maintained, and
      the indexes increment by 1.  When the depth of a layer is changed by the
      user, the new depth is constrained to be less than the depth of the layer
      above and more than the depth of the layer below in the snow pack.
      @type {SnowProfile.Layer[]}
     */
    snowLayers: [],

    /**
      Make the handle visible if it has not been touched.
      @type {boolean}
     */
    showHandle: null,

    /**
      Previous state of showHandle.
      @type {boolean}
     */
    oldShowHandle: null,

    /**
     * @summary Total depth of the snow pack (cm)
     * @desc Distance in cm from the snow surface to the ground, as measured
     *   with a calibrated probe or by digging to the ground.  Null
     *   if this distance is not known.
     * @type {?number}
     */
    totalDepth: null,

    /**
     * @summary Pit depth (cm)
     * @desc Depth of the pit in cm from the snow surface.  Must
     *   be an integer >= 30.  Default 200.
     * @type {!number}
     */
    pitDepth: 200,

    /**
     * @summary Depth reference (snow surface or ground)
     * @desc  A single letter indicating whether snow depth is referenced
     *   to the snow surface ("s") or ground ("g").  Must be one or the
     *   other.  Default is "s".  Ground reference may be used only if
     *   the value of total snow depth (totalDepth) is known.
     * @type {!string}
     */
    depthRef: "s",

    /**
      Table of CAAML grain shapes.
      Property name is the code value to store.
      Property value is the humanly-readable description.
      @type {Object}
      @const
     */
    CAAML_SHAPE: {
      PP: {
        text: "Precipitation Particles",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABPSURBVCiRY/j//z8DOm" +
            "ZgYEhgYGD4z8DAkIFNnomBDDDINbEwMjJmYBG3hNK2jIyMGJKMDJBQIgk" +
            "wMjAw4LIpjoGBYRkDA8NhDNnReIIAAEJwQ7TYUolnAAAAAElFTkSuQmCC",
          height: 13,
          width: 13
        }
      },
      MM: {
        text: "Machine Made",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAN/wAADf8B9IqyiQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADcSURBVBiVbdGhSsNRGI" +
            "bx37yBsTBYGsgYMqfBbFrxBhZN3oOgyeSQgU0Ek8kgGr0ILTIsWozCYFj" +
            "GwKbH4LvxDx444cDzfrzfc5RSlFKggTGeMMcjzlBfMQEHmAa6wynuscAH" +
            "dsNpYpaJbfQwRBfreE6gDpeZ0MYIPyj4xjE6+EolE9xiO9A1+rhJoIuH7" +
            "GCBExwE7qRfP+8hzjFfwzs28eLvHNVqtR4OA79iA29wVel8EWB5R5XOY2" +
            "jhs2JjB/vYqtiYorH0vJfAf55nGKw+JYFWKk0CTaK1uWR+Aai+ZHz0ufc" +
            "/AAAAAElFTkSuQmCC",
          height: 13,
          width: 13
        }
      },
      DF: {
        text: "Decomposing/Fragmented",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABMAAAASCAYAAAC5DOVpAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAV6wAAFesBBGcFMAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADxSURBVDiNpdKrSkRRFA" +
            "bgzwsKIngBMRgmGAwWo+bp+gD6AOIDCD6AYJ9gFqwG44g2g8lgESyCQbB" +
            "PGBh0WfaRrc7tnBN2Wj/fgrV/EaHOww7usFwXaqKDwE0daA/dBL1jsyp0" +
            "gF6CXrEeEapAR/hK0DPWfmYloZOEBB6x8mteAjrLoHss/MuMgUziPIPam" +
            "OubHQFN4zKDrjAzMD8EmsV1Bl1gaujyAdB8anUBtTAx8iR9oCU8ZNDp2J" +
            "/0B1rFUwYdl6pOBjXwkpBPHJYudII28JagHvbLQsmxhY8EdbFbBSqwdoI" +
            "6aFaFCmwRt9iuA0WEb9vULhTE9LrXAAAAAElFTkSuQmCC",
          height: 18,
          width: 19
        }
      },
      RG: {
        text: "Rounded Grains",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAATEQAAExEBOWB/8AAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACASURBVCiRldLRCcJAEE" +
            "XRk00LQsCqtIOsJQYVDPphAeki2Mb6swkRMWYH3t+9zMA8KSVTENHhldO" +
            "h/WAy2OCG9CNX7JZCvwLPUmbFDfCUNuBg+xxhLNgwBtQFG+qAoUAYAi4F" +
            "whkCnv7ff0c1/WGPxwrco5kfl6UKJ9/ViMtqvAGD/nbwFTl/UgAAAABJR" +
            "U5ErkJggg==",
          height: 12,
          width: 12
        }
      },
      FC: {
        text: "Faceted Crystals",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABPSURBVCiR7dExCoBAEE" +
            "PRt2IlXsPK+9/BUrDyImI3Fq61O42VgSFNPhNIQUiqr35ib8hPGNRPa0R" +
            "4OyyILlsNfuhzqLjHPbA15GeMD5TSBUq1JZC/MAMeAAAAAElFTkSuQmCC",
          height: 13,
          width: 13
        }
      },
      DH: {
        text: "Depth Hoar",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAStQAAErUB1jM0ZgAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD1SURBVDiNndMvS0NRGA" +
            "fgZ0GYCoaloRhMi6sGP8NA2wxm4/JAEJtFWF9RMBmXF8XgJ1icmFemIoL" +
            "O8hPm2P9wuLzv+zvPgXvuNRqNzFu4WZhZANQxQn0tBEX0g/RRXAdpBvhb" +
            "zZUQlDHED87zHKK8CtLO6bep71K3l0JQxTfesJveHt7Try6DdHPqxUT/M" +
            "v3uXAS1BF+wOTHbwmvmtakINtBL6HTGuzrLvIeNaUgjgScUZiAFPCfX+I" +
            "eghEGu8nDBV3wUZIDSONLK4H7Rf5L8Q/Kt1Cr4wgf2l0QO8Jl9FehEvVo" +
            "GGIOus68DJ3jE9orITi7h+BfPSUFU8uzJMwAAAABJRU5ErkJggg==",
          height: 17,
          width: 16
        }
      },
      SH: {
        text: "Surface Hoar",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAStQAAErUB1jM0ZgAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEDSURBVDiNldIxTkJBFI" +
            "Xhj4qgiSUJGgsXQENlYa0LoKOwdgVUmBg7K2sqoomVS6Aimli4BhrjBkj" +
            "UWBjG5j6C8B6MxS3mnHP/ezMzcIYn7KaU5Bb28IxTGCPh+p+Qm+gbQxs/" +
            "+MJhJuAI39HXLsRhUB8yIY+RH6aUFGITM8xxvAVwEoAZmgtImP0wX1CrA" +
            "NTwGrn+Ql8K1DGNQK8Cch7+FPU1SIS6EXpDY8XbwXv43T9eybRJBC9X9K" +
            "vQJ2s9JZBOXPAH9kM7wGfona2QaBrF1Ls438d5VJqvgLRikzkuljZrZUM" +
            "CNIjpRQ0qsxsgjXil0tfKggSot+nf5EJquK36wUX9Amy9O8ZyCXfaAAAA" +
            "AElFTkSuQmCC",
          height: 16,
          width: 17
        }
      },
      MF: {
        text: "Melt Forms",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAATOQAAEzkBj8JWAQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEESURBVCiRndMtS4RBFA" +
            "Xg532DzSDoyiaTitEPxGLS4oLFtn9C8B+Y/RfmBUEMIiIGixi0KWgyycq" +
            "Cot1rmVlGcJfVC5fh3jnnzJmvKiKUUVVVC1tYxQLucY2TiLj4AY4ISaCB" +
            "DmJIHmKiz0nEJroJ8IpdLGMcK9hDL80/Z4FMPk4TZ5jMymViGpfZQd7uT" +
            "mp0BxELgSbeEn6jTocD+xHRMyQi4gUHqdyusZSKq2HEIjJuDT7xhbFhlg" +
            "vrU8n2R40nVJgbceX5ND7UuEvF+ojkjLuBtv+ddis3z/3tnjvlI5nBu9F" +
            "eWBeNPrkQyA4G5TGamVP98qva2MQiZvGIW5xGxFGJ/QaoLuxwkopfZwAA" +
            "AABJRU5ErkJggg==",
          height: 15,
          width: 15
        }
      },
      IF: {
        text: "Ice Formations",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAAICAYAAAAiJnXPAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAYSURBVBiVY2RgYPjPQC" +
            "JgIlXDqCZKNQEAsVMBD3cM+XcAAAAASUVORK5CYII=",
          height: 8,
          width: 13
        }
      }
    },

    /**
      Table of CAAML sub-shapes
      @type {Object}
      @const
     */
    CAAML_SUBSHAPE: {
      PP: {
        PPco: {
          text: "Prismatic",
          icon: ""
        },
        PPnd:{
          text: "Needles",
          icon: ""
        },
        PPpl: {
          text: "Plates",
          icon: ""
        },
        PPsd: {
          text: "Stellars",
          icon: ""
        },
        PPir: {
          text: "Irregular",
          icon: ""
        },
        PPgp: {
          text: "Graupel",
          icon: ""
        },
        PPhl: {
          text: "Hail",
          icon: ""
        },
        PPip: {
          text: "Ice pellets",
          icon: ""
        },
        PPrm: {
          text: "Rimed",
          icon: ""
        }
      },
      MM: {
        MMrp: {
          text: "Round polycrystalline",
          icon: ""
        },
        MMci: {
          text: "Crushed ice",
          icon: ""
        }
      },
      DF: {
        DFdc: {
          text: "Partly decomposed",
          icon: ""
        },
        DFbk: {
          text: "Wind-broken",
          icon: ""
        }
      },
      RG: {
        RGsr: {
          text: "Small rounded",
          icon: ""
        },
        RGlr: {
          text: "Large rounded",
          icon: ""
        },
        RGwp: {
          text: "Wind packed",
          icon: ""
        },
        RGxf: {
          text: "Faceted rounded",
          icon: ""
        }
      },
      FC: {
        FCso: {
          text: "Solid faceted",
          icon: ""
        },
        FCsf: {
          text: "Near surface",
          icon: ""
        },
        FCxr: {
          text: "Rounded faceted",
          icon: ""
        }
      },
      DH: {
        DHcp: {
          text: "Hollow cups",
          icon: ""
        },
        DHpr: {
          text: "Hollow prisms",
          icon: ""
        },
        DHch: {
          text: "Chains of depth hoar",
          icon: ""
        },
        DHla: {
          text: "Large striated",
          icon: ""
        },
        DHxr: {
          text: "Rounding depth hoar",
          icon: ""
        }
      },
      SH: {
        SHsu: {
          text: "Surface hoar",
          icon: ""
        },
        SHcv: {
          text: "Cavity hoar",
          icon: ""
        },
        SHxr: {
          text: "Rounding surface hoar",
          icon: ""
        }
      },
      MF: {
        MFcl: {
          text: "Clustered rounded",
          icon: ""
        },
        MFpc: {
          text: "Rounded polycrystals",
          icon: ""
        },
        MFsl: {
          text: "Slush",
          icon: ""
        },
        MFcr: {
          text: "Melt-freeze crust",
          icon: ""
        }
      },
      IF: {
        IFil: {
          text: "Ice layer",
          icon: ""
        },
        IFic: {
          text: "Ice column",
          icon: ""
        },
        IFbi: {
          text: "Basal ice",
          icon: ""
        },
        IFrc: {
          text: "Rain crust",
          icon: ""
        },
        IFsc: {
          text: "Sun crust",
          icon: ""
        }
      }
    },

    /**
      Table of CAAML grain sizes.
      Property name is the code value to store
      Property value is the humanly-readable description
      @type {Object}
      @const
     */
    CAAML_SIZE: {
      "very fine": "< 0.2 mm",
      "fine": "0.2 - 0.5 mm",
      "medium": "0.5 - 1.0 mm",
      "coarse": "1.0 - 2.0 mm",
      "very coarse": "2.0 - 5.0 mm",
      "extreme": "> 5.0 mm"
    },

    /**
      Table of CAAML liquid water contents.
      Property name is the code value to store
      Property value is the humanly-readable description
      @type {Object}
      @const
     */
    CAAML_LWC: {
      D: "Dry",
      M: "Moist",
      W: "Wet",
      V: "Very Wet",
      S: "Soaked"
    }
  }; // SnowProfile = {

  /**
    Central x of the data plotting area.
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.GRAPH_CENTER_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    (SnowProfile.GRAPH_WIDTH / 2);

  /**
    Central Y of the data plotting area.
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.GRAPH_CENTER_Y = SnowProfile.TOP_LABEL_HT + 1 +
    (SnowProfile.GRAPH_HEIGHT / 2);

  /**
    Maximum x value allowed for a handle (hardness 'I').
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.HANDLE_MAX_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH - (SnowProfile.HANDLE_SIZE / 2);

  /**
    Minimum x value allowed for a handle (hardness 'F-').
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.HANDLE_MIN_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    (SnowProfile.HANDLE_SIZE / 2);

  /**
   * Minimum Y value allowed for a handle (top of graph area)
   * @const
     @memberof SnowProfile
   */
  SnowProfile.HANDLE_MIN_Y = SnowProfile.TOP_LABEL_HT + 1;

  /**
    Get the Y axis value for the line below the description of a layer.
    @param {number} i Index of the layer.
    @returns {number} Y axis value of the line below the ith layer.
   */
  SnowProfile.lineBelowY = function(i) {
    return SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2) +
      ((i + 1) * SnowProfile.DESCR_HEIGHT);
  };

  /**
    Width in pixels of one hardness band in the CAAML_HARD table

    Calculation depends on knowing there are 21 entries in the table
    @const
    @memberof SnowProfile
   */
  SnowProfile.HARD_BAND_WD = (SnowProfile.GRAPH_WIDTH -
    SnowProfile.HANDLE_SIZE) / 20;

  /**
   Table of CAAML hardness values (HardnessBaseEnumType).

   + CAAML_HARD[i][0] is the alpha string defined by CAAML 5.0.
   + CAAML_HARD[i][1] is a boolean; whether to draw a line here.
   + CAAML_HARD[i][2] minimum x value having this hardness.  The
     maximum x value for this hardness is one less than the minimum for
     the next row.
     @const
     @type {string[]}
     @memberof SnowProfile
   */
  SnowProfile.CAAML_HARD = [
    ['F-',    0, SnowProfile.HANDLE_MIN_X],
    ['F',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 0.5],
    ['F+',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 1.5],
    ['F-4F',  0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 2.5],
    ['4F-',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 3.5],
    ['4F',    1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 4.5],
    ['4F+',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 5.5],
    ['4F-1F', 0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 6.5],
    ['1F-',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 7.5],
    ['1F',    1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 8.5],
    ['1F+',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 9.5],
    ['1F-P',  0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 10.5],
    ['P-',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 11.5],
    ['P',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 12.5],
    ['P+',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 13.5],
    ['P-K',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 14.5],
    ['K-',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 15.5],
    ['K',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 16.5],
    ['K+',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 17.5],
    ['K-I',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 18.5],
    ['I',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 19.5]
  ];

  /**
    Vertical height in pixels of the KineticJS stage
    @const
    @memberof SnowProfile
   */
   SnowProfile.STAGE_HT =  SnowProfile.TOP_LABEL_HT + 1 +
     SnowProfile.GRAPH_HEIGHT + 1 + SnowProfile.HARD_LABEL_HT;

  /**
    Horizontal width in pixels of the KineticJS stage
    @const
    @memberof SnowProfile
   */
   SnowProfile.STAGE_WD = SnowProfile.DEPTH_LABEL_WD + 1 +
     SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD + 1 +
     SnowProfile.GRAIN_WD + 1 + SnowProfile.LWC_WD + 1 +
     SnowProfile.COMMENT_WD;

  /**
    X position of the center line of the buttons in the control area
   */
  SnowProfile.BUTTON_X =  SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 150;

  /**
    X position of the left edge of the Grains text area
    @const
    @memberof SnowProfile
   */
  SnowProfile.GRAIN_LEFT = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD;

  /**
    X position of the left edge of the Water text area
    @const
    @memberof SnowProfile
   */
  SnowProfile.LWC_LEFT = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD +
    SnowProfile.GRAIN_WD;

  /**
    X position of the left edge of the Comment text area
    @const
    @memberof SnowProfile
   */
  SnowProfile.COMMENT_LEFT = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD +
    SnowProfile.GRAIN_WD + SnowProfile.LWC_WD;

  /**
    Depth scale in pixels per cm
    @const
    @memberof SnowProfile
   */
  SnowProfile.DEPTH_SCALE = SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH;

  /**
    Maximum Y value allowed for any handle (bottom of graph area)
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.handleMaxY = SnowProfile.TOP_LABEL_HT + 1 +
    (SnowProfile.DEPTH_SCALE * SnowProfile.pitDepth);

  /**
    Recalculate the Y axis positions of all KineticJS objects whose position
    depends on the index of the layer in the snowpack.
   */
  SnowProfile.setIndexPositions = function() {
    var i,
      numLayers = SnowProfile.snowLayers.length;

    for (i = 0; i < numLayers; i++) {
      SnowProfile.snowLayers[i].setIndexPosition();
    }
  };

  /**
   Convert a depth in cm to a Y axis position.
   @param {number} depth Depth from the snow surface in cm.
   @returns {number} Y position.
   */
  SnowProfile.depth2y = function(depthArg) {
    return (depthArg * (SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH)) +
      SnowProfile.HANDLE_MIN_Y;
  };

  /**
   * Initialize the container and the grid layer
   */
  SnowProfile.init = function() {
    var i, numLayers;

    SnowProfile.stage = new Kinetic.Stage({
      container: 'snow_profile_diagram',
      width: SnowProfile.STAGE_WD,
      height: SnowProfile.STAGE_HT
    });

    // Add the reference grid to it
    SnowProfile.stage.add(new SnowProfile.Grid());

    // Create the KineticJS layer
    SnowProfile.kineticJSLayer = new Kinetic.Layer();

    // Draw a horizontal line across the top of graph and description areas
    SnowProfile.kineticJSLayer.add(new Kinetic.Line({
      points: [SnowProfile.DEPTH_LABEL_WD + 1,
        SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2),
        SnowProfile.STAGE_WD - 3,
        SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2)],
      stroke: SnowProfile.GRID_COLOR,
      strokeWidth: 1
    }));

    // Add an icon to see if it works
    // var imageObj = new Image();
    // imageObj.onload = function() {
    //   var newIcon = new Kinetic.Image({
    //     x:100,
    //     y:100,
    //     image: imageObj
    //   });
    //   SnowProfile.kineticJSLayer.add(newIcon);
    // };
    // imageObj.src = "data:image/png;base64," +
    //   SnowProfile.CAAML_SHAPE.DH.icon.image;


    // Add an "Insert" button to allow the user to insert a snow layer
    // above the top snow layer.
    var insertButton = new SnowProfile.Button("Insert");
    insertButton.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2));

    // When Insert button clicked, insert a new snow layer at depth zero.
    $(document).bind("SnowProfileButtonClick", function(evt, extra) {
      if (extra.buttonObj === insertButton) {
        new SnowProfile.Layer(0);
        evt.stopImmediatePropagation();
      }
    });

    // Add the label to the Grain Type column
    var grainText = new Kinetic.Text({
      x: SnowProfile.GRAIN_LEFT,
      y: 25,
      text: 'Grain Type',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: "left"
    });
    SnowProfile.kineticJSLayer.add(grainText);

    // Add the label to the Water column
    var waterText = new Kinetic.Text({
      x: SnowProfile.LWC_LEFT,
      y: 25,
      text: 'Water',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: "left"
    });
    SnowProfile.kineticJSLayer.add(waterText);

    // Add the label to the Comment column
    var commentText = new Kinetic.Text({
      x: SnowProfile.COMMENT_LEFT,
      y: 25,
      text: 'Comment',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: "left"
    });
    SnowProfile.kineticJSLayer.add(commentText);

    // add the KineticJS layer to the stage
    SnowProfile.stage.add(SnowProfile.kineticJSLayer);

    // Create an animation
    // FIXME use a custom event to communicate with layers
    var anim = new Kinetic.Animation(function(frame) {
      SnowProfile.showHandle = (frame.time % 1000) > 500;
      if (SnowProfile.oldShowHandle === null) {
          SnowProfile.oldShowHandle = SnowProfile.showHandle;
      }
      else {
        if (SnowProfile.showHandle !== SnowProfile.oldShowHandle) {
          SnowProfile.oldShowHandle = SnowProfile.showHandle;

          // For each snow layer, if handle untouched, blink
          numLayers = SnowProfile.snowLayers.length;
          for (i = 0; i < numLayers; i++) {
            SnowProfile.snowLayers[i].setHandleVisibility(SnowProfile.showHandle);
          }
        }
      }
    });
    anim.start();

    // When the "Preview" button is clicked, generate a preview
    $(document).ready(function() {
      $("#snow_profile_preview").click(function() {

        // Hide the controls so they won't show in the PNG
        $.event.trigger("SnowProfileHideControls");
        var scaleFactor = SnowProfile.IMAGE_WD / SnowProfile.stage.getWidth();
        SnowProfile.stage.scale({x: scaleFactor, y: scaleFactor});

        // Open a new window and show the PNG in it
        SnowProfile.stage.toDataURL({
          x: 0,
          y: 0,
          width: SnowProfile.IMAGE_WD,
          height: scaleFactor * SnowProfile.stage.getHeight(),
          callback: function(dataUrl) {
            var newWin = window.open(dataUrl, "_blank");
            if (newWin === undefined) {
              alert("You must enable pop-ups for this site to use" +
                " the Preview button");
            }
            SnowProfile.stage.scale({x: 1, y: 1});
            $.event.trigger("SnowProfileShowControls");
          }
        });
      });
    });
  };  // function SnowProfile.init();
})();

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
