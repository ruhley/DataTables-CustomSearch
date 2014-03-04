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
                "columns": [],
                "container": "",
                "removeStandardSearch": false
            };

            /**
             * @namespace Settings object which contains customisable information for CustomSearch instance
             */
            this.s = {};

            /**
             * @namespace Common and useful DOM elements for the class instance
             */
            this.dom = {
                "table": null
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
                    column,
                    form = [];

                this.s.dt = new DataTable.Api(dt).settings()[0];
                this.s.init = config || {};
                this.dom.table = this.s.dt.nTable;

                $.extend(true, this.c, CustomSearch.defaults, config);

                if (this.c.removeStandardSearch === true) {
                    $('#' + this.s.dt.sInstance + '_filter').hide();
                }

                for (i = 0; i < this.c.columns.length; i++) {
                    column = this.c.columns[i];

                    /*
                     set up the config for the column
                    */

                    // if only a number or an array of numbers given then they are the columns
                    if (!isNaN(column) || $.isArray(column)) {
                        column = {
                            columns: column
                        };
                    }

                    column.range = this._fnGetRange(column.range);
                    column.id = this._fnGetId(i, column.range);
                    column.label = this._fnGetLabel(column.label, column.range, column.columns);
                    column.type = this._fnGetType(column.type, column.columns);
                    column.field = '';



                    switch (column.type) {
                        case 'string':
                            column.field = '<label for="' + column.id + '">' + column.label + '</label>' +
                                            '<input type="text" id="' + column.id + '" data-table="#' + this.dom.table.id + '">';
                        break;
                        case 'number':
                        case 'currency':
                        case 'num':
                        case 'num-fmt':
                            if (column.range.length === 0) {
                                column.field = '<label for="' + column.id + '">' + column.label + '</label>' +
                                                '<input type="number" id="' + column.id + '" data-table="#' + this.dom.table.id + '">';
                            } else {
                                if (this._fnHasRange('min', column.range)) {
                                    column.field += '<label for="' + column.id.min + '">' + column.label.min + '</label>' +
                                                    '<input type="number" id="' + column.id.min + '" data-table="#' + this.dom.table.id + '">';
                                }

                                if (this._fnHasRange('max', column.range)) {
                                    column.field += '<label for="' + column.id.max + '">' + column.label.max + '</label>' +
                                                    '<input type="number" id="' + column.id.max + '" data-table="#' + this.dom.table.id + '">';
                                }
                            }
                        break;
                        case 'select':
                            column.field = '<label for="' + column.id + '">' + column.label + '</label>' +
                                            '<select id="' + column.id + '" data-table="#' + this.dom.table.id + '">';

                            if (!column.options || column.options.length === 0) {
                                column.options = [{
                                    value: '',
                                    text: 'All'
                                }];

                                $.each(this.s.dt.aoData, function (index, row) {
                                    if ($.inArray(row._aData[column.columns], column.options) === -1) {
                                        column.options.push(row._aData[column.columns]);
                                    }
                                });
                            }

                            for (j = 0; j < column.options.length; j++) {
                                if (typeof column.options[j] === 'object') {
                                    column.field += '<option value="' + column.options[j].value + '">' + column.options[j].text + '</option>';
                                } else {
                                    column.field += '<option value="' + column.options[j] + '">' + column.options[j] + '</option>';
                                }
                            }

                            column.field += '</select>';
                        break;

                        case 'date':
                            if (column.range.length === 0) {
                                column.field = '<label for="' + column.id + '">' + column.label + '</label>' +
                                                '<input type="date" id="' + column.id + '" data-table="#' + this.dom.table.id + '">';
                            } else {
                                if (this._fnHasRange('min', column.range)) {
                                    column.field += '<label for="' + column.id.min + '">' + column.label.min + '</label>' +
                                                    '<input type="date" id="' + column.id.min + '" data-table="#' + this.dom.table.id + '">';
                                }

                                if (this._fnHasRange('max', column.range)) {
                                    column.field += '<label for="' + column.id.max + '">' + column.label.max + '</label>' +
                                                    '<input type="date" id="' + column.id.max + '" data-table="#' + this.dom.table.id + '">';
                                }
                            }
                        break;

                        default:
                            throw( "Warning: CustomSearch init failed due to invalid column type given - " + column.type );
                        break;
                    }

                    form.push(column.field);

                    this.c.columns[i] = column;
                }

                if (!this.c.container) {
                    this.c.container = this.s.dt.nTableWrapper;
                    $(this.c.container).prepend('<div>' + form.join('') + '</div>');
                } else {
                    $(this.c.container).append('<div>' + form.join('') + '</div>');
                }

                $(this.c.container).find('input,select').change(function () {
                    $($(this).data('table')).DataTable().draw();
                });

                $(this.dom.table).dataTable().DataTable.ext.search.push(function (settings, data, dataIndex) {
                    return that._fnSearch(settings, data, dataIndex);
                });
            },

            "_fnSearch": function (settings, data, dataIndex) {
                var i, j, pass, value, values, column, allColumns;

                for (i = 0; i < this.c.columns.length; i++) {
                    column = this.c.columns[i];

                    if (column.range.length === 0) {
                        value = $('#' + column.id).val();

                        if ($.isArray(column.columns)) {
                            pass = false;
                            allColumns = [];

                            for (j = 0; j < column.columns.length; j++) {
                                allColumns.push(data[column.columns[j]]);
                                if (this._fnSearchString(data[column.columns[j]], value)) {
                                    pass = true;
                                }
                            }

                            if (pass === false) {
                                if (!this._fnSearchString(allColumns.join(' '), value)) {
                                    return false;
                                }
                            }
                        } else {
                            if (!this._fnSearchString(data[column.columns], value)) {
                                return false;
                            }
                        }
                    } else {
                        values = {
                            min: this._fnHasRange('min', column.range) ? $('#' + column.id.min).val() : '',
                            max: this._fnHasRange('max', column.range) ? $('#' + column.id.max).val() : ''
                        }

                        if ($.isArray(column.columns)) {
                            pass = false;
                            for (j = 0; j < column.columns.length; j++) {
                                if (this._fnSearchNumberRange(data[column.columns[j]], values)) {
                                    pass = true;
                                }
                            }

                            if (pass === false) {
                                return false;
                            }
                        } else {
                            if (!this._fnSearchNumberRange(data[column.columns], values)) {
                                return false;
                            }
                        }
                    }
                }

                return true;
            },


            "_fnSearchString": function (cell, search) {
                return cell.toLowerCase().search(search.toLowerCase()) >= 0;
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



            "_fnGetRange": function (range) {
                var newRange = [],
                    isMin = false,
                    isMax = false;

                if (typeof range === 'string') {
                    newRange = range.split(',');
                }

                if (typeof range === Array) {
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

            "_fnGetId": function (index, range) {
                var baseId = this.s.dt.sInstance + '_' + index,
                    id;

                if (range.length === 0) {
                    id = baseId;
                } else {
                    id = {};
                    if (this._fnHasRange('min', range)) {
                        id.min = baseId + '_min';
                    }

                    if (this._fnHasRange('max', range)) {
                        id.max = baseId + '_max';
                    }
                }

                return id;
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
