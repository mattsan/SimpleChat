//----------------------------------------------------------------------
// basic functions (from Learning JavaScript)

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

//----------------------------------------------------------------------

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

function Interval(onInterval)
{
    var id = null;

    this.start = function (time)
    {
        if(id)
        {
            clearInterval(id);
        }

        id = onInterval ? setInterval(onInterval, time) : null;
    };

    this.clear = function ()
    {
        if(id)
        {
            clearInterval(id);
            id = null;
        }
    };
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

//----------------------------------------------------------------------

var xmlhttp = getXmlHttp();

//----------------------------------------------------------------------
// server

function ResponseReceiver(onResponse)
{
    var doResponse = function (response)
    {
        if(onResponse)
        {
            onResponse(response);
        }
    }

    this.responseReceived = function ()
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
            doResponse({ good: false, what: "status error: status = " + xmlhttp.status });
        }

        try
        {
            eval("var response = (" + xmlhttp.responseText + ")");
            doResponse(response);
        }
        catch(e)
        {
            doResponse({ good: false, what: e + "(" + xmlhttp.responseText + ")" });
        }
    }
}

function Server()
{
    var post = function (url, query, onResponse)
    {
        var receiver = new ResponseReceiver(onResponse);

        xmlhttp.open("POST", url, true);
        xmlhttp.onreadystatechange = function () { receiver.responseReceived(); };
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(query);
    };

    this.login = function (password, onResponse)
    {
        post("login.php", "password=" + encodeURIComponent(password), onResponse);
    };

    this.write = function (statement, onResponse)
    {
        post("write.php", "statement=" + statement, onResponse);
    };

    this.read = function (query, onResponse)
    {
        post("read.php", query, onResponse);
    };

    this.configure = function (iconurl, mailaddress, onConfigured)
    {
        var query = "iconurl=" + iconurl + "&mailaddress=" + mailaddress;
        post("configure.php", query, onConfigured);
    };
}

//----------------------------------------------------------------------
// view

function View()
{
    var fill08 = getFiller("0", 8);

    var body         = document.getElementById("body");
    var message_div  = document.getElementById("message_div");
    var entrance_div = document.getElementById("entrance_div");
    var log_div      = document.getElementById("log_div");
    var statements   = document.getElementById("statements");
    var clearLog     = function () { while(statements.hasChildNodes()) { statements.removeChild(statements.firstChild); } };

    body.log      = new Toggle(log_div);
    body.entrance = new Toggle(entrance_div);
    body.help     = new Toggle(document.getElementById("help"));
    body.config   = new Toggle(document.getElementById("config"));

    catchEvent(document.getElementById("help_button"),   "click", function () { body.help.toggle;   });
    catchEvent(document.getElementById("config_button"), "click", function () { body.config.toggle; });

    body.log.hide();
    body.entrance.hide();
    body.help.hide();
    body.config.hide();

    clearLog();

    var addTextWithAnchor = function (elem, source)
    {
        var pattern_http = new RegExp("s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+");

        var s = source;
        var result;
        while((result = pattern_http.exec(s)) != null)
        {
            var plane = document.createTextNode(s.substring(0, result.index));
            elem.appendChild(plane);
            var anchor = document.createElement("a");
            anchor.setAttribute("href", result[0]);
            anchor.setAttribute("target", "_blank");
            anchor.innerHTML = result[0];
            elem.appendChild(anchor);
            s = s.substring(result.index + result[0].length);
        }
        var plane = document.createTextNode(s);
        elem.appendChild(plane);
    };

    var decorate = function (elem)
    {
        var pattern = /\(\((small|large|red|blue|green|yellow):(.*?)\)\)/
        var s = elem.innerHTML;
        while(pattern.test(s))
        {
            s = s.replace(pattern, "<span class=\"deco_$1\">$2</span>");
        }
        elem.innerHTML = s;
    };

    var createNode = function (serial, username, statement, datetime, iconurl)
    {
        var username_span = document.createElement("span");
        username_span.setAttribute("id", "username");
        username_span.innerHTML = username + " &gt; ";

        var matched = datetime.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
        if(matched)
        {
            datetime = matched[1] + "/" + matched[2] + "/" + matched[3] + " - " +
                       matched[4] + ":" + matched[5] + ":" + matched[6];
        }

        var serial_datetime_span = document.createElement("span");
        serial_datetime_span.setAttribute("id", "datetime");
        serial_datetime_span.innerHTML = " - (No." + fill08(serial) + " : " + datetime + ")";
        
        var result  = document.createElement("li");
        result.appendChild(username_span);
        var decoratedStatement = document.createElement("span");
        addTextWithAnchor(decoratedStatement, statement);
        decorate(decoratedStatement);
        result.appendChild(decoratedStatement);
        result.appendChild(serial_datetime_span);
        result.style.backgroundImage = "url(" + iconurl + ")";
        result.setAttribute("id", serial);

        return result;
    };

    var fadein = function (item) {};

    var fadein_ = function (item)
    {
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

    catchEvent(document.getElementById("config_button"), "click", function (event)
    {
        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);
        body.config.toggle();
    });

    catchEvent(document.getElementById("help_button"), "click", function (event)
    {
        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);
        body.help.toggle();
    });

    catchEvent(document.getElementById("config"), "submit", function (event)
    {
        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);

        body.config.hide();
    });

    catchEvent(document.getElementById("selecticon"), "click", function (event)
    {
        var theEvent = event ? event : window.event;
        cancelEvent(theEvent);

        window.setIconUrl = function (iconurl)
        {
            document.getElementById("config").iconurl.value = iconurl;
        };
        window.open("icon.php");;
    });

    this.setLoginSubmitted = function (onSubmitted)
    {
        catchEvent(document.getElementById("entrance"), "submit", function (event)
        {
            var theEvent = event ? event : window.event;
            cancelEvent(theEvent);

            if(onSubmitted)
            {
                onSubmitted(event);
            }
        });
    };

    this.setStatementSubmitted = function (onSubmitted)
    {
        catchEvent(document.getElementById("log"), "submit", function (event)
        {
            var theEvent = event ? event : window.event;
            cancelEvent(theEvent);

            if(onSubmitted)
            {
                onSubmitted(event);
            }
        });
    };

    this.setPreiousRequested = function (onRequested)
    {
        catchEvent(document.getElementById("prev"), "click", function (event)
        {
            var theEvent = event ? event : window.event;
            cancelEvent(theEvent);

            if(onRequested)
            {
                onRequested(event);
            }
        });
    };

    this.setDisconnectRequested = function (onRequested)
    {
        catchEvent(document.getElementById("disconnect"), "click", function (event)
        {
            var theEvent = event ? event : window.event;
            cancelEvent(theEvent);

            if(onRequested)
            {
                onRequested(event);
            }
        });
    };

    this.setConfigured = function (onConfigured)
    {
        body.config.onshow = function ()
        {
            if(onConfigured)
            {
                var values = onConfigured(null);
                var config = document.getElementById("config");
                config.iconurl.value     = values.iconurl;
                config.mailaddress.value = values.mailaddress;
            }
        };

        body.config.onhide = function ()
        {
            if(onConfigured)
            {
                var config = document.getElementById("config");
                onConfigured({ iconurl: config.iconurl.value, mailaddress: config.mailaddress.value });
            }
        };
    };

    this.getNewStatement = function ()
    {
        var result = document.getElementById("log").statement.value;
        document.getElementById("log").statement.value = "";
        return result;
    };

    this.getSerialOfNewestStatement = function ()
    {
        return statements.firstChild ? statements.firstChild.getAttribute("id") : 0;
    };

    this.getSerialOfOldestStatement = function ()
    {
        return statements.lastChild.getAttribute("id");
    };

    this.setUsername = function (username)
    {
    };

    this.setMessage = function (message)
    {
        message_div.innerHTML = message;
    };

    this.showEntrance = function ()
    {
        clearLog();
        body.log.hide();
        body.entrance.show();
        document.getElementById("entrance").username.focus();
    };

    this.showLog = function ()
    {
        body.entrance.hide();
        body.log.show();
        document.getElementById("log").statement.focus();
    };

    this.insertBeforeNewest = function (serial, username, statement, datetime, iconurl)
    {
        var node = createNode(serial, username, statement, datetime, iconurl);
        statements.insertBefore(node, statements.firstChild);
        fadein(node);
    };

    this.appendAfterOldest = function (serial, username, statement, datetime, iconurl)
    {
        var node = createNode(serial, username, statement, datetime, iconurl);
        statements.appendChild(node);
        fadein(node);
    };
}

//----------------------------------------------------------------------
// chat

function Chat(server, view)
{
    var iconurl     = "";
    var mailaddress = "";
    var writing     = false;

    var readUpdated = function ()
    {
        if( ! writing)
        {
            readStatements({ good: true });
        }
    };

    var interval = new Interval(readUpdated);

    var disconnect = function (event)
    {
        eraseCookie("connected");
        interval.clear();
        view.setMessage("ユーザ名とパスワードを入力してください");
        showEntrance();
    };

    var isConnected = function ()
    {
        return readCookie("connected") == "true";
    };

    var appendStatements = function (response)
    {
        if(response.good)
        {
            view.setMessage((new Date()).toLocaleString() + " 現在の発言状況");
            for(var i = 0; i < response.statements.length; ++i)
            {
                var serial    = response.statements[i].serial;
                var username  = decodeURIComponent(response.statements[i].username);
                var statement = decodeURIComponent(response.statements[i].statement);
                var datetime  = response.statements[i].datetime;
                var iconurl   = response.statements[i].iconurl;
                view.appendAfterOldest(serial, username, statement, datetime, iconurl);
            }
        }
        else
        {
            view.setMessage("発言の読み取りに失敗しました：" + response.what);
        }
    };

    var showLogAndReadStatements = function (response)
    {
        if(response.good)
        {
            iconurl     = response.iconurl;
            mailaddress = response.mailaddress;
            setCookie("connected", true); // <<< TODO: isConnected/disconnect と非対称
            view.showLog();
            view.setMessage("最新の発言を読み込み中");
            interval.start(10000);
            server.read("count=20", appendStatements);
        }
        else
        {
            view.setMessage("ログインに失敗しました：" + response.what);
        }
    };

    var insertStatements = function (response)
    {
        if(response.good)
        {
            view.setMessage((new Date()).toLocaleString() + " 現在の発言状況");
            for(var i = response.statements.length - 1; i >= 0; --i)
            {
                var serial    = response.statements[i].serial;
                var username  = decodeURIComponent(response.statements[i].username);
                var statement = decodeURIComponent(response.statements[i].statement);
                var datetime  = response.statements[i].datetime;
                view.insertBeforeNewest(serial, username, statement, datetime, iconurl);
            }
        }
        else
        {
            view.setMessage("発言の読み取りに失敗しました：" + response.what);
        }
        writing = false;
    };

    var readStatements = function (response)
    {
        if(response.good)
        {
            server.read("greater=" + view.getSerialOfNewestStatement(), insertStatements);
        }
        else
        {
            view.setMessage("発言の書き込みに失敗しました：" + response.what);
            writing = false;
        }
    };

    var login = function (event)
    {
        var entrance = document.getElementById("entrance"); // <<< TODO: Viewをバイパスしてる。
        var username = entrance.username.value; // <<< TODO: Viewをバイパスしてる。
        var password = entrance.password.value; // <<< TODO: Viewをバイパスしてる。
        if((username == "") || (password == ""))
        {
            return;
        }

        password = hex_sha1(password);
        view.setMessage("ログイン処理中");
        setCookie("username", username);
        setCookie("password", password);
        server.login(password, showLogAndReadStatements);
    };

    var sendStatement = function (event)
    {
        writing = true;
        var newstatement = view.getNewStatement();
        if(newstatement != "")
        {
            server.write(newstatement, readStatements);
        }
    };

    var readPreviousStatements = function (event)
    {
        server.read("less=" + view.getSerialOfOldestStatement() + "&count=20", appendStatements);
    };

    var showConfiguredResult = function (response)
    {
        if(response.good)
        {
            iconurl     = response.iconurl;
            mailaddress = response.mailaddress;
            view.setMessage("設定を更新しました");
        }
        else
        {
            view.setMessage("設定に失敗しました：" + response.what);
        }
    }

    var setConfig = function (config)
    {
        if(config)
        {
            if((iconurl != config.iconurl) || (mailaddress != config.mailaddress))
            {
                server.configure(config.iconurl, config.mailaddress, showConfiguredResult);
            }
        }
        else
        {
            return { iconurl: iconurl, mailaddress: mailaddress };
        }
    }

    var showEntrance = function ()
    {
        var entrance = document.getElementById("entrance"); // <<< TODO: Viewをバイパスしてる
        entrance.username.value = readCookie("username");   // <<< TODO: Viewをバイパスしてる
        view.showEntrance();
    };

    this.exec = function ()
    {
        view.setLoginSubmitted(login);
        view.setStatementSubmitted(sendStatement);
        view.setPreiousRequested(readPreviousStatements);
        view.setDisconnectRequested(disconnect);
        view.setConfigured(setConfig);

        if(isConnected())
        {
            view.setMessage("ログイン処理中");
            server.login(readCookie("password"), showLogAndReadStatements);
        }
        else
        {
            view.setMessage("ユーザ名とパスワードを入力してください");
            showEntrance();
        }
    };
}

//----------------------------------------------------------------------
// entry point

function setup()
{
    var server = new Server();
    var view   = new View();
    var chat   = new Chat(server, view);
    chat.exec();
}

catchEvent(window, "load", setup);
