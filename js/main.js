jQuery.unserialize = function(str){
		var items = str.split('&');
		var ret = "{";
		var arrays = [];
		var index = "";
		for (var i = 0; i < items.length; i++) {
			var parts = items[i].split(/=/);
			//console.log(parts[0], parts[0].indexOf("%5B"),  parts[0].indexOf("["));
			if (parts[0].indexOf("%5B") > -1 || parts[0].indexOf("[") > -1){
				//Array serializado
				index = (parts[0].indexOf("%5B") > -1) ? parts[0].replace("%5B","").replace("%5D","") : parts[0].replace("[","").replace("]","");
				//console.log("array detectado:", index);
				//console.log(arrays[index] === undefined);
				if (arrays[index] === undefined){
					arrays[index] = [];
				}
				arrays[index].push( decodeURIComponent(parts[1].replace(/\+/g," ")));
				//console.log("arrays:", arrays);
			} else {
				//console.log("common item (not array)");
				if (parts.length > 1){
					ret += "\""+parts[0] + "\": \"" + decodeURIComponent(parts[1].replace(/\+/g," ")).replace(/\n/g,"\\n").replace(/\r/g,"\\r") + "\", ";
				}
			}
			
		};
		
		ret = (ret != "{") ? ret.substr(0,ret.length-2) + "}" : ret + "}";
		//console.log(ret, arrays);
		var ret2 = JSON.parse(ret);
		//proceso los arrays
		for (arr in arrays){
			ret2[arr] = arrays[arr];
		}
		return ret2;
}

jQuery.fn.unserialize = function(parm){
		//If not string, JSON is assumed.
		var items = (typeof parm == "string") ? parm.split('&') : parm;
		if (typeof items !== "object"){
			throw new Error("unserialize: string or JSON object expected.");
		}
		//Check for the need of building an array from some item.
		//May return a false positive, but it's still better than looping twice.
		//TODO: confirm if it's ok to simplify this method by always calling
		//$.unserialize(parm) without any extra checking. 
		var need_to_build = ((typeof parm == "string") && decodeURIComponent(parm).indexOf("[]=") > -1);
		items = (need_to_build) ? $.unserialize(parm) : items;
		
		for (var i in items){
			//if(items[i] == "")continue;
			//console.log(items[i]);
			var parts = (items instanceof Array) ? items[i].split(/=/) : [i, (items[i] instanceof Array) ? items[i] : "" + items[i]];
			parts[0] = decodeURIComponent(parts[0]);
			if (parts[0].indexOf("[]") == -1 && parts[1] instanceof Array){
				parts[0] += "[]";
			}
			obj = this.find('[name=\''+ parts[0] +'\']');
			if (obj.length == 0){
				try{
					//obj = this.parent().find('[name=\''+ parts[0] +'\']'); DANIEL: commented for performance improvement
				} catch(e){}
			}
			if (typeof obj.attr("type") == "string" && ( obj.attr("type").toLowerCase() == "radio" || obj.attr("type").toLowerCase() == "checkbox")){
				 obj.each(function(index, coso) {
					coso = $(coso);
					//if the value is an array, i gotta search the item with that value.
					if (parts[1] instanceof Array){
						for (var i2 in parts[1]){
							var val = ""+parts[1][i2];
							if (coso.attr("value") == decodeURIComponent(val.replace(/\+/g," "))){
								coso.prop("checked",true);
								if(form_refresh){
									try {
										coso.checkboxradio( "refresh" );
									} catch (ex) {}
								}
							} else {
								if (!$.inArray(coso.val(),parts[1])){
									coso.prop("checked",false);
									if(form_refresh) try { coso.checkboxradio( "refresh" ); } catch (ex) {}
								}
							}
						}
					} else {
						val = "" + parts[1];
						if (coso.attr("value") == decodeURIComponent(val.replace(/\+/g," "))){
							coso.prop("checked",true);
						} else {
							coso.prop("checked",false);
						}
						if(form_refresh) try {coso.checkboxradio( "refresh" );} catch (ex) {}
					}
				 });
			} else if (obj.length > 0 && obj[0].tagName == "SELECT" && parts[1] instanceof Array && obj.prop("multiple")){
				//Here, i have an array for a multi-select.
				obj.val(parts[1]);
				if(form_refresh) try { obj.selectmenu( "refresh" );		} catch (ex) {}	
			} else {
				//When the value is an array, we join without delimiter
				var val = (parts[1] instanceof Array) ? parts[1].join("") : parts[1];
				//when the value is an object, we set the value to ""
				val = ((typeof val == "object") || (typeof val == "undefined")) ? "" : val;
				
				obj.val(decodeURIComponent(val.replace(/\+/g," ")));
				force_select_option( obj.attr("id") , val );	

				if(parts[1] == "overnight"){
					if(form_refresh) try { obj.selectmenu( "refresh" );		} catch (ex) {}	
				}
				//alert(parts[1]);

			}

		};
		return this;
}

function rebuild_arbol(){

		if( $("#encuesta5").find("input[name=01010000]:checked").val() == "SI"){
			$( "#div02010000,#div03010000" ).hide();
			$( "#div11000000,#div11010000,#div11020000,#div11030000" ).show();
		} else {
			$( "#div02010000,#div03010000" ).show();
			$( "#div11000000,#div11010000,#div11020000,#div11030000" ).hide();
		}

		if( $("#encuesta5").find("input[name=04010000]:checked").val() == "NIVEL EDUCATIVO"){
			$( "#div05010000" ).hide();
			$( "#div06010000" ).hide();
			$( "#div07010000" ).hide();
			$( "#div08010000" ).hide();



			$( "#div09000000" ).show();
			$( "#div10000000" ).show();

			$( "#div11000000" ).hide();//11
			$( "#div11020000" ).hide();//1.b
			if( $("#encuesta5").find( "input[name=01010000]:checked").val() == "SI"){
				$( "#div11010000" ).show();
				$( "#div11030000" ).show();
			}

			$( "#div62000000" ).hide();	
		
			$( "#div63000000" ).show();	

			$( "#div12020110" ).show();
			$( "#div12020200" ).hide();			
			$( "#div12020120" ).show();

			$( "#div07010200" ).hide();		
			$( "#div07020300" ).hide();		
		
		} else {
			$( "#div05010000" ).show();
			$( "#div06010000" ).show();
			$( "#div07010000" ).show();
			$( "#div08010000" ).show();

			if( $("#encuesta5").find( "input[name=01010000]:checked").val() == "SI"){
				$( "#div11000000" ).show();//11
				$( "#div11020000" ).show();//1.
			}
			$( "#div11010000" ).hide();
			$( "#div11030000" ).hide();
			$( "#div09000000" ).hide();
			$( "#div10000000" ).hide();



			$( "#div62000000" ).show();			
			$( "#div63000000" ).hide();	

			$( "#div12020100" ).show();			
			$( "#div12020110" ).hide();
			$( "#div12020200" ).show();			
			$( "#div12020120" ).hide();

			$( "#div07010200" ).show();		
			$( "#div07020300" ).show();			
		}

		if( $("#encuesta5").find("input[name=08010000]:checked" ).val() == "SI"){
			$( "#div62000000" ).show();
			$( "#div63000000" ).hide();
		} else {
			$( "#div62000000").hide();
			$( "#div63000000" ).show();
		}

		if( $("#encuesta6").find("input[name=10010000]:checked" ).val() == "SI"){
			$( ".edi" ).show();
		} else {
			$( ".edi" ).hide();
		}

		if( $("#encuesta6").find("input[name=10020000]:checked" ).val() == "SI"){
			$( ".edp" ).show();
		} else {
			$( ".edp" ).hide();
		}

		if( $("#encuesta6").find("input[name=10030000]:checked" ).val() == "SI"){
			$( ".eds" ).show();
		} else {
			$( ".eds" ).hide();
		}


		if( $("#encuesta6").find("input[name=12010000]:checked" ).val() == "OTRO"){
			$( "#div12010100" ).show();
		} else {
			$( "#div12010100").hide();
			$( "#12010100").val("");
		}

		if( $("#encuesta6").find("input[name=13010001]:checked").val() == "IE-EIB"){
			$(".noeib .efi").hide();
			$(".eib .efi").show();
		} else {
			$(".noeib .efi").show();
			$(".eib .efi").hide();
		}

		if( $("#encuesta6").find("input[name=13010002]:checked").val() == "IE-EIB"){
			$(".noeib .efp").hide();
			$(".eib .efp").show();
		} else {
			$(".noeib .efp").show();
			$(".eib .efp").hide();
		}
	

	if($("#1401010101").is(":checked") ) { $("#div14010201,#div14010301,#div14010401,#div14010501,#div14010601").show();  } else { $("#div14010201,#div14010301,#div14010401,#div14010501,#div14010601").hide(); } 
	if($("#1402010101").is(":checked") ) { $("#div14020201,#div14020301,#div14020401,#div14020501,#div14020601").show();  } else { $("#div14020201,#div14020301,#div14020401,#div14020501,#div14020601").hide(); } 

	 if($("#1401010201").is(":checked") ) { $("#div14010202,#div14010302,#div14010402,#div14010502,#div14010602").show();  } else { $("#div14010202,#div14010302,#div14010402,#div14010502,#div14010602").hide(); } 
	 if($("#1402010201").is(":checked") ) { $("#div14020202,#div14020302,#div14020402,#div14020502,#div14020602").show();  } else { $("#div14020202,#div14020302,#div14020402,#div14020502,#div14020602").hide(); } 
	if($("#1403010201").is(":checked") ) { $("#div14030202,#div14030302,#div14030402,#div14030502,#div14030602").show();  } else { $("#div14030202,#div14030302,#div14030402,#div14030502,#div14030602").hide(); } 

	if($("#1401010301").is(":checked") ) { $("#div14010203,#div14010303,#div14010403,#div14010503,#div14010603").show();  } else { $("#div14010203,#div14010303,#div14010403,#div14010503,#div14010603").hide(); } 
	if($("#1402010301").is(":checked") ) { $("#div14020203,#div14020303,#div14020403,#div14020503,#div14020603").show();  } else { $("#div14020203,#div14020303,#div14020403,#div14020503,#div14020603").hide(); } 
	 if($("#1403010301").is(":checked") ) { $("#div14030203,#div14030303,#div14030403,#div14030503,#div14030603").show();  } else { $("#div14030203,#div14030303,#div14030403,#div14030503,#div14030603").hide(); } 

		if( $("#encuesta7").find("input[name=15010000]:checked").val() == "NO"){
			$(".rai").hide();
		} else {
			$(".rai").show();
		}

		if( $("#encuesta7").find("input[name=15020000]:checked").val() == "NO"){
			$(".rap").hide();
		} else {
			$(".rap").show();
		}

		if( $("#encuesta7").find("input[name=15030000]:checked").val() == "NO"){
			$(".ras").hide();
		} else {
			$(".ras").show();
		}
	ocultar16();

		if( $("#encuesta7").find("input[name=16010001]:checked").val() == "SI"){ $("#div64010001").show();	} else {$("#div64010001").hide();}

		if( $("#encuesta7").find("input[name=16020001]:checked").val() == "SI"){ $("#div64020001").show();	} else {$("#div64020001").hide();}

		if( $("#encuesta7").find("input[name=16030001]:checked").val() == "SI"){ $("#div64030001").show();	} else {$("#div64030001").hide();}

		if( $("#encuesta7").find("input[name=16010002]:checked").val() == "SI"){ $("#div64010002").show();	} else {$("#div64010002").hide();}

		if( $("#encuesta7").find("input[name=16020002]:checked").val() == "SI"){ $("#div64020002").show();	} else {$("#div64020002").hide();}

		if( $("#encuesta7").find("input[name=16030002]:checked").val() == "SI"){ $("#div64030002").show();	} else {$("#div64030002").hide();}

		if( $("#encuesta7").find("input[name=16010003]:checked").val() == "SI"){ $("#div64010003").show();	} else {$("#div64010003").hide();}

		if( $("#encuesta7").find("input[name=16020003]:checked").val() == "SI"){ $("#div64020003").show();	} else {$("#div64020003").hide();}

		if( $("#encuesta7").find("input[name=16030003]:checked").val() == "SI"){ $("#div64030003").show();	} else {$("#div64030003").hide();}



		if( ($("#encuesta9").find("input[name=19010002]:checked").val() == "SI") ){ $("#div65010002").show();	} else { $("#div65010002").hide(); }

		if( ($("#encuesta9").find("input[name=19010003]:checked").val() == "SI") ){ $("#div65010003").show();	} else { $("#div65010003").hide(); }

		if( ($("#encuesta9").find("input[name=19020001]:checked").val() == "SI") ){ $("#div65020001").show();	} else { $("#div65020001").hide(); }

		if( ($("#encuesta9").find("input[name=19020002]:checked").val() == "SI") ){ $("#div65020002").show();	} else { $("#div65020002").hide(); }

		if( ($("#encuesta9").find("input[name=19020003]:checked").val() == "SI") ){ $("#div65020003").show();	} else { $("#div65020003").hide(); }

		if( ($("#encuesta9").find("input[name=19030002]:checked").val() == "SI") ){ $("#div65030002").show();	} else { $("#div65030002").hide(); }


		if( $("#encuesta10").find("input[name=21010100]:checked").val() == "NO"){ $( "#div21010200" ).hide(); } else { $( "#div21010200" ).show(); }

		if( $("#encuesta10").find("input[name=21020100]:checked").val() == "NO"){ $( "#div21020200" ).hide(); } else { $( "#div21020200" ).show(); }

		if( $("#encuesta10").find("input[name=21030100]:checked").val() == "NO"){ $( "#div21030200" ).hide(); } else { $( "#div21030200" ).show(); }

		if( $("#encuesta10").find("input[name=21040100]:checked").val() == "NO"){ $( "#div21040200" ).hide(); } else { $( "#div21040200" ).show(); }

		if( $("#encuesta10").find("input[name=21050100]:checked").val() == "NO"){ $( "#div21050200" ).hide(); } else { $( "#div21050200" ).show(); }

		if( $("#encuesta10").find("input[name=21060100]:checked").val() == "NO"){ $( "#div21060200" ).hide(); } else { $( "#div21060200" ).show(); }

		if( $("#encuesta10").find("input[name=21070100]:checked").val() == "NO"){ $( "#div21070200" ).hide(); } else { $( "#div21070200" ).show(); }
	
		if( $("#encuesta10").find("input[name=21080100]:checked").val() == "NO"){ $( "#div21080200" ).hide(); } else { $( "#div21080200" ).show(); }

		if( $("#encuesta10").find("input[name=21090100]:checked").val() == "NO"){ $( "#div21090200" ).hide(); } else { $( "#div21090200" ).show(); }

		if( $("#encuesta10").find("input[name=21100100]:checked").val() == "NO"){ $( "#div21100200" ).hide(); } else { $( "#div21100200" ).show(); }

		if( $("#encuesta10").find("input[name=21110100]:checked").val() == "NO"){ $( "#div21110200" ).hide(); } else { $( "#div21110200" ).show(); }

		if( $("#encuesta10").find("input[name=21120100]:checked").val() == "NO"){ $( "#div21120200" ).hide(); } else { $( "#div21120200" ).show(); }
	


		if( $("#encuesta11").find("input[name=22010000]:checked").val() == "NO"){
			$( "#div23010000,#div24010000,#div25000000" ).hide();
		} else {
			$( "#div23010000,#div24010000,#div25000000" ).show();
		}


		if( $("#2301000001").is(":checked") && ( $("#2301000002").is(":checked") || $("#2301000003").is(":checked")|| $("#2301000004").is(":checked") || $("#2301000005").is(":checked") || $("#2301000006").is(":checked")  ) ){
			$( "#div24010000" ).show();
			$( "#div25000000" ).show();
		} else {
			if( $("#2301000002").is(":checked") || $("#2301000003").is(":checked")|| $("#2301000004").is(":checked") || $("#2301000005").is(":checked") || $("#2301000006").is(":checked")   ){
				$( "#div24010000" ).hide();
				$( "#div25000000" ).hide();
			} else {
				$( "#div24010000" ).show();
				$( "#div25000000" ).show();
			}
		}

		if(  $("#2301000006").is(":checked")   ){
			$( "#2301000001" ).parent().hide();
			$( "#2301000002" ).parent().hide();
			$( "#2301000003" ).parent().hide();
			$( "#2301000004" ).parent().hide();
			$( "#2301000005" ).parent().hide();
		} else {
			$( "#2301000001" ).parent().show();
			$( "#2301000002" ).parent().show();
			$( "#2301000003" ).parent().show();
			$( "#2301000004" ).parent().show();
			$( "#2301000005" ).parent().show();
		}



		if( $("#2301000005" ).is(":checked") ){
			$( "#div23010100" ).show();
		} else {
			$( "#div23010100").hide();
			$( "#23010100").val("");
		}

		if( $("#2401000007").is(":checked") ){
			$( "#div24010100" ).show();

			$("#div67070000 legend").html( $( "#24010100" ).val()  );
			$("#div68070000 legend").html( $( "#24010100" ).val()  );

		} else {
			$("#div67070000 legend").html( "Otros(Especificar)");
			$("#div68070000 legend").html( "Otros(Especificar)" );
			$( "#div24010100").hide();
			$( "#24010100").val("");
		}

	/*	if( $("#2401000007").is(":checked") ){
			$( "#2401000001" ).parent().hide();
			$( "#2401000002" ).parent().hide();
			$( "#2401000003" ).parent().hide();
			$( "#2401000004" ).parent().hide();
			$( "#2401000005" ).parent().hide();
			$( "#2401000006" ).parent().hide();
		} else {
			$( "#2401000001" ).parent().show();
			$( "#2401000002" ).parent().show();
			$( "#2401000003" ).parent().show();
			$( "#2401000004" ).parent().show();
			$( "#2401000005" ).parent().show();
			$( "#2401000006" ).parent().show();		
		}*/

		if( $("#24010100").val() != "" ){
			$("#div67070000 legend").html( $( "#24010100" ).val()  );
			$("#div68070000 legend").html( $( "#24010100" ).val()  );
			$("#div25000000").find(".25070000 td:first-child").html( $( "#24010100" ).val()  );
		} else {
			$("#div67070000 legend").html( "Otros"  );
			$("#div68070000 legend").html(  "Otros"  );
			$("#div25000000").find(".25070000 td:first-child").html(  "Otros"  );
		}

		if( $("#2401000001").is(":checked") ){ $(".25010000,#div67010000,#div68010000").show();	} else {$(".25010000,#div67010000,#div68010000").hide();}

		if( $("#2401000002").is(":checked") ){ $(".25020000,#div67020000,#div68020000").show();	} else {$(".25020000,#div67020000,#div68020000").hide();}

		if( $("#2401000003").is(":checked") ){ $(".25030000,#div67030000,#div68030000").show();	} else {$(".25030000,#div67030000,#div68030000").hide();}

		if( $("#2401000004").is(":checked") ){ $(".25040000,#div67040000,#div68040000").show();	} else {$(".25040000,#div67040000,#div68040000").hide();}

		if( $("#2401000005").is(":checked") ){ $(".25050000,#div67050000,#div68050000").show();	} else {$(".25050000,#div67050000,#div68050000").hide();}

		if( $("#2401000006").is(":checked") ){ $(".25060000,#div67060000,#div68060000").show();	} else {$(".25060000,#div67060000,#div68060000").hide();}

		if( $("#2401000007").is(":checked") ){ $(".25070000,#div67070000,#div68070000").show();	} else {$(".25070000,#div67070000,#div68070000").hide();}



		if( $( "#encuesta12").find("input[name=26010000]:checked").val() == "NO"){
			$( "#div27010000,#div28010000,#div31010000,#div32010000" ).hide();
		} else {
			$( "#div27010000,#div28010000,#div31010000,#div32010000" ).show();
		}
	

	
		if( ($( "#encuesta12").find("input[name=27010000]:checked").val() == "NO") || ($( "#encuesta12").find("input[name=27010000]:checked").val() == "NO SABE") ){
			$( "#div28010000,#div31010000,#div32010000" ).hide();
		} else {
			$( "#div28010000,#div31010000,#div32010000" ).show();
		}


		/*if( ($("#encuesta11").find("input[name=29010000]:checked").val() == "NO") || ($("#encuesta11 input[name=29010000]:checked").val() == "NO SABE") ){
			$( "#div31010000" ).hide();
		} else {
			$( "#div31010000" ).show();
		}*/

	if($("#encuesta12").find("input[name=33010101]:checked").val() == "SI"){ $("#div33020101,#div33030101,#div33120101").show();   } else { $("#div33020101,#div33030101,#div33120101").hide();  }

	if($("#encuesta12").find("input[name=33040101]:checked").val() == "SI"){ $("#div33050101,#div33060101").show(); } else { $("#div33050101").hide();$("#div33060101").show(); }

	if($("#encuesta12").find("input[name=33010201]:checked").val() == "SI"){ $("#div33020201,#div33030201,#div33120201").show();   } else { $("#div33020201,#div33030201,#div33120201").hide();  }

	if($("#encuesta12").find("input[name=33040201]:checked").val() == "SI"){ $("#div33050201,#div33060201").show(); } else { $("#div33050201").hide();$("#div33060201").show(); }

	if($("#encuesta12").find("input[name=33010301]:checked").val() == "SI"){ $("#div33020301,#div33030301,#div33120301").show();   } else { $("#div33020301,#div33030301,#div33120301").hide();  }

	if($("#encuesta12").find("input[name=33040301]:checked").val() == "SI"){ $("#div33050301,#div33060301").show(); } else { $("#div33050301").hide();$("#div33060301").show(); }

	if($("#encuesta12").find("input[name=33010401]:checked").val() == "SI"){ $("#div33020401,#div33030401,#div33120401").show();   } else { $("#div33020401,#div33030401,#div33120401").hide();  }

	if($("#encuesta12").find("input[name=33040401]:checked").val() == "SI"){ $("#div33050401,#div33060401").show(); } else { $("#div33050401").hide();$("#div33060401").show(); }

	if($("#encuesta12").find("input[name=33010501]:checked").val() == "SI"){ $("#div33020501,#div33030501,#div33120501").show();   } else { $("#div33020501,#div33030501,#div33120501").hide();  }

	if($("#encuesta12").find("input[name=33040501]:checked").val() == "SI"){ $("#div33050501,#div33060501").show(); } else { $("#div33050501").hide();$("#div33060501").show(); }

	if($("#encuesta12").find("input[name=33010601]:checked").val() == "SI"){ $("#div33020601,#div33030601,#div33120601").show();   } else { $("#div33020601,#div33030601,#div33120601").hide();  }

	if($("#encuesta12").find("input[name=33040601]:checked").val() == "SI"){ $("#div33050601,#div33060601").show(); } else { $("#div33050601").hide();$("#div33060601").show(); }

	if($("#encuesta12").find("input[name=33010102]:checked").val() == "SI"){ $("#div33020102,#div33030102,#div33120102").show();   } else { $("#div33020102,#div33030102,#div33120102").hide();  }

	if($("#encuesta12").find("input[name=33040102]:checked").val() == "SI"){ $("#div33050102,#div33060102").show(); } else { $("#div33050102").hide();$("#div33060102").show(); }

	if($("#encuesta12").find("input[name=33010202]:checked").val() == "SI"){ $("#div33020202,#div33030202,#div33120202").show();   } else { $("#div33020202,#div33030202,#div33120202").hide();  }

	if($("#encuesta12").find("input[name=33040202]:checked").val() == "SI"){ $("#div33050202,#div33060202").show(); } else { $("#div33050202").hide();$("#div33060202").show(); }

	if($("#encuesta12").find("input[name=33010302]:checked").val() == "SI"){ $("#div33020302,#div33030302,#div33120302").show();   } else { $("#div33020302,#div33030302,#div33120302").hide();  }

	if($("#encuesta12").find("input[name=33040302]:checked").val() == "SI"){ $("#div33050302,#div33060302").show(); } else { $("#div33050302").hide();$("#div33060302").show(); }

	if($("#encuesta12").find("input[name=33010402]:checked").val() == "SI"){ $("#div33020402,#div33030402,#div33120402").show();   } else { $("#div33020402,#div33030402,#div33120402").hide();  }

	if($("#encuesta12").find("input[name=33040402]:checked").val() == "SI"){ $("#div33050402,#div33060402").show(); } else { $("#div33050402").hide();$("#div33060402").show(); }

	if($("#encuesta12").find("input[name=33010502]:checked").val() == "SI"){ $("#div33020502,#div33030502,#div33120502").show();   } else { $("#div33020502,#div33030502,#div33120502").hide();  }

	if($("#encuesta12").find("input[name=33040502]:checked").val() == "SI"){ $("#div33050502,#div33060502").show(); } else { $("#div33050502").hide();$("#div33060502").show(); }

	if($("#encuesta12").find("input[name=33010602]:checked").val() == "SI"){ $("#div33020602,#div33030602,#div33120602").show();   } else { $("#div33020602,#div33030602,#div33120602").hide();  }

	if($("#encuesta12").find("input[name=33040602]:checked").val() == "SI"){ $("#div33050602,#div33060602").show(); } else { $("#div33050602").hide();$("#div33060602").show(); }

	if($("#encuesta12").find("input[name=33010103]:checked").val() == "SI"){ $("#div33020103,#div33030103,#div33120103").show();   } else { $("#div33020103,#div33030103,#div33120103").hide();  }

	if($("#encuesta12").find("input[name=33040103]:checked").val() == "SI"){ $("#div33050103,#div33060103").show(); } else { $("#div33050103").hide();$("#div33060103").show(); }

	if($("#encuesta12").find("input[name=33010203]:checked").val() == "SI"){ $("#div33020203,#div33030203,#div33120203").show();   } else { $("#div33020203,#div33030203,#div33120203").hide();  }

	if($("#encuesta12").find("input[name=33040203]:checked").val() == "SI"){ $("#div33050203,#div33060203").show(); } else { $("#div33050203").hide();$("#div33060203").show(); }

	if($("#encuesta12").find("input[name=33010303]:checked").val() == "SI"){ $("#div33020303,#div33030303,#div33120303").show();   } else { $("#div33020302,#div33030303,#div33120303").hide();  }

	if($("#encuesta12").find("input[name=33040303]:checked").val() == "SI"){ $("#div33050303,#div33060303").show(); } else { $("#div33050303").hide();$("#div33060303").show(); }

	if($("#encuesta12").find("input[name=33010403]:checked").val() == "SI"){ $("#div33020403,#div33030403,#div33120403").show();   } else { $("#div33020403,#div33030403,#div33120403").hide();  }

	if($("#encuesta12").find("input[name=33040403]:checked").val() == "SI"){ $("#div33050403,#div33060403").show(); } else { $("#div33050403").hide();$("#div33060403").show(); }

	if($("#encuesta12").find("input[name=33010503]:checked").val() == "SI"){ $("#div33020503,#div33030503,#div33120503").show();   } else { $("#div33020503,#div33030503,#div33120503").hide();  }

	if($("#encuesta12").find("input[name=33040503]:checked").val() == "SI"){ $("#div33050503,#div33060503").show(); } else { $("#div33050503").hide();$("#div33060503").show(); }

	if($("#encuesta12").find("input[name=33010603]:checked").val() == "SI"){ $("#div33020603,#div33030603,#div33120603").show();   } else { $("#div33020603,#div33030603,#div33120603").hide();  }

	if($("#encuesta12").find("input[name=33040603]:checked").val() == "SI"){ $("#div33050603,#div33060603").show(); } else { $("#div33050603").hide();$("#div33060603").show(); }

/*
		if( $("#3101000004").is(":checked") ){
			$( "#div31010100" ).show();
		} else {
			$( "#div31010100").hide();
			$( "#31010100").val("");
		}*/


		tmpcon = "Opciones marcadas: ";
		if( $("#3101000001").is(":checked") ){ tmpcon += $("#3101000001").val()+","; }
		if( $("#3101000002").is(":checked") ){ tmpcon += $("#3101000002").val()+","; }
		if( $("#3101000003").is(":checked") ){ tmpcon += $("#3101000003").val()+","; }
		if( $("#3101000004").is(":checked") ){ tmpcon += $("#3101000004").val()+","; }
		//console.log(tmpcon);
		$("#obs69").html(tmpcon);


		/*if( $("#3201000003").is(":checked") ){
			$( "#div32010100" ).show();
		} else {
			$( "#div32010100").hide();
			$( "#32010100").val("");
		}*/

		if( ($("#encuesta17").find("input[name=34010000]:checked").val() == "NO") ){
			$( "#div35000000,#div36010000,#div37010000,#div38000000" ).hide();
		} else {
			$( "#div35000000,#div36010000,#div37010000,#div38000000" ).show();
		}

		if( ($("#encuesta17").find("input[name=35010105]:checked").val() == "SI") ){
			$("#div70000000").show();
		} else {
			$("#div70000000").hide();
		}
	

	if( $("#encuesta17").find("input[name=35010101]:checked").val() == "SI"){  $( "#div35010201,#div35010301" ).show();  } else {  $( "#div35010201,#div35010301" ).hide();    }

	if( $("#encuesta17").find("input[name=35010102]:checked").val() == "SI"){  $( "#div35010202,#div35010302" ).show();  } else {  $( "#div35010202,#div35010302" ).hide();    }

	if( $("#encuesta17").find("input[name=35010103]:checked").val() == "SI"){  $( "#div35010203,#div35010303" ).show();  } else {  $( "#div35010203,#div35010303" ).hide();    }

	if( $("#encuesta17").find("input[name=35010104]:checked").val() == "SI"){  $( "#div35010204,#div35010304" ).show();  } else {  $( "#div35010204,#div35010304" ).hide();   }

	if( $("#encuesta17").find("input[name=35010105]:checked").val() == "SI"){  $( "#div35010205,#div35010305" ).show();  } else { $( "#div35010205,#div35010305" ).hide();     }

	if( $("#encuesta17").find("input[name=35010106]:checked").val() == "SI"){  $( "#div35010206,#div35010306" ).show();  } else {  $( "#div35010206,#div35010306" ).hide();   }

	if( $("#encuesta17").find("input[name=35010107]:checked").val() == "SI"){  $( "#div35010207,#div35010307" ).show();  } else {   $( "#div35010207,#div35010307" ).hide();  }
	
	if( $("#encuesta17").find("input[name=35010108]:checked").val() == "SI"){  $( "#div35010208,#div35010308,#div35901011" ).show();  } else {   $( "#div35010208,#div35010308,#div35901011" ).hide();  }

	//if( $("#encuesta17").find("input[name=35010109]:checked").val() == "SI"){  $( "#div35010209,#div35010309" ).show();  } else {   $( "#div35010209,#div35010309" ).hide();  }



	if( $("#encuesta17").find("input[name=35020101]:checked").val() == "SI"){  $( "#div35020201,#div35020301" ).show();  } else { $( "#div35020201,#div35020301" ).hide();    }

	if( $("#encuesta17").find("input[name=35020102]:checked").val() == "SI"){  $( "#div35020202,#div35020302" ).show();  } else {  $( "#div35020202,#div35020302" ).hide();   }

	if( $("#encuesta17").find("input[name=35020103]:checked").val() == "SI"){  $( "#div35020203,#div35020303" ).show();  } else {  $( "#div35020203,#div35020303" ).hide();   }

	if( $("#encuesta17").find("input[name=35020104]:checked").val() == "SI"){  $( "#div35020204,#div35020304" ).show();  } else { $( "#div35020204,#div35020304" ).hide();    }

	if( $("#encuesta17").find("input[name=35020105]:checked").val() == "SI"){  $( "#div35020205,#div35020305" ).show();  } else { $( "#div35020205,#div35020305" ).hide();     }

	if( $("#encuesta17").find("input[name=35020106]:checked").val() == "SI"){  $( "#div35020206,#div35020306" ).show();  } else {  $( "#div35020206,#div35020306" ).hide();    }

	if( $("#encuesta17").find("input[name=35020107]:checked").val() == "SI"){  $( "#div35020207,#div35020307" ).show();  } else {   $( "#div35020207,#div35020307" ).hide();  }

	if( $("#encuesta17").find("input[name=35020108]:checked").val() == "SI"){  $( "#div35020208,#div35020308,#div35901111" ).show();  } else {   $( "#div35020208,#div35020308,#div35901111" ).hide();  }

	//if( $("#encuesta17").find("input[name=35020109]:checked").val() == "SI"){  $( "#div35020209,#div35020309" ).show();  } else {   $( "#div35020209,#div35020309" ).hide();  }



	if( $("#encuesta17").find("input[name=35030101]:checked").val() == "SI"){  $( "#div35030201,#div35030301" ).show();  } else { $( "#div35030201,#div35030301" ).hide();     }

	if( $("#encuesta17").find("input[name=35030102]:checked").val() == "SI"){  $( "#div35030202,#div35030302" ).show();  } else {  $( "#div35030202,#div35030302" ).hide();     }

	if( $("#encuesta17").find("input[name=35030103]:checked").val() == "SI"){  $( "#div35030203,#div35030303" ).show();  } else { $( "#div35030203,#div35030303" ).hide();     }

	if( $("#encuesta17").find("input[name=35030104]:checked").val() == "SI"){  $( "#div35030204,#div35030304" ).show();  } else { $( "#div35030204,#div35030304" ).hide();     }

	if( $("#encuesta17").find("input[name=35030105]:checked").val() == "SI"){  $( "#div35030205,#div35030305" ).show();  } else {   $( "#div35030205,#div35030305" ).hide();    }

	if( $("#encuesta17").find("input[name=35030106]:checked").val() == "SI"){  $( "#div35030206,#div35030306" ).show();  } else { $( "#div35030206,#div35030306" ).hide();     }

	if( $("#encuesta17").find("input[name=35030107]:checked").val() == "SI"){  $( "#div35030207,#div35030307" ).show();  } else {  $( "#div35030207,#div35030307" ).hide();    }

	if( $("#encuesta17").find("input[name=35030108]:checked").val() == "SI"){  $( "#div35030208,#div35030308,#div35901211" ).show();  } else {  $( "#div35030208,#div35030308,#div35901211" ).hide();    }

	//if( $("#encuesta17").find("input[name=35030109]:checked").val() == "SI"){  $( "#div35030209,#div35030309" ).show();  } else {  $( "#div35030209,#div35030309" ).hide();    }


	 special37(); 

		if( $("#3701000006").is(":checked") ){
			$( "#div37010011" ).show();
		} else {
			$( "#div37010011" ).hide();
			$( "#37010011" ).val("");
		}

		if( ($("#encuesta17").find("input[name=36010000]:checked").val() == "NO") ){
			$( "#div37010000,#div38000000" ).hide();
		} else {
			$( "#div37010000,#div38000000" ).show();
		}


		if( $("#38010000").val() == "" ){
			$( "#div38020000" ).show();
		} else {
			$( "#div38020000" ).hide();
		}

		$( "#div38010000" ).val("");
		if( $("#3802000001").is(":checked") ){
			$( "#div38010000" ).hide();
		} else {
			$( "#div38010000" ).show();
		}

		if( ($("#encuesta18").find("input[name=40010000]:checked").val() == "NO") || ($("#encuesta18").find("input[name=40010000]:checked").val() == "NO SABE") ){
			$( "#mantenimiento" ).hide();
		} else {
			$( "#mantenimiento" ).show();
		}



	/*	if( ($("#encuesta18").find("input[name=41010000]:checked").val() == "NO") || ($("#encuesta18").find("input[name=41010000]:checked").val() == "NO SABE") ){
			$( "#mantficha" ).hide();
		} else {
			$( "#mantficha" ).show();
		}*/


		if( ($("#encuesta18").find("input[name=42010000]:checked").val() == "SI")  ){
			$( "#div43010000" ).hide();
			$("#encuesta18").find("input[name=43010000]:checked").attr("checked", false);
			//$("#encuesta18").find("input[name=43010000]").checkboxradio("refresh");
			$( "#div44010000").show();
		} else {
			$("#encuesta18").find("input[name=43010000]:checked").attr("checked", false);
			//$("#encuesta18").find("input[name=43010000]").checkboxradio("refresh");
			$( "#div43010000" ).show();
			$( "#div44010000").hide();
		}


		if( $("#encuesta18").find("input[name=43010000]:checked").val() == "Otros" ){
			$( "#div43010100" ).show();
		} else {
			$( "#div43010100").hide();
			$( "#43010100").val("");
		}
		$( "#div44010000").hide();


		if( ($("#encuesta19").find("input[name=45010000]:checked").val() == "NO")  ){
			$( "#higienicos" ).hide();
		} else {
			$( "#higienicos" ).show();
		}


		if( ($("#encuesta19").find("input[name=47010100]:checked").val() == "NO")  ){	$(".finodoro,#div47010200").hide();	} else {$(".finodoro,#div47010200").show();	}

		if( ($("#encuesta19").find("input[name=47020100]:checked").val() == "NO")  ){	$(".fturco,#div47020200").hide();	} else {$(".fturco,#div47020200").show();	}

		if( ($("#encuesta19").find("input[name=47030100]:checked").val() == "NO")  ){	$(".fhueco,#div47030200").hide();	} else {$(".fhueco,#div47030200").show();	}



		if( ($("#encuesta20").find("input[name=48010000]:checked").val() == "NO") ){
			$("#encuesta20").find("#div49010000,#div50010000,#horasagua,#div86000000" ).hide();
		} else {
			$("#encuesta20").find("#div49010000,#div50010000,#horasagua,#div86000000" ).show();
		}


		if( $("#4901000005" ).is(":checked") ){
			$( "#div49010100" ).show();
		} else {
			$( "#div49010100").hide();
			$( "#49010100").val("");
		}


	$( "#4901000001" ).change(function() {
		if( $(this).is(":checked") ){
			$( "#div50010000,#horasagua" ).show();
		} else {
			$( "#div50010000,#horasagua").hide();
		}
	});

		if( $("#5101000003").is(":checked") ){
			$( "#div51010100" ).show();
		} else {
			$( "#div51010100").hide();
			$( "#51010100").val("");
		}


		if( $("#5101000001").is(":checked") ){
			$( "#div52010000" ).show();
		} else {
			$( "#div52010000").hide();
		}

		if( $("#5201000004").is(":checked") ){
			$( "#div52010100" ).show();
		} else {
			$( "#div52010100").hide();
			$( "#52010100").val("");
		}

		if( $("#encuesta22").find("input[name=54010000]:checked").val() == "NO"){
			$("#div55000000").hide();
			$("#div66010000").hide();	
		} else {
			$("#div55000000").show();
			$("#div66010000").show();	
		}

		if( $("#encuesta23").find("input[name=56010000]:checked" ).val() == "NO"){
			$( "#div57010000" ).hide();
			$( "#div58010000" ).hide();
			$( "#div59010000" ).hide();
		} else {
			$( "#div57010000" ).show();
			$( "#div58010000" ).show();
			$( "#div59010000" ).show();
		}
	
		if( $("#encuesta23").find("input[name=57010000]:checked").val() == "NO"){
			$( "#div58010000" ).hide();
			$( "#div59010000" ).show();
		} else {
			$( "#div58010000" ).show();
			$( "#div59010000" ).hide();
		}
	


		if( $("#encuesta24").find("input[name=60010000]:checked").val() == "NO"){
			$( "#div61000000" ).hide();
		} else {
			$( "#div61000000" ).show();
		}



	if( $("#encuesta24").find("input[name=61010101]:checked").val() == "SI"){  $( "#div61010201,#div61010301" ).show();  } else { $( "#div61010201,#div61010301" ).hide();     }

	if( $("#encuesta24").find("input[name=61020101]:checked").val() == "SI"){  $( "#div61020201,#div61020301" ).show();  } else {    $( "#div61020201,#div61020301" ).hide();  }

	if( $("#encuesta24").find("input[name=61030101]:checked").val() == "SI"){  $( "#div61030201,#div61030301" ).show();  } else {  $( "#div61030201,#div61030301" ).hide();    }

	if( $("#encuesta24").find("input[name=61040101]:checked").val() == "SI"){  $( "#div61040201,#div61040301" ).show();  } else {  $( "#div61040201,#div61040301" ).hide();    }

	if( $("#encuesta24").find("input[name=61050101]:checked").val() == "SI"){  $( "#div61050201,#div61050301" ).show();  } else {  $( "#div61050201,#div61050301" ).hide();    }

	if( $("#encuesta24").find("input[name=61060101]:checked").val() == "SI"){  $( "#div61060201,#div61060301" ).show();  } else {  $( "#div61060201,#div61060301" ).hide();   }

	if( $("#encuesta24").find("input[name=61070101]:checked").val() == "SI"){  $( "#div61070201,#div61070301" ).show();  } else {   $( "#div61070201,#div61070301" ).hide();  }

	if( $("#encuesta24").find("input[name=61080101]:checked").val() == "SI"){  $( "#div61080201,#div61080301" ).show();  } else {   $( "#div61080201,#div61080301" ).hide();  }

	if( $("#encuesta24").find("input[name=61090101]:checked").val() == "SI"){  $( "#div61090201,#div61090301" ).show();  } else {   $( "#div61090201,#div61090301" ).hide();    }

	if( $("#encuesta24").find("input[name=61100101]:checked").val() == "SI"){  $( "#div61100201,#div61100301" ).show();  } else {  $( "#div61100201,#div61100301" ).hide();   }

	if( $("#encuesta24").find("input[name=61110101]:checked").val() == "SI"){  $( "#div61110201,#div61110301" ).show();  } else {  $( "#div61110201,#div61110301" ).hide();    }

	if( $("#encuesta24").find("input[name=61120101]:checked").val() == "SI"){  $( "#div61120201,#div61120301" ).show();  } else {  $( "#div61120201,#div61120301" ).hide();   }

	if( $("#encuesta24").find("input[name=61130101]:checked").val() == "SI"){  $( "#div61130201,#div61130301" ).show();  } else {  $( "#div61130201,#div61130301" ).hide();   }

	if( $("#encuesta24").find("input[name=61140101]:checked").val() == "SI"){  $( "#div61140201,#div61140301" ).show();  } else {   $( "#div61140201,#div61140301" ).hide();   }

	if( $("#encuesta24").find("input[name=61150101]:checked").val() == "SI"){  $( "#div61150201,#div61150301" ).show();  } else {  $( "#div61150201,#div61150301" ).hide();   }

	if( $("#encuesta24").find("input[name=61160101]:checked").val() == "SI"){  $( "#div61160201,#div61160301" ).show();  } else {  $( "#div61160201,#div61160301" ).hide();   }

	if( $("#encuesta24").find("input[name=61170101]:checked").val() == "SI"){  $( "#div61170201,#div61170301" ).show();  } else {  $( "#div61170201,#div61170301" ).hide();     }

	if( $("#encuesta24").find("input[name=61210101]:checked").val() == "SI"){  $( "#div61210201,#div61210301" ).show();  } else {   $( "#div61210201,#div61210301" ).hide();   }

	if( $("#encuesta24").find("input[name=61180101]:checked").val() == "SI"){  $( "#div61180201,#div61180301" ).show();  } else {   $( "#div61180201,#div61180301" ).hide();  }

	if( $("#encuesta24").find("input[name=61190101]:checked").val() == "SI"){  $( "#div61190201,#div61190301" ).show();  } else {  $( "#div61190201,#div61190301" ).hide();   }

	if( $("#encuesta24").find("input[name=61200101]:checked").val() == "SI"){  $( "#div61200201,#div61200301" ).show();  } else {  $( "#div61200201,#div61200301" ).hide();   }

	


		if( $("#encuesta28").find("input[name=79010000]:checked").val() == "NO"){
			$("#encuesta28").find( "#div79020000,#div80020000,#div81030000,#div80010000,#div80010100" ).hide();
		} else {
			$("#encuesta28").find( "#div79020000,#div80020000,#div81030000,#div80010000,#div80010100" ).show();
		}


		if( $("#encuesta28").find("input[name=80010000]:checked").val() == "OTRO"){
			$("#encuesta28").find( "#div80010100" ).show();
		} else {
			$("#encuesta28").find( "#div80010100" ).hide();
		}

		if( $("#encuesta28").find("input[name=80010000]:checked").val() == "CERCO VIVO"){
			$("#encuesta28").find( "#div80010100,#div80020000,81030000" ).hide();
		} else {
			$("#encuesta28").find( "#div80010100,#div80020000,#div81030000" ).show();
		}


		if( $("#8701000004").is(":checked") ){
			$( "#div87010100" ).show();
		} else {
			$( "#div87010100").hide();
			$( "#87010100").val("");
		}

		if($("#8901000003").is(":checked") ){
			$( "#div89010100" ).show();
		} else {
			$( "#div89010100").hide();
			$( "#89010100").val("");
		}


	/*if( $('#2401000001').is(":checked") )$(".25010000,#67010000,#68010000").show();
	if( $('#2401000002').is(":checked") )$(".25020000,#67020000,#68020000").show();
	if( $('#2401000003').is(":checked") )$(".25030000,#67030000,#68030000").show();
	if( $('#2401000004').is(":checked") )$(".25040000,#67040000,#68040000").show();
	if( $('#2401000005').is(":checked") )$(".25050000,#67050000,#68050000").show();
	if( $('#2401000006').is(":checked") )$(".25060000,#67060000,#68060000").show();
	if( $('#2401000007').is(":checked") )$("tr.25070000,#67070000,#68070000").show();*/

		if(  ( $('#2401000001').is(":checked") ||   
				$('#2401000002').is(":checked") || 
				$('#2401000003').is(":checked") || 
				$('#2401000004').is(":checked") || 
				$('#2401000005').is(":checked") || 
				$('#2401000006').is(":checked") || 
				$('#2401000007').is(":checked") ) &&
			( ($('#25010200').val() == 2014) || ($('#25010200').val() == 2015) ||
				($('#25020200').val() == 2014) || ($('#25020200').val() == 2015) ||
				($('#25030200').val() == 2014) || ($('#25030200').val() == 2015) ||
				($('#25040200').val() == 2014) || ($('#25040200').val() == 2015) ||
				($('#25050200').val() == 2014) || ($('#25050200').val() == 2015) ||
				($('#25060100').val() == 2014) || ($('#25060100').val() == 2015) ||
				($('#25070200').val() == 2014) || ($('#25070200').val() == 2015)
		  ) ){

			if( $('#2401000001').is(":checked") )$("tr.25010000,#67010000,#68010000").show();
			if( $('#2401000002').is(":checked") )$("tr.25020000,#67020000,#68020000").show();
			if( $('#2401000003').is(":checked") )$("tr.25030000,#67030000,#68030000").show();
			if( $('#2401000004').is(":checked") )$("tr.25040000,#67040000,#68040000").show();
			if( $('#2401000005').is(":checked") )$("tr.25050000,#67050000,#68050000").show();
			if( $('#2401000006').is(":checked") )$("tr.25060000,#67060000,#68060000").show();
			if( $('#2401000007').is(":checked") )$("tr.25070000,#67070000,#68070000").show();
			$("#fotoprefa").show();
		} else {

			$("#67010000,#68010000").show();
			$("#67020000,#68020000").show();
			$("#67030000,#68030000").show();
			$("#67040000,#68040000").show();
			$("#67050000,#68050000").show();
			$("#67060000,#68060000").show();
			$("#67070000,#68070000").show();
			$("#fotoprefa").hide();
		}

	if($("#4401000001").is(":checked") ){ $("#div71010000").show();} else{  $("#div71010000").hide(); }
	if($("#4401000002").is(":checked") ){ $("#div72010000").show();} else{ $("#div72010000").hide();  }
	if($("#4401000003").is(":checked") ){ $("#div73010000").show();} else{ $("#div73010000").hide();  }
	if($("#4401000004").is(":checked") ){ $("#div74010000").show();} else{ $("#div74010000").hide();  }
	if($("#4401000005").is(":checked") ){ $("#div75010000").show();} else{ $("#div75010000").hide();  }
	if($("#4401000006").is(":checked") ){ $("#div76010000").show();} else{ $("#div76010000").hide();  }
	if($("#4401000007").is(":checked") ){ $("#div77010000").show();} else{ 	$("#div77010000").hide();  }
	if($("#4401000010").is(":checked") ){ $("#div78010000").show();} else{ $("#div78010000").hide();  }


		if( $("#encuesta7").find("#1730010006").is(":checked")){
			$("#div17300199").show();
		} else {
			$("#div17300199").hide();
		}

	/*	if( $("input[name=34220250]:checked").val() == "OTRO"){
			$("#div34220251").show();
		} else {
			$("#div34220251").hide();
		}*/

		if( $("input[name=34220250]:checked").val() == "Otro"){
			$("#div37010001").show();
		} else {
			$("#div37010001").hide();
		}

		if($("#5510110001").is(":checked") ){
			$( "#div55100100" ).show();
		} else {
			$( "#div55100100").hide();
			$( "#55100100").val("");
		}
	


		if($("#5510120001").is(":checked") ){
			$( "#div55100200" ).show();
		} else {
			$( "#div55100200").hide();
			$( "#55100200").val("");
		}


		if($("#5510130001").is(":checked") ){
			$( "#div55100300" ).show();
		} else {
			$( "#div55100300").hide();
			$( "#55100300").val("");
		}

		if($("#5510140001").is(":checked") ){
			$( "#div55100400,#div55104400" ).show();
		} else {
			$( "#div55100400,#div55104400").hide();
			$( "#55100400,#55104400").val("");
		}


	
		if( $("#encuesta24").find("input[name=60010000]:checked").val() == "OTRO"){
			$("#div60010001").show();
		} else {
			$("#div60010001").hide();
			$("#60010001").val("");
		}
	


		if($("#encuesta8").find("input[name=18100101]:checked").val() == "NO"){ 	$("#div18100102,#div18100103").hide();$("#encuesta8").find(".fi_i1").hide();	} else { $("#div18100102,#div18100103").show();$("#encuesta8").find(".fi_i1").show();	}

		if($("#encuesta8").find("input[name=18100201]:checked").val() == "NO"){ 	$("#div18100202,#div18100203").hide();$("#encuesta8").find(".fi_i2").hide();	} else { $("#div18100202,#div18100203").show();$("#encuesta8").find(".fi_i2").show();	}

		if($("#encuesta8").find("input[name=18100301]:checked").val() == "NO"){ 	$("#div18100302,#div18100303").hide();$("#encuesta8").find(".fi_i3").hide();	} else { $("#div18100302,#div18100303").show();$("#encuesta8").find(".fi_i3").show();	}

		if($("#encuesta8").find("input[name=18100401]:checked").val() == "NO"){ 	$("#div18100402,#div18100403").hide();$("#encuesta8").find(".fi_i4").hide();	} else { $("#div18100402,#div18100403").show();$("#encuesta8").find(".fi_i4").show();	}

		if($("#encuesta8").find("input[name=18100501]:checked").val() == "NO"){ 	$("#div18100502,#div18100503").hide();$("#encuesta8").find(".fi_i5").hide();	} else { $("#div18100502,#div18100503").show();$("#encuesta8").find(".fi_i5").show();	}

		if($("#encuesta8").find("input[name=18100601]:checked").val() == "NO"){ 	$("#div18100602,#div18100603").hide();$("#encuesta8").find(".fi_i6").hide();	} else { $("#div18100602,#div18100603").show();$("#encuesta8").find(".fi_i6").show();	}

		if($("#encuesta8").find("input[name=18100701]:checked").val() == "NO"){ 	$("#div18100702,#div18100703").hide();$("#encuesta8").find(".fi_i7").hide();	} else { $("#div18100702,#div18100703").show();$("#encuesta8").find(".fi_i7").show();	}

		if($("#encuesta8").find("input[name=18100801]:checked").val() == "NO"){ 	$("#div18100802,#div18100803").hide();$("#encuesta8").find(".fi_i8").hide();	} else { $("#div18100802,#div18100803").show();$("#encuesta8").find(".fi_i8").show();	}

		if($("#encuesta8").find("input[name=18100901]:checked").val() == "NO"){ 	$("#div18100902,#div18100903").hide();$("#encuesta8").find(".fi_i9").hide();	} else { $("#div18100902,#div18100903").show();$("#encuesta8").find(".fi_i9").show();	}

		if($("#encuesta8").find("input[name=18101001]:checked").val() == "NO"){ 	$("#div18101002,#div18101003,#div18109001").hide();$("#encuesta8").find(".fi_i10").hide();	} else { $("#div18101002,#div18101003,#div18109001").show();$("#encuesta8").find(".fi_i10").show();	}

		if($("#encuesta8").find("input[name=18110101]:checked").val() == "NO"){ 	$("#div18110102,#div18110103").hide();$("#encuesta8").find(".fi_p1").hide();	} else { $("#div18110102,#div18110103").show();$("#encuesta8").find(".fi_p1").show();	}
		if($("#encuesta8").find("input[name=18110201]:checked").val() == "NO"){ 	$("#div18110202,#div18110203").hide();$("#encuesta8").find(".fi_p2").hide();	} else { $("#div18110202,#div18110203").show();$("#encuesta8").find(".fi_p2").show();	}

		if($("#encuesta8").find("input[name=18110301]:checked").val() == "NO"){ 	$("#div18110302,#div18110303").hide();$("#encuesta8").find(".fi_p3").hide();	} else { $("#div18110302,#div18110303").show();$("#encuesta8").find(".fi_p3").show();	}

		if($("#encuesta8").find("input[name=18110401]:checked").val() == "NO"){ 	$("#div18110402,#div18110403").hide();$("#encuesta8").find(".fi_p4").hide();	} else { $("#div18110402,#div18110403").show();$("#encuesta8").find(".fi_p4").show();	}

		if($("#encuesta8").find("input[name=18110501]:checked").val() == "NO"){ 	$("#div18110502,#div18110503").hide();$("#encuesta8").find(".fi_p5").hide();	} else { $("#div18110502,#div18110503").show();$("#encuesta8").find(".fi_p5").show();	}

		if($("#encuesta8").find("input[name=18110601]:checked").val() == "NO"){ 	$("#div18110602,#div18110603").hide();$("#encuesta8").find(".fi_p6").hide();	} else { $("#div18110602,#div18110603").show();$("#encuesta8").find(".fi_p6").show();	}

		if($("#encuesta8").find("input[name=18110701]:checked").val() == "NO"){ 	$("#div18110702,#div18110703").hide();$("#encuesta8").find(".fi_p7").hide();	} else { $("#div18110702,#div18110703").show();$("#encuesta8").find(".fi_p7").show();	}
		if($("#encuesta8").find("input[name=18110801]:checked").val() == "NO"){ 	$("#div18110802,#div18110803").hide();$("#encuesta8").find(".fi_p8").hide();	} else { $("#div18110802,#div18110803").show();$("#encuesta8").find(".fi_p8").show();	}
		if($("#encuesta8").find("input[name=18110901]:checked").val() == "NO"){ 	$("#div18110902,#div18110903").hide();$("#encuesta8").find(".fi_p9").hide();	} else { $("#div18110902,#div18110903").show();$("#encuesta8").find(".fi_p9").show();	}
		if($("#encuesta8").find("input[name=18111001]:checked").val() == "NO"){ 	$("#div18111002,#div18111003,#div18119001").hide();$("#encuesta8").find(".fi_p10").hide();	} else { $("#div18111002,#div18111003,#div18119001").show();$("#encuesta8").find(".fi_p10").show();	}

		if($("#encuesta8").find("input[name=18120101]:checked").val() == "NO"){ 	$("#div18120102,#div18120103").hide();$("#encuesta8").find(".fi_s1").hide();	} else { $("#div18120102,#div18120103").show();$("#encuesta8").find(".fi_s1").show();	}

		if($("#encuesta8").find("input[name=18120201]:checked").val() == "NO"){ 	$("#div18120202,#div18120203").hide();$("#encuesta8").find(".fi_s2").hide();	} else { $("#div18120202,#div18120203").show();$("#encuesta8").find(".fi_s2").show();	}

		if($("#encuesta8").find("input[name=18120301]:checked").val() == "NO"){ 	$("#div18120302,#div18120303").hide();$("#encuesta8").find(".fi_s3").hide();	} else { $("#div18120302,#div18120303").show();$("#encuesta8").find(".fi_s3").show();	}

		if($("#encuesta8").find("input[name=18120401]:checked").val() == "NO"){ 	$("#div18120402,#div18120403").hide();$("#encuesta8").find(".fi_s4").hide();	} else { $("#div18120402,#div18120403").show();$("#encuesta8").find(".fi_s4").show();	}

		if($("#encuesta8").find("input[name=18120501]:checked").val() == "NO"){ 	$("#div18120502,#div18120503").hide();$("#encuesta8").find(".fi_s5").hide();	} else { $("#div18120502,#div18120503").show();$("#encuesta8").find(".fi_s5").show();	}

		if($("#encuesta8").find("input[name=18120601]:checked").val() == "NO"){ 	$("#div18120602,#div18120603").hide();$("#encuesta8").find(".fi_s6").hide();	} else { $("#div18120602,#div18120603").show();$("#encuesta8").find(".fi_s6").show();	}

		if($("#encuesta8").find("input[name=18120701]:checked").val() == "NO"){ 	$("#div18120702,#div18120703").hide();$("#encuesta8").find(".fi_s7").hide();	} else { $("#div18120702,#div18120703").show();$("#encuesta8").find(".fi_s7").show();	}

		if($("#encuesta8").find("input[name=18120801]:checked").val() == "NO"){ 	$("#div18120802,#div18120803").hide();$("#encuesta8").find(".fi_s8").hide();	} else { $("#div18120802,#div18120803").show();$("#encuesta8").find(".fi_s8").show();	}

		if($("#encuesta8").find("input[name=18120901]:checked").val() == "NO"){ 	$("#div18120902,#div18120903").hide();$("#encuesta8").find(".fi_s9").hide();	} else { $("#div18120902,#div18120903").show();$("#encuesta8").find(".fi_s9").show();	}

		if($("#encuesta8").find("input[name=18121001]:checked").val() == "NO"){ 	$("#div18121002,#div18121003,#div18129001").hide();$("#encuesta8").find(".fi_s10").hide();	} else { $("#div18121002,#div18121003,#div18129001").show();$("#encuesta8").find(".fi_s10").show(); }

		if($("#18100104").val() == "Otro"){ 	$("#div18100109").show();	} else { $("#div18100109").hide(); }
		if($("#18100204").val() == "Otro"){ 	$("#div18100209").show();	} else { $("#div18100209").hide(); }

		if($("#18100304").val() == "Otro"){ 	$("#div18100309").show();	} else { $("#div18100309").hide(); }

		if($("#18100404").val() == "Otro"){ 	$("#div18100409").show();	} else { $("#div18100409").hide(); }

		if($("#18100504").val() == "Otro"){ 	$("#div18100509").show();	} else { $("#div18100509").hide(); }

		if($("#18100604").val() == "Otro"){ 	$("#div18100609").show();	} else { $("#div18100609").hide(); }

		if($("#18100704").val() == "Otro"){ 	$("#div18100709").show();	} else { $("#div18100709").hide(); }

		if($("#18100804").val() == "Otro"){ 	$("#div18100809").show();	} else { $("#div18100809").hide(); }

		if($("#18100904").val() == "Otro"){ 	$("#div18100909").show();	} else { $("#div18100909").hide(); }

		if($("#18101004").val() == "Otro"){ 	$("#div18101009").show();	} else { $("#div18101009").hide(); }




		if($("#18110104").val() == "Otro"){ 	$("#div18110109").show();	} else { $("#div18110109").hide(); }

		if($("#18110204").val() == "Otro"){ 	$("#div18110209").show();	} else { $("#div18110209").hide(); }

		if($("#18110304").val() == "Otro"){ 	$("#div18110309").show();	} else { $("#div18110309").hide(); }

		if($("#18110404").val() == "Otro"){ 	$("#div18110409").show();	} else { $("#div18110409").hide(); }

		if($("#18110504").val() == "Otro"){ 	$("#div18110509").show();	} else { $("#div18110509").hide(); }

		if($("#18110604").val() == "Otro"){ 	$("#div18110609").show();	} else { $("#div18110609").hide(); }

		if($("#18110704").val() == "Otro"){ 	$("#div18110709").show();	} else { $("#div18110709").hide(); }

		if($("#18110804").val() == "Otro"){ 	$("#div18110809").show();	} else { $("#div18110809").hide(); }

		if($("#18110904").val() == "Otro"){ 	$("#div18110909").show();	} else { $("#div18110909").hide(); }

		if($("#18111004").val() == "Otro"){ 	$("#div18111009").show();	} else { $("#div18111009").hide(); }


		if($("#18120104").val() == "Otro"){ 	$("#div18120109").show();	} else { $("#div18120109").hide(); }

		if($("#18120204").val() == "Otro"){ 	$("#div18120209").show();	} else { $("#div18120209").hide(); }

		if($("#18120304").val() == "Otro"){ 	$("#div18120309").show();	} else { $("#div18120309").hide(); }

		if($("#18120404").val() == "Otro"){ 	$("#div18120409").show();	} else { $("#div18120409").hide(); }

		if($("#18120504").val() == "Otro"){ 	$("#div18120509").show();	} else { $("#div18120509").hide(); }

		if($("#18120604").val() == "Otro"){ 	$("#div18120609").show();	} else { $("#div18120609").hide(); }

		if($("#18120704").val() == "Otro"){ 	$("#div18120709").show();	} else { $("#div18120709").hide(); }

		if($("#18120804").val() == "Otro"){ 	$("#div18120809").show();	} else { $("#div18120809").hide(); }

		if($("#18120904").val() == "Otro"){ 	$("#div18120909").show();	} else { $("#div18120909").hide(); }

		if($("#18121004").val() == "Otro"){ 	$("#div18121009").show();	} else { $("#div18121009").hide(); }

		if($("#encuesta9").find("input[name=19100000]:checked").val() == "Otro"){ 	$("#div19110000").show();} else { $("#div19110000").hide(); }

		if($("#encuesta10").find("input[name=21130100]:checked").val() == "SI"){ 	$("#div21130200").show();} else { $("#div21130200").hide(); }

		if($("#encuesta10").find("input[name=21140100]:checked").val() == "SI"){ 	$("#div21140200,#div21200100").show();} else { $("#div21140200,#div21200100").hide(); }

		if($("#encuesta5").find("input[name=02010000]:checked").val() == "Otro"){ 	$("#div02010100").show();} else { $("#div02010100").hide(); }

		if($("#encuesta5").find("input[name=07010200]:checked").val() == "Otro"){ 	$("#div07010100").show();} else { $("#div07010100").hide(); }

		if($("#encuesta7").find("input[name=15100000]:checked").val() == "SI"){ 	$("#div15111100").show();} else { $("#div15111100").hide(); }

		if( $("#encuesta7").find("#1730010001").is(":checked") ){  $("#encuesta7").find(".f29b1").show();	} else { $("#encuesta7").find(".f29b1").hide();}

		if( $("#encuesta7").find("#1730010002").is(":checked") ){  $("#encuesta7").find(".f29b2").show();	} else { $("#encuesta7").find(".f29b2").hide();}

		if( $("#encuesta7").find("#1730010003").is(":checked") ){  $("#encuesta7").find(".f29b3").show();	} else { $("#encuesta7").find(".f29b3").hide();}

		if( $("#encuesta7").find("#1730010004").is(":checked") ){  $("#encuesta7").find(".f29b4").show();	} else { $("#encuesta7").find(".f29b4").hide();}

		if( $("#encuesta7").find("#1730010005").is(":checked") ){  $("#encuesta7").find(".f29b5").show();	} else { $("#encuesta7").find(".f29b5").hide();}

		if( $("#encuesta7").find("#1730010006").is(":checked") ){  $("#encuesta7").find(".f29b6").show();	} else { $("#encuesta7").find(".f29b6").hide();}

		if( $("#encuesta14").find("input[name=34010230]:checked").val() == "NO" ){ 
			 $("#div34010250,#div34010270,#div34010280,#div70110100,#div70110200").hide();	
		} else { 
			 $("#div34010250,#div34010270,#div34010280,#div70110100,#div70110200").show(); 
		}



		if( $("#encuesta5").find("input[name=07010200]:checked").val() == "Ratificado por evaluación excepcional 2014" ){  $("#div_ratificado").show();	} else {  $("#div_ratificado").hide();  }
		if( $("#encuesta5").find("input[name=07010200]:checked").val() == "Asignado por evaluación de acceso 2014" ){      $("#div_ratificado").show();	} else {  $("#div_ratificado").hide();  }



		if( $("#encuesta9").find("input[name=20010001]:checked").val() == "SI" ){  $("#div66020100").show();	} else {  $("#div66020100").hide();  }

		if( $("#encuesta9").find("input[name=20010002]:checked").val() == "SI" ){  $("#div66020200").show();	} else {  $("#div66020200").hide();  }

		if( $("#encuesta9").find("input[name=20010003]:checked").val() == "SI" ){  $("#div66020300").show();	} else {  $("#div66020300").hide();  }

		if( $("#encuesta4").find("input[name=00003101]:checked").val() == "SI" ){  $("#div00003100").show();	} else {  $("#div00003100").hide();  }

		if( $("#encuesta13").find("input[name=34020100]:checked").val() == "SI" ){  $("#div34020200").show();	} else {  $("#div34020200").hide();  }

		if( $("#encuesta15").find("input[name=34010310]:checked").val() == "SI" ){  $("#soportepeda").show();	} else {  $("#soportepeda").hide();  }

		if( $("#encuesta16").find("input[name=34220150]:checked").val() == "SI" ){  $("#div34220250,#div34220350").show();	} else {  $("#div34220250,#div34220350").hide();  }

		if( $("#encuesta21").find("input[name=53010000]:checked").val() == "SI" ){  $("#internet").show();	} else {  $("#internet").hide();  }

		if( $("#encuesta24").find("input[name=60010220]:checked").val() == "SI" ){  $("#materiale").show();	} else {  $("#materiale").hide();  }

		if( $("#encuesta28").find("input[name=79100000]:checked").val() == "SI" ){  $("#div79110000").show();	} else {  $("#div79110000").hide();  }


		if( $("#encuesta6").find("input[name=10040001]:checked").val() == "NO" ){  $("#div10050011").hide();	 } else {  $("#div10050011").show();  }

		if( $("#encuesta6").find("input[name=10040002]:checked").val() == "NO" ){  $("#div10050012").hide();	 } else {  $("#div10050012").show();  }

		if( $("#encuesta6").find("input[name=10040003]:checked").val() == "NO" ){  $("#div10050013").hide();	 } else {  $("#div10050013").show();  }

		if( $("#encuesta6").find("input[name=34010110]:checked").val() == "NO" ){  $("#div34010130,#div34010170").hide();	 } else {  $("#div34010130,#div34010170").show();  }

		if( $("#encuesta6").find("input[name=34010120]:checked").val() == "NO" ){  $("#div34010150,#div34010180").hide();	 } else {  $("#div34010150,#div34010180").show();  }

	
		if( ($("#encuesta13").find("input[name=34010130]:checked").val() == "NO") || ($("#encuesta13").find("input[name=34010150]:checked").val() == "NO") ){  $("#div34010160").show();	 } else { $("#div34010160").hide(); }
		if( ($("#encuesta13").find("input[name=34010170]:checked").val() == "NO") || ($("#encuesta13").find("input[name=34010180]:checked").val() == "NO") ){  $("#div34010220").show();	 } else { $("#div34010220").hide(); }



		if( $("#encuesta5").find("input[name=07020200]:checked").val() == "SI" ){  $("#div07020300").show(); } else { $("#div07020300").hide(); }


		if( $("#encuesta5").find("input[name=07020100]:checked").val() == "SI" ){  $("#div07020200,#div07020300").hide(); } else { $("#div07020200,#div07020300").show(); }

		if( $("#encuesta24").find("input[name=60010220]:checked").val() == "NO" ){  $("#div60010000,#div61000000").hide(); } else { $("#div60010000,#div61000000").show(); }

		if( $("#encuesta18").find("input[name=39010000]:checked").val() == "Otro" ){  $("#39011100").show(); } else { $("#39011100").hide(); }

		if( $("#encuesta29").find("input[name=85010000]:checked").val() == "SI" ){  $("#div86000000").find(".finodoro").show(); } else { $("#div86000000").find(".finodoro").hide(); }

		if( $("#encuesta29").find("input[name=85020000]:checked").val() == "SI" ){  $("#div86000000").find(".fturco").show(); } else { $("#div86000000").find(".fturco").hide(); }

		if( $("#encuesta29").find("input[name=85030000]:checked").val() == "SI" ){  $("#div86000000").find(".fhueco").show(); } else { $("#div86000000").find(".fhueco").hide(); }

		if( $("#encuesta27").find("input[name=70110100]:checked").val() == "SI" ){  $("#div70110200").show(); } else { $("#div70110200").hide(); }
	

		if( $("#encuesta6").find("input[name=12020100]:checked").val() == "SI" ){  $("#div12020200").show(); } else { $("#div12020200").hide(); }

		if( $("#encuesta6").find("input[name=12020101]:checked").val() == "SI" ){  $("#div12020201").show(); } else { $("#div12020201").hide(); }

		if( $("#encuesta6").find("input[name=12020102]:checked").val() == "SI" ){  $("#div12020202").show(); } else { $("#div12020202").hide(); }

		if( $("#encuesta6").find("input[name=12020103]:checked").val() == "SI" ){  $("#div12020203").show(); } else { $("#div12020203").hide(); }

		if( $("#09040001").val() == "Ratificado por evaluación excepcional 2014" ){  $("#div_ratificado").show();$("#div12020101").show(); } else { $("#div12020101").hide(); }

		if( $("#09040002").val() == "Ratificado por evaluación excepcional 2014" ){  $("#div_ratificado").show();$("#div12020102").show(); } else { $("#div12020102").hide(); }

		if( $("#09040003").val() == "Ratificado por evaluación excepcional 2014" ){  $("#div_ratificado").show();$("#div12020103").show(); } else { $("#div12020103").hide(); }
	


}

