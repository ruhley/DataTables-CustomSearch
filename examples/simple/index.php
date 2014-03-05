<!DOCTYPE HTML>
<html>
	<head>
		<title>Test</title>
	</head>
	<body>
		<div id="form">
			<input type="text" id="myField">
		</div>

		<table class="stripe hover cell-border order-column">
			<thead>
				<tr>
					<th>First Name</th>
					<th>Last Name</th>
					<th>Age</th>
					<th>Date</th>
					<th>Amount</th>
					<th>Available?</th>
				</tr>
			</thead>
			<tbody>
				<?php
					for($i = 1; $i <= 2500; $i++) {
						print "<tr>
							<td>" . generateName() . "</td>
							<td>" . generateName() . "</td>
							<td>" . generateAge() . "</td>
							<td>" . generateDate() . "</td>
							<td>" . generateCurrency() . "</td>
							<td>" . generateBoolean() . "</td>
						</tr>";
					}
				?>
			</tbody>
		</table>

		<link type="text/css" rel="stylesheet" href="jquery.datatables.1.10-beta2/css/jquery.dataTables.min.css">
		<script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.js"></script>
		<script type="text/javascript" src="jquery.datatables.1.10-beta2/js/jquery.dataTables.js"></script>
		<script type="text/javascript" src="jquery.datatables.customsearch.js"></script>
		<script type="text/javascript">
			$('table').dataTable();

			new $.fn.dataTable.CustomSearch($('table').dataTable(), {
				"container": "#form",
				hideStandardSearch: true,
				fields: [[0,1],2,3,4,5]
			});
		</script>
	</body>
</html>


<?php
	function generateName() {
		$length = mt_rand(3, 10);
		$vowels = array('a', 'e', 'i', 'o', 'u');
		$name = "";

		for($i = 1; $i <= $length; $i++) {
			if ($i == 1) {
				$name .= chr(mt_rand(65, 90));
			} else if ($i % 2 == 0) {
				$name .= $vowels[mt_rand(0, 4)];
			} else {
				$name .= chr(mt_rand(97, 122));
			}
		}

		return $name;
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
?>
