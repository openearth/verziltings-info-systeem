<?php
error_reporting(E_ALL);
ini_set('display_errors',1);
/*
* php database manager
* Deltares, Matthijs Schaap, 4-2018
* saves documents from form
* adds documents to database
* queries database for documents with area
*/

//If submit == true we have data from the form
if(isset($_POST['submit'])){
    $db = new Dbase;
    $postData = $_POST;
    $uploadDir = "D:/Applications/Webserver/Apache24/htdocs/verzilting/files/";
    $tmp_dir = ini_get('upload_tmp_dir') ? ini_get('upload_tmp_dir') : sys_get_temp_dir();
        
    //save document
    if ( 0 < $_FILES['document']['error'] ) {
        echo 'Error: ' . $_FILES['file']['error'] . '<br>';
        die;
    }
    if(!isset ($_FILES['document']["name"]))
    {
        echo 'Error: No File uploaded <br>';
        die;
    }
    
    $target_fileName = basename($_FILES["document"]["name"]);
    $fileType = strtolower(pathinfo($target_fileName, PATHINFO_EXTENSION));
    
    // Allow certain file formats
    if($fileType != "doc" &&
       $fileType != "docx" &&
       $fileType != "pdf" &&
       $fileType != "ppt" &&
       $fileType != "pptx") {
        echo "You tried to upload a ".$fileType."-file. ";
        echo "However only DOC, DOCX, PDF, PPT & PPTX files are allowed.";
        die;
    }
    
    //should move uploaded file, but since that does not work, we use copy
    $checkMoved = copy( $tmp_dir.'/'. basename($_FILES["document"]["tmp_name"]),  $uploadDir . $target_fileName);
    if ($checkMoved){
         $postData["type"] = $fileType;
        //add to database    
        $db -> sqlite_addDocumentToDb($postData, "files/" . $target_fileName);

        //all is well
        echo $target_fileName.' was uploaded successfully';
    }
    else
    {
        echo $tmp_dir . basename($_FILES["document"]["tmp_name"]);
        echo 'Failed to move uploaded file:'. $target_fileName .'<br>';
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
        Format TEXT,
        Title TEXT,
        Authors TEXT,
        Project TEXT,
        Waterbody TEXT,
        Link TEXT
        )";
        
        $this -> sqlite_query($buildTable);
        
        $addEntry = "INSERT INTO ". $this->tableName." (
             Date,
             Creator,
             Format,
             Title,
             Authors,
             Project,
             Waterbody,
             Link
         )
         VALUES
         (
         ".time().",
         '".$this->test_input($document['creator'])."',
         '".$this->test_input($document['type'])."',
         '".$this->test_input($document['title'])."',
         '".$this->test_input($document['author'])."',
         '".$this->test_input($document['project'])."',
         '".$this->test_input($document['waterbody'])."',
         '".$link."'
         )";
        $this -> sqlite_query($addEntry);
    }
    
    //entries by area
    public function sqlite_fetchEntiesByArea($areaID)
    {
        $query = "SELECT * FROM ".$this->tableName." WHERE Waterbody='". $areaID ."'";
        $result = $this ->sqlite_query($query);
        
        $entries = array();

        $result->setFetchMode(PDO::FETCH_ASSOC);
/*
        while ($row = $result->fetch()) {

            extract($row);
            $entries[] = array(
                "title" -> $row["Title"],
                "author" -> $row["Author"],
                "link" -> $row["Link"],
                "project" -> $row["Project"],
            );
        }
 */       
        
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
?> 