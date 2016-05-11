(function(win,doc){
	
	try {

		window.NEM=function(){

		}

		window.onerror=function(){

			var data={},errorData={"type":"error"};
			data["emsg"]=arguments[0] || "";
			data["efile"]=arguments[1] || "";
			data["erow"]=arguments[2] || 0;
			data["ecolumn"]=arguments[3] || 0;
			data["estack"]=arguments[4] || "";
			console.log(arguments);
		}

  		var nem={
  			randNum:function(min, max){
  				return min + Math.floor(Math.random() * (max - min));
  			},
  			getEle:function(id){
				return document.getElementById(id);
			},
  			performance:{		
				sendData:function(dt){
					var dt=dt || {};
					var that=this;
					var imgObj=new Image();
					imgObj.src="http://163.com";
				},
				check:function(){
					return !!(win.performance && win.performance.timing)
				},
				tData:function(){
					if(this.check()){
						var timing=win.performance.timing;
						var data={
							"tdns":timing.domainLookupEnd - timing.domainLookupStart,   // dns查询时间
							"ttcp":timing.connectEnd - timing.connectStart,          // tcp连接时间
							"thttpresponse":timing.responseStart - timing.connectEnd,   // 服务器响应时间 ttfb
							"tblankscreen":2,  //白屏时间
							"tfirstscreen":3,  //首屏时间
							"tdomready": timing.domContentLoadedEventEnd - timing.navigationStart,   // domready完毕时间
							"tload":timing.loadEventStart - timing.navigationStart,                  // 页面load完毕时间
							"tstaticnum":(win.performance.getEntries && win.performance.getEntries().length) || 0  //静态资源数量
						};
						return data;
					}
				}
			}
  		}

		window.addEventListener("load",function(){
			setTimeout(function(){
				var tData=nem.performance.tData();
				var getEle=nem.getEle;
				// getEle("dns").innerHTML=tData.tdns;
				// getEle("tcp").innerHTML=tData.ttcp;
				// getEle("httpresponse").innerHTML=tData.thttpresponse;
				// getEle("blankscreen").innerHTML=tData.tblankscreen;
				// getEle("firstscreen").innerHTML=tData.tfirstscreen;
				// getEle("domready").innerHTML=tData.tdomready;
				// getEle("load").innerHTML=tData.tload;
				// getEle("staticnum").innerHTML=tData.tstaticnum;
				console.log(tData);
			},0);
		}, false);

	}catch(e){
		
	}
	
}(window,document));