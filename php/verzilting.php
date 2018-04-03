<?php
/*
* php database manager
* Deltares, Matthijs Schaap, 4-2018
* saves documents from form
* adds documents to database
* queries database for documents with area
*/
if(isset($_POST['submit'])){
    $db = new Dbase;
    $postData = $_POST;
    //check for valid information
        
    //save document
    $link = 'savedPath';
        
    //add to database    
    $db -> sqlite_addDocumentToDb($postData, $link);
    
    //all is well
    echo $postData['title'];
}

class Dbase {

    const location = "db/phpsqlite.db";
    const tableName = "documents";

    // add entry
    public function sqlite_addDocumentToDb($document, $link)
    {
        $buildTable = "CREATE TABLE IF NOT EXISTS ". self::tableName." (
        id INTERGER PRIMARY KEY,
        Date created TEXT,
        Creator TEXT,
        Format TEXT,
        Title TEXT,
        Authors TEXT,
        Project TEXT,
        Waterbody TEXT,
        Link TEXT
        )";
        
        sqlite_query($buildTable)
            
        $addEntry = "INSERT INTO table1 (
         Date,
         Creator,
         Format,
         Title,
         Authors,
         Project,
         Waterbody,
         Link)
        VALUES
         (
         ".time().",
         ".$document['creator'].",
         ".$document['format'].",
         ".$document['title'].",
         ".$document['author'].",
         ".$document['project'].",
         ".$document['waterbody'].",
         ".$document['link'].",
         )";
        
        sqlite_query($addEntry);
    }
    
    //entries by area
    public function sqlite_fetchEntryByArea($area)
    {
        $query = "SELECT * FROM ".self::tableName." WHERE area='". $area ."'";
        $result = sqlite_query($query);
        print_r( json_encode($result) );
    }

    //open database
    private function sqlite_open()
    {
        $handle = new PDO(self::location) or die("cannot open the database");
        return $handle;
    }

    //read from database
    private function sqlite_query($query)
    {
        $array['dbhandle'] = sqlite_open();
        $array['query'] = $query;
        $result = $dbhandle->query($query);
        return $result;
    }
}
?> 