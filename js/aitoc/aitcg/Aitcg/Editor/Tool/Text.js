
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
 * Text customization tool
 */
var Aitcg_Editor_Tool_Text = Class.create( Aitcg_Editor_Tool_Abstract,
{
    titleTemplate: 'text_title',
    _colorSet    : null,
    _saveAllowed : true,
    _colorSetShadow    : null,
    _colorSetOutline    : null,

    initialize: function( $super, params )
    {
        $super(params);
        this.template = 
            '<div id="aitcg-tool-' + this.toolKey + '" class="tool-body"><form id="add_text_form{{rand}}">' +
                '<div id="text-edit-notice-{{rand}}" class="text-edit-notice" style="display:none;">{{edit_text}}</div>';

        // begin table
        this.template +=
            '<table class="form-list">';

        // text
        this.template +=
            '<tr>' +
                '<td class="label"><label for="add_text_{{rand}}">{{texttoadd_text}}</label></td>' +
                '<td class="value">' +
                    '<input type="text" class="required-entry input-text" id="add_text_{{rand}}" name="text" value=""' +
                    ' onkeyup="$(this.id).next().replace(\'<span>\'+this.getValue().length+\'</span>\');"';

        if (this.config.textLength) {
            this.template +=
                    ' maxlength="' + this.config.textLength + '" /> <span>0</span><span>/' + this.config.textLength + '</span>';
        } else {
            this.template +=
                    '" /> <span>0</span>';
        }

        this.template +=
                '</td>' +
            '</tr>';

        // font
        this.template +=
            '<tr>' +
                //'<td class="label"><label for="font-preview-selector-{{rand}}">{{font_text}}</label></td>' +
                '<td class="value">' +
                    '<input id="font-preview-selector-{{rand}}" name="font" type="hidden" value="'+this.config.textFont+'">' +
                    //'<select id="font-preview-selector-{{rand}}" name="font" class="required-entry select">{{fontOptions}}</select>' +
                '</td>' +
            '</tr>';

        // font preview
        this.template +=
            '<tr>' +
                '<td></td>' +
                '<td class="value">' +
                    '<div class="aitcg-font-preview"><img id="font-preview-{{rand}}" src="{{empty_img_url}}" /></div>' +
                '</td>' +
            '</tr>';

        this.template += this._getColorpickHtml();
        this.template += this._getOutlineHtml();
        this.template += this._getShadowHtml();
        // end table
        this.template +=
            '</table>';

        // add text button
        this.template +=
            this._getUnderTemplateSelectHtml() +
            '<div class="buttons">' +
                '<button type="button" class="aitcg-button" id="submit-text-image-{{rand}}">{{addtext_text}}</button>' +
                '<button type="button" style="display:none;" class="aitcg-button" id="submit-text-edit-{{rand}}">{{apply_text}}</button>' +
            '</div>';

        // end form
        this.template +=
            '</form>' +
            '</div>';
    },
    
    _getColorpickHtml: function()
    {
        var template = '';
        if (this.config.useColorpick) {
            if(this.config.onlyPredefColor) {
                template +=
                '<tr style="display: none;">' +
                    '<td class="label"><label for="font-selector{{rand}}">{{pickcolor_text}}</label></td>' +
                    '<td class="value">' +
                        '<input id="colorfield{{rand}}" class="jscolorpicker {pickerOnfocus:false}" readonly="readonly" name="color" value="#000000" style="width: 100px; background-color:#000000;" />' +
                        '<div id="aitcg_colorset_container{{rand}}" class="aitcg_colorset_container"></div>'+
                    '</td>' +
                '</tr>';
            } else {
                template +=
                '<tr style="display: none;">' +
                    '<td class="label"><label for="font-selector{{rand}}">{{pickcolor_text}}</label></td>' +
                    '<td class="value">' +
                        '<input id="colorfield{{rand}}" name="color" class="jscolorpicker" value="#000000" style="width: 100px;" />' +
                    '</td>' +
                '</tr>';
            }
        }
        return template;
    },

    _getOutlineHtml: function()
    {
        var template = '';
        if (this.config.useOutline > 0) {
            template +=
                '<tr>'+
                    '<td class="label"><label for="outline{{rand}}">{{outline_text}}</label></td>'+
                    '<td class="value">' +
                        '<input id="outline{{rand}}" name="outline" type="checkbox" class="aitcg-text-cb-{{rand}}" />'+
                    '</td>' +
                '</tr>';
            template +=
                '<tr style="display: none;">'+
                    '<td></td>' +
                    '<td class="label">'+
                        '<table  class="form-list">'+
                        '<tr>'+
                            '<td class="label">';
            if (this.config.onlyPredefColor) {
                template +='' +
                                '<label for="font-selector{{rand}}">{{pickcoloroutline_text}}</label>' +
                            '</td>'+
                            '<td class="value">'+
                                '<input id="coloroutline{{rand}}" class="jscolorpicker {pickerOnfocus:false}" readonly="readonly" name="coloroutline" value="#000000" style="width: 100px; background-color:#000000;" />' +
                                '<div id="aitcg_colorset_container_outline{{rand}}" class="aitcg_colorset_container" ></div>';
            } else {
                template +=
                                '<label for="font-selector{{rand}}">{{pickcoloroutline_text}}</label>' +
                            '</td>'+
                            '<td class="value">'+
                                '<input id="coloroutline{{rand}}" name="coloroutline" class="jscolorpicker" value="#000000" style="width: 100px;" />';
            }

            template +=
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td class="label">'+
                                '<label for="widthoutline{{rand}}">{{widthoutline_text}}</label>' +
                            '</td>'+
                            '<td class="value">'+
                                '<input id="widthoutline{{rand}}" name="widthoutline" type="text" value="1" size=5>' +
                            '</td>'+
                        '</tr>'+
                        '</table>'+
                    '</td>' +
                '</tr>';
        }
        return template;
    },

    _getShadowHtml: function()
    {
        var template = '';
        if (this.config.useShadow > 0) {
            template +=
                '<tr>' +
                    '<td class="label"><label for="shadow{{rand}}">{{shadow_text}}</label></td>'+
                    '<td class="value">' +
                        '<input id="shadow{{rand}}" name="shadow" type="checkbox" class="aitcg-text-cb-{{rand}}" />'+
                    '</td>' +
                '</tr>'+
                '<tr style="display: none;">' +
                    '<td></td>' +
                    '<td class="label">'+
                        '<table  class="form-list">'+
                        '<tr>'+
                            '<td class="label">';
            if (this.config.onlyPredefColor) {
                template +=
                                '<label for="font-selector{{rand}}">{{pickcolorshadow_text}}</label>' +
                            '</td>'+
                            '<td class="value">'+
                                '<input id="colorshadow{{rand}}" class="jscolorpicker {pickerOnfocus:false}" readonly="readonly" name="colorshadow" value="#000000" style="width: 50px; background-color:#000000;" />' +
                                '<div id="aitcg_colorset_container_shadow{{rand}}" class="aitcg_colorset_container" ></div>';
            } else {
                template +=
                                '<label for="font-selector{{rand}}">{{pickcolorshadow_text}}</label>' +
                            '</td>'+
                                '<td class="value">'+
                                '<input id="colorshadow{{rand}}" name="colorshadow" class="jscolorpicker" value="#000000" style="width: 50px;" />';
            }

            template +=
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td class="label">'+
                                '<label for="shadowalpha{{rand}}">{{shadowalpha_text}}</label>' +
                            '</td>'+
                            '<td class="value">'+
                                '<input id="shadowalpha{{rand}}"  name="shadowalpha" value="50" type="text" size="5" />' +
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td class="label">'+
                                '<label for="shadowoffsetx{{rand}}">{{shadowoffsetx_text}}</label>' +
                            '</td>'+
                            '<td class="value">'+
                                '<input id="shadowoffsetx{{rand}}"  name="shadowoffsetx" value="20" type="text" size="5" />' +
                            '</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td class="label">'+
                                '<label for="shadowoffsety{{rand}}">{{shadowoffsety_text}}</label>' +
                            '</td>'+
                            '<td class="value">'+
                                '<input id="shadowoffsety{{rand}}"  name="shadowoffsety" value="20" type="text" size="5" />' +
                            '</td>'+
                        '</tr>'+
                        '</table>'+
                    '</td>' +
                '</tr>';
        }
        return template;
    },
    
    _requestSuccess: function( transport )
    {
        var response = eval("("+transport.responseText+")");
        if (this.editShape) {
            this.editSave(response);
        } else {
            this.loadUploadedImage(response);
        }
        Aitcg.hideLoader();
    },

    initObservers: function( $super )
    {
        if ( this.tools.config.editorEnabled ) {
            $super();
            $('submit-text-image-' + this.tools.config.rand).observe('click', this.submit.bindAsEventListener(this));
            $('submit-text-edit-'  + this.tools.config.rand).observe('click', this.submit.bindAsEventListener(this));

            //$('font-preview-selector-' + this.tools.config.rand).observe('change', this.fontPreview.bindAsEventListener(this));
            $$('.aitcg-text-cb-' + this.tools.config.rand).each(function( cb ){
                cb.observe('click',  this.onCheckboxClick.bind(this));
                cb.observe('change', this.onCheckboxClick.bind(this));
            }.bind(this));

            jscolor.default_dir = this.tools.config.jsUrl + 'aitoc/aitcg/jscolor/';
            jscolor.init();
            if(this.config.useColorpick)
            {
                if (this.config.onlyPredefColor) {
                    this._getColorSet().renderSet();
                }
                if(this.config.useShadow)
                {
                    this._getColorSetShadow().renderSet();
                }
                if(this.config.useOutline)
                {
                    this._getColorSetOutline().renderSet();
                }
            }
        }
    },
    
    /**
     * Submit customer image to the server
     */
    submit: function()
    {
        var addTextForm = new VarienForm('add_text_form' + this.tools.config.rand);
        if (addTextForm.validator.validate()) {
            this._request($('add_text_form' + this.tools.config.rand).serialize());
        }
    },
    
    fontPreview: function()
    {
        var selectorValue = $('font-preview-selector-' + this.tools.config.rand).getValue();
        if (selectorValue > 0) {
            Aitcg.showLoader();
            new Ajax.Request(this.config.fontPreviewUrl, {
                method: 'post',
                parameters: {font_id: selectorValue, rand: this.tools.config.rand},
                onSuccess: function( transport ){
                    var response = eval("("+transport.responseText+")");
                    $('font-preview-' + response.rand).src = response.src;
                    Aitcg.hideLoader();
                }.bind(this)
            });
        }
    },

    onCheckboxClick: function(e)
    {
        var item = e.target,
            itemNext = item.up().up().next();
        if (item.getValue() == 'on') {
            itemNext.show();
        } else {
            itemNext.hide();
        }
    },

    editSave: function( url )
    {
        this.editShape.updateSource(url, this._getCreatorObject());
    },

    editStop: function()
    {
        this.editShape = null;
        if($('submit-text-image-' + this.tools.config.rand)){
            $('submit-text-image-' + this.tools.config.rand).show();
        }
        if($('submit-text-edit-'  + this.tools.config.rand)){
            $('submit-text-edit-'  + this.tools.config.rand).hide();
        }
        if($('text-edit-notice-'  + this.tools.config.rand)){
            $('text-edit-notice-'  + this.tools.config.rand).hide();
        }

        var underTemplateCheckbox = $('under_template_' + this.toolKey + '_' + this.tools.config.rand);
        if (underTemplateCheckbox) {
            underTemplateCheckbox.enable();
        }
    },

    /**
     * Edit an existing text shape
     *
     * @param shape Aitcg_Editor_Canvas_Shape
     * @param params Object|String
     */
    edit: function( shape, params ){
        this.editShape = shape;
        params = params.parseQuery();

        $('add_text_form' + this.tools.config.rand).getElements().each(function(el){
            if (typeof params[el.name] != 'undefined') {
                if (el.getValue() == params[el.name]) {
                    return;
                }
                el.setValue(params[el.name]);
            } else {
                if (el.nodeName == 'INPUT' && el.type == 'checkbox') {
                    el.setValue(false);
                } else {
                    return;
                }
            }
            fireEvent(el, 'click');
            fireEvent(el, 'change');
            fireEvent(el, 'keyup');
        }.bind(this));

        if (!$('aitcg-tool-title-' + this.toolKey).hasClassName('selected')) {
            this.toggleTool();
        }
        $('submit-text-image-' + this.tools.config.rand).hide();
        $('submit-text-edit-'  + this.tools.config.rand).show();
        $('text-edit-notice-'  + this.tools.config.rand).show();

        var underTemplateCheckbox = $('under_template_' + this.toolKey + '_' + this.tools.config.rand);
        if (underTemplateCheckbox) {
            underTemplateCheckbox.disable();
        }
    },

    _getColorSet: function()
    {
        if (!this._colorSet) {
            var rand = this.tools.config.rand;
            this._colorSet = new Aitcg_ColorSet({
                source      : this.config.colorSet,
                containerId : 'aitcg_colorset_container' + rand,
                initVarName : 'aitcgColorset' + rand,
                id          : rand,
                colorInputId: 'colorfield' + rand
            });
        }
        return this._colorSet;
    },

    _getColorSetShadow: function()
    {
        if (!this._colorSetShadow) {
            var rand = this.tools.config.rand;
            this._colorSetShadow = new Aitcg_ColorSet({
                source      : this.config.colorSet,
                containerId : 'aitcg_colorset_container_shadow' + rand,
                initVarName : 'aitcgColorsetShadow' + rand,
                id          : rand,
                colorInputId: 'colorshadow' + rand
            });
        }
        return this._colorSetShadow;
    },

    _getColorSetOutline: function()
    {
        if (!this._colorSetOutline) {
            var rand = this.tools.config.rand;
            this._colorSetOutline = new Aitcg_ColorSet({
                source      : this.config.colorSet,
                containerId : 'aitcg_colorset_container_outline' + rand,
                initVarName : 'aitcgColorsetOutline' + rand,
                id          : rand,
                colorInputId: 'coloroutline' + rand
            });
        }
        return this._colorSetOutline;
    },


    decorateSaveLink: function( linkHtml, params )
    {
        params = params.parseQuery();
        var text_config = this.tools.config.text,
            htmlBefore = text_config.save_type_text + ' ',
            htmlAfter = '';

        if (params && params.color && params.text) {
            htmlAfter  = '<ul>';
            htmlAfter += '<li>- ' + text_config.saved_color + ' <b>' + params.color + '</b>;</li>';
            htmlAfter += '<li>- ' + text_config.saved_text  + ' <b>' + params.text + '</b>.</li>';
            htmlAfter += '</ul>';
        }
        return htmlBefore + linkHtml + htmlAfter;
    }
});