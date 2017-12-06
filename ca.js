// LICENSE
// You can copy, modify and distribute this JS file for XMPP Web Interface under these terms:
// You must leave the "About" creators function in your copy.
// You can change default XMMP Server to any of your convenience.
//
// This JS have been created by Circuitos Aljarafe ( http://955170000.com ) based on XMPP 
// Javascript port from Strophe project.
// This JS requires other JS files from the Strophe project.

var lang="es";

if (lang == "es") {
var help_webrtc   = "Abrir chat de Voz y Video";
var help_fonts    = "Configurar mis fonts";
var help_sendfile = "Enviar un fichero";
var help_getvcard = "Informaci&oacute;n del usuario";
var help_savechat = "Salvar &eacute;sta converaci&oacute;n";
var help_insert   = "Insertar una imagen";
var help_user_del = "Borrar contacto";
var help_empty    = "";
var msg_login = "Introduzca su login o bien un nuevo Login y Clave para crear su cuenta.";
var msg_add ="Añadir";
var msg_budy="Entre el contacto USUARIO@DOMINIO:";
}

if (lang == "en") {
var help_webrtc   = "Open Video/Voice chat";
var help_fonts    = "Set my fonts";
var help_sendfile = "Send a file";
var help_getvcard = "Get user info";
var help_savechat = "Save this conversation";
var help_insert   = "Insert an image";
var help_user_del = "Delete user";
var help_empty    = "";
var msg_login = "Enter your login or new Login and Password to create a new one.";
var msg_add="Add";
var msg_budy="Enter USER@DOMAIN:";
}


var uniqueId = 0;
var uid      = 0;
var contents;
var size     = "2000";
var resource = "CA1";
var filename,file,part,fileb64;
var connection,idresponse,nbuddys,k=0,next_msg=[],next_msg2=[],userinfo=[],photodata=[],alias=[],statuses=[],firstime=1,mybuddy;
var textlog    = new Object();
var has_webrtc = 0;
var jids       = [];
var hash_jids  = new Object();
var rooms = [],nrooms = 1;
var active_room;
var newuser = 0;
var pre_msg=[];
var recibido=0;

for(m=0;m<1000;m++) {
	photodata[m]="";
}

var Ca = function() {

  login();
  // var connection = null;
  var obj = {
	go: function(un, pw) {
		var un_server="xmpp.interec.com";
		hash_jids[un_server]="NONE";
		//un=document.getElementById('un').value;
		//pw=document.getElementById('pw').value;
		un = un +"@" + un_server;
		$("#login_result").html("");

		Strophe.log = function(level, log) {
			console.log("Logger:"+log);
		};
		console.log("connecting...");
		var server = $("#server").val();
		//connection = new Strophe.Connection({proto : new Strophe.Websocket("ws://" + server + ":5288/ws-xmpp")});
		//connection = new Strophe.Connection({proto : new Strophe.Websocket("ws://" + server + ":5280/http-bind")});
		// connection = new Strophe.Connection("/http-bind/", {protocol: "ws"});
		connection=new Strophe.Connection('http://xmpp.interec.com:5280/http-bind');

		connection.rawInput = function(log) {
			var xml = $($.parseXML(log));
			var mystyle="",insertstyle="";
			var log2 = xml.find("iq").text();
			log2.replace(/>/g, '&gt;');
			log2.replace(/</g, '&lt;');

			// $("#msgs").prepend("<pre><i>" + log2 + "</i></pre>");   // DEBUG




			if(xml.find("body").text().length) {
				// var from = xml.find("message").attr("from").split("@")[0];
				var from = "me";
				var msg = xml.find("message").find("body").text();
				if(xml.find("html").attr("xmlns") == "http://jabber.org/protocol/xhtml-im") {
					xml.find("span").each(function () { ;
						mystyle=$(this).attr("style");
						insertstyle += mystyle;
					});
					msg = xml.find("html").find("body").text();
				}

				if (msg) {
					var from = xml.find("message").attr("from").split("@")[0];
					if (from != "xmpp.interec.com") {
						if(!document.getElementById(from)) {
							create_room(from);
						}

						var element = document.getElementById(from+"msgs");
						element.style.backgroundColor="#FFCACA";
						$("#"+from+"msgs").append("<p style='font-size:10px;color:#000096;'><strong>" + from + "</strong>: <span style='" +insertstyle + "'>" + msg + "</span></p>");
						document.getElementById(from+"container").scrollTop += 300;
						textlog[from] +=  new Date().toISOString() + " " + from + ":" + msg + "\n";
						if (from != active_room) {
							document.getElementById('nav_'+from).style.backgroundColor="#b9e390";
						}
					}
				}
			}

			var from = xml.find("message").attr("from");

			if(xml.find("iq").attr("type") == "result") {
				if(xml.find("si").attr("xmlns") == "http://jabber.org/protocol/si") {

					var fileHandler = function (from, sid, filename, size, mime) {
   							// received a stream initiation
  							// be prepared
					};
					connection.si_filetransfer.addFileHandler(fileHandler);

					if(xml.find("x").attr("xmlns") == "jabber:x:data") { 
						if(xml.find("x").attr("type") == "submit") {
							alert(xml+"Se ha recibido un submit");
							// Enviar el stream
						}
					}
				}
				
				if(xml.find("pubsub").attr("xmlns") == "http://jabber.org/protocol/pubsub") {
					if(xml.find("items").attr("node") == "urn:xmpp:avatar:data") {
						var itemid = xml.find("item").attr("id");
						var data   = xml.find("data").text();
						var avatar = Base64.decode(data);
						// show_avatar(data);
					
					} 
				}

				if(xml.find("vCard").attr("xmlns") == "vcard-temp") {
					// alert("Recibimos una vcard"+nbuddys);
					// recibimos info de una vcard, posiblemente la nuestra propia, pero puede ser de otro usuario
				   var remite = xml.find("iq").attr("from").split("@")[0];
				   if(document.getElementById(remite + "vcard")) {
					document.getElementById("FN").innerHTML = xml.find("FN").text();
					document.getElementById("NICKNAME").innerHTML= xml.find("NICKNAME").text();
					document.getElementById("URL").innerHTML= xml.find("URL").text();
					document.getElementById("BDAY").innerHTML= xml.find("BDAY").text();
					document.getElementById("ORG.ORGNAME").innerHTML= xml.find("ORG").find("ORGNAME").text();
					document.getElementById("ORG.ORGUNIT").innerHTML= xml.find("ORG").find("ORGUNIT").text();
					document.getElementById("TITLE").innerHTML= xml.find("TITLE").text();
					document.getElementById("ROLE").innerHTML= xml.find("ROLE").text();
					document.getElementById("TEL.WORK.VOICE.NUMBER").innerHTML= xml.find("TEL").find("WORK").find("VOICE").find("NUMBER").text();
					document.getElementById("TEL.WORK.FAX.NUMBER").innerHTML= xml.find("TEL").find("WORK").find("FAX").find("NUMBER").text();
					document.getElementById("ADR.WORK.EXTADD").innerHTML = xml.find("ADR").find("WORK").find("EXTADD").text();
					document.getElementById("ADR.WORK.STREET").innerHTML= xml.find("ADR").find("WORK").find("STREET").text();
					document.getElementById("ADR.WORK.LOCALITY").innerHTML= xml.find("ADR").find("WORK").find("LOCALITY").text();
					document.getElementById("ADR.WORK.REGION").innerHTML= xml.find("ADR").find("WORK").find("REGION").text();
					document.getElementById("ADR.WORK.PCODE").innerHTML= xml.find("ADR").find("WORK").find("PCODE").text();
					document.getElementById("ADR.WORK.CTRY").ineerHTML= xml.find("ADR").find("WORK").find("CTRY").text();

					document.getElementById("TEL.HOME.VOICE.NUMBER").innerHTML= xml.find("TEL").find("HOME").find("VOICE").find("NUMBER").text();
					document.getElementById("TEL.HOME.FAX.NUMBER").innerHTML= xml.find("TEL").find("HOME").find("FAX").find("NUMBER").text();
					document.getElementById("ADR.HOME.EXTADD").innerHTNL= xml.find("ADR").find("HOME").find("EXTADD").text();
					document.getElementById("ADR.HOME.STREET").innerHTML= xml.find("ADR").find("HOME").find("STREET").text();
					document.getElementById("ADR.HOME.LOCALITY").innerHTML= xml.find("ADR").find("HOME").find("LOCALITY").text();
					document.getElementById("ADR.HOME.REGION").innerHTML= xml.find("ADR").find("HOME").find("REGION").text();
					document.getElementById("ADR.HOME.PCODE").innerHTML= xml.find("ADR").find("HOME").find("PCODE").text();
					document.getElementById("ADR.HOME.CTRY").innerHTML= xml.find("ADR").find("HOME").find("CTRY").text();
					document.getElementById("EMAIL.INTERNET.PREF.USERID").innerHTML= xml.find("EMAIL").find("INTERENET").find("PREF").find("USERID").text();
					document.getElementById("DESC").innerHTML= xml.find("DESC").text();
				  }

				  if(document.getElementById("editvcard")) {
					document.getElementById("FN").value = xml.find("FN").text();
                                        document.getElementById("NICKNAME").value= xml.find("NICKNAME").text();
                                        document.getElementById("URL").value= xml.find("URL").text();
                                        document.getElementById("BDAY").value= xml.find("BDAY").text();
                                        document.getElementById("ORG.ORGNAME").value= xml.find("ORG").find("ORGNAME").text();
                                        document.getElementById("ORG.ORGUNIT").value= xml.find("ORG").find("ORGUNIT").text();
                                        document.getElementById("TITLE").value= xml.find("TITLE").text();
                                        document.getElementById("ROLE").value= xml.find("ROLE").text();
                                        document.getElementById("TEL.WORK.VOICE.NUMBER").value= xml.find("TEL").find("WORK").find("VOICE").find("NUMBER").text();
                                        document.getElementById("TEL.WORK.FAX.NUMBER").value= xml.find("TEL").find("WORK").find("FAX").find("NUMBER").text();
                                        document.getElementById("ADR.WORK.EXTADD").value= xml.find("ADR").find("WORK").find("EXTADD").text();
                                        document.getElementById("ADR.WORK.STREET").value= xml.find("ADR").find("WORK").find("STREET").text();
                                        document.getElementById("ADR.WORK.LOCALITY").value= xml.find("ADR").find("WORK").find("LOCALITY").text();
                                        document.getElementById("ADR.WORK.REGION").value= xml.find("ADR").find("WORK").find("REGION").text();
                                        document.getElementById("ADR.WORK.PCODE").value= xml.find("ADR").find("WORK").find("PCODE").text();
                                        document.getElementById("ADR.WORK.CTRY").value= xml.find("ADR").find("WORK").find("CTRY").text();

                                        document.getElementById("TEL.HOME.VOICE.NUMBER").value= xml.find("TEL").find("HOME").find("VOICE").find("NUMBER").text();
                                        document.getElementById("TEL.HOME.FAX.NUMBER").value= xml.find("TEL").find("HOME").find("FAX").find("NUMBER").text();
                                        document.getElementById("ADR.HOME.EXTADD").value= xml.find("ADR").find("HOME").find("EXTADD").text();
                                        document.getElementById("ADR.HOME.STREET").value= xml.find("ADR").find("HOME").find("STREET").text();
                                        document.getElementById("ADR.HOME.LOCALITY").value= xml.find("ADR").find("HOME").find("LOCALITY").text();
                                        document.getElementById("ADR.HOME.REGION").value= xml.find("ADR").find("HOME").find("REGION").text();
                                        document.getElementById("ADR.HOME.PCODE").value= xml.find("ADR").find("HOME").find("PCODE").text();
                                        document.getElementById("ADR.HOME.CTRY").value= xml.find("ADR").find("HOME").find("CTRY").text();
                                        document.getElementById("EMAIL.INTERNET.PREF.USERID").value= xml.find("EMAIL").find("INTERENET").find("PREF").find("USERID").text();
                                        document.getElementById("DESC").value= xml.find("DESC").text();
				  }

					// <PHOTO><TYPE>image/png</TYPE><BINVAL>
					if (xml.find("PHOTO")) {
						var foto_type=xml.find("TYPE").text();
						var foto_data=xml.find("BINVAL").text();

					}

					if(firstime) {
                                		uid=uid+1;
        					idresponse=uid;         
        					var from = $('#un').val() + "@" + $('#un_server').val(); //.split("/")[0];
        					msg = $iq({type: "get", id: uid, from: from}).c("query", {xmlns: "jabber:iq:roster"});
        					connection.send(msg);
                                		firstime = 0;
                        		}

					// alert("Guardamos los datos en el registro de usuario:"+k+ "FN:"+xml.find("FN").text());
					userinfo[k]=xml.find("FN").text();
					photodata[k]=xml.find("BINVAL").text();
					alias[k]=xml.find("iq").attr("from").split("@")[0];
					//experimental
					// hash_jids[xml.find("iq").attr("from").split("@")[0]] = xml.find("presence").attr("from");
					jids[k]=xml.find("iq").attr("from");
				}


				//if(xml.find("iq").find("query").attr("xmlns") == "jabber:iq:roster") {
				//  alert("un response !! idresponse="+idresponse+" y id="+xml.find("iq").attr("id")+"y el attr del query xmlns es "+xml.find("query").attr("xmlns"));
				//}

				if(xml.find("iq").attr("id") == idresponse) {
				  // alert("Coinciden el id con el idresponse");
  				  if(xml.find("query").attr("xmlns") == "jabber:iq:roster") {
					// alert("SIIIIII RECIBIMOS ROSTER");
					// alert("SIIIIII RECIBIMOS ROSTER"+xml.find("item").attr("subscription")+"ENCONTRADOS ITEMS: "+xml.find("item").length);
					// while(xml.find("item").attr("subscription") == "both") { 
					var z=0; 
					nbuddys=0;
					//var next_msg=[]; 
					k=0;
					msg="";
					$(xml).find("item").each(function () {
					   if(xml.find("item").attr("jid")) {
						mybuddy = $(this).attr("jid") || "";
						if (mybuddy.search("@") > 0) {

							alias[nbuddys] = mybuddy.split("@")[0];
							hash_jids[mybuddy.split("@")[0]] = mybuddy;
							nbuddys++;
							uid=uid+1;
							msg = $iq({type: "get", id: uid, to: mybuddy}).c("vCard", {xmlns: "vcard-temp"});
							connection.send(msg);
							uid=uid+1;
							var msg_probe = $pres({to: mybuddy, id: uid, type: 'probe'});
							connection.send(msg_probe);
							connection.flush();
							k++;
						}
					   }
					});
					// alert("EL JID DEL ROOMID manolo2 es:"+hash_jids['manolo2']);
					// for (z=0;z<k;z++) {
                        		//        if (pre_msg[z]) {
                                        //		connection.send(pre_msg[z]);
                                        //		pre_msg[z]="";
					//		roster_listen_vcard();
                                	//	}                       
                        		// }
					// alert("Encontrados "+k+" buddis");
				  }
				}
			}


			if(xml.find("iq").attr("type") == "get") {
				to = xml.find("iq").attr("from");

				if(xml.find("query").attr("xmlns") == "http://jabber.org/protocol/disco#info") {
					// alert("Recibimos peticion de PROTOCOL disco#info");
					Ca.sendinfo(to);
				}

				if(xml.find("time").attr("xmlns") == "urn:xmpp:time") {
					// alert("Peticion de time recibida");
					Ca.sendtime(to);
				}

				if(xml.find("query").attr("xmlns") == "jabber:iq:version") {
					// alert("Peticion de version recibida");
					Ca.sendversion(to);
				}

				if(xml.find("query").attr("xmlns") == "jabber:iq:last") {
					Ca.sendlast(to);
				}

				if(xml.find("vCard").attr("xmlns") == "vcard-temp") {
					// alert("Peticion de vCard recibida");
					Ca.sendvcard(to);
				}
			}



			
			if(xml.find("iq").attr("type") == "set") {
				if(xml.find("si").find("file").attr("xmlns") == "http://jabber.org/protocol/si/profile/file-transfer") {
					filename=xml.find("file").attr("name");
					alert("Nos estan enviando el fichero " + filename);
					file = "";
					var chunk = "";
					part = "";
					fileb64= "";
				}

				if(xml.find("data").attr("xmlns") == "http://jabber.org/protocol/ibb") {
				// recibimos un chunk o trozo del fichero
					chunk = xml.find("data").text();
					part=Base64.decode(chunk);
					file = file + part;
					fileb64 = fileb64 + chunk;
				} 
				
				if(xml.find("close").attr("xmlns") == "http://jabber.org/protocol/ibb") {
				// envio de fichero completado
					var size = file.length;
					// Ofrecer salvar por HTTP
					alert("Fichero recibido" + filename + " Tamano:"+size);
					// savefile(filename,file);	
					download(filename,fileb64);
				}
				
			
				// iq xmlns='jabber:client' from='cliente16@xmpp.interec.com' to='cliente16@xmpp.interec.com/CA1' id='push1350704910' type='set'>
				//alert(xml.find("iq").attr("id"));
				//if (  xml.find("iq").attr("id").substr(0,4) == "push"   ) {
					// Confirm buddy remove
				//	var push = xml.find("iq").attr("id");
				//	msg = $iq({to: to, id: push, type: "result"});
				//	alert("ENVIAMOS:"+msg);
					connection.send(msg);
				//}

			}

			if(xml.find("presence").attr("xmlns") == "jabber:client") {
				// 
				//if(xml.find("presence").attr("from").split("@")[0] == "joaquin") {
				//	alert("Recibimos presence, k="+k+"  "+xml.find("presence").attr("from"));
				//}
				var icon="";
				var to = xml.find("presence").attr("from").split("/")[0];
				var status = xml.find("status").text();
				var priority = xml.find("priority").text();
				var show = xml.find("show").text();
				var roomID = to.split("@")[0];
				// JOAQUIN 
				hash_jids[roomID] = xml.find("presence").attr("from");

				if (xml.find("presence").attr("type") == "subscribe") { 
					//alert("Nos pide autorizacion "+to); 
					Ca.subscribesend(to); 
					return;
				}
				if(roomID.length) {
					if (xml.find("presence").attr("type") == "unavailable") { icon="icons/icon_offline.png"; status="Offline"}
					if (priority.length) { icon="icons/icon_available.png"; status="Available";}
					if (show == "away") { icon="icons/icon_away.png";}
					if (show == "xa") { icon="icons/icon_extaway.png";}
					if (show == "dnd") { icon="icons/icon_dnd.png";}
			
					if (eval(document.getElementById(roomID+"title")))  {
						document.getElementById(roomID+"status").src=icon;
					}
					if (xml.find("x").attr("xmlns") == "vcard-temp:x:update") {
						var photo_ref=xml.find("photo").text();
						uid=uid+1;
						msg = $iq({to: to, from: connection.jid, type: "get", id: uid}).c("pubsub", {xmlns: "http://jabber.org/protocol/pubsub"}).c("items", {node: "urn:xmpp:avatar:data"}).c("item", {id: photo_ref});
						connection.send(msg);
					}

					if (  document.getElementById("icon_"+roomID) === null ) {
					} else {
						document.getElementById("icon_"+roomID).src=icon;document.getElementById("statuses"+roomID).innerHTML=status;
					}
				}
			}

			// if(nbuddys >0) {
			//	uid++;
			//	connection.send(next_msg[k]);
			//	uid++;
			//	connection.send(next_msg2[k]);
			//	nbuddys = nbuddys -1 ;
			//	k++;
			// }

			if(xml.find("failure")) {
	
				if(xml.find("not-authorized").length) {
                                        $("#login_result").html("<p style=color:#FF0000;font-size:11px;text-align:center;>Usuario no encontrado,<br>&#191;Desea crearlo&#063; </p><input id=create_user type=button value=ok style='border:1px solid rgba(185,50,120,1);background:rgba(200,50,50,0.9); border-radius:5px; padding:1px; color:#ffffff; width:100%;'  OnClick=register(un.value,pw.value)>");
				}
				if(xml.find("bad-auth").length) {
					$("#login_result").html("<p style=color:#960000;font-size:14px;text-align:center;>Clave err&oacute;nea</p>");
					//$("#login_result").append("<p style=color:#FF0000>Clave err&oacute;nea</p>");
				}

			}

		};

		connection.rawOutput = function(log) {
			console.log("SENT:"+log);
		};


		connection.connect(un, pw, function(cond, status) {
			console.log("Connection handler:");
			if (cond === 0) {
				console.log("Error");
				$('#connstate').html('ERROR');
			} 
			else if (cond === 1) {
				console.log("Connecting");
				$('#connstate').html('Connecting');
			} else if (cond === 2) {
				console.log("Connection Failed");
				$('#connstate').html('Connection Failed');
			} else if (cond === 3) {
				console.log("Authenticating");
				$('#connstate').html('Authenticating');
			} else if (cond === 4) {
				console.log("Auth Failed");
				$('#connstate').html('Auth Failed');
			} else if (cond === 5) {
				console.log("Connected");
				$('#connstate').html('Connected');
				console.log("sending presence tree...");
				connection.send($pres().tree());
				inicio(connection);
				// remove_login();
				// inicia_roster();
			} else if (cond === 6) {
				console.log("disconnected");
				$('#connstate').html('Disconnected');
			} else if (cond === 7) {
				console.log("disconnecting");
				$('#connstate').html('Disconnecting');
			} else if (cond === 8) {
				console.log("Attached");
				$('#connstate').html('Attached');
			}

			if (status) {
				console.log(status);
			}
			return true;
		});


		connection.addHandler(function(stanza) {
			console.log("Stanza handler.");
			console.log(stanza);
			return true;
		}, null, 'message', null, null, null);
},

close: function() {
	connection.disconnect();
},


setPresence: function(){
	connection.send($pres().tree());
},

filesend: function(host,port, to) {
	uid= uid+1 ;
	alert("UID:"+uid);
//	msg = $iq({to: to, id: connection.jid, type: "set"}).c("si", {xmlns: "http://jabber.org/protocol/si", profile: "http://jabber.org/protocol/si/profile/file-transfer", id: uid}).c("file", {xmlns: "http://jabber.org/protocols/si/profile/file-transfer", name: "thisfile", size: "100"}).up().c("feature", {xmlns: "http://jabber.org/protocol/feature-neg"}).c("x", {xmlns: "jabber:x:data", type: "form"}).c("field", {var: "stream-method", type: "list-single"}).c("option").c("value", "http//jabber.org/protocol/bytestreams").up().up().c("option").c("value", "http://jabber.org/protocol/ibb");
	connection.send(msg);
},


readfile: function(to) {
	alert(pedro);
	var sid="2222";
//	Ca.startstream(to,sid);


	uid=uid+1;
	msg = $iq({to: "proxy.xmpp.interec.com", from: connection.jid, type: "set", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/bytestream", sid: sid}).c("activate").t(connection.jid);
	//alert(msg);
// .c("streamhost-used",{jid: to});
	connection.send(msg);


	var recvfile="/tmp/nada_de_nada";
	alert("FILENAME:"+recvfile);
        var fileHandler = function(from, sid, recvfile, size, mime) {
                // received a stream initiation
                // save to data and be prepared to receive the file.
        };
                                                  
        connection.si_filetransfer.addFileHandler(fileHandler);
	alert("SID:"+sid);
        var ibbHandler = function (type, from, sid, data, seq) {
                switch(type) {
                        case "open":
                        // new file, only metadata
                        break;
                        case "data":
                        // data
                        break;
                        case "close":
                        // and we're done
                        default:
                        throw new Error("shouldn't be here.")
                }
        };

},


sendinfo: function(to) {
	uid=uid+1;
	var from = $('#un').val() + "@" + $('#un_server').val();
	msg = $iq({to: to, from: connection.jid, type: "result", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#info"}).c("identity", {category: "client", type: "pc"}).up()
.c("feature", {var: "jabber:iq:time"}).up().c("feature", {var: "jabber:iq:version"}).up()
.c("feature",{var: "http://jabber.org/protocol/ibb"}).up()
.c("feature",{var: "http://jabber.org/protocol/bytestreams"}).up()
.c("feature",{var: "http://jabber.org/protocol/si"}).up()
.c("feature",{var: "http://jabber.org/protocol/feature-neg"}).up()
.c("feature",{var: "http://jabber.org/protocol/disco#info"}).up()
.c("feature",{var: "http://jabber.org/protocol/si/profile/file-transfer"});

	connection.send(msg);



        uid=uid+1;
	sid="2222";
        msg = $iq({to: "proxy.xmpp.interec.com", from: connection.jid, type: "set", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/bytestream", sid: sid}).c("activate").t(connection.jid);
        //alert(msg);
        connection.send(msg);


},

sendvcard: function(to) {
	uid=uid+1;
	var from = $('#un').val() + "@" + $('#un_server').val();
	msg = $iq({to: to, from: connection.jid, type: "result", id: uid}).c("vCard", {xmlns: 'vcard-temp'});
	connection.send(msg);
},

sendtime: function(to) {

	uid=uid+1;
	// var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();
	var from = $('#un').val() + "@" + $('#un_server').val();
	var mylocaltime = new Date().toISOString();
	msg = $iq({to: to, from: connection.jid, type: "result", id: uid}).c("time", {xmlns: "urn:xmpp:time"}).c("tzo").t("Z").up().c("utc").t(mylocaltime) ;
	//alert(msg);
	connection.send(msg);
},


sendversion: function(to) {
	uid=uid+1;
	var from = $('#un').val() + "@" + $('#un_server').val(); 
	msg = $iq({to: to, from: connection.jid, type: "result", id: uid}).c("query", {xmlns: "jabber:iq:version"}).c("name").t("CAljarafe").up().c("version").t("Version 1.0.a");
	connection.send(msg);

},

sendlast: function(to) {
	uid=uid+1;
        var from = $('#un').val() + "@" + $('#un_server').val();
	msg = $iq({to: to, from: connection.jid, type: "result", id: uid}).c("query", {xmlns: "jabber:iq:last", seconds: 25});
	connection.send(msg);
},

subscribesend: function(to) {
	var from = $('#un').val() + "@" + $('#un_server').val();
	// var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val().split("/")[0];
	msg = $pres({to: to, from: from, type: "subscribed"});
	// .c("body", {xmlns: Strophe.NS.CLIENT}).t(message);
	//alert(msg);
	connection.send(msg);
	Ca.ReqAuth(to);
},

startstream: function(to,sid) {
	uid=uid+1;
	// var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();
	var from = $('#un').val() + "@" + $('#un_server').val();
	var host = document.getElementById("sendMessage").ip.value;
	// var host = "192.168.1.3";
	// var port = "59890";
	msg = $iq({to: to, from: connection.jid, type: "set", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/bytestreams", sid: sid}).c("streamhost", {host: "xmpp.interec.com", port: "7777", jid: "proxy.xmpp.interec.com"});
	//alert(msg);
	connection.send(msg);
},

send: function(message, to) {
	var msg = $msg({to: to, from: connection.jid, type: "chat"}).c("body", {xmlns: Strophe.NS.CLIENT}).t(message);
	connection.send(msg);
},


ReqAuth: function(to) {
	uid=uid+1;
	var from = $('#un').val() + "@" + $('#un_server').val();
	//var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();
	msg = $iq({from: from, to: connection.jid, type: "set", id: uid}).c("query", {xmlns: "jabber:iq:roster"}).c("item", {ask: "subscribe", subscription: "none", jid: to}).c("group").t("New");
	msg = $pres({to: to, type: "subscribe"});
	//alert(msg);
	connection.send(msg);
}




};
return obj;
}();


$(function() {

$('#connect').submit(function(e) {
	e.preventDefault();
	var un = $('#un').val() + "@" + $('#un_server').val();
	var pw = $('#pw').val();
	alert("Login un:"+un+" pass:"+pw);
	Ca.go(un, pw);
});

$('#buttonClose').click(function(e) {
	Ca.close();
});

//$('#sendMessage').submit(function(e) {
$('#buttonSend').click(function(e) {
	e.preventDefault();
	var msg = $("#"+active_room+"_phrase").val();
	if (msg.length) {
		var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();
		var from = $('#un').val() + "@" + $('#un_server').val();
		Ca.send(msg, to);
		$('#'+active_room+'_phrase').val('');

		var roomID= $("#"+active_room+"_to").val();
        	if(!document.getElementById(roomID)) {
			create_room(roomID);
        	}       
                                                
        	var element = document.getElementById(roomID);
        	element.style.backgroundColor="#CACACA";
        	from=$('#un').val();        
        	$("#"+roomID+"msgs").append("<p style=font-size:10px;color:#960000;><strong>" + from + "</strong>: " + msg + "</p>");
		document.getElementById(roomID+"container").scrollTop += 300;
		textlog[roomID] +=  new Date().toISOString() + " " + from + ":" + msg + "\n";

	}
});

$('#buttonSendFile').click(function(e) {
	e.preventDefault();
	if (document.getElementById('filename').value.length) {
		alert("Te envio un fichero");
        	var msg = "Te envio un fichero";
        	var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();  
        	var from = $('#un').val() + "@" + $('#un_server').val();
		alert("Enviamos a "+to+" Desde: "+from);

		var host = "87.220.176.32";
		var port = "5086";
	        // Ca.filesend(host,port, to);

        	uid=uid+1;
		var sid = "100"+uid;
		var filename = document.getElementById("filename").value; // "estefhichero";
		var mime = "text/plain";
		var mime = "Base64";
		var cb;
		Ca.sendfile2(to, sid, filename, size, mime, cb);
	}
});


$('#buttonReqAuth').click(function(e) {
	e.preventDefault();
	Ca.ReqAuth();
});

$('#buttonReqRoster').click(function(e) {
        e.preventDefault();
	// nbuddys=0;
	k=0;
        request_roster();
	update_roster();
});


$('#buttonSubscribe').click(function(e) {
	e.preventDefault();
	var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();
	var from = $('#un').val() + "@" + $('#un_server').val();
	var msg = "<presence to='john@xmpp.interec.com/test' id='console71444eb7' type='subscribed'/><iq type='get' id='purple173ba2e5'><ping xmlns='urn:xmpp:ping'/>";
	Ca.subscribesend(msg, to);
});


$("#server").bind("change", function(){
	var server = $(this).val();
	var unServer = $("#un_server");
	var toServer = $("#to_server");
	if((unServer.val() == server && toServer.val() == server) || (!unServer.val() && !toServer.val())){
		$('#un_server, #to_server').val($(this).val());
	}
});


});







function newUID(suffix) {
    uniqueID = UID;
    if (typeof suffix == "string" || typeof suffix == "number") {
        return ++this._uniqueId + ":" + suffix;
    } else {
        return uniqueId + 1;
    }
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}




function displayContents(contents) {
  //element = document.getElementById('file-content');
  //element.innerHTML = contents;
  msg = contents;
  alert("Estmaos en displaycontents...");
  return;
}





//function createGMTDate(xiYear, xiMonth, xiDate) {
//   return new Date(months[xiMonth] + ' ' + xiDate + ', ' + xiYear + ' 00:00:00 GMT');
//}


function inicio(connection) {

	uid=uid+1;
	msg = $iq({to: "xmpp.interec.com", type: "get", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#items"});
	connection.send(msg);

	uid=uid+1;
	msg = $iq({to: "xmpp.interec.com", type: "get", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#info"});
	connection.send(msg);

	uid=uid+1;
        msg = $iq({to: "conference.xmpp.interec.com", type: "get", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#info"});
	connection.send(msg);
	uid=uid+1;
        msg = $iq({to: "irc.xmpp.interec.com", type: "get", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#info"});
        connection.send(msg);
	uid=uid+1;
        msg = $iq({to: "proxy.xmpp.interec.com", type: "get", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#info"});
        connection.send(msg);
	uid=uid+1;
        msg = $iq({to: "pubsub.xmpp.interec.com", type: "get", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#info"});
        connection.send(msg);
	uid=uid+1;
        msg = $iq({to: "jvud.xmpp.interec.com", type: "get", id: uid}).c("query", {xmlns: "http://jabber.org/protocol/disco#info"});
        connection.send(msg);

	uid=uid+1;
	msg = $iq({type: "get", id: uid}).c("vCard", {xmlns: "vcard-temp"});
	connection.send(msg);
	// uid=uid+1;
        // msg = $iq({type: "get", id: uid}).c("query", {xmlns: "jabber:iq:roster"});
        // connection.send(msg);
	uid=uid+1;
        msg = $iq({type: "get", id: uid, to: "xmpp.interec.com"}).c("query", {xmlns: "http://jabber.org/protocol/disco#items", node: "http://jabber.org/protocol/commands"});
        connection.send(msg);
	uid=uid+1;
        msg = $iq({type: "get", id: uid}).c("blocklist", {xmlns: "urn:xmpp:blocking"});
        connection.send(msg);
	uid=uid+1;
        msg = $iq({type: "get", id: uid, to: "proxy.xmpp.interec.com"}).c("query", {xmlns: "http://jabber.org/protocol/bytestreams"});
        connection.send(msg);



	uid=uid+1;
        msg = $pres().c("priority").t("1").up().c("c",{xmlns: "http://jabber.org/protocol/caps", node: "http://pidgin.im/", hash: "sha-1", ver: "I22W7CegORwdbnu0ZiQwGpxr0Go=",}).up().c("x", {xmlns: "vcard-temp:x:update"});
        connection.send(msg);

	uid=uid+1;
	msg = $iq({type: "set", id: uid}).c("pubsub", {xmlns: "http://jabber.org/protocol/pubsub"}).c("publish", {node: "'http://jabber.org/protocol/tune"}).c("item").c("tune", {xmlns: "http://jabber.org/protocol/tune"});
	connection.send(msg);

	new_user();
	setTimeout(function() { request_roster(); create_roster(); update_roster();}, 3600)
	document.getElementById("login").style.zIndex="0";
	document.getElementById("login_result").style.zIndex="0";
	tags();
}



function savelog(roomID) {
	//alert("roomID:"+roomID);
	//alert(document.getElementById(roomID+"msgs").innerHTML);
	data = textlog[roomID]; // document.getElementById(roomID+"msgs").innerHTML.replace(/<[^>]*>/g, '');
	var pom = document.createElement('a');
	data=Base64.encode(data);
    	pom.setAttribute('href', 'data:application/octet-stream;filename='+roomID+'_txt.log;base64,' +  data);
    	pom.setAttribute('download', roomID+"txt.log");
    
    	if (document.createEvent) {
        	var event = document.createEvent('MouseEvents');
        	event.initEvent('click', true, true);
        	pom.dispatchEvent(event);
    	}
    	else {
        	pom.click();
    	}
}

function savefile(filename,file) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:application/octet-stream,' + file);
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }

}



function linkDownload(a, filename, content) {
        contentType =  'data:application/octet-stream;base64,';
        uriContent = contentType + encodeURIComponent(content);
        a.setAttribute('href', uriContent);
        a.setAttribute('download', filename);
}
function download(filename, content) {
        var a = document.createElement('a');
        linkDownload(a, filename, content);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
}



function show_miniavatar(buddy,i) {
	if(photodata[buddy].length) {
		contentType =  'data:image/jpeg;base64,';
		uriContent = contentType + encodeURIComponent(photodata[buddy]);
		document.getElementById(alias[buddy]+"img"+i).src = uriContent;
	}
	else {
		document.getElementById(alias[buddy]+"img"+i).src = 'no_photo.png';
	}
}



function request_vcard(to) {
	uid=uid+1;
	msg = $iq({type: "get", id: uid, to: to}).c("vCard", {xmlns: "vcard-temp"});
	connection.send(msg);
}

function request_roster(to) {
	uid=uid+1;
	idresponse=uid;
	var from = $('#un').val() + "@" + $('#un_server').val(); //.split("/")[0];	
	msg = $iq({type: "get", id: uid, from: from}).c("query", {xmlns: "jabber:iq:roster"});
	connection.send(msg);
}


function create_room(roomID) {
	if ((!document.getElementById(roomID)) && (roomID != "xmpp.interec.com")) {
		//var buddy=k+1;
		rooms[nrooms] = roomID;
		nrooms++;
                for(n=0; n<k; n++) {
                        if (alias[n] == roomID) {
                                buddy=n;
                        }
                }
		var to_server = hash_jids[roomID].split("@")[1];
		tags();

		textlog[roomID]="";
		var new_div = document.createElement("div");
		new_div.id=roomID;
		new_div.style.position="absolute";
		new_div.style.left="20px";
		new_div.style.top="0px";
		new_div.style.width="210px";
		new_div.style.height="280px";
		new_div.style.backgroundColor="#FFFFFF";
		new_div.style.overflow="hidden";
		new_div.style.borderStyle="solid";
                new_div.style.borderWidth="1px 1px 1px 1px";
		new_div.style.borderRadius="8px 8px 0px 0px";
		document.getElementsByTagName('body')[0].appendChild(new_div);


		var new_input = document.createElement("div");
		new_input.id  = roomID+"jejejeje";
                new_input.style.position="absolute";
                new_input.style.left="21px"; 
                new_input.style.top="250px";    
                new_input.style.width="210px"; 
                new_input.style.height="60px";
                new_input.style.borderRadius="0px 0px 8px 8px";
                new_input.style.backgroundColor="#f1f1f1";

		document.getElementById(roomID).appendChild(new_input);


		// Creamo una caja contenedora para el div de msgs, que será msgs el que recibe el texto
		// y sufre el scrolling

		var new_msgs_container = document.createElement("div");
		new_msgs_container.id=roomID+"container";
		//new_msgs_container.style.position="absolute";
                new_msgs_container.style.padding="5px";
		new_msgs_container.style.left="5px";
		new_msgs_container.style.top="65px";
		new_msgs_container.style.width="200px";
		new_msgs_container.style.height="250px";
		new_msgs_container.style.backgroundColor="#FFFFFF";
		new_msgs_container.style.overflow="auto";
		document.getElementById(roomID).appendChild(new_msgs_container);


		var new_msgs = document.createElement("div");
		new_msgs.id=roomID+"msgs";
		//new_msgs.style.position="absolute";
		new_msgs.style.left="5px";
		new_msgs.style.top="65px";
		new_msgs.style.width="180px";
		new_msgs.style.height="1px";
		// new_msgs.style.backgroundColor="#ffffff";
		document.getElementById(roomID+"container").appendChild(new_msgs);

		

		var new_title = document.createElement("div");
		new_title.id=roomID+"title";
		new_title.style.position="absolute";
		new_title.style.left="20px";
		new_title.style.top="0px";
		new_title.style.width="212px";
		new_title.style.height="25px";
		new_title.style.backgroundColor="#777777";
		// new_title.style.overflow="hidden";
		new_title.style.color="#ffffff";
                // new_title.style.opacity="0.9";
		new_title.style.borderRadius="8px 8px 0px 0px";
		document.getElementById(roomID).appendChild(new_title);




		$("#"+roomID+"title").append("<span style=font-size:16px;vertical-align:middle;>"
+"<div style=position:absolute;left:6px;top:2px;><img id="+roomID+"img1 width=21 height=21 style=border-radius:5px;></div><div style=position:absolute;left:33px;top:5px;font-size:12px;>" + roomID + "</div>"
+"<div style=position:absolute;left:185px;top:3px;><button style=height:17px;width:20px;border-radius:15px;background:rgba(0,0,0,0.6);color:#ffffff;border:1px solid #ffffff; id=killroom value=killroom onClick=remove_room('"+roomID+"')><div style=position:absolute;top:-2px; right:2px;>x</div></button></div>"
+"<div style=position:absolute;left:165px;top:3px;><img id="+roomID+"status src=icons/icon_available.png></div></span");

		$("#"+roomID+"jejejeje").append("<span style=font-size:12px;color:#FFFFAC;vertical-align:bottom>"
+"<div style=position:absolute;top:22px;left:3px;><input style='font-size:12px;' type='text' id='"+roomID+"_phrase' OnChange=document.getElementById('buttonSend').click()></div>"
+"<div id="+roomID+"showhelp style=position:absolute;top:45px;left:8px;color:#777777;font-size:11px;background-color:transparent;></div>"
+"<div style=position:absolute;top:23px;left:190px;><bottom id='bSend' OnClick=document.getElementById('buttonSend').click(); style=background:rgba(0,0,0,0.7);font-size:16px;color:#ffffff;border-radius:3px;padding:2px;><b>></b></buttom></div>"

+"<div style=position:absolute;top:1px;left:3px;><input id='bFont' type='image' src=icons/font.png width=20 OnClick=document.getElementById('buttonFont').click(); OnMouseOver=showhelp('"+roomID+"',help_fonts) OnMouseOut=showhelp('"+roomID+"',help_empty)></div>"
+"<div style=position:absolute;top:1px;left:22px;><input id='bFsend' type='image' src=icons/file_add.png width=20 OnClick=document.getElementById('filename').click(); OnMouseOver=showhelp('"+roomID+"',help_sendfile) OnMouseOut=showhelp('"+roomID+"',help_empty)></div>"
+"<div style=position:absolute;top:1px;left:44px;><input id='bSave' type='image' src=icons/save.png width=20 OnClick=savelog('" + roomID + "') OnMouseOver=showhelp('"+roomID+"',help_savechat) OnMouseOut=showhelp('"+roomID+"',help_empty)></div>"
+"<div style=position:absolute;top:1px;left:66px;><input id='bgetvcard' type='image' src=icons/info.png width=20 OnClick=getvcard('" + roomID + "') OnMouseOver=showhelp('"+roomID+"',help_getvcard) OnMouseOut=showhelp('"+roomID+"',help_empty)></div>"

+"<div style=position:absolute;top:1px;left:88px;><input id='bInsert' type='image' src=icons/photo.png width=20 OnClick=insert_image('" + roomID + "') OnMouseOver=showhelp('"+roomID+"',help_insert) OnMouseOut=showhelp('"+roomID+"',help_empty)></div>"

+"<div style=position:absolute;top:1px;left:110px;><input id='bRTC' type='image' src=icons/video.png width=20 OnClick=startwebrtc('" + roomID + "') OnMouseOver=showhelp('"+roomID+"',help_webrtc) OnMouseOut=showhelp('"+roomID+"',help_empty)></div>"

+"<div style=position:absolute;top:1px;left:180px;><input id='bRTC' type='image' src=icons/user_del.png width=20 OnClick=user_del('" + roomID + "') OnMouseOver=showhelp('"+roomID+"',help_user_del) OnMouseOut=showhelp('"+roomID+"',help_empty)></div>"


+"<input type=hidden id="+roomID+"_to value="+roomID+"><input type=hidden id=to_server value="+to_server+"> </span>");
// +"<div style=position:absolute;top:380px;left:180px;><button id='buttonSendFile' class='button' type='submit' name='sendfile'>Send File</button></div>"
// +"<div style=position:absolute;top:280px;left:180px;><input id='filename' class='button' type='file' name='sendfile'>Send File</button></div>"
// +"<button id='buttonSubscribe' class='button' type='submit' name='subscribe'>Subscribe</button>"
// +"<button id='buttonReqAuth' class='button' type='submit' name='Req Auth'>Req Auth</button>"
// +"<button id='buttonReqRoster' class='button' type='submit' name='Req Roster'>Req Roster</button>"
// +"<input type=hidden id=ip name=ip value=170.10.10.10> ></span>");




		document.getElementById(roomID).style.zIndex="4";
		document.getElementById(roomID+"msgs").style.zIndex="14";
		document.getElementById(roomID+"title").style.zIndex="14";
		document.getElementById(roomID+"jejejeje").style.zIndex="14";
		// alert("Hemos actualizado los zindex");

		document.getElementsByTagName('body')[0].appendChild(new_input);
		document.getElementsByTagName('body')[0].appendChild(new_div);
		// document.getElementsByTagName('body')[0].appendChild(new_msgs);
		// document.getElementsByTagName('body')[0].appendChild(new_msgs_container);
		document.getElementsByTagName('body')[0].appendChild(new_title);

		show_miniavatar(buddy,"1");

		$("#"+roomID+"msgs").append("<p><br></p><p></p><p></p>");		
		check_webrtc();
		focuse(roomID);

                document.getElementById('bFont').style.opacity="0.5";
                document.getElementById('bFont').disabled=true;
                document.getElementById('bRTC').style.opacity="0.5";
                document.getElementById('bRTC').disabled=true;

        }
}


function login() {

		// Enter login,pass -> connect create/login

                var new_div = document.createElement("div");
                new_div.id="login";
                new_div.style.position="absolute";
                new_div.style.left="20px";
                new_div.style.top="0px";
                new_div.style.width="200px";
                new_div.style.height="300px";
                new_div.style.backgroundColor="f9f9f9";
                new_div.style.overflow="hidden";
                new_div.style.borderStyle="solid";
                new_div.style.borderWidth="1px 2px 2px 1px";
                new_div.style.borderRadius="8px 8px 8px 8px";
                new_div.style.borderColor="888888";
                new_div.style.padding="5px";
                new_div.style.backgroundImage="url(logo.png)";
                new_div.style.backgroundSize="cover";
                new_div.style.backgroundRepeat="no-repeat"; 
                document.getElementsByTagName('body')[0].appendChild(new_div);


                $("#login").append("<br><b><form id=connect>"
+"<table cellpadding=0 cellspacing=0 border=0><tr><td><p style=font-size:10px;text-align:left;><b>Login:</b></p></td><td><p><input style=font-size:10px;width:100%; type=text id=un onkeypress='return alfanum_noespacio(event)'></p><p></p></td></tr>"
+"<tr><td><p style=font-size:10px;text-align:center;><b>Password:</b></p></td><td><p><input style=font-size:10px;width:100%; type=text id=pw onkeypress='return intro(event)'></p></td></tr>"
+"<tr><td colspan=2><p><input type=hidden id=server value=xmpp.interec.com>"
+"<input type=hidden id=un_server value=xmpp.interec.com><div style=height:30px;></div></td></tr><tr><td colspan=2><center><input style='border:1px solid rgba(0,0,0,0); background:rgba(0,0,0,0);  padding:35px 10px 35px 0px; color:#555555; font-size:22px; font-weight:bold; width:110px;'  id=buttonConnect type=button value=Connect "
+"OnClick=Ca.go(document.getElementById('un').value,document.getElementById('pw').value)></center></p></td></tr></table></form>");


		document.getElementById("login").style.zIndex="14";

                var new_div = document.createElement("div");
                new_div.id="login_result";
                new_div.style.position="relative";
                new_div.style.left="20px";
                new_div.style.top="220px";
                new_div.style.width="195px";
                new_div.style.height="150px";
                new_div.style.backgroundColor="transparent";
                new_div.style.overflow="hidden";
                document.getElementById('login').appendChild(new_div);



		document.getElementById("login_result").style.zIndex="14";
		document.getElementsByTagName('body')[0].appendChild(new_div);
                $("#login_result").html("<p style=font-size:11px;text-align:center;color:#222222;>"+msg_login+"</p>");
}



function remove_login() {
	document.body.removeChild(document.getElementById('login'));
}



function remove_room(roomID) {
	for(j=0;j<nrooms;j++) {
		if (rooms[j] == roomID) {
			var myval=j;
		}
	}
	
	rooms[myval]="";
	tags();

	document.getElementById(roomID+"jejejeje").parentNode.removeChild(document.getElementById(roomID+"jejejeje"));
	document.getElementById(roomID+"title").parentNode.removeChild(document.getElementById(roomID+"title"));
	document.getElementById(roomID).parentNode.removeChild(document.getElementById(roomID));
	if(document.getElementById('localVideo')) {
		document.body.removeChild(document.getElementById('localVideo'));
		document.body.removeChild(document.getElementById(roomID+'rtc'));
	}
	focuse('roster')
}

function remove_vcard(roomID) {
	document.getElementById(roomID+"vcard").parentNode.removeChild(document.getElementById(roomID+"vcard"));
	document.getElementById(roomID+"vcardtitle").parentNode.removeChild(document.getElementById(roomID+"vcardtitle"));
}


function create_roster() {
	if(!document.getElementById("roster")) {
		var new_div = document.createElement("div");
                new_div.id="roster";
                new_div.style.position="absolute";
                new_div.style.left="20px";
                new_div.style.top="0px";
                new_div.style.width="210px";
                new_div.style.height="310px";
                new_div.style.backgroundColor="#f8f8f8";
                new_div.style.overflow="hidden";
		new_div.style.borderStyle="solid";
		new_div.style.borderWidth="1px 1px 1px 1px";
		new_div.style.borderRadius="8px 8px 8px 8px";
		
                document.getElementsByTagName('body')[0].appendChild(new_div);

		var new_roster_container = document.createElement("div");
                new_roster_container.id="roster"+"container";
                new_roster_container.style.position="absolute";
                // new_roster_container.style.left="905px";
                new_roster_container.style.top="25px";
                new_roster_container.style.width="210px";
                new_roster_container.style.height="300px";
                new_roster_container.style.backgroundColor="#f8f8f8";
                new_roster_container.style.borderRadius="0px 0px 8px 8px";
                new_roster_container.style.overflow="auto";
                document.getElementById('roster').appendChild(new_roster_container);

		var new_items = document.createElement("div");
                new_items.id="roster"+"items";
                //new_msgs.style.position="absolute";
                new_items.style.left="905px";
                new_items.style.top="80px";   
                new_items.style.width="210px";
                new_items.style.height="1px";  
                new_items.style.backgroundColor="#DDFF00";
		//new_items.style.overflow="auto";
                document.getElementById("roster"+"container").appendChild(new_items);

		var new_menu = document.createElement("div");
                new_menu.id="roster"+"menu";
                new_menu.style.position="absolute";
                new_menu.style.left="20px";
                new_menu.style.top="0px";
                new_menu.style.width="212px";
                new_menu.style.height="25px";
                new_menu.style.backgroundColor="#888888";
                // new_title.style.overflow="hidden";
                new_menu.style.color="#ffffff";
		new_menu.style.borderRadius="8px 8px 0px 0px";
                document.getElementById("roster").appendChild(new_menu);

		document.getElementsByTagName('body')[0].appendChild(new_menu);
		// document.getElementsByTagName('body')[0].appendChild(new_roster_container);
		document.getElementsByTagName('body')[0].appendChild(new_div);
		
		document.getElementById("roster").style.zIndex="14";
		document.getElementById("rostermenu").style.zIndex="15";
		document.getElementById("rostercontainer").style.zIndex="14";
		document.getElementById("rosteritems").style.zIndex="15";

		$('#rostermenu').append("<div id=Add style=position:absolute;top:4px;left:2px;font-size:11px; OnCLick=add_buddy()>&nbsp;&nbsp;"+msg_add+"</div>");
		$('#rostermenu').append("<div id=Me style=position:absolute;top:4px;left:52px;font-size:11px;>MyInfo</div>");
		if(document.getElementById('nav_roster')) {
			document.getElementById('nav_roster').style.borderStyle="solid";
			document.getElementById('nav_roster').style.borderWidth= "1px 1px 0px 1px";
			document.getElementById('nav_roster').style.backgroundColor="#FFFFFF";
		}
	}
}

function update_roster() {
	$("#rosteritems").html("");
	contentType =  'data:image/jpeg;base64,';
	for(n=0; n<k; n++) {
	   // alert("K:"+k+" ALIAS de "+n+" es "+alias[n]);
	   if(alias[n]) {
		
		var top=n*32;
		var top2=top-2;
		var top3=top2+14;
		$("#"+"rosteritems").append("<div style=height:32px;overflow:hidden;background-color:#FFFFFF"
+" OnClick=create_room('"+alias[n]+"')>"
+"<div style=position:relative;width:16px;left:3px;top:2px;><img id=icon_" + alias[n] + " width=16 src=icons/icon_offline.png></div>"
+"<div style=width:160px;position:relative;left:20px;top:-16px;font-size:12px;overflow:hidden>"+ alias[n] + "</div>"
+"<div id=statuses"+alias[n]+" style=position:relative;width:150px;left:20px;top:-16px;font-size:10px;overflow:hidden>"+ "Offline</div>"
+"<div style=position:relative;width:30px;height:30px;left:170px;top:-45px;overflow:hidden><img id=img_buddy" + n + " height=100% width=100% style=border-radius:7px;></div></div>");

		if (photodata[n].length) {
			uriContent = contentType + encodeURIComponent(photodata[n]);
			document.getElementById("img_buddy"+n).src = uriContent;
		}
		else {
			document.getElementById("img_buddy"+n).src = 'no_photo.png';
		}
		document.getElementById("rostercontainer").scrollTop += 300;
	   }	
	}
}




function nadaobjToString (obj) {


    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}



function objToString(xmlData) { 

        var xmlString;
        //IE
        if (window.ActiveXObject){
            xmlString = xmlData.xml;
        }
        // code for Mozilla, Firefox, Opera, etc.
        else{
            xmlString = (new XMLSerializer()).serializeToString(xmlData);
        }
        return xmlString;
} 


function sendfile3(e) {

	// Añadimos primero request de presence probe para detectar el recurso del to
	var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();
	uid=uid+1;
	msg= $pres({to: to, id: uid, type: 'probe'}); 

        //var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val() + '/CA3';
	setTimeout(function() {
		var to = $("#"+hash_jids[active_room]).val()}, 500);
        var from = $('#un').val() + "@" + $('#un_server').val();
        // var host = "87.220.176.32";
        // var port = "5086";
        uid=uid+1;
        var sid = "100"+uid;
        var filename = document.getElementById("filename").value;
        var mime = "text/plain";
        var mime = "Base64";
        var cb;

        // Prepara el fichero a enviar
        var file = e.target.files[0];
        if (!file) {
                return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
                contents = e.target.result;
                size = contents.length;
                return;
        };
        reader.readAsBinaryString(file);

        var fileHandler = function(from, sid, filename, size, mime) {
                // received a stream initiation save to data and be prepared to receive the file.
        };
        
        connection.si_filetransfer.addFileHandler(fileHandler);

        var ibbHandler = function (type, from, sid, data, seq) {
                switch(type) {
                        case "open":
                        // new file, only metadata
                        break;
                        case "data":
                        // data
                        break;
                        case "close":
                        // and we're done
                        default:
                        throw new Error("shouldn't be here.")
                }
        };
  
        connection.ibb.addIBBHandler(ibbHandler);

        connection.si_filetransfer.send(to, sid, filename, size, mime, function (err) {
                if (err) {
                        return console.log(err);
                }

                var chunksize=8000;
                var seq=0;

                connection.ibb.open(to, sid, chunksize, function (err) {
                        if (err) {
                                alert(err);
                                return console.log(err);
                        }
                                           
                        var l = contents.length, lc = 0, chunks = [], c = 0;
                        for (; lc < l; c++) {
                                chunks[c] = contents.slice(lc, lc += chunksize);
                                connection.ibb.data(to, sid, seq, Base64.encode(chunks[c]), function (err) {});
                                seq++;
                        }



                        connection.ibb.close(to, sid, function (err) {
                                if (err) {
                                       return console.log(err);
                                }
                                alert("done");
                        });
                });
        });

}


function check_webrtc() {
	navigator.getMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

		       if(!navigator.getMedia) {
			       document.getElementById('bRTC').src="icons/video.png";
                               document.getElementById('bRTC').style.opacity="0.5";	
		       } else {
				has_webrtc="1";
			}	
}




function startwebrtc(roomID) {

	if(!has_webrtc) {
		alert("Your browser has NOT WebRTC support");
		return;

	}

	if(!document.getElementById(roomID+'rtc')) {
                var new_rtc = document.createElement("div");  
                new_rtc.id=roomID+'rtc';
                new_rtc.style.position="absolute";
                new_rtc.style.left="500px";
                new_rtc.style.top="0px";
                new_rtc.style.width="320px";
                new_rtc.style.height="280px";
                new_rtc.style.backgroundColor="#DDFFDD";
                new_rtc.style.overflow="hidden";
                document.getElementsByTagName('body')[0].appendChild(new_rtc);


		var new_local = document.createElement("video");		
		new_local.id = 'localVideo';
		document.getElementsByTagName('body')[0].appendChild(new_local);




		// .......... 
		var RTC = setupRTC();
		// .......... 
		var RTCPeerconnection = RTC.peerconnection;

        	connection.jingle.pc_constraints = RTC.pc_constraints;

        	// var jid = document.getElementById('jid').value || window.location.hostname;

        	//connection.connect(jid, document.getElementById('password').value, function(status) {
          	//if (status == Strophe.Status.CONNECTED) {
            	//	console.log('connected');
            		getUserMediaWithConstraints(['audio', 'video']);  
            	//	document.getElementById('connect').disabled = true;
            	//	document.getElementById('myJID').textContent = connection.jid;
          	//} else {
            	//	console.log('status', status);
          	//}
        	//});

            
        	// var callInfo = document.getElementById('callInfo');  
        	// callInfo.onsubmit = function (e) {
          	//	if (e.preventDefault) e.preventDefault();
          	//	if (document.getElementById('call').value == 'Call') {
            	//		var jid = document.getElementById('peer').value;
            	//		document.getElementById('call').disabled = true;
            	//		document.getElementById('peer').disabled = true;
            	//		connection.jingle.initiate(jid);
          	//	} else {
              	//		connection.jingle.terminate();
          	//	}
          	//	return false;
        	// };

      		$(document).bind('mediaready.jingle', function(event, stream) {
			alert("vamos a connection.jingle.localStream = stream");
        		connection.jingle.localStream = stream;
			alert("vamos a RTC.attachMediaStream($('#localVideo'), stream)");
        		RTC.attachMediaStream($('#localVideo'), stream);
			alert("vamos a document.getElementById('localVideo').muted = true");
        		document.getElementById('localVideo').muted = true;
        		document.getElementById('localVideo').autoplay = true;
        		// document.getElementById('call').disabled = false; 
        		// document.getElementById('peer').disabled = false;
			alert("todo");
      		});

      		//$(document).bind('mediafailure.jingle', onMediaFailure);
      		$(document).bind('remotestreamadded.jingle', function(event, data, sid) {
        		function waitForRemoteVideo(selector, sid) {
            			sess = connection.jingle.sessions[sid];
            			videoTracks = sess.remoteStream.getVideoTracks();
            			if (videoTracks.length === 0 || selector[0].currentTime > 0) {
                			$(document).trigger('callactive.jingle', [selector, sid]);
                			RTC.attachMediaStream(selector, data.stream); // FIXME: why do i have to do this for FF?
                			console.log('waitForremotevideo', sess.peerconnection.iceConnectionState, sess.peerconnection.signalingState);
            			} else {
                			setTimeout(function() { waitForRemoteVideo(selector, sid); }, 100);
            			}
        		}
        		var sess = connection.jingle.sessions[sid];
        		var vid = document.createElement('video');
        		var id = 'remoteVideo_' + sid + '_' + data.stream.id; 
        		vid.id = id;
        		vid.autoplay = true;
        		var remotes = document.getElementById(roomID+'rtc');
        		remotes.appendChild(vid);
        		var sel = $('#' + id);
        		sel.hide();
        		RTC.attachMediaStream(sel, data.stream);
        		waitForRemoteVideo(sel, sid);
        		console.log(data.stream);
        		data.stream.addEventListener('ended', function() {
            			console.log('stream ended', this.id);
            			$('#' + id).remove();
        		});
      		}); 
  
      		$(document).bind('remotestreamremoved.jingle', function(event, data, sid) {
        		console.log('remove stream', 'remoteVideo_' + sid + '_' + data.stream.id);
        		// note that this isn't triggered when the peerconnection is closed
      		});

      		$(document).bind('callincoming.jingle', function(event, sid) {
        		var sess = connection.jingle.sessions[sid];
        		document.getElementById('call').disabled = true;
        		document.getElementById('peer').disabled = true;
        		document.getElementById('peer').value = sess.peerjid;
        		sess.sendAnswer();
        		sess.accept();
      		});

      		$(document).bind('callactive.jingle', function(event, videoelem, sid) {
        		console.log('call active');
        		document.getElementById('call').disabled = false;
        		document.getElementById('call').value = 'hangup';
        		videoelem.show();
      		});

      		$(document).bind('callterminated.jingle', function(event, sid, reason) {
        		document.getElementById('call').disabled = false;  
        		document.getElementById('call').value = 'Call';
        		document.getElementById('peer').disabled = false; 
      		});



	}

}



function getvcard(roomID) {
        if(!document.getElementById(roomID+'vcard')) {

	for(n=1; n<k+1; n++) {
		if (alias[n] == roomID) {
			var this_to = hash_jids[roomID].split("/")[0];
			var miniavatar = n;
		}
	}


                var new_vcard = document.createElement("div");  
                new_vcard.id=roomID+'vcard';
                new_vcard.style.position="absolute";
                new_vcard.style.left="22px";
                new_vcard.style.top="15px";
                new_vcard.style.width="209px";
                new_vcard.style.height="245px";
                // new_vcard.style.padding="5px";
                new_vcard.style.backgroundColor="#ffffff";
                new_vcard.style.overflow="auto";
		new_vcard.style.borderRadius="8px 8px 0px 0px";
                document.getElementsByTagName('body')[0].appendChild(new_vcard);

		new_vcard.innerHTML="<div style=position:absolute;top:25px;left:0px;width:195px;height:420px;overflow:hidden>"
+"<table border=0 cellspacing=0 colspsan=0 style=font-size:10px;><tr><td>Name:</td><td><div style=font-size:10px; id=FN ></div>"
+"<tr><td>NickName:</td><td><div style=font-size:10px; id=NICKNAME ></div><tr><td>Url:</td><td><div style=font-size:10px; id=URL ></div>"
+"<tr><td>Birth Date:</td><td><div style=font-size:10px; id=BDAY ></div><tr><td>Organiz:</td><td><div style=font-size:10px; id=ORG.ORGNAME ></div>"
+"<tr><td>Department:</td><td><div style=font-size:10px; id=ORG.ORGUNIT ></div><tr><td>Title:</td><td><div style=font-size:10px; id=TITLE ></div><tr><td>Role:</td><td><div style=font-size:10px; id=ROLE ></div>"
+"<tr><td><b>Work</b><tr><td>phone:</td><td><div style=font-size:10px; id=TEL.WORK.VOICE.NUMBER ></div><tr><td>fax:</td><td> <div style=font-size:10px; id=TEL.WORK.FAX.NUMBER ></div>"
+"<tr><td>Address1:</td><td><div style=font-size:10px; id=ADR.WORK.EXTADD ></div><tr><td>Address2:</td><td><div style=font-size:10px; id=ADR.WORK.STREET ></div>"
+"<tr><td>Locality:</td><td><div style=font-size:10px; id=ADR.WORK.LOCALITY ></div><tr><td>Region:</td><td><div style=font-size:10px; id=ADR.WORK.REGION ></div>"
+"<tr><td>P.Code:</td><td><div style=font-size:10px; id=ADR.WORK.PCODE ></div><tr><td>Country:</td><td><div style=font-size:10px; id=ADR.WORK.CTRY ></div>"
+"<tr><td><b>Home</b><tr><td>phone:</td><td><div style=font-size:10px; id=TEL.HOME.VOICE.NUMBER ></div><tr><td>fax:</td><td> <div style=font-size:10px; id=TEL.HOME.FAX.NUMBER ></div>"
+"<tr><td>Address1:</td><td><div style=font-size:10px; id=ADR.HOME.EXTADD ></div><tr><td>Address2:</td><td><div style=font-size:10px; id=ADR.HOME.STREET ></div>"
+"<tr><td>Locality:</td><td><div style=font-size:10px; id=ADR.HOME.LOCALITY ></div><tr><td>Region:</td><td><div style=font-size:10px; id=ADR.HOME.REGION ></div>"
+"<tr><td>P.Code:</td><td><div style=font-size:10px; id=ADR.HOME.PCODE ></div><tr><td>Country:</td><td><div style=font-size:10px; id=ADR.HOME.CTRY ></div>"
+"<tr><td>Email:</td><td><div style=font-size:10px; id=EMAIL.INTERNET.PREF.USERID ></div><tr><td>Description:</td><td><div style=font-size:10px; id=DESC ></div>";
+"</table></div>";


		var new_title = document.createElement("div");
                new_title.id=roomID+"vcardtitle";
                new_title.style.position="absolute";
                new_title.style.left="20px";
                new_title.style.top="0px";
                new_title.style.width="212px";
                new_title.style.height="25px";
                new_title.style.backgroundColor="#777777";   
                // new_title.style.overflow="hidden";
                new_title.style.color="#ffffff";
		new_title.style.borderRadius="8px 8px 0px 0px";
                document.getElementById(roomID+"vcard").appendChild(new_title);

		$("#"+roomID+"vcardtitle").append("<span style=font-size:12px;left:5px;vertical-align:middle;>"
+"<div style=position:absolute;left:6px;top:2px;><img id="+roomID+"img2 width=21 height=21 style=border-radius:5px;></div><div style=position:absolute;left:33px;top:5px;>" + roomID + " Vcard</div>"

+"<div style=position:absolute;left:185px;top:3px;><button style=height:17px;width:20px;border-radius:15px;background:rgba(0,0,0,0.6);color:#ffffff;border:1px solid #ffffff; id=killvcard value=killroom onClick=remove_vcard('"+roomID+"')><div style=position:absolute;top:-2px; right:2px;>x</div></button></div>");

		request_vcard(this_to);
		document.getElementById(roomID+"vcard").style.zIndex="14";
		document.getElementById(roomID+"vcardtitle").style.zIndex="14";
		document.getElementsByTagName('body')[0].appendChild(new_title);
		show_miniavatar(miniavatar,"2");	
	}

}


function register(un,pw) {
	
		var un_server = "xmpp.interec.com";
		var email = un + "@" + un_server;
        	uid=uid+1;
        //	msg = $build("iq", {type: "set", to: un_server, id: uid }).c("query", {xmlns: "jabber:iq:register"}).c("username").t(un).up().c("pasword").t(pw); // .up().c("email").t(email);
        //	connection.send(msg);


	var callback = function (status) {
		// alert("STATUS:"+status);
	};



	var wait="10";
	var hold="30";
	newuser=1;	
	connection.register.connect("xmpp.interec.com", callback, wait, hold);
	connection.register.fields.username = un;
	connection.register.fields.password = pw;
	connection.register.submit();
	Ca.go(un,pw);

}



function add_buddy() {
	// document.getElementById('rosteritems').style.opacity=".5";
	$('#rosteritems').prepend("<div id=addbuddy style='border-top:solid 1px #222222;position:absolute;top:210px;width:200px;height:65px;z-index:14;background-color:#f2f2f2;opacity=1;font-size:11px;color:#555555;padding:5px;'>"
+"<b>"+msg_budy+"</b><input type=text id=new_buddy style=width:100%;height:24px;font-size:12px;><input type=button OnClick=submit_buddy() value=OK style='border:1px solid rgba(100,100,100,1);background: rgba(150,150,150,1); border-radius:5px; padding:0px;  color:#ffffff; width:100%;'> </div>"); 
}

function submit_buddy() {

	var from = $('#un').val() + "@" + $('#un_server').val();
	var to = $('#new_buddy').val();
	if (to.search('@') > 1) {
		var msg = $pres({type: "subscribe", to: to, from: from, id: uid })
		connection.send(msg);
	}
	$("#rosteritems").html="";
		// document.getElementById("rosteritems").removeChild("addbuddy");
	document.getElementById("addbuddy").parentNode.removeChild(document.getElementById("addbuddy"));
	
	// document.getElementById('rosteritems').style.opacity="1";
	// connection.disconnect();
	k=0;
	firstime=1;
	Ca.go(document.getElementById('un').value,document.getElementById('pw').value)
	// setTimeout(function() { k=0; request_roster(); update_roster();}, 3500);
}

function user_del(roomID) {
        var from = $('#un').val() + "@" + $('#un_server').val();
	var to = hash_jids[roomID];
	//alert("Vamos a borrar a "+to);
        if (to.search('@') > 1) {
		// remove both subscriptions too
                uid=uid+1;
                var msg = $pres({from: from, id: uid, to: to, type: "unsubscribe"});
                // connection.send(msg);
                uid=uid+1;
                var msg = $pres({from: from, id: uid, to: to, type: "unsubscribed"});
                // connection.send(msg);

		uid=uid+1;
                var msg = $iq({type: "set", id: uid }).c("query", {xmlns: "jabber:iq:roster"}).c("item", {jid: to, subscription: "remove"}) ;
                connection.send(msg);
        }
	remove_room(roomID);
	k=0;
	firstime=1;
	Ca.go(document.getElementById('un').value,document.getElementById('pw').value)
	
}          

      
function focuse(ele) {
	active_room=ele;
        for (j=1;j<nrooms;j++) {
                if (rooms[j].length) {
                        document.getElementById(rooms[j]).style.zIndex="1";
			//var joa = 200*j;
			//document.getElementById(rooms[j]+'jejejeje').style.left=joa;
			if(document.getElementById(rooms[j]+'jejejeje')) {
				document.getElementById(rooms[j]+'jejejeje').style.zIndex="1";
				document.getElementById(rooms[j]+'jejejeje').style.opacity="20";
			}
			if(document.getElementById(rooms[j]+'container')) {
				document.getElementById(rooms[j]+'container').style.zIndex="1";
			}
			if(document.getElementById(rooms[j]+'msgs')) {
				document.getElementById(rooms[j]+'msgs').style.zIndex="1";
			}
			if(document.getElementById(rooms[j]+'title')) {
				document.getElementById(rooms[j]+'title').style.zIndex="1";
			}
			if(document.getElementById('nav_'+rooms[j])) {
				document.getElementById('nav_'+rooms[j]).style.borderStyle= "solid";
				document.getElementById('nav_'+rooms[j]).style.borderWidth= "1px 1px 0px 1px";
				document.getElementById('nav_'+rooms[j]).style.backgroundColor="#B0B0B0";
				document.getElementById('nav_'+rooms[j]).style.zIndex="12";
			}
			if(document.getElementById(rooms[j]+"vcard")) {
				document.getElementById(rooms[j]+"vcard").parentNode.removeChild(document.getElementById(rooms[j]+"vcard"));
				document.getElementById(rooms[j]+"vcardtitle").parentNode.removeChild(document.getElementById(rooms[j]+"vcardtitle"));
			}
                }
        }
	if (ele != 'roster') {
	        document.getElementById('roster').style.zIndex="1";
		document.getElementById('rostercontainer').style.zIndex="1";
		document.getElementById('rostermenu').style.zIndex="1";
		document.getElementById('rosteritems').style.zIndex="1";
		document.getElementById('nav_roster').style.borderStyle= "solid";
		document.getElementById('nav_roster').style.zIndex="15";
		document.getElementById('nav_roster').style.borderWidth= "1px 1px 0px 1px";
		document.getElementById('nav_roster').style.backgroundColor="#B0B0B0";
	} else {
		document.getElementById('roster').style.zIndex="14";
		document.getElementById('rostercontainer').style.zIndex="14";
		document.getElementById('rostermenu').style.zIndex="15";
		document.getElementById('rosteritems').style.zIndex="15";
		document.getElementById('nav_roster').style.borderStyle= "solid";
		document.getElementById('nav_roster').style.borderWidth= "1px 1px 0px 1px";
		document.getElementById('nav_roster').style.backgroundColor="#FFFFFF";
		document.getElementById('nav_roster').style.zIndex="16";

	}
        document.getElementById(ele).style.zIndex="14";
	if(document.getElementById(ele+'menu')) {
		document.getElementById(ele+'menu').style.zIndex="15";
	}
	if(document.getElementById(ele+'title')) {
		document.getElementById(ele+'title').style.zIndex="14";
	}
	if(document.getElementById(ele+'container')) {
		document.getElementById(ele+'container').style.zIndex="14";
	}
	if(document.getElementById(ele+'msgs')) {
		document.getElementById(ele+'msgs').style.zIndex="14";
	}
	if(document.getElementById(ele+'jejejeje')) {
		document.getElementById(ele+'jejejeje').style.zIndex="15";
	}
	if(document.getElementById('nav_'+ele)) {
		document.getElementById('nav_'+ele).style.borderStyle= "solid";
		document.getElementById('nav_'+ele).style.borderWidth= "1px 1px 0px 1px";
		document.getElementById('nav_'+ele).style.backgroundColor="#FFFFFF";
		document.getElementById('nav_'+ele).style.zIndex="15";
		// document.getElementById('nav_'+ele).style.textColor="#000000";
	}

}       






function tags() {
	if(!document.getElementById("tags")) {
		// Crea un div lateral con lenguetas de selección de Roster alguna Room existente
		var new_navigator = document.createElement("div");
	        new_navigator.id='tags';
	        new_navigator.style.position="absolute";
	        new_navigator.style.left="0px";
	        new_navigator.style.top="35px";
	        new_navigator.style.width="20px";
	        new_navigator.style.height="285px";
	        new_navigator.style.backgroundColor="transparent";
	        //new_navigator.style.overflow="hidden";
		new_navigator.style.zIndex="18";
        	document.getElementsByTagName('body')[0].appendChild(new_navigator);
	}

	$("#tags").html("");

	// Inserta primera pestaña que será "roster"
	$("#tags").append("<div id=nav_roster style='background-color:#C0C0C0;padding:0px 0px 0px 3px;text-align:center;width:50px;height:14px;font-size:12px;position:relative;top:20px;left:-14px;"
+"-ms-transform:rotate(270deg);-moz-transform:rotate(270deg);-webkit-transform:rotate(270deg);-o-transform:rotate(270deg);border-top-right-radius:8px;border-top-left-radius:8px;'"
+" OnClick=focuse('roster')>Roster</div>");


	
	// ver cuantas room hay abiertas (?)
	var myleft=56;
	for (j=1;j<nrooms;j++) {
		if (rooms[j].length) {
			var tagwidth= 58; // rooms[j].length*8+2;
			$("#tags").append("<div id=nav_"+rooms[j]+" style='overflow:hidden;background-color:#C0C0C0;width:"+tagwidth+"px;height:14px;font-size:12px;position:relative;top:"+myleft+"px;left:-18px;text-align:center;padding:0px 0px 0px 3px;"+"-ms-transform:rotate(-90deg);-moz-transform:rotate(-90deg);-webkit-transform:rotate(-90deg);-o-transform:rotate(-90deg);border-top-right-radius:8px;border-top-left-radius:8px;"
+"-transform-origin:100% 0%;-webkit-transform-origin:100% 0%;-ms-transform-origin:100% 0%'"
+" OnClick=focuse('"+rooms[j]+"') >"+rooms[j]+"</div>");
			if (rooms[j] == active_room) {
				document.getElementById('nav_'+rooms[j]).style.zIndex='15';
			}
			else {
				document.getElementById('nav_'+rooms[j]).style.zIndex='12';
			}

		myleft+=24;
		}
	}
}


function showhelp(roomID,text) {
        document.getElementById(roomID+"showhelp").innerHTML=text;

}

function insert_image(roomID) {
	var new_insert = document.createElement("input");
	new_insert.setAttribute('id',"insert_image");
	new_insert.setAttribute('type',"file");
	// new_insert.type="file";
	new_insert.name="insert_image";
        new_insert.style.position="absolute";
        new_insert.style.top="-2000";
        new_insert.style.left="-2500";
        new_insert.style.width="0px";
        new_insert.style.height="0px";
        new_insert.style.opacity="0";
	document.body.appendChild(new_insert);
	new_insert.click();
	// alert(document.getElementById('insert_image').value);
	document.getElementById('insert_image').addEventListener('change', insert_image2, false);
}

function insert_image2(e) {
	alert("YO");
	uid=uid+1;
        var sid = "100"+uid;
        var filename = document.getElementById("insert_image").value;
                
        // Prepara el fichero a enviar
        var file = e.target.files[0];
	alert("FILE:"+file);
        if (!file) {
                return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
                contents = e.target.result;
                size = contents.length;
                return;  
        };
        reader.readAsBinaryString(file);

	setTimeout(function() { 
	        contentType =  'data:image/jpeg;base64,';
        	//uriContent = contentType + encodeURIComponent(contents);
		uriContent = contentType + Base64.encode(contents);
		var insert= "<center><img alt=picture width=180 src="+uriContent+"></center>";
		alert(insert+"FIN");
		document.body.removeChild(document.getElementById('insert_image'));
		var to = $("#"+active_room+"_to").val() + "@" + $('#to_server').val();
        	var from = $('#un').val() + "@" + $('#un_server').val();
		var msg = $msg({to: to, from: connection.jid, type: "chat"}).c("body", {xmlns: Strophe.NS.CLIENT}).t('image').up().c("html", {xmlns: "http://jabber.org/protocol/xhtml-im"}).c("body", {xmlns: "http://www.w3.org/1999/xhtml"}).t(insert) ;
        	connection.send(msg);
	},1000);
}

function new_user() {
	//alert("El valor de newuser es:"+newuser);
	if (newuser == "1") {
	// alert("NUEVO USUARIO PRIMERA VEZ");
	// Esta función se llama despues de register() y de go() un nuevo usuario
	// Añade al roster de dicho usuario a los usuarios de soporte, 
	// abre room a soporte y presenta un msg de bienvenida
	hash_jids['help']="help@xmpp.interec.com/CA";
	uid=uid+1;
	var to ="help@xmpp.interec.com";
	var from = $('#un').val() + "@" + $('#un_server').val();
	var msg = $pres({type: "subscribe", to: to, from: from, id: uid })
        connection.send(msg);
	var msg = $pres({type: "subscribed", to: to, from: from, id: uid })
        connection.send(msg);
	setTimeout(function() { request_roster(); create_roster(); update_roster();}, 3600);
	// alert(hash_jids['help']);
	// create_room("help");
	// alert("room help creada");
	// active_room="help";
	// from="HELP";
	// $("#"+"helpmsgs").append("<p style='font-size:10px;color:#000096;'><strong>" + from + "</strong>: <span style='" +insertstyle + "'>" + "Welcome, can I help you ?" + "</span></p>");
	
	//var message="Bienvenido por primera vez";
	//alert(message);
	//var msg = $msg({to: from, from: to, type: "chat"}).c("body", {xmlns: Strophe.NS.CLIENT}).t(message);
        //connection.send(msg);
	newuser=0;
	}
}


function roster_listen_vcard() {
	photodata[k] = "";
	connection.rawInput = function(log) {
		var xml = $($.parseXML(log));
		if(xml.find("iq").attr("type") == "result") {
			if(xml.find("vCard").attr("xmlns") == "vcard-temp") {
				
				if (xml.find("PHOTO")) {
                                	var foto_type=xml.find("TYPE").text();
                                        var foto_data=xml.find("BINVAL").text();
                                        
                                }
                                           
                                userinfo[k]=xml.find("FN").text();
                                photodata[k]=xml.find("BINVAL").text();
                                alias[k]=xml.find("iq").attr("from").split("@")[0];
                                jids[k]=xml.find("iq").attr("from");
				recibido=1;
			}
		}
	} 
}





// eventos jquery


document.getElementById('filename').addEventListener('change', sendfile3, false);
//document.getElementById('insert_image').addEventListener('change', insert_image2, false);


//document.getElementById('nav_roster').addEventListener('click', focus('roster'), false);





// FUNCIONES EXTRA
////////////////////////////////////////////////////////////////////
  
// Funcion recoger intro
 function intro(e) {
   var keynum = window.event ? window.event.keyCode : e.which;

//  alert(keynum);

   if (keynum == 13) {
    document.getElementById('buttonConnect').click();
   }
   else {
    return true;
   }

    return /\d/.test(String.fromCharCode(keynum));
 }

        
// Funcion recoger alfanumericos sin espacios
 function alfanum_noespacio(e) {
   var keynum = window.event ? window.event.keyCode : e.which;

//   alert(keynum);

   if ((keynum > 47 && keynum < 58) || (keynum > 64 && keynum < 91) || (keynum > 96 && keynum < 123 ) || (keynum == 8) || (keynum == 0)) {
    return true;
   }  

    return /\d/.test(String.fromCharCode(keynum));
 } 
