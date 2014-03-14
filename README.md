#DataTables-CustomSearch

An extension to the jQuery plugin DataTables 1.10 (http://next.datatables.net) allowing you to specify custom search fields.


##Quick Example

```javascript
var table = $('table').dataTable();
new $.fn.dataTable.CustomSearch(table, {
  container: '#form',
  hideStandardSearch: true,
  fields: [0]
});
```


##Options

###container
Can be a jQuery selector string or a jQuery object. Will be where the fields are appended to. If not passed in then it will prepend it to the DataTables wrapper (effectively putting it on top of the table).

###hideStandardSearch
Whether or not to hide the DataTables search field.

###fields
An array of columns to give search fields. Starts at index of 0.
```javascript
fields: [0,2,3,4,5,6]
```

If an array is passed in as fields the field will search both columns using OR.
```javascript
fields: [0,[2,3],[4,6],5]
```

If you want to have more control then you need to pass in an object.
```javascript
fields: [
  {
    field: '#myField',
    columns: 0
  },
  [2,3],
  {
    label: 'String Field',
    columns: [4,6],
    type: 'string'
  },
  {
    label: 'Number Field',
    columns: 5,
    type: 'number',
    range: ['min','max']
  },
  {
    type: 'select',
    columns: 7,
    options: [
      {
        value: 'a',
        text: 'abc'
      },
      'def'
    ]
  }
]
```

##Fields Options

####columns
Default: ```[]```<br>
Required<br>
Accepts: number or array of numbers<br>
Requirements: none<br>
This will tie the field to the column(s) (starting with an index of 0).

####field
Default: ''<br>
Optional<br>
Accepts: jQuery selector string or jQuery object<br>
Requirements: none<br>
This will tie an existing field to search the column. If supplied the label, type, and options will be ignored.

####label
Default: Column Header (if a range then a concat of the column headers).<br>
Optional<br>
Accepts: string (plain text or html)<br>
Requirements: none<br>
The text in the ```<label>``` tag.

####type
Default: DataTables column types (https://next.datatables.net/reference/option/columns.type)<br>
Optional<br>
Accepts: ```'string', 'number', 'select', 'date'```<br>
Requirements: none<br>
This specifies the type of field to create, and affects how it is searched.

####range
Default: ```[]```<br>
Optional<br>
Accepts: ```[], ['min'], ['max'], ['min', 'max']```<br>
Requirements: type is number or date<br>
This will create a min and/or max field that the column values will have to be between.

####advanced
Default: false<br>
Optional<br>
Accepts: boolean<br>
Requirements: none<br>
Puts a dropdown in from the of the field giving the user advanced searching options. It will have: contains, does not contain, is equal to, is not equal to. If the type is a number or range then it will give the options is greater than and is less than.

####caseInsensitive
Default: true<br>
Optional<br>
Accepts: boolean<br>
Requirements: none<br>
Whether or not string searches should be case sensitive or not.

####options
Default: The distinct values in the column<br>
Optional<br>
Accepts: an array of strings or objects<br>
Requirements: ```type == 'select'```<br>
This will specify the options available in the select field. If the array item is an object then you need to specify the value and the text of the option. If it is a string then it counts for both. An 'All' option will always be put first with a value of ''.


