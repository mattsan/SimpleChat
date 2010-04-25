function catchEvent(eventObj, event, eventHandler)
{
    if(eventObj.addEventListener)
    {
        eventObj.addEventListener(event, eventHandler, false);
    }
    else if(eventObj.attachEvent)
    {
        event = "on" + event;
        eventObj.attachEvent(event, eventHandler);
    }
}

function cancelEvent(event)
{
    if(event.preventDefault)
    {
        event.preventDefault();
        event.stopPropagation();
    }
    else
    {
        event.returnValue = false;
        event.cancelBubble = true;
    }
}

function setCookie(key, value)
{
    var cookieDate = new Date(2015, 11, 10, 19, 30, 30);
    document.cookie = key + "=" + encodeURIComponent(value) + "; expires=" + cookieDate.toGMTString();
}

function readCookie(key)
{
    var cookie = document.cookie;
    var first = cookie.indexOf(key + "=");
    if(first >= 0)
    {
        var str = cookie.substring(first, cookie.length);
        var last = str.indexOf(";");
        if(last < 0)
        {
            last = str.length;
        }
        str = str.substring(0, last).split("=");
        return (str) ? decodeURIComponent(str[1]) : "";
    }
    else
    {
        return 0;
    }
}

function eraseCookie(key)
{
    var cookieDate = new Date(2000, 11, 10, 19, 30, 30);
    document.cookie = key + "=; expires=" + cookieDate.toGMTString();
}

function getXmlHttp()
{
    if(window.XMLHttpRequest)
    {
        var xmlhtml = new XMLHttpRequest();
        xmlhtml.overrideMimeType("text/xml");
        return xmlhtml;
    }

    try
    {
        return new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch(e)
    {
        try
        {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch(e)
        {
            return false;
        }
    }
}

var xmlhttp = getXmlHttp();

function Toggle(element)
{
    var visible = true;
    var self    = this;

    this.onshow = null;
    this.onhide = null;

    this.show = function ()
    {
        element.style.display = "block";
        visible = true;
        if(self.onshow)
        {
            self.onshow();
        }
    };

    this.hide = function ()
    {
        element.style.display = "none";
        visible = false;
        if(self.onhide)
        {
            self.onhide();
        }
    };

    this.toggle = function (event)
    {
        if(visible)
        {
            self.hide();
        }
        else
        {
            self.show();
        }

        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);
    };

}

function login(password)
{
    if( ! xmlhttp)
    {
        return;
    }

    var onLoginResultReceived = function ()
    {
        if( ! xmlhttp)
        {
            return;
        }

        if(xmlhttp.readyState != 4)
        {
            return;
        }

        if(xmlhttp.status != 200)
        {
            alert("error:status = " + xmlhttp.status);
            return;
        }

        eval("var response = (" + xmlhttp.responseText + ")");

        if( ! response["success"])
        {
            alert("error:" + response["errormessage"]);
            return;
        }

        body.entrance.hide();
        body.log.show();
        document.log.statement.focus();
        postRequestStatement("count=20", true);
    };

    var url   = "login.php";
    var query = "password=" + encodeURIComponent(password);
    xmlhttp.open("POST", url, true);
    xmlhttp.onreadystatechange = onLoginResultReceived;
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(query);
}

function postRequestStatement(query, insert)
{
    if( ! xmlhttp)
    {
        return;
    }

    onStatementsReceived = function ()
    {
        if( ! xmlhttp)
        {
            return;
        }

        if(xmlhttp.readyState != 4)
        {
            return;
        }

        if(xmlhttp.status != 200)
        {
            addStatement(0, "error", "status = " + xmlhttp.status, datetime, null, true);
            return;
        }

        eval("var response = (" + xmlhttp.responseText + ")");

        var add = function (i)
        {
            var serial    = response[i]["serial"];
            var username  = decodeURIComponent(response[i]["username"]);
            var statement = decodeURIComponent(response[i]["statement"]);
            var datetime  = response[i]["datetime"];
            addStatement(serial, username, statement, datetime, null, insert);
        };
        if(insert) for(var i = response.length - 1; i >= 0; --i) add(i);
        else       for(var i = 0; i < response.length; ++i) add(i);
    }

    var url = "read.php";
    xmlhttp.open("POST", url, true);
    xmlhttp.onreadystatechange = onStatementsReceived;
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(query);
}

function setup()
{
    var body         = document.getElementById("body");
    var message_div  = document.getElementById("message_div");
    var entrance_div = document.getElementById("entrance_div");
    var log_div      = document.getElementById("log_div");

    body.log      = new Toggle(log_div);
    body.entrance = new Toggle(entrance_div);

    var help   = new Toggle(document.getElementById("help"));
    var config = new Toggle(document.getElementById("config"));

    help.hide();
    config.hide();

    catchEvent(document.getElementById("help_button"),   "click", help.toggle);
    catchEvent(document.getElementById("config_button"), "click", config.toggle);

    body.log.hide();
    body.entrance.hide();
    statements = document.getElementById("statements").childCount = 0;


    message_div.innerHTML = "アカウント情報を確認しています";

    var username  = readCookie("username");
    var connected = readCookie("connected");

    if( ! username)
    {
        // アカウントがcookieにない
        message_div.innerHTML = "ユーザ名とパスワードを入力してください";
        body.entrance.show();
        document.entrance.username.focus();
    }
    else if( ! connected)
    {
        // ユーザ名がcookieにあるがログインしていない
        message_div.innerHTML = "ユーザ名とパスワードを入力してください";
        body.entrance.show();
        document.entrance.username.value = username;
        document.entrance.username.focus();
    }
    else
    {
        // ログイン済み
        message_div.innerHTML = username;
        body.log.show();
        document.log.username.focus();
    }

    catchEvent(document.entrance, "submit", function (event)
    {
        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);

        if((document.entrance.username.value != "") && (document.entrance.password.value != ""))
        {
            message_div.innerHTML = document.entrance.username.value;
            setCookie("username", document.entrance.username.value);

            login(document.entrance.password.value);
        }
    });

    catchEvent(document.log, "submit", function (event)
    {
        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);

        if( ! xmlhttp)
        {
            return;
        }

        var newStatement = encodeURIComponent(this.statement.value);
        this.statement.value = "";
        var query = "statement=" + newStatement;
        var url   = "write.php";
        xmlhttp.open("POST", url, true);
        xmlhttp.onreadystatechange = getNewStatements;
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(query);
    });

    var getNewStatements = function ()
    {
        if( ! xmlhttp)
        {
            return;
        }

        if(xmlhttp.readyState != 4)
        {
            return;
        }

        if(xmlhttp.status != 200)
        {
            // http request error
            return;
        }

        var statements = document.getElementById("statements");
        var lastSerial = statements.firstChild.getAttribute ? statements.firstChild.getAttribute("id") : 0;
        postRequestStatement("greater=" + lastSerial, true);
    }

    catchEvent(document.config, "submit", function (event)
    {
        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);
    });

    catchEvent(document.getElementById("prev"), "click", function (event)
    {
        var statements = document.getElementById("statements");
        var oldest = statements.lastChild.getAttribute ? statements.lastChild.getAttribute("id") : 0;
        postRequestStatement("less=" + oldest + "&count=20", false);
    });

/*
    setInterval(function ()
    {
        var statements = document.getElementById("statements");
        var lastSerial = statements.firstChild.getAttribute ? statements.firstChild.getAttribute("id") : 0;
        postRequestStatement("greater=" + lastSerial, true);
    }, 15000);
*/
}

function getFiller(fill, size)
{
    var padding = "";
    for(var i = 0; i < size; ++i)
    {
        padding = padding + fill;
    }

    return function (s)
    {
        return (padding + s).substr(s.length, size);
    };
}

var fill08 = getFiller("0", 8);

function addStatement(serial, name, s, datetime, icon, insert)
{
    var username = document.createElement("span");
    username.setAttribute("id", "username");
    username.innerHTML = name + " &gt; ";

    var matched = datetime.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if(matched)
    {
        datetime = matched[1] + "/" + matched[2] + "/" + matched[3] + " - " +
                   matched[4] + ":" + matched[5] + ":" + matched[6];
    }
    var dt = document.createElement("span");
    dt.style.fontSize = "small";
    dt.style.color    = "silver";
    dt.innerHTML      = " - (No." + fill08(serial) + " : " + datetime + ")";

    var statement  = document.createElement("li");
    statement.appendChild(username);
    statement.appendChild(document.createTextNode(s));
    statement.appendChild(dt);
    statement.style.backgroundImage = icon;
    statement.setAttribute("id", serial);

    var statements = document.getElementById("statements");
    if(insert)
    {
        statements.insertBefore(statement, statements.firstChild);
    }
    else
    {
        statements.appendChild(statement);
    }

    fadein(statement);
}

function fadein(item)
{
    if("フェードインを無効化");
    {
//        return;
    }

    item.style.marginTop = "-" + item.offsetHeight + "px";
    var top = -item.offsetHeight;
    var fadein_id = setInterval(function ()
    {
        if(top < 0)
        {
            item.style.marginTop = top + "px";
            top += 2;
        }
        else
        {
            item.style.marginTop = "0px";
            clearInterval(fadein_id);
        }
    }, 20);
}

function fadeout(item)
{
    var top = 0;
    var fadein_id = setInterval(function ()
    {
        if(top > -item.offsetHeight)
        {
            item.style.marginTop = top + "px";
            top -= 2;
        }
        else
        {
            item.style.marginTop = "-" + item.offsetHeight + "px";
            clearInterval(fadein_id);
        }
    }, 20);
}

catchEvent(window, "load", setup);

