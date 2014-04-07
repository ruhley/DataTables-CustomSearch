(function (window, document, undefined) {
	'use strict';

	var factory = function ($, DataTable) {

		var CustomSearch = function (oDT, oConfig) {

			// Sanity check that we are a new instance
			if (!(this instanceof CustomSearch)) {
				throw ('Warning: CustomSearch must be initialised with the keyword "new".');
			}

			if (!$.fn.dataTableExt.fnVersionCheck('1.10.0')) {
				throw ('Warning: CustomSearch requires DataTables 1.10 or greater.');
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
				init: null,
				table: null
			};


			// Run constructor logic
			this.init(oDT, oConfig);

			// Return this for chaining
			return this;
		};

		CustomSearch.prototype = {
			/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
			 * Private methods (they are of course public in JS, but recommended as private)
			 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
			init: function (dt, config) {
				var that = this,
					i,
					j,
					k,
					id,
					field,
					form = [],
					allIds = [],
					type,
					element,
					currentColumn,
					sequentialCount,
					method,
					row;

				this.s.dt = new DataTable.Api(dt).settings()[0];
				this.s.init = config || {};
				this.s.table = $(this.s.dt.nTable);

				$.extend(true, this.c, CustomSearch.defaults, config);

				if (this.c.hideStandardSearch === true) {
					$('#' + this.s.dt.sInstance + '_filter').hide();
				}

				if (this.c.fields === null || this.c.fields === undefined || this.c.fields.length === 0) {
					this.c.fields = [];
					for (i = 0; i < this.s.dt.aoColumns.length; i++) {
						this.c.fields.push(i);
					}
				}

				if (!$.isArray(this.c.fields)) {
					this.c.fields = [this.c.fields];
				}

				for (i = 0; i < this.c.fields.length; i++) {
					field = this.c.fields[i];

					/* set up the config for the field */

					// if only a number or an array of numbers given then they are the columns
					if (!isNaN(field) || $.isArray(field)) {
						field = {
							columns: field
						};
					}

					field.columns         = $.isArray(field.columns) ? field.columns : [field.columns];
					field.columns.sort();
					field.multiple        = this.getMultiple(field.multiple);
					field.type            = this.getType(field.type, field.columns);
					field.range           = this.getRange(field.range);
					field.label           = this.getLabel(field.label, field.range, field.columns);
					field.id              = this.getId(i, field.range, field.field);
					field.advanced        = this.getAdvanced(field.advanced, field.range, field.id, field.type);
					field.server          = this.getServer(field.server, field.id);
					field.caseInsensitive = field.caseInsensitive !== false;
					field.smart           = field.smart === true;
					field                 = this.getField(field);

					// makes sure the changes to the field are pushed back to the config
					this.c.fields[i] = field;

					if (field.range.length === 0) {
						allIds.push(field.id);
					} else {
						for (id in field.id) {
							allIds.push(field.id[id]);
						}
					}

					if (field.advanced && field.advanced.id) {
						allIds.push(field.advanced.id);
					}

					form.push(field.fullField);
				}

				this.c.fields.sort(this.sortBySubArray);

				if (this.c.container === 'thead' || this.c.container === 'thead:before' || this.c.container === 'thead:after' ||
					this.c.container === 'tfoot' || this.c.container === 'tfoot:before' || this.c.container === 'tfoot:after') {
					type = this.c.container.indexOf('thead') >= 0 ? 'thead' : 'tfoot';
					element = this.s.table.find(type);
					currentColumn = 0;
					sequentialCount = 1;
					method = 'prependTo';

					if (this.c.container === type + ':after') {
						method = 'appendTo';
					}

					if (element.length === 0) {
						this.s.table.append('<' + type + '>');
					}

					element = this.s.table.find(type);
					row = $('<tr>')[method](element);


					for (i = 0; i < this.c.fields.length; i++) {
						for (j = 0; j < this.c.fields[i].columns.length; j++) {
							while (this.c.fields[i].columns[j] > currentColumn) {
								row.append($('<td>'));
								currentColumn++;
							}

							if (this.c.fields[i].columns.length === 1) {
								row.append($('<td>').append(this.c.fields[i].field));
							} else {
								sequentialCount = 1;
								for (k = j + 1; k < this.c.fields[i].columns.length; k++) {
									if (this.c.fields[i].columns[k] === this.c.fields[i].columns[j] + 1) {
										sequentialCount++;
										currentColumn++;
									} else {
										break;
									}
								}
								row.append($('<td>').attr('colspan', sequentialCount).append($(this.c.fields[i].field)));
								j = k;
							}

							currentColumn++;
						}
					}
				} else {
					if (!this.c.container) {
						$(this.s.dt.nTableWrapper).prepend('<div>' + form.join('') + '</div>');
					} else {
						$(this.c.container).append('<div>' + form.join('') + '</div>');
					}
				}

				$('#' + allIds.join(',#')).change(function () {
					if (that.s.dt.oInit.serverSide) {
						var ajax = that.s.dt.ajax;

						if (typeof ajax === 'string') {
							ajax = {url: ajax, data: {}};
						}

						ajax.data.customsearch = {};

						for (i = 0; i < that.c.fields.length; i++) {
							ajax.data.customsearch[that.c.fields[i].server] = $('#' + that.c.fields[i].id).val();
						}

						that.s.dt.ajax = ajax;
					}

					that.s.table.DataTable().draw();
				});


				if (!this.s.dt.oInit.serverSide) {
					this.s.table.dataTable().DataTable.ext.search.push(function (settings, data, dataIndex) {
						return that.search(settings, data, dataIndex);
					});
				}

				if ($.isFunction(this.c.after)) {
					this.s.table.on('search.dt', function (evt, settings) {
						var rows = settings.aiDisplay,
							data = that.s.table.DataTable().data(),
							pagePassedData = [],
							allPassedData = [],
							i = settings._iDisplayStart,
							to = settings._iDisplayStart + settings._iDisplayLength;

						if (to > data.length) {
							to = data.length;
						}

						if (to > rows.length) {
							to = rows.length;
						}

						for (; i < to; i++) {
							pagePassedData.push(data[rows[i]]);
						}

						for (i = 0; i < rows.length; i++) {
							allPassedData.push(data[rows[i]]);
						}

						that.c.after(pagePassedData, allPassedData, data);
					});
				}
			},

			search: function (settings, data, dataIndex) {
				var i, j, pass, value, values, field, allFields, advancedValue;

				for (i = 0; i < this.c.fields.length; i++) {
					field = this.c.fields[i];

					if (field.advanced) {
						advancedValue = $('#' + field.advanced.id).val();
					} else {
						advancedValue = false;
					}

					if (field.range.length === 0) {
						value = $('#' + field.id).val();

						if (!value) {
							value = '';
						}

						if (value.length) {
							pass = false;

							if (field.type == 'date' && !advancedValue) {
								for (j = 0; j < field.columns.length; j++) {
									if (this.searchDate(data[field.columns[j]], value)) {
										pass = true;
										break;
									}
								}
							} else {
								allFields = [];
								for (j = 0; j < field.columns.length; j++) {
									allFields.push(data[field.columns[j]]);
								}

								if (this.searchString(allFields.join(' '), value, advancedValue, field.caseInsensitive, field.smart)) {
									pass = true;
								}
							}

							if (pass === false) {
								return false;
							}
						}
					} else {
						values = {
							min: this.hasRange('min', field.range) ? $('#' + field.id.min).val() : '',
							max: this.hasRange('max', field.range) ? $('#' + field.id.max).val() : ''
						};

						pass = false;
						for (j = 0; j < field.columns.length; j++) {
							if (field.type == 'date') {
								if (this.searchDateRange(data[field.columns[j]], values)) {
									pass = true;
									break;
								}
							} else {
								if (this.searchNumberRange(data[field.columns[j]], values)) {
									pass = true;
									break;
								}
							}
						}

						if (pass === false) {
							return false;
						}
					}
				}

				return true;
			},


			searchString: function (cell, value, advanced, caseInsensitive, smart) {
				var pass = false;

				// multiple select field that has nothing selected (so 'All')
				if (value === null || !value.length) {
					pass = true;
				} else {
					pass = this.searchStringAdvanced(cell, value, advanced, caseInsensitive, smart);
				}

				return pass;
			},

			searchStringAdvanced: function (string, search, advanced, caseInsensitive, smart) {
				var i = 0,
					stringNumber,
					searchNumber;

				if (caseInsensitive) {
					string = string.toLowerCase();
				}

				stringNumber = parseInt(string, 10);

				if (!$.isArray(search)) {
					search = [search];
				}

				for (; i < search.length; i++) {
					if (caseInsensitive) {
						search[i] = search[i].toLowerCase();
					}

					searchNumber = parseInt(search[i], 10);

					if ((!advanced || advanced == 'contains') && string.search(search[i]) != -1) {
						return true;
					} else if (advanced == 'not-contains' && string.search(search[i]) == -1) {
						return true;
					} else if (advanced == 'equal' && string == search[i]) {
						return true;
					} else if (advanced == 'not-equal' && string != search[i]) {
						return true;
					} else if (advanced == 'greater' && stringNumber > searchNumber) {
						return true;
					} else if (advanced == 'less' && stringNumber < searchNumber) {
						return true;
					} else if (advanced == 'begins' && string.indexOf(search[i]) === 0) {
						return true;
					}
				}



				return false;
			},

			searchNumberRange: function (cell, values) {
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

			searchDate: function (cell, value) {
				cell = new Date(cell);
				value = new Date(value);

				return (this.isValidDate(cell) && cell == value);
			},

			searchDateRange: function (cell, values) {
				cell = new Date(cell);
				values.min = new Date(values.min);
				values.max = new Date(values.max);

				if (!this.isValidDate(cell)) {
					return false;
				}

				return (
						(!this.isValidDate(values.min) && !this.isValidDate(values.max)) ||
						(!this.isValidDate(values.min) && values.max >= cell) ||
						(values.min <= cell               && !this.isValidDate(values.max)) ||
						(values.min <= cell               && values.max >= cell)
				);
			},


			isValidDate: function (date) {
				return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
			},



			getRange: function (range) {
				var newRange = [],
					isMin = false,
					isMax = false;

				if (typeof range === 'string') {
					newRange = range.split(',');
				}

				if ($.isArray(range)) {
					isMin = this.hasRange('min', range);
					isMax = this.hasRange('max', range);

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

			getField: function (field) {
				var newField = $(field.field);

				if (!field.field || newField.length === 0) {
					newField = this.createField(field);
				}

				return newField;
			},


			createField: function(field) {
				var i;

				field.fieldLabel = [];
				field.field = [];

				switch (field.type) {
					case 'string':
						if (field.label) {
							field.fieldLabel = '<label for="' + field.id + '">' + field.label + '</label>';
						}
						field.field = field.advanced.field + '<input type="text" id="' + field.id + '">';
					break;
					case 'number':
						if (field.range.length === 0) {
							if (field.label) {
								field.fieldLabel = '<label for="' + field.id + '">' + field.label + '</label>';
							}
							field.field = field.advanced.field + '<input type="number" id="' + field.id + '">';
						} else {
							if (this.hasRange('min', field.range)) {
								if (field.label) {
									field.fieldLabel.push('<label for="' + field.id.min + '">' + field.label.min + '</label>');
								}
								field.field.push('<input type="number" id="' + field.id.min + '">');
							}

							if (this.hasRange('max', field.range)) {
								if (field.label) {
									field.fieldLabel.push('<label for="' + field.id.max + '">' + field.label.max + '</label>');
								}
								field.field.push('<input type="number" id="' + field.id.max + '">');
							}
						}
					break;
					case 'select':
						if (field.label) {
							field.fieldLabel = '<label for="' + field.id + '">' + field.label + '</label>';
						}
						field.field = field.advanced.field + '<select id="' + field.id + '"';

						if (field.multiple) {
							field.field += ' multiple="multiple"';
						}

						field.field += '>';

						if (!$.isArray(field.options) || field.options.length === 0) {
							if (field.multiple) {
								field.options = [];
							} else {
								field.options = [{
									value: '',
									text: 'All'
								}];
							}

							$.each(this.s.dt.aoData, function (index, row) {
								if ($.inArray(row._aData[field.columns], field.options) === -1) {
									field.options.push(row._aData[field.columns]);
								}
							});
						} else {
							if (!field.multiple) {
								field.options.unshift({
									value: '',
									text: 'All'
								});
							}
						}

						for (i = 0; i < field.options.length; i++) {
							if (typeof field.options[i] === 'object') {
								field.field += '<option value="' + field.options[i].value + '">' + field.options[i].text + '</option>';
							} else {
								field.field += '<option value="' + field.options[i] + '">' + field.options[i] + '</option>';
							}
						}

						field.field += '</select>';
					break;

					case 'date':
						if (field.range.length === 0) {
							if (field.label) {
								field.fieldLabel = '<label for="' + field.id + '">' + field.label + '</label>';
							}
							field.field = field.advanced.field + '<input type="date" id="' + field.id + '">';
						} else {
							if (this.hasRange('min', field.range)) {
								if (field.label) {
									field.fieldLabel.push('<label for="' + field.id.min + '">' + field.label.min + '</label>');
								}
								field.field.push('<input type="date" id="' + field.id.min + '">');
							}

							if (this.hasRange('max', field.range)) {
								if (field.label) {
									field.fieldLabel.push('<label for="' + field.id.max + '">' + field.label.max + '</label>');
								}
								field.field.push('<input type="date" id="' + field.id.max + '">');
							}
						}
					break;

					default:
						throw('Warning: CustomSearch init failed due to invalid field type given - ' + field.type);
					break;
				}

				field.fullField = '';

				if ($.isArray(field.field)) {
					for (i = 0; i < field.field.length; i++) {
						field.fullField += field.fieldLabel[i];
						field.fullField += field.field[i];
					}
				} else {
					field.fullField += field.fieldLabel;
					field.fullField += field.field;
				}

				return field;
			},

			getMultiple: function (multiple) {
				return multiple === true;
			},

			getId: function (index, range, field) {
				var baseId = this.s.dt.sInstance + '_' + index,
					newId, fieldId;

				if (range.length === 0) {
					newId = baseId;
				} else {
					newId = {};
					if (this.hasRange('min', range)) {
						newId.min = baseId + '_min';
					}

					if (this.hasRange('max', range)) {
						newId.max = baseId + '_max';
					}
				}

				if ($(field).length > 0) {
					fieldId = $(field).attr('id');
					if (fieldId) {
						newId = fieldId;
					} else {
						$(field).attr('id', newId);
					}
				}


				return newId;
			},


			getAdvanced: function (advanced, range, id, type) {
				var advancedField = '',
					i,
					advancedId = id + '_advanced',
					numerical = type == 'number' || type == 'date',
					options = [
						['contains', 'Contains', !numerical],
						['not-contains', 'Does Not Contain', false],
						['equal', 'Is Equal To', numerical],
						['not-equal', 'Is Not Equal To', false]
					];

					if (numerical) {
						options.push(['greater', 'Is Greather Than', false]);
						options.push(['less', 'Is Less Than', false]);
					} else {
						options.push(['begins', 'Begins With', false]);
					}

				if (advanced === true && range.length === 0) {
					advancedField += '<select id="' + advancedId + '">';

					for (i = 0; i < options.length; i++) {
						advancedField += '<option value="' + options[i][0] + '"';

						if (options[i][2]) {
							advancedField += ' selected="selected"';
						}

						advancedField += '>' + options[i][1] + '</option>';
					}

					advancedField += '</select>';

					return {id: advancedId, field: advancedField};
				}

				return {id: '', field: ''};
			},

			getServer: function (server, id) {
				return server ? server : id;
			},

			getLabel: function (label, range, columns) {
				var newLabel = '',
					j;

				// get the label from the column names if not given
				if (label === undefined) {
					label = [];

					for (j = 0; j < columns.length; j++) {
						label.push(this.s.dt.aoColumns[columns[j]].sTitle);
					}

					label = label.join(' & ');
				}

				if (range.length === 0) {
					newLabel = label;
				} else {
					newLabel = {};
					if (this.hasRange('min', range)) {
						newLabel.min = 'Min ' + label;
					}

					if (this.hasRange('max', range)) {
						newLabel.max = 'Max ' + label;
					}
				}

				return newLabel;
			},


			getType: function (type, columns) {
				var newType = type;

				if (!newType) {
					if (columns.length == 1) {
						newType = this.s.dt.aoColumns[columns[0]].sType;

						if (newType == 'num' || newType == 'currency' || newType == 'num-fmt') {
							newType = 'number';
						}
					} else {
						newType = 'string';
					}
				}

				return newType.toLowerCase();
			},


			hasRange: function ( value, range ) {
				return $.inArray(value, range) >= 0;
			},


			sortBySubArray: function ( a, b ) {
				var minA = a.columns,
					minB = b.columns;

				if ($.isArray(minA)) {
					minA = Math.min.apply(Math, minA);
				}

				if ($.isArray(minB)) {
					minB = Math.min.apply(Math, minB);
				}

				return minA - minB;
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