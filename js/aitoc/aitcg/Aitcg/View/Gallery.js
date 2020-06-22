
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
 * Gallery editor view
 */
var Aitcg_View_Gallery = Class.create( Aitcg_View_Abstract,
{
    editorStartObserver: null,
    configUpdated      : false,
    useCPPVYA : false,// compatibility with VYA extension

    /**
     * static object shared among all views
     */
    gallery: {
        inited: false, // is product image block replaced with editor container
        block : null,  // main gallery block
        editor: null,  // inner editor container inside the gallery
        active: null   // current active (in use) view
    },

    initialize: function( $super, option ) {
        $super(option);
        this.gallery.block = $$('.product-view .img-box')[0];
        this.editorStartObserver = this.startEditor.bind(this);

        this.option.mult = Math.min(1, this.gallery.block.getWidth() / this.config.productImage.sizeX);

        this.scr = Aitcg.countMult( this.id, this.config.productImage.sizeX, this.config.productImage.sizeY, this.option.mult);
        this._setTemplateSetting();
    },

    /**
     * Return HTML code for main editor container
     * and all its inner layers (except masks layer)
     *
     * @return string
     * @private
     */
    _getImageContainerHtml: function()
    {
        return '<div id="{{option_id}}' + Aitcg_Editor.CONTAINER_ID + '" class="aitcg_image_container" style="width:{{img_width}}px;height:{{img_height}}px;position:relative;overflow:hidden;">' +
                   '<div id="{{option_id}}' + Aitcg_Editor_Canvas.RAPH_BOT_ID_SUFFIX + '" class="aitraph aitraph-bot" style="left:{{left}};top:{{top}};width:{{width}};height:{{height}};z-index:100;"></div>' +
                   '<img src="{{full_image}}" id="' + Aitcg_Editor.TEMPLATE_ID + '" width="{{img_width}}" height="{{img_height}}" alt="" style="position:absolute;left:0px;top:0px; z-index:300;" />' +
                   '<div id="{{option_id}}' + Aitcg_Editor_Canvas.RAPH_TOP_ID_SUFFIX + '" class="aitraph aitraph-top" style="left:{{left}};top:{{top}};width:{{width}};height:{{height}};z-index:500;"></div>' +
                   '<div class="aitcg-overlay" style="width:{{img_width}}px;height:{{img_height}}px;"></div>' +
               '</div> ';
    },

    /**
     * Remove preview container from the option
     * and then place it into the gallery
     *
     * @param container
     * @private
     */
    _showPreviewBlock: function( container )
    {
        var moreViewsBlock = this.gallery.block.select('.more-images')[0];

        // create gallery previews block if it does not exist
        if (!moreViewsBlock || typeof moreViewsBlock == 'undefined') {
            this.gallery.block.select('.product-image')[0].insert({
                after: '<div class="more-images"><h2>' + this.config.text.moreViews + '</h2><ul></ul></div>'
            })
        }

        var ul = this.gallery.block.select('.more-images div.owl-wrapper')[0];

        // Visualize Your Attributes compatibility - here we correct order of CPP preview images after click on VYA attribute
        if(this.useCPPVYA){
            li = ul.select('div.aitraph-li')[0];
        }
        else{
            li = ul.select('div.aitraph-li').last();
        }

        thumb = this.config.productImage.thumb;
        style = {
            width :  thumb.sizeX + 'px',
            height:  thumb.sizeY + 'px'
        };

        //we define that max is equal
        if(thumb.sizeX > thumb.sizeY) {
            style.marginTop  = Math.round((thumb.sizeX - thumb.sizeY)/2) + 'px';
        } else {
            style.margin = '0 ' + Math.round((thumb.sizeY - thumb.sizeX)/2) + 'px';
        }

        var wrappedContainer =
            container.remove()
                     .setStyle( style )
                     .show()
                     .wrap('div', {'class': 'aitraph-li owl-item', 'style':'width: 79px;'});

        // this if maintains a correct order of previews
        if (li && typeof li != 'undefined') {
            // insert the second, the third and so on previews
            li.insert({ after: wrappedContainer });
        } else {
            // insert the first cpp preview
            ul.insert({ top: wrappedContainer });
        }

        // removing empty elements (compatibility with VYA extension)
        $$('.aitraph-li:empty').each(function(el){
            el.remove();
        });
    },

    /**
     * Remove main product image and zoom tool.
     * Create a container to store editors.
     *
     * This method should be called only once per page.
     *
     * @private
     */
    _initEditorPlaceholder: function()
    {
        // check the flag in the shared static object
        if (!this.gallery.inited || $('aitcg-gallery-editor') == null) {
            this.gallery.inited = true;

            // remove zoom tool
            $$('.product-view .zoom, .product-view .zoom-notice').each(Element.remove);

            // replace the product image block with an editor's container
            $$('.product-view .product-image')[0]
                .insert({ before: '<div id="aitcg-gallery-editor"></div><div id="aitcg-gallery-tooltip" class="zoom-notice">' + this.config.text.galleryTooltip + '</div>' })
                .hide();

            this.gallery.editor = $('aitcg-gallery-editor');
        }
    },

    switchToEditor: function()
    {
        this._initEditorPlaceholder();

        // check if some editor in use
        if (this.gallery.active) {
            if (this.gallery.active == this // current editor in use - no action should be invoked
                || !window.confirm(this.config.text.areYouSure)) {
                    return;
            }
            this.gallery.active.switchFromEditor();
        }

        var template =
            this._getImageContainerHtml() +
            '<script type="text/javascript">$$(".tooltip-help").each( function(link) {new Tooltip(link, {delay: 100, opacity: 1.0});});</script>';

        this.gallery.editor.update( this.renderTemplate(template) );

        $$('.more-images div.owl-item > .item > a').first().addClassName('cboxElement');

        var el = $(this.id + Aitcg_Editor.CONTAINER_ID),
            elWidth = el.clientWidth,
            editorWidth = el.up().getWidth();

        if (elWidth < editorWidth) {
            el.setStyle({
                marginLeft: Math.round((editorWidth-elWidth)/2) +'px'
            });
        }

        this.editor.init(el, Aitcg_Editor.MODE_EDIT, !this.config.editorEnabled, this.option.mult);

        this.option.tools.initToolsData();

        this.editor.load( $('options_' + this.id).getValue() );

        this._initEditorClickObserver();
    },

    switchFromEditor: function()
    {
        this.closeEditor();
        this._removeEditorClickObserver();
    },

    /**
     * @private
     */
    _initEditorClickObserver: function()
    {
        if ($(this.id + Aitcg_Editor.CONTAINER_ID)) {
            $(this.id + Aitcg_Editor.CONTAINER_ID)
                .setStyle({'cursor': 'pointer'})
                .observe('click', this.editorStartObserver);

            $$('.aitcg-overlay')[0].show();
        }
    },

    /**
     * @private
     */
    _removeEditorClickObserver: function()
    {
        if ($(this.id + Aitcg_Editor.CONTAINER_ID)) {
            $(this.id + Aitcg_Editor.CONTAINER_ID)
                .setStyle({'cursor': 'auto'})
                .stopObserving('click', this.editorStartObserver);

            $$('.aitcg-overlay')[0].hide();
        }
    },

    startEditor: function()
    {
        this._removeEditorClickObserver();

        this.editor.makeActive();

        // show toolbox
        var toolbox = this.renderTemplate( this._getToolsHtml() );        
        $$('.product-shop .product-name')[0].insert({ after: toolbox });
        $$('.aitcg-toolbox')[0].setStyle({'clear' : 'both'});// Magento CE 1.9 compatibility

        var cp = this.renderTemplate( this._getControlPanelHtml() );
        this.gallery.editor.insert({ after: cp });
        $('aitcg-control-panel').style.boxSizing = "content-box";// Magento CE 1.9 compatibility

        $('aitcg-gallery-tooltip').hide();

        // init additional tools data and observers
        this.option.tools.initTools();

        Aitcg.tooltip().initObservers(".tooltip-help");

        this.initObservers();

        this.gallery.active = this;
    },

    closeEditor: function()
    {
        this.editor.canvas.shapes.each(function(item) {
            if(item._isEditAvailable()){
                item.creator.tool.editStop();
            }
        });

        this.gallery.active = null;

        $$('.aitcg-toolbox')[0].remove();
        $('aitcg-control-panel').remove();
        $('aitcg-gallery-tooltip').show();
        this._initEditorClickObserver();
    },

    onPreviewClick: function()
    {
        this.switchToEditor();
    },

    /**
     * Set VYA extension image as CPP option image
     *
     */
    setVYAProductImage: function()
    {
        // <<< here we save open editor values before changing image of VYA
        if (this.gallery.active) {
            if (this.option.id == this.gallery.active.id) {
                this.option.apply();
            }
            else {
                return;
            }
        }
        // >>>

        this.useCPPVYA = true;
        this._setVYAProductImage();
        this.switchToEditor();
        this.useCPPVYA = false;

        if (!this.gallery.active) {
            this.option.applyVYA();
        }
    }
});