<?php

header("Content-type: text/plane; charset=utf-8");

$greater = $_POST["greater"];
$less    = $_POST["less"];
$count   = $_POST["count"];

$handle = sqlite3_open("chat.db");

if( ! $handle)
{
    echo "{ \"good\": false, \"what\": \"cannot open database: ".sqlite3_error($handle)."\" }";
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
    echo "{ \"good\": true, \"statements\": [";
    $ss = array();
    while($a = sqlite3_fetch_array($resultset))
    {
        $username  = mb_convert_encoding($a["username"], "utf-8");
        $statement = mb_convert_encoding($a["statement"], "utf-8");
        array_push($ss, "{ \"serial\"    : \"$a[serial]\",".
                        "  \"username\"  : \"$username\",".
                        "  \"statement\" : \"$statement\",".
                        "  \"datetime\"  : \"$a[datetime]\",".
                        "  \"iconurl\"   : \"$a[iconurl]\"".
                        "}");
    }
    sqlite3_query_close($resultset);
    echo join($ss, ",\n")."] }";
}
else
{
    echo "{ \"good\": false, \"what\": \"read statements error: ".sqlite3_error($handle)."\" }";
}

sqlite3_close($handle);

?>
