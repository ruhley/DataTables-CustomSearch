(function (window, document, undefined) {
    "use strict";

    var factory = function ($, DataTable) {

        var CustomSearch = function (oDT, oConfig) {
            // Sanity check that we are a new instance
            if (!(this instanceof CustomSearch)) {
                throw ("Warning: CustomSearch must be initialised with the keyword 'new'");
            }

            if (!$.fn.dataTableExt.fnVersionCheck('1.10.0')) {
                throw ("Warning: CustomSearch requires DataTables 1.10 or greater");
            }

            /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             * Public class variables
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

            /**
             * @namespace The settings passed in by the user and manipulated by CustomSearch
             */
            this.c = {
                fields: [],
                container: '',
                hideStandardSearch: false
            };

            /**
             * @namespace Settings object which contains customisable information for CustomSearch instance
             */
            this.s = {
                dt: null,
                init: null
            };

            /**
             * @namespace Common and useful DOM elements for the class instance
             */
            this.dom = {
                table: null
            };


            // Run constructor logic
            this._fnInit(oDT, oConfig);

            // Return this for chaining
            return this;
        };

        CustomSearch.prototype = {
            /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             * Private methods (they are of course public in JS, but recommended as private)
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
            "_fnInit": function (dt, config) {
                var
                    that = this,
                    i, j,
                    field,
                    form = [],
                    allIds = [];

                this.s.dt = new DataTable.Api(dt).settings()[0];
                this.s.init = config || {};
                this.dom.table = $(this.s.dt.nTable);

                $.extend(true, this.c, CustomSearch.defaults, config);

                if (this.c.hideStandardSearch === true) {
                    $('#' + this.s.dt.sInstance + '_filter').hide();
                }

                for (i = 0; i < this.c.fields.length; i++) {
                    field = this.c.fields[i];

                    /*
                     set up the config for the field
                    */

                    // if only a number or an array of numbers given then they are the columns
                    if (!isNaN(field) || $.isArray(field)) {
                        field = {
                            columns: field
                        };
                    }

                    field.field = this._fnGetField(field.field);
                    field.range = this._fnGetRange(field.range);
                    field.id = this._fnGetId(i, field.range, field.field);
                    field.label = this._fnGetLabel(field.label, field.range, field.columns);
                    field.type = this._fnGetType(field.type, field.columns);

                    if (field.range.length === 0) {
                        allIds.push(field.id);
                    } else {
                        for (var id in field.id) {
                            allIds.push(field.id[id]);
                        }
                    }


                    if (field.field === '') {
                        switch (field.type) {
                            case 'string':
                                field.field = '<label for="' + field.id + '">' + field.label + '</label>' +
                                                '<input type="text" id="' + field.id + '">';
                            break;
                            case 'number':
                            case 'currency':
                            case 'num':
                            case 'num-fmt':
                                if (field.range.length === 0) {
                                    field.field = '<label for="' + field.id + '">' + field.label + '</label>' +
                                                    '<input type="number" id="' + field.id + '">';
                                } else {
                                    if (this._fnHasRange('min', field.range)) {
                                        field.field += '<label for="' + field.id.min + '">' + field.label.min + '</label>' +
                                                        '<input type="number" id="' + field.id.min + '">';
                                    }

                                    if (this._fnHasRange('max', field.range)) {
                                        field.field += '<label for="' + field.id.max + '">' + field.label.max + '</label>' +
                                                        '<input type="number" id="' + field.id.max + '">';
                                    }
                                }
                            break;
                            case 'select':
                                field.field = '<label for="' + field.id + '">' + field.label + '</label>' +
                                                '<select id="' + field.id + '">';

                                if (!field.options || field.options.length === 0) {
                                    field.options = [{
                                        value: '',
                                        text: 'All'
                                    }];

                                    $.each(this.s.dt.aoData, function (index, row) {
                                        if ($.inArray(row._aData[field.columns], field.options) === -1) {
                                            field.options.push(row._aData[field.columns]);
                                        }
                                    });
                                } else {
                                    field.options.unshift({
                                        value: '',
                                        text: 'All'
                                    });
                                }

                                for (j = 0; j < field.options.length; j++) {
                                    if (typeof field.options[j] === 'object') {
                                        field.field += '<option value="' + field.options[j].value + '">' + field.options[j].text + '</option>';
                                    } else {
                                        field.field += '<option value="' + field.options[j] + '">' + field.options[j] + '</option>';
                                    }
                                }

                                field.field += '</select>';
                            break;

                            case 'date':
                                if (field.range.length === 0) {
                                    field.field = '<label for="' + field.id + '">' + field.label + '</label>' +
                                                    '<input type="date" id="' + field.id + '">';
                                } else {
                                    if (this._fnHasRange('min', field.range)) {
                                        field.field += '<label for="' + field.id.min + '">' + field.label.min + '</label>' +
                                                        '<input type="date" id="' + field.id.min + '">';
                                    }

                                    if (this._fnHasRange('max', field.range)) {
                                        field.field += '<label for="' + field.id.max + '">' + field.label.max + '</label>' +
                                                        '<input type="date" id="' + field.id.max + '">';
                                    }
                                }
                            break;

                            default:
                                throw( "Warning: CustomSearch init failed due to invalid field type given - " + field.type );
                            break;
                        }

                        form.push(field.field);
                    }

                    // push back changes to the field to the config
                    this.c.fields[i] = field;
                }

                if (!this.c.container) {
                    this.c.container = this.s.dt.nTableWrapper;
                }

                if (form.length > 0) {
                    if (this.c.container == this.s.dt.nTableWrapper) {
                        $(this.c.container).prepend('<div>' + form.join('') + '</div>');
                    } else {
                        $(this.c.container).append('<div>' + form.join('') + '</div>');
                    }
                }

                $('#' + allIds.join(',#')).change(function () {
                    that.dom.table.DataTable().draw();
                });


                this.dom.table.dataTable().DataTable.ext.search.push(function (settings, data, dataIndex) {
                    return that._fnSearch(settings, data, dataIndex);
                });
            },

            "_fnSearch": function (settings, data, dataIndex) {
                var i, j, pass, value, values, field, allFields;

                for (i = 0; i < this.c.fields.length; i++) {
                    field = this.c.fields[i];

                    if (field.range.length === 0) {
                        value = $('#' + field.id).val();

                        if ($.isArray(field.columns)) {
                            pass = false;
                            allFields = [];

                            for (j = 0; j < field.columns.length; j++) {
                                allFields.push(data[field.columns[j]]);

                                if (field.type == 'date') {
                                    if (this._fnSearchDate(data[field.columns[j]], value)) {
                                        pass = true;
                                    }
                                } else {
                                    if (this._fnSearchString(data[field.columns[j]], value)) {
                                        pass = true;
                                    }
                                }
                            }

                            if (pass === false) {
                                if (!this._fnSearchString(allFields.join(' '), value)) {
                                    return false;
                                }
                            }
                        } else {
                            if (field.type == 'date') {
                                if (!this._fnSearchDate(data[field.columns], value)) {
                                    return false;
                                }
                            } else {
                                if (!this._fnSearchString(data[field.columns], value)) {
                                    return false;
                                }
                            }
                        }
                    } else {
                        values = {
                            min: this._fnHasRange('min', field.range) ? $('#' + field.id.min).val() : '',
                            max: this._fnHasRange('max', field.range) ? $('#' + field.id.max).val() : ''
                        };

                        if ($.isArray(field.columns)) {
                            pass = false;
                            for (j = 0; j < field.columns.length; j++) {
                                if (field.type == 'date') {
                                    if (this._fnSearchDateRange(data[field.columns[j]], values)) {
                                        pass = true;
                                    }
                                } else {
                                    if (this._fnSearchNumberRange(data[field.columns[j]], values)) {
                                        pass = true;
                                    }
                                }
                            }

                            if (pass === false) {
                                return false;
                            }
                        } else {
                            if (field.type == 'date') {
                                if (!this._fnSearchDateRange(data[field.columns], values)) {
                                    return false;
                                }
                            } else {
                                if (!this._fnSearchNumberRange(data[field.columns], values)) {
                                    return false;
                                }
                            }
                        }
                    }
                }

                return true;
            },


            "_fnSearchString": function (cell, value) {
                return cell.toLowerCase().search(value.toLowerCase()) >= 0;
            },

            "_fnSearchNumberRange": function (cell, values) {
                cell = parseInt(cell.replace(/[^\d]/i, ''), 10);
                values.min = parseInt(values.min, 10);
                values.max = parseInt(values.max, 10);

                if (isNaN(cell)) {
                    return false;
                }

                return (
                        (isNaN(values.min) && isNaN(values.max)) ||
                        (isNaN(values.min) && values.max >= cell) ||
                        (values.min <= cell && isNaN(values.max)) ||
                        (values.min <= cell && values.max >= cell)
                );
            },

            "_fnSearchDate": function (cell, value) {
                cell = new Date(cell);
                value = new Date(value);

                return (this._fnIsValidDate(cell) && cell == value);
            },

            "_fnSearchDateRange": function (cell, values) {
                cell = new Date(cell);
                values.min = new Date(values.min);
                values.max = new Date(values.max);

                if (!this._fnIsValidDate(cell)) {
                    return false;
                }

                return (
                        (!this._fnIsValidDate(values.min) && !this._fnIsValidDate(values.max)) ||
                        (!this._fnIsValidDate(values.min) && values.max >= cell) ||
                        (values.min <= cell               && !this._fnIsValidDate(values.max)) ||
                        (values.min <= cell               && values.max >= cell)
                );
            },

            "_fnIsValidDate": function (date) {
                return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
            },



            "_fnGetRange": function (range) {
                var newRange = [],
                    isMin = false,
                    isMax = false;

                if (typeof range === 'string') {
                    newRange = range.split(',');
                }

                if ($.isArray(range)) {
                    isMin = this._fnHasRange('min', range);
                    isMax = this._fnHasRange('max', range);

                    if (isMin && isMax) {
                        newRange = ['min', 'max'];
                    } else if (isMin && !isMax) {
                        newRange = ['min'];
                    } else if (!isMin && isMax) {
                        newRange = ['max'];
                    } else {
                        newRange = [];
                    }
                }

                if (range === undefined) {
                    newRange = [];
                }

                if (range === true) {
                    newRange = ['min', 'max'];
                }

                return newRange;
            },

            "_fnGetField": function (field) {
                if (field) {
                    return $(field);
                }

                return '';
            },

            "_fnGetId": function (index, range, field) {
                var baseId = this.s.dt.sInstance + '_' + index,
                    newId, fieldId;

                if (range.length === 0) {
                    newId = baseId;
                } else {
                    newId = {};
                    if (this._fnHasRange('min', range)) {
                        newId.min = baseId + '_min';
                    }

                    if (this._fnHasRange('max', range)) {
                        newId.max = baseId + '_max';
                    }
                }

                if (field) {
                    fieldId = field.attr('id');
                    if (fieldId) {
                        newId = fieldId;
                    } else {
                        field.attr('id', newId);
                    }
                }


                return newId;
            },

            "_fnGetLabel": function (label, range, columns) {
                var newLabel = '',
                    j;

                // get the label from the column names if not given
                if (!label) {
                    label = [];

                    if ($.isArray(columns)) {
                        for (j = 0; j < columns.length; j++) {
                            label.push(this.s.dt.aoColumns[columns[j]].sTitle);
                        }
                    } else {
                        label.push(this.s.dt.aoColumns[columns].sTitle);
                    }

                    label = label.join(' & ');
                }

                if (range.length === 0) {
                    newLabel = label;
                } else {
                    newLabel = {};
                    if (this._fnHasRange('min', range)) {
                        newLabel.min = 'Min ' + label;
                    }

                    if (this._fnHasRange('max', range)) {
                        newLabel.max = 'Max ' + label;
                    }
                }

                return newLabel;
            },


            "_fnGetType": function (type, columns) {
                var newType = type;

                if (!newType) {
                    if ($.isArray(columns)) {
                        newType = 'string';
                    } else {
                        newType = this.s.dt.aoColumns[columns].sType;
                    }
                }

                return newType.toLowerCase();
            },


            "_fnHasRange": function ( value, range ) {
                return $.inArray(value, range) >= 0;
            }



        };

        // Alias for access
        DataTable.CustomSearch = CustomSearch;


        return CustomSearch;
    };


    if (typeof define === 'function' && define.amd) { // Define as an AMD module if possible
        define('datatables-customsearch', ['jquery', 'datatables'], factory);
    } else if ( jQuery && !jQuery.fn.dataTable.CustomSearch ) { // Otherwise simply initialise as normal, stopping multiple evaluation
        factory( jQuery, jQuery.fn.dataTable );
    }

} (window, document));
