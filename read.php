<?php

$greater = $_POST["greater"];
$less    = $_POST["less"];
$count   = $_POST["count"];

$handle = sqlite3_open("chat.db");

if( ! $handle)
{
    echo "{ good: false, what: \"cannot open database: ".sqlite3_error($handle)."\" }";
    return;
}

$query = "select serial, statements.username, statement, datetime, iconurl".
         "  from statements natural left join accounts";
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

$resultset = sqlite3_query($handle, $query);

if($resultset)
{
    echo "{ good: true, statements: [";
    while($a = sqlite3_fetch_array($resultset))
    {
        echo "{ serial    : \"$a[serial]\",".
             "  username  : \"$a[username]\",".
             "  statement : \"$a[statement]\",".
             "  datetime  : \"$a[datetime]\",".
             "  iconurl   : \"$a[iconurl]\"".
             "},\n";
    }
    sqlite3_query_close($resultset);
    echo "] }";
}
else
{
    echo "{ good: false, what: \"read statements error: ".sqlite3_error($handle)."\" }";
}

sqlite3_close($handle);

?>