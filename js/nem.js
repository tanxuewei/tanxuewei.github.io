(function(win,doc){
	
	try {
		/**
	     * 初始化(ua相关)
	     */
		var LIBVERSION  = '0.7.10',
	        EMPTY       = '',
	        UNKNOWN     = '?',
	        FUNC_TYPE   = 'function',
	        UNDEF_TYPE  = 'undefined',
	        OBJ_TYPE    = 'object',
	        STR_TYPE    = 'string',
	        MAJOR       = 'major', 
	        MODEL       = 'model',
	        NAME        = 'name',
	        TYPE        = 'type',
	        VERSION     = 'version';

		//工具函数对象
		var util={
			setCookie:function(name,value){
				var Days = 30; 
    			var exp = new Date(); 
    			exp.setTime(exp.getTime() + Days*24*60*60*1000); 
    			document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString(); 
			},
			randNum:function(){
				return 1000000000 + Math.floor(Math.random() * (9999999999 - 1000000000));
			},
			getCookie:function(name) {
			  var value = "; " + document.cookie;
			  var parts = value.split("; " + name + "=");
			  if (parts.length == 2) return parts.pop().split(";").shift();
			},
			getEle:function(id){
				return document.getElementById(id);
			},
			addEvent:function(el,type,handler){
				if(el.addEventListener){
					el.addEventListener(type,handler,false);
				}else if(el.attachEvent){
					el.attachEvent("on"+type,handler);
				}else{
					el["on"+type]=handler;
				}
			},	
			removeEvent:function(el,type,handler){
				if(el.removeEventListener){
					el.removeEventListener(type,handler,false);
				}else if(el.detachEvent){
					el.detachEvent("on"+type,handler);
				}else{
					el["on"+type]=null;
				}
			},
			obj2string:function(obj){
				var parts = [];
			    for (var i in obj) {
			        if (obj.hasOwnProperty(i)) {
			            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
			        }
			    }
    			return parts.join("&");
			},
			//extend,has,major为ua信息的util
			extend: function (regexes, extensions) {
	            for (var i in extensions) {
	                if ("browser cpu device engine os".indexOf(i) !== -1 && extensions[i].length % 2 === 0) {
	                    regexes[i] = extensions[i].concat(regexes[i]);
	                }
	            }
	            return regexes;
	        },
	        has: function (str1, str2) {
		        if (typeof str1 === "string") {
		            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
		        } else {
		            return false;
		        }
	        },
	        major: function (version) {
	            return typeof(version) === STR_TYPE ? version.split(".")[0] : undefined;
	        },
	        //合并两个对象
	        merge: function(target, source) {
			    /* Merges two (or more) objects,
			       giving the last one precedence */
			    if ( typeof target !== 'object' ) {
			        target = {};
			    }
			    for (var property in source) {
			        if ( source.hasOwnProperty(property) ) {
			            var sourceProperty = source[ property ];
			            if ( typeof sourceProperty === 'object' ) {
			                target[ property ] = util.merge( target[ property ], sourceProperty );
			                continue;
			            }
			            target[ property ] = sourceProperty;
			        }
			    }
			    for (var a = 2, l = arguments.length; a < l; a++) {
			        merge(target, arguments[a]);
			    }
			    return target;
			}
		}
		/**
	     * mapper(ua相关)
	     */
	    var mapper = {

	        rgx : function () {

	            var result, i = 0, j, k, p, q, matches, match, args = arguments;

	            // loop through all regexes maps
	            while (i < args.length && !matches) {

	                var regex = args[i],       // even sequence (0,2,4,..)
	                    props = args[i + 1];   // odd sequence (1,3,5,..)

	                // construct object barebones
	                if (typeof result === UNDEF_TYPE) {
	                    result = {};
	                    for (p in props) {
	                        if (props.hasOwnProperty(p)){
	                            q = props[p];
	                            if (typeof q === OBJ_TYPE) {
	                                result[q[0]] = undefined;
	                            } else {
	                                result[q] = undefined;
	                            }
	                        }
	                    }
	                }

	                // try matching uastring with regexes
	                j = k = 0;
	                while (j < regex.length && !matches) {
	                    matches = regex[j++].exec(this.getUA());
	                    if (!!matches) {
	                        for (p = 0; p < props.length; p++) {
	                            match = matches[++k];
	                            q = props[p];
	                            // check if given property is actually array
	                            if (typeof q === OBJ_TYPE && q.length > 0) {
	                                if (q.length == 2) {
	                                    if (typeof q[1] == FUNC_TYPE) {
	                                        // assign modified match
	                                        result[q[0]] = q[1].call(this, match);
	                                    } else {
	                                        // assign given value, ignore regex match
	                                        result[q[0]] = q[1];
	                                    }
	                                } else if (q.length == 3) {
	                                    // check whether function or regex
	                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
	                                        // call function (usually string mapper)
	                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
	                                    } else {
	                                        // sanitize match using given regex
	                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
	                                    }
	                                } else if (q.length == 4) {
	                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
	                                }
	                            } else {
	                                result[q] = match ? match : undefined;
	                            }
	                        }
	                    }
	                }
	                i += 2;
	            }
	            return result;
	        },

	        str : function (str, map) {

	            for (var i in map) {
	                // check if array
	                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
	                    for (var j = 0; j < map[i].length; j++) {
	                        if (util.has(map[i][j], str)) {
	                            return (i === UNKNOWN) ? undefined : i;
	                        }
	                    }
	                } else if (util.has(map[i], str)) {
	                    return (i === UNKNOWN) ? undefined : i;
	                }
	            }
	            return str;
	        }
	    };
	    /**
	     * maps(ua相关)
	     */
	    var maps = {

	        browser : {
	            oldsafari : {
	                version : {
	                    '1.0'   : '/8',
	                    '1.2'   : '/1',
	                    '1.3'   : '/3',
	                    '2.0'   : '/412',
	                    '2.0.2' : '/416',
	                    '2.0.3' : '/417',
	                    '2.0.4' : '/419',
	                    '?'     : '/'
	                }
	            }
	        },
	        os : {
	            windows : {
	                version : {
	                    'ME'        : '4.90',
	                    'NT 3.11'   : 'NT3.51',
	                    'NT 4.0'    : 'NT4.0',
	                    '2000'      : 'NT 5.0',
	                    'XP'        : ['NT 5.1', 'NT 5.2'],
	                    'Vista'     : 'NT 6.0',
	                    '7'         : 'NT 6.1',
	                    '8'         : 'NT 6.2',
	                    '8.1'       : 'NT 6.3',
	                    '10'        : ['NT 6.4', 'NT 10.0'],
	                    'RT'        : 'ARM'
	                }
	            }
	        }
	    };
	    /**
	     * regexes(ua相关)
	     */
	    var regexes = {
	        browser : [[
	            // Presto based
	            /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
	            /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
	            /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
	            /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80

	            ], [NAME, VERSION], [

	            /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
	            ], [[NAME, 'Opera'], VERSION], [

	            // Mixed
	            /(kindle)\/([\w\.]+)/i,                                             // Kindle
	            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
	                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

	            // Trident based
	            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
	                                                                                // Avant/IEMobile/SlimBrowser/Baidu
	            /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

	            // Webkit/KHTML based
	            /(rekonq)\/([\w\.]+)*/i,                                            // Rekonq
	            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i
	                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS
	            ], [NAME, VERSION], [

	            /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
	            ], [[NAME, 'IE'], VERSION], [

	            /(edge)\/((\d+)?[\w\.]+)/i                                          // Microsoft Edge
	            ], [NAME, VERSION], [

	            /(yabrowser)\/([\w\.]+)/i                                           // Yandex
	            ], [[NAME, 'Yandex'], VERSION], [

	            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
	            ], [[NAME, /_/g, ' '], VERSION], [

	            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,
	                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
	            /(qqbrowser)[\/\s]?([\w\.]+)/i
	                                                                                // QQBrowser
	            ], [NAME, VERSION], [

	            /(uc\s?browser)[\/\s]?([\w\.]+)/i,
	            /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i,
	            /JUC.+(ucweb)[\/\s]?([\w\.]+)/i
	                                                                                // UCBrowser
	            ], [[NAME, 'UCBrowser'], VERSION], [

	            /(dolfin)\/([\w\.]+)/i                                              // Dolphin
	            ], [[NAME, 'Dolphin'], VERSION], [

	            /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
	            ], [[NAME, 'Chrome'], VERSION], [

	            /XiaoMi\/MiuiBrowser\/([\w\.]+)/i                                   // MIUI Browser
	            ], [VERSION, [NAME, 'MIUI Browser']], [

	            /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i         // Android Browser
	            ], [VERSION, [NAME, 'Android Browser']], [

	            /FBAV\/([\w\.]+);/i                                                 // Facebook App for iOS
	            ], [VERSION, [NAME, 'Facebook']], [

	            /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
	            ], [VERSION, [NAME, 'Firefox']], [

	            /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
	            ], [VERSION, [NAME, 'Mobile Safari']], [

	            /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
	            ], [VERSION, NAME], [

	            /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
	            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

	            /(konqueror)\/([\w\.]+)/i,                                          // Konqueror
	            /(webkit|khtml)\/([\w\.]+)/i
	            ], [NAME, VERSION], [

	            // Gecko based
	            /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
	            ], [[NAME, 'Netscape'], VERSION], [
	            /(swiftfox)/i,                                                      // Swiftfox
	            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
	                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
	            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
	                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
	            /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

	            // Other
	            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
	                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
	            /(links)\s\(([\w\.]+)/i,                                            // Links
	            /(gobrowser)\/?([\w\.]+)*/i,                                        // GoBrowser
	            /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
	            /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
	            ], [NAME, VERSION]
	        ],
	        os : [[
	            // Windows based
	            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
	            ], [NAME, VERSION], [
	            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
	            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
	            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
	            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
	            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

	            // Mobile/Embedded OS
	            /\((bb)(10);/i                                                      // BlackBerry 10
	            ], [[NAME, 'BlackBerry'], VERSION], [
	            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
	            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
	            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
	                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
	            /linux;.+(sailfish);/i                                              // Sailfish OS
	            ], [NAME, VERSION], [
	            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
	            ], [[NAME, 'Symbian'], VERSION], [
	            /\((series40);/i                                                    // Series 40
	            ], [NAME], [
	            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
	            ], [[NAME, 'Firefox OS'], VERSION], [

	            // Console
	            /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

	            // GNU/Linux based
	            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
	            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
	            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
	                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
	                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
	            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
	            /(gnu)\s?([\w\.]+)*/i                                               // GNU
	            ], [NAME, VERSION], [

	            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
	            ], [[NAME, 'Chromium OS'], VERSION],[

	            // Solaris
	            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
	            ], [[NAME, 'Solaris'], VERSION], [

	            // BSD based
	            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
	            ], [NAME, VERSION],[

	            /(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i              // iOS
	            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

	            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
	            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
	            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

	            // Other
	            /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,                            // Solaris
	            /(haiku)\s(\w+)/i,                                                  // Haiku
	            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
	            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
	                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
	            /(unix)\s?([\w\.]+)*/i                                              // UNIX
	            ], [NAME, VERSION]
	        ]
	    };
		/**
	     * Constructor(ua相关)
	     */
	    var UAParser = function (uastring, extensions) {

	        if (!(this instanceof UAParser)) {
	            return new UAParser(uastring, extensions).getResult();
	        }

	        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
	        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

	        this.getBrowser = function () {
	            var browser = mapper.rgx.apply(this, rgxmap.browser);
	            browser.major = util.major(browser.version);
	            return browser;
	        };
	        this.getOS = function () {
	            return mapper.rgx.apply(this, rgxmap.os);
	        };
	        this.getReferrer = function(){
	            return (document&&document.referrer?document.referrer:EMPTY);
	        };
	        this.getResolution = function(){
	            return (window && window.screen)?(window.screen.width+'*'+window.screen.height):EMPTY;
	        };
	        this.getResult = function() {
	            return {
	                ua          : this.getUA(),
	                uostype     : this.getOS().name || EMPTY,
	                uosversion  : this.getOS().version || EMPTY,
	                ubrowsertype    : this.getBrowser().name || EMPTY,
	                ubrowserversion : this.getBrowser().major || EMPTY,
	                ureferrer   : this.getReferrer()||'无',
	                uresolution : this.getResolution()
	            };
	        };
	        this.getUA = function () {
	            return ua;
	        };
	        this.setUA = function (uastring) {
	            ua = uastring;
	            return this;
	        };
	        this.setUA(ua);
	        return this;
	    };

	    UAParser.VERSION = LIBVERSION;
	    UAParser.BROWSER = {
	        NAME    : NAME,
	        MAJOR   : MAJOR, 
	        VERSION : VERSION
	    };
	    UAParser.OS = {
	        NAME    : NAME,
	        VERSION : VERSION
	    };

		//发送采集数据
		function sendDataFun(str,type){
			var random=util.randNum();
			var imgObj=new Image();
			//随机数+用户唯一标识+打点数据类型+打点数据内容
			imgObj.src="http://www.163.com/xx.gif?random="+random+"&"+"userid="+_unique_user+"&"+"dtype="+type+"&"+str;
		}

		//确认独立访客
		var _unique_user_cookie=util.getCookie("_nem_user");
		if(!_unique_user_cookie){

			//设置独立访客cookie
			var dt=new Date().getTime();
			var rand=util.randNum(); 
			util.setCookie("_nem_user","NEM."+rand+"."+dt);  // 随机数+时间戳
			var _unique_user=rand+"."+dt;
		
		}else{
			var _unique_user=_unique_user_cookie.substring(4);
		}

		//domReady时间兼容
		function contentLoaded(fn) {
            var done = false, top = true,
                doc = window.document,
                root = doc.documentElement,
                modern = doc.addEventListener,
                add = modern ? 'addEventListener' : 'attachEvent',
                rem = modern ? 'removeEventListener' : 'detachEvent',
                pre = modern ? '' : 'on',
                init = function(e) {
                    if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                    (e.type == 'load' ? window : doc)[rem](pre + e.type, init, false);
                    if (!done && (done = true)) fn.call(window, e.type || e);
                },
                poll = function() {
                    try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
                    init('poll');
                };
                if (doc.readyState == 'complete') fn.call(window, 'lazy');
                else {
                    if (!modern && root.doScroll) {
                        try { top = !window.frameElement; } catch(e) { }
                        if (top) poll();
                    }
                    doc[add](pre + 'DOMContentLoaded', init, false);
                    doc[add](pre + 'readystatechange', init, false);
                    window[add](pre + 'load', init, false);
                }
        }
        contentLoaded(function(){NEM.domReady=new Date().getTime()});

		//页面打点接口
		NEM.marksArr=[];
		NEM.mark=function(){
			if(markName && (typeof markName=="string")){
				var obj={
					"markName":"",
					"time":0
				};
				obj["markName"]=markName || "";
				obj["time"]=new Date().getTime();
				this.marksArr.push(obj);

				if(arguments[1] && arguments[1]===true){
					//发送打点数据
					var sendData=util.obj2string(obj);
					sendDataFun(sendData,"mark");
				}
				return obj;
			}
		}
		NEM.measure=function(measureName,markStart,markEnd){
			var markStart,markEnd,markStartTime,markEndTime,measureObj={};
				var marksArr=this.marksArr;

			if(measureName && measureName=="firstscreen"){
				//首屏时间
				NEM["firstscreen"]=(new Date().getTime()-NEM.config.clientStart)/1000;
			}else if(measureName && measureName=="blankscreen"){
				//白屏时间
				NEM["blankscreen"]=(new Date().getTime()-NEM.config.clientStart)/1000;
			}

			if(measureName && (typeof measureName =="string") && markStart && (typeof markStart =="string")){

				if(markEnd && (typeof markEnd =="string")){
					for(var i=0,len=marksArr.length;i<len;i++){
						if(marksArr[i].markName==markStart){
							markStartTime=marksArr[i]["time"]; 
						}else if(marksArr[i].markName==markEnd){
							markEndTime=marksArr[i]["time"]; 
						}
					}
				}else if(arguments.length==2){
					//没传markEnd，则markEnd的时间为当前时间戳
					for(var i=0,len=marksArr.length;i<len;i++){
						if(marksArr[i].markName==markStart){
							markStartTime=marksArr[i]["time"]; 
						}
						markEndTime=new Date().getTime();
					}
				}

				if(markStartTime && markEndTime && (markEndTime >= markStartTime)){
					measureObj[measureName]=(markEndTime-markStartTime)/1000;
					var sendData=util.obj2string(measureObj);
					sendDataFun(sendData,"mark");
				}
			}		
		}

		// js异常和错误捕捉
		window.onerror=function(){
			var data={};
			data["emsg"]=arguments[0] || "";
			data["efile"]=arguments[1] || "";
			data["erow"]=arguments[2] || 0;
			data["ecolumn"]=arguments[3] || 0;
			data["estack"]=arguments[4] || "";

			var getEle=util.getEle;
			getEle("emsg").innerHTML=data["emsg"] ? data["emsg"]:"无";
			getEle("efile").innerHTML=data["efile"] ?  data["efile"] : "无";
			getEle("erow").innerHTML=data["erow"] ? data["erow"] : "无";
			getEle("ecolumn").innerHTML=data["ecolumn"] ? data["ecolumn"] : "无";
			getEle("estack").innerHTML=data["estack"] ? data["estack"] : "无";

			//发送采集数据
			var sendData=util.obj2string(data);
			sendDataFun(sendData,"error");
		}

		//加载时间获取
  		var performance={		
			check:function(){
				return !!(window.performance && window.performance.timing)
			},
			getDomReadyTime:function(){
				var clientStart=NEM.config.clientStart;
				var domReady=NEM.domReady;
				return domReady-clientStart;
			},
			getLoadTime:function(){
  				var clientStart=NEM.config.clientStart;
				var now=new Date().getTime();
				return now-clientStart;
  			},
  			getBlankScreenTime:function(){
  				//白屏
  				if(NEM.blankscreen){
  					var clientStart=NEM.config.clientStart;
					var blankScreen=NEM.blankscreen;
					return (blankScreen-clientStart)/1000;
  				}else{
  					return 0;
  				}
  			},
  			getFirstScreenTime:function(){
  				//首屏
  				if(NEM.firstscreen){
  					var clientStart=NEM.config.clientStart;
					var firstScreen=NEM.firstscreen;
					return (firstScreen-clientStart)/1000;
  				}else{
  					return 0;
  				}
  			},	
			timeData:function(){
				var parser = new UAParser();
                var result = parser.getResult() || {};

				if(this.check()){
					var timing=window.performance.timing;
					var data={
						"tdns":(timing.domainLookupEnd - timing.domainLookupStart)/1000,   // dns查询时间
						"ttcp":(timing.connectEnd - timing.connectStart)/1000,          // tcp连接时间
						"thttpresponse":(timing.responseStart - timing.connectEnd)/1000,   // 服务器响应时间
						"tblankscreen":this.getBlankScreenTime() ? this.getBlankScreenTime() : (timing.responseStart - timing.navigationStart)/1000,  //白屏时间
						"tfirstscreen":this.getFirstScreenTime() ? this.getFirstScreenTime() : 0,  //首屏时间
						"tdomready":(timing.domContentLoadedEventEnd - timing.navigationStart)/1000,   // domready完毕时间
						"tload":(timing.loadEventEnd - timing.navigationStart)/1000,                  // 页面load完毕时间
						"tstaticnum":(win.performance.getEntries && win.performance.getEntries().length) || 0,  //静态资源数量,
						"timingsupport":1    // 是否支持window.performance.timing
					};
				}else{
					var data={
						"tdns":0, 
						"ttcp":0,         
						"thttpresponse":0,   
						"tblankscreen":this.getBlankScreenTime() ? this.getBlankScreenTime() : 0,  
						"tfirstscreen":this.getFirstScreenTime() ? this.getFirstScreenTime() : 0,
						"tdomready":(this.getDomReadyTime())/1000,
						"tload":(this.getLoadTime())/1000,             
						"tstaticnum":0,
						"timingsupport":0   // ie9及以上才支持window.performance.timing查询
					};
				}
				util.merge(data,result);
				return data;
			}
		}

  		var loadEvent=function(){
  			setTimeout(function(){
				var timeData=performance.timeData();
				var getEle=util.getEle;

				if(timeData.timingsupport){
					getEle("support").innerHTML="是";
				}else{
					getEle("support").innerHTML="否";
				}
				// getEle("ua").innerHTML=timeData.ua;
				getEle("os").innerHTML=timeData.uostype+'/'+timeData.uosversion;
				getEle("browser").innerHTML=timeData.ubrowsertype+'/'+timeData.ubrowserversion;
				getEle("resolution").innerHTML=timeData.uresolution;
				getEle("referrer").innerHTML=timeData.ureferrer;

				getEle("uid").innerHTML=_unique_user;
				getEle("dns").innerHTML=timeData.tdns+"s";
				getEle("tcp").innerHTML=timeData.ttcp+"s";
				getEle("httpresponse").innerHTML=timeData.thttpresponse+"s";
				getEle("blankscreen").innerHTML=timeData.tblankscreen+"s";
				getEle("firstscreen").innerHTML=timeData.tfirstscreen+"s";
				getEle("domready").innerHTML=timeData.tdomready+"s";
				getEle("load").innerHTML=timeData.tload+"s";
				getEle("staticnum").innerHTML=timeData.tstaticnum+"个";

				//发送采集数据
				var sendData=util.obj2string(timeData);
				sendDataFun(sendData,"resource");

			},20);
  		};	

  		// load事件以后触发
  		util.addEvent(window,"load",loadEvent)

	}catch(e){
		//console.log(e);
	}
	
}(window,document));