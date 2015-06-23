/*! jQuery DataTables Custom Search Plugin - v0.9.0 (2014-11-21) | Copyright 2014 Timothy Ruhle; Licensed MIT */
(function (window, document, undefined) {
	'use strict';

	var factory = function ($, DataTable) {

		var CustomSearch = function (table, config) {
			var that = this;

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
				global: {},
				fields: [],
				container: '',
				hideStandardSearch: true
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
			$(table).on('init.dt', function () {
				that.init(table, config);
			});

			// Return this for chaining
			return this;
		};

		CustomSearch.prototype = {
			/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
			 * Private methods (they are of course public in JS, but recommended as private)
			 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
			init: function (table, config) {
				var that = this,
					i,
					j,
					k,
					id,
					field,
					form = [],
					type,
					element,
					currentColumn,
					sequentialCount,
					method,
					row;

				this.s.dt = new DataTable.Api(table).settings()[0];
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

					// bring in the global settings
					field = $.extend(true, {}, this.c.global, field);

					field.columns         = $.isArray(field.columns) ? field.columns : [field.columns];
					field.columns.sort();
					field.multiple        = this.getMultiple(field.multiple);
					field.type            = this.getType(field.type, field.columns);
					field.dataType        = this.getDataType(field.columns);
					field.range           = this.getRange(field.range);
					field.slider          = field.slider === true && this.hasRange('min', field.range) && this.hasRange('max', field.range);
					field.label           = this.getLabel(field.label, field.range, field.columns, field.slider);
					field.id              = this.getId(i, field.range, field.field, field.slider);
					field.advanced        = this.getAdvanced(field.advanced, field.range, field.id, field.type);
					field.server          = this.getServer(field.server, field.id);
					field.caseInsensitive = field.caseInsensitive !== false;
					field.smart           = field.smart === true;
					field.autocomplete    = field.autocomplete === true;
					field.chosen          = field.chosen === true;
					field.trigger         = field.trigger === 'key' ? 'keyup' : 'change';
					field                 = this.getField(field);

					// makes sure the changes to the field are pushed back to the config
					this.c.fields[i] = field;

					form.push(field.fullField);
				}

				this.c.fields.sort(this.sortBySubArray);

				if (this.c.container === 'thead' || this.c.container === 'tfoot') {
					type = this.c.container.indexOf('thead') >= 0 ? 'thead' : 'tfoot';
					element = this.s.table.find(type);
					row = element.find('tr');
					if (element.length === 0) {
						this.s.table.append('<' + type + '>');
						element = this.s.table.find(type);
						row = $('<tr>').appendTo(element);

						for (i = 0; i < this.s.dt.aoColumns.length; i++) {
							row.append($('<th>').toggle(this.s.dt.aoColumns[i].bVisible));
						}
					}

					for (i = 0; i < this.c.fields.length; i++) {
						row.find('th').eq(this.c.fields[i].columns[0]).append(this.c.fields[i].field);
					}
				} else if (this.c.container === 'thead:before' || this.c.container === 'thead:after' ||
						this.c.container === 'tfoot:before' || this.c.container === 'tfoot:after') {
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

				for (i = 0; i < this.c.fields.length; i++) {
					field = this.c.fields[i];
					if (field.autocomplete) {
						$('#' + field.id).autocomplete({
							source: that.getDistinctValuesInColumn(field.columns, field.dataType, true),
							select: function (evt, ui) {
								$(this).val(ui.item.label);
								that.triggerSearch();
							}
						})[field.trigger](function () {
							that.triggerSearch();
						});
					} else if (field.slider) {
						j = this.getDistinctValuesInColumn(field.columns, field.dataType, true);
						$('#' + field.id).slider({
							min: that.intParse(j[0]),
							max: that.intParse(j[j.length - 1]),
							values: [that.intParse(j[0]), that.intParse(j[j.length - 1])],
							range: true,
							slide: function (evt, ui) {
								$('#' + this.id + '_display').text(ui.values[0] + ' - ' + ui.values[1]);
								that.triggerSearch();
							}
						});

						$('#' + field.id + '_display').text(j[0] + ' - ' + j[j.length - 1]);
					} else {
						id = [];
						if (field.range.length === 0) {
							id.push(field.id);
						} else {
							if (field.id.min) {
								id.push(field.id.min);
							}

							if (field.id.max) {
								id.push(field.id.max);
							}
						}
						$('#' + id.join(',#'))[field.trigger](function () {
							that.triggerSearch();
						});

						if (field.chosen) {
							$('#' + id.join(',#')).chosen({
								allow_single_deselect: true,
								width: '100%'
							});
						}

						if (field.type === 'switch') {
							$('#' + field.id).buttonset();
						}
					}
				}


				if (!this.s.dt.oInit.serverSide) {
					this.s.table.dataTable().DataTable.ext.search.push(function (settings, data, dataIndex) {
						if (settings.nTable.id === that.s.dt.nTable.id) {
							return that.search(settings, data, dataIndex);
						}

						return true;
					});
				}

				if ($.isFunction(this.c.after)) {
					this.s.table.on('search.dt', function (evt, settings) {
						var rows = settings.aiDisplay,
							data = that.s.table.DataTable().data(),
							pagePassedData = [],
							allPassedData = [],
							i,
							to = settings._iDisplayStart + settings._iDisplayLength;

						if (to > data.length) {
							to = data.length;
						}

						if (to > rows.length) {
							to = rows.length;
						}

						for (i = settings._iDisplayStart; i < to; i++) {
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
						if (field.type === 'switch') {
							value = [];
							$('#' + field.id + ' input:checked').each(function () {
								value.push($(this).val());
							});
						} else {
							value = $('#' + field.id).val();
						}

						if (!value) {
							value = '';
						}

						if (value.length) {
							pass = false;

							if (field.type === 'date' && !advancedValue) {
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
						if (field.slider) {
							values = {
								min: $('#' + field.id).slider('values', 0),
								max: $('#' + field.id).slider('values', 1)
							};
						} else {
							values = {
								min: this.hasRange('min', field.range) ? $('#' + field.id.min).val() : '',
								max: this.hasRange('max', field.range) ? $('#' + field.id.max).val() : ''
							};
						}

						if (!values.min) {
							values.min = '';
						}

						if (!values.max) {
							values.max = '';
						}

						if (values.min || values.max) {
							pass = false;
							for (j = 0; j < field.columns.length; j++) {
								if (field.type === 'date') {
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
				var i,
					stringNumber,
					searchNumber;

				if (caseInsensitive) {
					string = string.toLowerCase();
				}

				stringNumber = this.intParse(string);

				if (!$.isArray(search)) {
					search = [search];
				}

				for (i = 0; i < search.length; i++) {
					if (caseInsensitive) {
						search[i] = search[i].toLowerCase();
					}

					searchNumber = this.intParse(search[i]);

					if ((!advanced || advanced === 'contains') && string.search(search[i]) !== -1) {
						return true;
					} else if (advanced === 'not-contains' && string.search(search[i]) === -1) {
						return true;
					} else if (advanced === 'equal' && string === search[i]) {
						return true;
					} else if (advanced === 'not-equal' && string !== search[i]) {
						return true;
					} else if (advanced === 'greater' && stringNumber > searchNumber) {
						return true;
					} else if (advanced === 'less' && stringNumber < searchNumber) {
						return true;
					} else if (advanced === 'begins' && string.indexOf(search[i]) === 0) {
						return true;
					}
				}

				return false;
			},

			searchNumberRange: function (cell, values) {
				cell = this.intParse(cell);
				values.min = this.intParse(values.min);
				values.max = this.intParse(values.max);

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

				return (this.isValidDate(cell) && cell.getDate() === value.getDate());
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
					(!this.isValidDate(values.min) && values.max.getDate() >= cell.getDate()) ||
					(values.min.getDate() <= cell.getDate()            && !this.isValidDate(values.max)) ||
					(values.min.getDate() <= cell.getDate()            && values.max.getDate() >= cell.getDate())
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


			createField: function (field) {
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
				case 'date':
					if (field.range.length === 0) {
						if (field.label) {
							field.fieldLabel = '<label for="' + field.id + '">' + field.label + '</label>';
						}

						field.field = field.advanced.field + '<input type="' + field.type + '" id="' + field.id + '">';
					} else {
						if (field.slider) {
							field.fieldLabel = '<label for="' + field.id + '">' + field.label + '</label>';
							field.field = field.advanced.field + '<div id="' + field.id + '"></div><div id="' + field.id + '_display"></div>';
						} else {
							if (this.hasRange('min', field.range)) {
								if (field.label) {
									field.fieldLabel.push('<label for="' + field.id.min + '">' + field.label.min + '</label>');
								}
								field.field.push('<input type="' + field.type + '" id="' + field.id.min + '">');
							}

							if (this.hasRange('max', field.range)) {
								if (field.label) {
									field.fieldLabel.push('<label for="' + field.id.max + '">' + field.label.max + '</label>');
								}
								field.field.push('<input type="' + field.type + '" id="' + field.id.max + '">');
							}
						}
					}
					break;

				case 'select':
					if (field.label) {
						field.fieldLabel = '<label for="' + field.id + '">' + field.label + '</label>';
					}

					if (!$.isArray(field.options) || field.options.length === 0) {
						field.options = this.getDistinctValuesInColumn(field.columns, field.dataType, true);
					}

					field.field = field.advanced.field + '<select id="' + field.id + '"';

					if (field.multiple) {
						field.field += ' multiple="multiple"';
					}

					field.field += '>';

					if (!field.multiple) {
						field.options.unshift({
							value: '',
							text: field.chosen ? '' : 'All'
						});
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

				case 'switch':
					if (!$.isArray(field.options) || field.options.length === 0) {
						field.options = this.getDistinctValuesInColumn(field.columns, field.dataType, true);
					}

					for (i = 0; i < field.options.length; i++) {
						if (typeof field.options[i] === 'object') {
							field.field.push('<input type="checkbox" id="' + field.id + '_' + i + '" name="' + field.id + '"' + field.options[i].value + '>');
							field.field.push('<label for="' + field.id + '_' + i + '">' + field.options[i].text + '</label>');
						} else {
							field.field.push('<input type="checkbox" id="' + field.id + '_' + i + '" name="' + field.id + '" value="' + field.options[i] + '">');
							field.field.push('<label for="' + field.id + '_' + i + '">' + field.options[i] + '</label>');
						}
					}

					field.field.unshift('<div id="' + field.id + '">');
					field.field.push('</div>');

					field.field = field.field.join('');
					break;

				default:
					throw ('Warning: CustomSearch init failed due to invalid field type given - ' + field.type);
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


			getDistinctValuesInColumn: function (columns, dataType, sort) {
				var options = [],
					that = this;

				$.each(this.s.dt.aoData, function (index, row) {
					var data = [],
						i;

					if ($.isArray(columns)) {
						for (i = 0; i < columns.length; i++) {
							data.push(row._aData[columns[i]]);
						}
					} else {
						data.push(row._aData[columns]);
					}

					data = data.join(' ');

					if ($.inArray(data, options) === -1) {
						options.push(data);
					}
				});

				if (sort) {
					if (dataType === 'string' || dataType === 'date') {
						options.sort();
					} else {
						options.sort(function (a, b) { return that.intParse(a) - that.intParse(b); });
					}
				}

				return options;
			},

			getMultiple: function (multiple) {
				return multiple === true;
			},

			intParse: function (number) {
				return parseInt(number.toString().replace(/[^\d]/i, ''), 10);
			},

			getId: function (index, range, field, slider) {
				var baseId = this.s.dt.sInstance + '_' + index,
					newId,
					fieldId;

				if (range.length === 0 || slider) {
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
					numerical = type === 'number' || type === 'date',
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
				return server || id;
			},

			getLabel: function (label, range, columns, slider) {
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

				if (range.length === 0 || slider) {
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
					if (columns.length === 1) {
						newType = this.s.dt.aoColumns[columns[0]].sType;

						if (newType === 'num' || newType === 'currency' || newType === 'num-fmt') {
							newType = 'number';
						}
					} else {
						newType = 'string';
					}
				}

				return newType.toLowerCase();
			},

			getDataType: function (columns) {
				var newDataType = 'string';

				if (columns.length === 1) {
					newDataType = this.s.dt.aoColumns[columns[0]].sType;

					if (newDataType === 'num' || newDataType === 'currency' || newDataType === 'num-fmt') {
						newDataType = 'number';
					}
				}

				return newDataType.toLowerCase();
			},


			hasRange: function (value, range) {
				return $.inArray(value, range) >= 0;
			},


			sortBySubArray: function (a, b) {
				var minA = a.columns,
					minB = b.columns;

				if ($.isArray(minA)) {
					minA = Math.min.apply(Math, minA);
				}

				if ($.isArray(minB)) {
					minB = Math.min.apply(Math, minB);
				}

				return minA - minB;
			},


			triggerSearch: function () {
				var ajax, j;

				if (this.s.dt.oInit.serverSide) {
					ajax = this.s.dt.ajax;

					if (typeof ajax === 'string') {
						ajax = {url: ajax, data: {}};
					}

					ajax.data.customsearch = {};

					for (j = 0; j < this.c.fields.length; j++) {
						ajax.data.customsearch[this.c.fields[j].server] = $('#' + this.c.fields[j].id).val();
					}

					this.s.dt.ajax = ajax;
				}

				this.s.table.DataTable().draw();
			}



		};

		// Alias for access
		DataTable.CustomSearch = CustomSearch;

		return CustomSearch;
	};


	if (typeof define === 'function' && define.amd) { // Define as an AMD module if possible
		define('datatables-customsearch', ['jquery', 'datatables'], factory);
	} else if (jQuery && !jQuery.fn.dataTable.CustomSearch) { // Otherwise simply initialise as normal, stopping multiple evaluation
		factory(jQuery, jQuery.fn.dataTable);
	}

	jQuery.fn.customSearch = function (options_arg) {
		$(this.selector).each(function () {
			new jQuery.fn.dataTable.CustomSearch(this, options_arg);
		});
		return this;
	};

}(window, document));
