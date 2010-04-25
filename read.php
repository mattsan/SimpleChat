<?php

$greater = $_POST["greater"];
$less    = $_POST["less"];
$count   = $_POST["count"];

//echo "$lastserial\n";

echo "[\n";
$resource = sqlite3_open("chat.db");

if($resource)
{
    $query = "select serial, username, statement, datetime from 'statements'";
    if($greater && $less)
    {
        $query .= " where (serial < $less) and ($greater < serial)";
    }
    else if($greater)
    {
        $query .= " where ($greater < serial)";
    }
    else if($less)
    {
        $query .= " where (serial < $less)";
    }

    $query .= " order by serial desc";
    if($count)
    {
        $query .= " limit 0, $count";
    }
    $query .= ";";

    $resultset = sqlite3_query($resource, $query);


    if($resultset)
    {
        while($a = sqlite3_fetch_array($resultset))
        {
            echo "  { serial : \"$a[serial]\", username : \"$a[username]\", statement : \"$a[statement]\", datetime : \"$a[datetime]\" },\n";
        }
        sqlite3_query_close($resultset);
    }

    sqlite3_close($resource);
}
echo "]\n";

?>