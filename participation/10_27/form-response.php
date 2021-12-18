<?php
	
    if(isset($_GET['name']) && !empty($_GET['name'])) {
        $name = $_GET["name"];
		$qty = $_GET["qty"];
		
		$myObj->method = "GET";
		$myObj->name = $name;
		$myObj->qty = $qty;
		$myObj->colors = array("red", "green", "blue");
		$myJSON = json_encode($myObj);
		    
		echo $myJSON;
	}
	else if(isset($_POST['name']) && !empty($_POST['name'])) {
		$name = $_POST["name"];
		$qty = $_POST["qty"];
		
		$myObj->method = "POST";
		$myObj->name = $name;
		$myObj->qty = $qty;
		$myObj->colors = array("red", "green", "blue");
		$myJSON = json_encode($myObj);
		    
		echo $myJSON;
	}
	else {
		# code...
		echo json_encode("<p>Form not completed</p>");
	}	
?>