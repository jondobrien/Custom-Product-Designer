
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
 * Abstract tool class
 */
var Aitcg_Editor_Tool_Abstract = Class.create(
{
    template     : '',
    titleTemplate: '',
    toolKey      : '',
    tools        : null,
    lastRequestParams: null,
    editShape    : null,
    _saveAllowed : false,
    renderable   : true,
    postSize : 1000000,
    reservedImgId : null,
    createImgUrl : null,

    /**
     * @param params Object
     */
    initialize: function( params )
    {
        Object.extend(this, params);
    },

    /**
     * Edit an existing shape by its creator tool
     *
     * @param shape Aitcg_Editor_Canvas_Shape
     * @param params Object|String
     * @abstract
     */
    edit: function( shape, params ){},

    /**
     * Init tool-specific data and html structure
     *
     * @abstract
     */
    initData: function(){},

    /**
     * Init tool-specific observers on editor load
     */
    initObservers: function()
    {
        $('aitcg-tool-title-' + this.toolKey).observe('click', this.toggleTool.bind(this));
    },

    /**
     * Render a tool
     *
     * @return Array
     */
    render: function()
    {
        if(this.tools.templateAllowed(this.toolKey)) {
            return [this._getControlsHtml(), this.template];
        }
        return ['',''];
    },

    /**
     * Render title and tool switch
     *
     * @return string
     */
    _getControlsHtml: function()
    {
        switch (this.tools.config.toolboxStyle) {
            case Aitcg_Editor_Tools.STYLE_ACCORDION:
                return '<div id="aitcg-tool-title-' + this.toolKey + '" class="toolTitle">' +
                           '<span class="plus"> + </span>' +
                           '<span class="minus"> - </span>' +
                           '{{' + this.titleTemplate + '}}' +
                       '</div>';
            break;
            case Aitcg_Editor_Tools.STYLE_ICONS:
                return '<div id="aitcg-tool-title-' + this.toolKey + '" class="toolTitle" title="{{' + this.titleTemplate + '}}">' +
                           '<div class="icon"></div>' +
                           '<div class="label">{{' + this.titleTemplate + '}}</div>' +
                       '</div>';
            break;
        }
        return '';
    },
    
    /**
     * Render switch to choose where element will be added
     *
     * @return string
     */
    _getUnderTemplateSelectHtml: function()
    {
        var template = '';
        if (this.config.placeBehind)
        {
            template = '<div class="aitcg-under-template-block">' +
                '<input type="checkbox" id="under_template_' + this.toolKey + '_{{rand}}" name="under_template_' + this.toolKey + '_{{rand}}" class="aitcg_bgupload" value="1">' +
                '<label for="under_template_' + this.toolKey + '_{{rand}}">{{under_template_text}}</label>' +
            '</div>';
        }
        return template;
    },

    /**
     * Request to the server side
     *
     * @param params Object
     */
    _request: function ( params )
    {
        Aitcg.showLoader();
        this.lastRequestParams = params;
        new Ajax.Request( this.config.requestUrl,
        {
            method: 'post',
            parameters: params,
            onSuccess: this._requestSuccess.bind(this)
        });
    },

    /**
     * Should be called on _request method success
     *
     * @abstract
     * @param transport
     */
    _requestSuccess: function( transport ){},

    /**
     * Load image to the browser as soon as it was upload/chosen by customer
     *
     * @param url string
     */
    loadUploadedImage: function( url ){

        var img = $$('.techimg')[0];
        img.onload = function(e){
            this.addImage(Aitcg.getEventTarget(e));
        }.bind(this);
        img.src = url;
    },

    /**
     * Add image to the editor
     *
     * @param img ImageObject
     */
    addImage: function( img )
    {
        var scale = 1;
        if ((img.getWidth() > (this.editor().sizeX-40)) || (img.getHeight() > (this.editor().sizeY-40))) {
            scale = Math.min((this.editor().sizeX-40) / img.getWidth(), (this.editor().sizeY-40) / img.getHeight());
        }
        var isReflection = false,
            underTemplateCheckbox = $('under_template_' + this.toolKey + '_' + this.tools.config.rand);

        if (underTemplateCheckbox) {
            isReflection = underTemplateCheckbox.checked;
        }

        var textAngle = this.editor().config.tools.Text.textAngle;
        var creator = this._getCreatorObject();
        var newShape = this.editor().createImageElement({
            src       : img.src,
            transform : 'r' + textAngle + 't' + 20/scale + ',' + 20/scale,
            width     : img.getWidth(),
            height    : img.getHeight(),
            reflection: isReflection,
            creator   : creator, 
            x : (((this.editor().sizeX-40) / scale) / 2) - (img.getWidth() / 2),
            y : (((this.editor().sizeY-40) / scale) / 2) - (img.getHeight() / 2)
        }, scale);

        this.editor().addShape(newShape);
    },

    editor: function()
    {
        return this.tools.option.getCurrentEditor();
    },

    toggleTool: function()
    {
        var title     = $('aitcg-tool-title-' + this.toolKey),
            selected  = title.hasClassName('selected'),
            isIcons = this.tools.config.toolboxStyle == Aitcg_Editor_Tools.STYLE_ICONS;

        if (isIcons && selected) {
            return;
        }

        $$('.aitcg-toolbox .toolTitle, .aitcg-toolbox .tool-body').invoke('removeClassName', 'selected');
        this.hideRequiredFields();

        if (!selected) {
            title.toggleClassName('selected');
            $('aitcg-tool-' + this.toolKey).toggleClassName('selected');
            this.showRequiredFields();
        }
    },

    /**
     * hide required fields for unselected tabs to correct work of js validation
     */
    hideRequiredFields: function()
    {
        $$('.tool-body .required-entry').each(function(el){
            el.removeClassName('required-entry');
            el.addClassName('aitcpp-hidden-required-entry');
        });
    },

    showRequiredFields: function()
    {
        $$('#aitcg-tool-' + this.toolKey + ' .aitcpp-hidden-required-entry').each(function(el){
            el.removeClassName('aitcpp-hidden-required-entry');
            el.addClassName('required-entry');
        });
    },

    _getCreatorObject: function()
    {
        return {
            tool   : this,
            type   : this.toolKey,
            params : this.lastRequestParams,
            isNew  : true
        };
    },

    isSaveAllowed: function()
    {
        return this._saveAllowed;
    },

    decorateSaveLink: function( linkHtml, params )
    {
        return linkHtml;
    },

    _ajaxCreateImg: function(dataUrl, startNumber)
    {
        var firstRequest = 0;
        var lastRequest = 0;
        var dataUrlPart = dataUrl.substr(startNumber, this.postSize);
        this.preventUpdate();

        if(startNumber == 0){
            firstRequest = 1;
        }
        if(dataUrl.length < startNumber + this.postSize){
            lastRequest = 1;
        }

        new Ajax.Request(this.createImgUrl, {
            method: 'post',
            asynchronous: true,
            parameters: {
                productId: this.tools.config.product_id,
                reservedImgId: this.reservedImgId,
                pngData      : dataUrlPart,
                lastRequest : lastRequest,
                firstRequest : firstRequest
            },
            onSuccess: function(transport){            
                this.allowUpdate();
                if(dataUrl.length >= startNumber + this.postSize){                
                    this._ajaxCreateImg(dataUrl, startNumber + this.postSize);
                }
            }.bind(this),
            onComplete: function(response) {
                if(lastRequest == 1){
                    this._processAjaxResponse(response);
                }
            }.bind(this)
        });
    },

    _processAjaxResponse: function(response)
    {
        return;
    },

    preventUpdate: function()
    {
        return;
    },

    allowUpdate: function()
    {
        return;
    }
});