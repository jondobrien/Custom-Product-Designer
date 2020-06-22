
/**
 * Custom Product Preview
 *
 * @category:    Aitoc
 * @package:     Aitoc_Aitcg
 * @version      4.1.4
 * @license:     n/a
 * @copyright:   Copyright (c) 2014 AITOC, Inc. (http://www.aitoc.com)
 */
/**
 * Wrapper and builder for trackers set
 */
var Aitcg_Editor_Canvas_Trackers = Class.create(
{
    //trackers   : 'Box,Resize,Rotate,ToFront,ToBack,Delete,OpacityInc,OpacityDec'.split(','),
    trackers   : [],
    dTrackers  : 'CenterDot,InnerCircle,InnerBox,OuterCircle,OuterBox'.split(','),
    shape      : null, // Aitcg_Editor_Canvas_Shape
    paper      : null, // Paper (Raphael)
    controlsSet: null, // Set (Raphael)
    trackersSet: null, // Object
    debug      : false, // Do we need to add debug trackers?

    /**
     * @param shape Aitcg_Editor_Canvas_Shape
     */
    initialize: function( shape )
    {
        this.shape       = shape;
        this.paper       = this.shape.paper;
        this.controlsSet = this.paper.set();
        this.trackersSet = {};

        // init all trackers
        this._initTrackersCollection( this.trackers );

        if (this.debug) {
            this._initTrackersCollection( this.dTrackers );
        }

        // update trackers' positions
        this.updateTrackersPositions();
    },

    _initTrackersCollection: function( trackers )
    {
        trackers.each(function(tracker){
            this.trackersSet[tracker] = new window['Aitcg_Editor_Canvas_Tracker_' + tracker]( this );
        }.bind(this));
    },

    /**
     * Remove trackers
     */
    remove: function()
    {
        for (var tracker in this.trackersSet) {
            this.trackersSet[tracker].remove();
        }
    },

    /**
     * Update position of all tracker elements
     */
    updateTrackersPositions: function()
    {
        var box = this.shape.getBBox();
        for (var tracker in this.trackersSet) {
            this.trackersSet[tracker].update(box);
        }
    }
});