<?php
error_reporting(-1);
ini_set('display_errors', 'On');
 cors();
/*
* php database manager
* Deltares, Matthijs Schaap, 4-2018
* saves documents from form
* sends email with form data also link with base64 encoded form data
* gets base64 form data and documents to database
* queries database for documents with request area parameter
*/

if(isset($_POST)){

    $db = new Dbase;
    $postData = $_POST;
    $uploadDir = "D:/Applications/Webserver/Apache24/htdocs/verzilting/files/";
    $tmp_dir = ini_get('upload_tmp_dir') ? ini_get('upload_tmp_dir') : sys_get_temp_dir();

    //save document
    if(! isset($_FILES['document']) || !isset ($_FILES['document']["name"]))
    {
        throw new Exception("No File uploaded");
    }
    if (0 < $_FILES['document']['error'] ) 
    {

        throw new Exception('Failed with error code ' . $_FILES['document']['error']);
    }
    
    $target_fileName = basename($_FILES["document"]["name"]);
    $fileType = strtolower(pathinfo($target_fileName, PATHINFO_EXTENSION));
    
    // Allow certain file formats
    if($fileType != "doc" &&
       $fileType != "docx" &&
       $fileType != "pdf" &&
       $fileType != "ppt" &&
       $fileType != "pptx") {
        throw new Exception("You tried to upload a ".$fileType."-file. Only DOC, DOCX, PDF, PPT & PPTX files are allowed");
    }
        
    //should move uploaded file, but since that does not work, we use copy
    $checkMoved = copy( $tmp_dir.'/'. basename($_FILES["document"]["tmp_name"]),  $uploadDir . $target_fileName);
    
    if ($checkMoved){
        $postData["type"] = $fileType;
        $postData["url"] = "files/" . $target_fileName;
        
        
        if( isset($postData["pass"]) && $postData["pass"] == "VerZilting159945Deltares")
        {
            //add to database    
            $db -> sqlite_addDocumentToDb($postData, "files/" . $target_fileName);
        }
        else
        {
            //mail to admin
            $postData["pass"] = "VerZilting159945Deltares";

            $base64FormData = rtrim( strtr( base64_encode( json_encode($postData) ), '+/', '-_'), '=');
            //we will send and email with the form data plain to check and link with encrypted data to click to enter into database

            $to      = 'shp@deltares.nl, Willem.Stolte@deltares.nl';
            $subject = 'Verzilting app: Nieuwe upload';
            $message = 'Beste Admin'. "\r\n"
                . "Er is een nieuwe upload klaar voor inspectie. Hieronder ziet u een overzicht van de informatie in deze upload:" . "\r\n" 
                . "\r\n" 
                . "Uploader: ". $postData['creator'] . "\r\n" 
                . "Organisatie: ". $postData['organisation'] . "\r\n" 
                . "Titel: ". $postData['title'] . "\r\n" 
                . "Auteur: ". $postData['author'] . "\r\n" 
                . "Samenvatting: ". $postData['abstract'] . "\r\n" 
                . "Projectnaam: ". $postData['project'] . "\r\n" 
                . "Type: ". $postData['type'] . "\r\n" 
                . "Waterlichaam id: ". $postData['waterbody'] . "\r\n" 
                . "Document: " ."files/" . $postData['url'] . "\r\n" 
                . "\r\n" 
                . "If this information is correct, please click here: http://d01518:8080/verzilting/upload/index.html?data=".$base64FormData. "\r\n" 
                . "\r\n" 
                . "Until the above information has been submitted, it will not be available to users.";

            $headers = 'From: fileuploader@deltares.nl' . "\r\n" .
            'Reply-To: noreply@deltares.nl' . "\r\n" .
            'X-Mailer: PHP/' . phpversion();

            echo $message;
            echo $subject;
            echo $to;
            echo $headers;
            echo "\r\n";
            echo $base64FormData;

            mail($to, $subject, $message, $headers);
        }
    }
    else
    {
         echo $tmp_dir . basename($_FILES["document"]["tmp_name"]);
         throw new Exception('Failed to move uploaded file:'. $target_fileName );
    }
}

//check if function is set
if(isset($_GET['function']) && $_GET['function'] === "getDocumentsByWaterbodyId"){
    
    $db = new Dbase;
    echo json_encode($db->sqlite_fetchEntiesByArea($_GET["id"]));
}

    
class Dbase {

    private $location = "sqlite:../db/phpsqlite.db";
    private $tableName = "documents";

    // add entry
    public function sqlite_addDocumentToDb($document, $link)
    {
        $buildTable = "CREATE TABLE IF NOT EXISTS ". $this->tableName." (
        id INTEGER PRIMARY KEY,
        Date created INTEGER,
        Creator TEXT,
        Organisation TEXT,
        Format TEXT,
        Title TEXT,
        Authors TEXT,
        Abstract TEXT,
        Project TEXT,
        Waterbody TEXT,
        Link TEXT
        )";
        
        $this -> sqlite_query($buildTable);
        
        $addEntry = "INSERT INTO ". $this->tableName." (
             Date,
             Creator,
             Organisation,
             Format,
             Title,
             Authors,
             Abstract,
             Project,
             Waterbody,
             Link
         )
         VALUES
         (
         ".time().",
         '".$this->test_input($document['creator'])."',
         '".$this->test_input($document['organisation'])."',
         '".$this->test_input($document['type'])."',
         '".$this->test_input($document['title'])."',
         '".$this->test_input($document['author'])."',
         '".$this->test_input($document['abstract'])."',
         '".$this->test_input($document['project'])."',
         '".$this->test_input($document['waterbody'])."',
         '".$link."'
         )";
        $this -> sqlite_query($addEntry);
    }
    
    //entries by area
    public function sqlite_fetchEntiesByArea($areaID)
    {
        $query = "SELECT * FROM ".$this->tableName." WHERE instr(Waterbody, '". $areaID ."') > 0";
        $result = $this ->sqlite_query($query);
        
        $entries = array();

        $result->setFetchMode(PDO::FETCH_ASSOC);
    
        return $result->fetchAll();
    }

    //open database
    private function sqlite_open()
    {
        $handle = new PDO($this->location) or die("cannot open the database");
        return $handle;
    }

    //read from database
    private function sqlite_query($query)
    {
        $dbhandle = $this->sqlite_open();
        $result = $dbhandle->query($query);
        return $result;
    }
    
    private function test_input($data) 
    {
      $data = trim($data);
      $data = stripslashes($data);
      $data = htmlspecialchars($data);
      return $data;
    }
}

function cors() {

    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
        // you want to allow, and if so:
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            // may also be using PUT, PATCH, HEAD etc
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }

    //echo "You have CORS!";
}
?> 