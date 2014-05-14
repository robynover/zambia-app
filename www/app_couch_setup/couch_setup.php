<?php
ini_set('display_errors',1);

/**** FILL IN DATABASE NAME HERE ****/
// name the database whatever you like, as long as it is unique
$dbname = 'zambia_app';

$options = new StdClass;
$options->url_base = 'http://127.0.0.1:5984/';
$options->url_endpoint = '';
$options->method = 'PUT';
$options->payload = false;

$db_created = false;
// create a new database (PUT)
$options->url_endpoint = $dbname;
$r1 = sendCurlReq($options);
$r1json = json_decode($r1);
if ($r1json->ok === true){
	echo "<p>Created new database <b>{$dbname}</b>. ";
	echo "<pre>";
	echo $r1;
	echo "</pre>";
	$db_created = true;
} else {
	echo "<p>There was an error creating a new database <b>{$dbname}</b>. ";
}
echo 'Couch returned response:</p>';
echo "<pre>";
echo $r1;
echo "</pre>";

if ($db_created){
	// put design docs
	// geo
	$options->url_endpoint = "$dbname/_design/geo";
	$options->method = 'PUT';
	$design_doc_geo = file_get_contents('couch_views/geo_views.json');
	$options->payload = $design_doc_geo;
	$r2 = sendCurlReq($options);
	$r2json = json_decode($r2);
	if ($r2json->ok === true){
		echo '<p>Created design doc "geo" ';
	} else {
		echo '<p>There was an error creating the design document "geo". ';
	}
	echo 'Couch returned respoonse:</p>';
	echo "<pre>";
	echo $r2;
	echo "</pre>";

	//study data records
	$options->url_endpoint = "$dbname/_design/study";
	$design_doc_study = file_get_contents('couch_views/study_views.json');
	$options->payload = $design_doc_study;
	$r3 = sendCurlReq($options);
	$r3json = json_decode($r3);
	if ($r3json->ok === true){
		echo '<p>Created design doc, "study". ';
		 
	} else {
		echo '<p>There was an error creating the design document "study". ';
	}
	echo 'Couch returned response:</p>';
	echo "<pre>";
	echo $r3;
	echo "</pre>";
}


function sendCurlReq($options){
	$ch = curl_init();
	//curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:5984/'.$table); //'http://127.0.0.1:5984/_uuids'
	curl_setopt($ch, CURLOPT_URL, $options->url_base . $options->url_endpoint);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $options->method);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); //sets curl to send back response data instead of bool

	if ($options->payload){
		// payload is a JSON string
		curl_setopt($ch, CURLOPT_POSTFIELDS, $options->payload);
	}
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
	    'Content-type: application/json',
	    'Accept: */*'
	));
	$response = curl_exec($ch);
	curl_close($ch);
	return $response;
}



