DataTables-CustomSearch
=======================

An extension to the jQuery plugin DataTables allowing you to specify custom search fields


Quick Example
-------------

```javascript
var table = $('table').dataTable();
new $.fn.dataTable.CustomSearch(table, {
  container: '#form',
  removeStandardSearch: true,
  columns: [0]
});
```


Options
-------

####container
Can be a jQuery selector string or a jQuery object. Will be where the fields are appended to. If not passed in then it will prepend it to the DataTables wrapper (effectively putting it on top of the table).

####removeStandardSearch
Whether or not to remove the DataTables search field.

####columns
An array of columns to give search fields. Starts at index of 0.
```javascript
columns: [0,2,3,4,5,6]
```

If an array is passed in as column the field will search both columns using OR.
```javascript
columns: [0,[2,3],[4,6],5]
```

If you want to have more control then you need to pass in an object.
```javascript
columns: [
  0,
  [2,3],
  {
    label: 'Field Label',
    columns: [4,6],
    type: 'string'
  },
  {
    label: 'Number Field',
    columns: 5,
    type: 'number',
    range: true
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

The label will default to the column header. If a range it will concat multiple column headers.
The columns option can be a number or an array of numbers and will tie the field to the columns (starting with an index of 0). 
The range option will only work if the type is number or date add it will add a min and max fields that the column will have to be between. This will default to false. You can specify true, 'min', 'max', ['min'], ['max'], ['min', 'max'].

The type option will specify the type of field. This will default to the DataTables column types (https://next.datatables.net/reference/option/columns.type). 

If select is chosen it uses the options option. This defaults to getting all the distinct values in the column. Otherwise an array needs to be passed in. The values can be an object that specifies both value and text or a string that counts for both. An All option will always be first with a value of ''.


