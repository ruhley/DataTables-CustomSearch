<!DOCTYPE HTML>
<html>
	<head>
		<title>Example 06 - Thead Advanced</title>

		<link type="text/css" rel="stylesheet" href="//cdn.datatables.net/1.10.0-beta.2/css/jquery.dataTables.css">
		<link type="text/css" rel="stylesheet" href="//code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css">
		<link type="text/css" rel="stylesheet" href="../resources/SyntaxHighlighter/shCore.css">
		<link type="text/css" rel="stylesheet" href="../resources/SyntaxHighlighter/shThemeDefault.css">

		<script type="text/javascript" src="//code.jquery.com/jquery-2.1.0.js"></script>
		<script type="text/javascript" src="//cdn.datatables.net/1.10.0-beta.2/js/jquery.dataTables.js"></script>
		<script type="text/javascript" src="//code.jquery.com/ui/1.10.3/jquery-ui.min.js"></script>
		<script type="text/javascript" src="../resources/SyntaxHighlighter/shCore.js"></script>
		<script type="text/javascript" src="../resources/SyntaxHighlighter/shBrushJScript.js"></script>
		<script type="text/javascript" src="../resources/SyntaxHighlighter/shBrushXml.js"></script>
		<script type="text/javascript" src="../../jquery.datatables.customsearch.min.js"></script>
		<script type="text/javascript">
			$(document).ready(function(){
				$('#dataTable').dataTable({
					ajax: '../resources/table-data.json'
				}).customSearch({
					container: 'thead:after',
					fields: [
						{
							columns: 3,
							type: 'select'
						},{
							columns: [0,1],
							type: 'select'
						},{
							columns: 2,
							type: 'select'
						},{
							columns: 4,
							range: true
						},{
							columns: 6,
							type: 'select'
						}
					]
				});

				$('#code').tabs();

				$('#code-json pre').load('../resources/table-data.json');
				SyntaxHighlighter.all();
			});
		</script>
	</head>
	<body>
		<table id="dataTable" class="display">
			<thead>
				<tr>
					<th>First Name</th>
					<th>Last Name</th>
					<th>Age</th>
					<th>Date</th>
					<th>Amount</th>
					<th>Available?</th>
					<th>Race</th>
				</tr>
			</thead>
			<tbody></tbody>
		</table>

		<div id="code">
			<ul>
				<li><a href="#code-js">Javascript</a></li>
				<li><a href="#code-html">HTML</a></li>
				<li><a href="#code-css">CSS</a></li>
				<li><a href="#code-json">JSON</a></li>
			</ul>

			<div id="code-js">
				<pre class="brush: js">
					$('table').dataTable({
						ajax: '../resources/table-data.json'
					}).customSearch({
						container: 'thead:after',
						fields: [
							{
								columns: 3,
								type: 'select'
							},{
								columns: [0,1],
								type: 'select'
							},{
								columns: 2,
								type: 'select'
							},{
								columns: 4,
								range: true
							},{
								columns: 6,
								type: 'select'
							}
						]
					});
				</pre>

				<p>The following Javascript libraries were used for this example</p>
				<ul>
					<li>//code.jquery.com/jquery-2.1.0.js</li>
					<li>//cdn.datatables.net/1.10.0-beta.2/js/jquery.dataTables.js</li>
					<li>../../jquery.datatables.customsearch.js</li>
				</ul>
			</div>

			<div id="code-html">
				<pre class="brush: xml">
					<table id="dataTable" class="display">
						<thead>
							<tr>
								<th>First Name</th>
								<th>Last Name</th>
								<th>Age</th>
								<th>Date</th>
								<th>Amount</th>
								<th>Available?</th>
								<th>Race</th>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
				</pre>
			</div>

			<div id="code-css">
				<p>The following CSS libraries were used for this example</p>
				<ul>
					<li>//cdn.datatables.net/1.10.0-beta.2/css/jquery.dataTables.css</li>
				</ul>
			</div>

			<div id="code-json">
				<p>The contents of the JSON file loaded into the table</p>

				<pre class="brush: js">

				</pre>
			</div>
		</div>
	</body>
</html>