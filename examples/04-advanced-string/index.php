<!DOCTYPE HTML>
<html>
	<head>
		<title>Test</title>

		<link type="text/css" rel="stylesheet" href="//datatables.net/download/build/nightly/jquery.dataTables.css?_=1c0eb9540e67f90cd07fa12f4da56554">
		<script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.js"></script>
		<script type="text/javascript" src="//datatables.net/download/build/nightly/jquery.dataTables.min.js?_=898a29d5c2a3871243ceea4db156ac44"></script>
		<script type="text/javascript" src="../../jquery.datatables.customsearch.js"></script>
		<script type="text/javascript">
			$(document).ready(function(){
				$('table').dataTable();

				new $.fn.dataTable.CustomSearch($('table').dataTable(), {
					container: '#container',
					hideStandardSearch: true,
					fields: [
						{
							columns: [0,1],
							advanced: true,
							caseInsensitive: false
						},
						{
							columns: 2,
							advanced: true,
						},
						{
							columns: 3,
							advanced: true
						},
						{
							columns: 4,
							advanced: true
						}
					]
				});
			});
		</script>
	</head>
	<body>
		<div id="container"></div>
		<table class="stripe hover cell-border order-column">
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
			<tbody>
				<?php
					for($i = 1; $i <= 1000; $i++) {
						print "<tr>
							<td>" . generateName() . "</td>
							<td>" . generateName() . "</td>
							<td>" . generateAge() . "</td>
							<td>" . generateDate() . "</td>
							<td>" . generateCurrency() . "</td>
							<td>" . generateBoolean() . "</td>
							<td>" . generateRace() . "</td>
						</tr>";
					}
				?>
			</tbody>
		</table>
	</body>
</html>


<?php
	function generateName() {
		$length = mt_rand(3, 10);
		$vowels = array('a', 'e', 'i', 'o', 'u');
		$consonants = array('b', 'c', 'd', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z');
		$name = "";

		for($i = 1; $i <= $length; $i++) {
			if ($i % 2 == 0) {
				$name .= $vowels[mt_rand(0, count($vowels) - 1)];
			} else {
				$name .= $consonants[mt_rand(0, count($vowels) - 1)];
			}
		}

		return ucfirst($name);
	}

	function generateAge() {
		return mt_rand(18, 111);
	}

	function generateDate() {
		return mt_rand(1988, 2014) . '/' . mt_rand(1, 12) . '/' . mt_rand(1, 30);
	}

	function generateCurrency() {
		return '$' . mt_rand(0, 20000);
	}

	function generateBoolean() {
		return mt_rand(0, 1) == 1 ? "Yes" : "No";
	}

	function generateRace() {
		$races = array(
			'Mongoloid',
			'Caucasoid',
			'Australoid',
			'Negroid',
			'Capoid'
		);

		return $races[mt_rand(0, count($races) - 1)];
	}
?>
