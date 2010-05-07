<?php

header("Content-type: text/plane; charset=utf-8");

$greater = $_POST["greater"];
$less    = $_POST["less"];
$count   = $_POST["count"];
$databasename = "chat";

if( ! mysql_connect())
{
    echo "{ \"good\": false, \"what\": \"cannot connect DBMS: ".mysql_error()."\" }";
    return;
}

if( ! mysql_select_db($databasename))
{
    echo "{ \"good\": false, \"what\": \"cannot select database: ".mysql_error()."\" }";
    mysql_close();
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

$resultset = mysql_query($query);

if($resultset)
{
    echo "{ \"good\": true, \"statements\": [";
    $ss = array();
    while($a = mysql_fetch_assoc($resultset))
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
    mysql_free_result($resultset);
    echo join($ss, ",\n")."] }";
}
else
{
    echo "{ \"good\": false, \"what\": \"read statements error: ".mysql_error()."\" }";
}

mysql_close();

?>
