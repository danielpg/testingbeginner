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
					obj = this.parent().find('[name=\''+ parts[0] +'\']');
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
								if(form_refresh)coso.checkboxradio( "refresh" );
							} else {
								if (!$.inArray(coso.val(),parts[1])){
									coso.prop("checked",false);
									if(form_refresh)coso.checkboxradio( "refresh" );
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
						if(form_refresh)coso.checkboxradio( "refresh" );
					}
				 });
			} else if (obj.length > 0 && obj[0].tagName == "SELECT" && parts[1] instanceof Array && obj.prop("multiple")){
				//Here, i have an array for a multi-select.
				obj.val(parts[1]);
				if(form_refresh)obj.selectmenu( "refresh" );			
			} else {
				//When the value is an array, we join without delimiter
				var val = (parts[1] instanceof Array) ? parts[1].join("") : parts[1];
				//when the value is an object, we set the value to ""
				val = ((typeof val == "object") || (typeof val == "undefined")) ? "" : val;
				
				obj.val(decodeURIComponent(val.replace(/\+/g," ")));
				force_select_option( obj.attr("id") , val );	

				if(parts[1] == "overnight"){
					if(form_refresh)obj.selectmenu( "refresh" );			
				}
				//alert(parts[1]);

			}

		};
		return this;
}

function rebuild_arbol(){

		if( $("input[name=01010000]:checked").val() == "SI"){
			$( "#div02010000,#div03010000" ).hide();
			$( "#div11000000,#div11010000,#div11020000,#div11030000" ).show();
		} else {
			$( "#div02010000,#div03010000" ).show();
			$( "#div11000000,#div11010000,#div11020000,#div11030000" ).hide();
		}

		if( $("input[name=04010000]:checked").val() == "NIVEL EDUCATIVO"){
			$( "#div05010000" ).hide();
			$( "#div06010000" ).hide();
			$( "#div07010000" ).hide();
			$( "#div08010000" ).hide();

			$( "#div11000000" ).hide();//11
			$( "#div11020000" ).hide();//1.b

			$( "#div09000000" ).show();
			$( "#div10000000" ).show();
			$( "#div11010000" ).show();
			$( "#div11030000" ).show();

			$( "#div62000000" ).hide();			
			$( "#div63000000" ).show();			
		} else {
			$( "#div05010000" ).show();
			$( "#div06010000" ).show();
			$( "#div07010000" ).show();
			$( "#div08010000" ).show();

			$( "#div11000000" ).show();//11
			$( "#div11020000" ).show();//1.

			$( "#div09000000" ).hide();
			$( "#div10000000" ).hide();
			$( "#div11010000" ).hide();
			$( "#div11030000" ).hide();

			$( "#div62000000" ).show();			
			$( "#div63000000" ).hide();			
		}

		if( $("input[name=08010000]:checked" ).val() == "SI"){
			$( "#div62000000" ).show();
			$( "#div63000000" ).hide();
		} else {
			$( "#div62000000").hide();
			$( "#div63000000" ).show();
		}

		if( $("input[name=10010000]:checked" ).val() == "SI"){
			$( ".edi" ).show();
		} else {
			$( ".edi" ).hide();
		}

		if( $("input[name=10020000]:checked" ).val() == "SI"){
			$( ".edp" ).show();
		} else {
			$( ".edp" ).hide();
		}

		if( $("input[name=10030000]:checked" ).val() == "SI"){
			$( ".eds" ).show();
		} else {
			$( ".eds" ).hide();
		}

		if( $("input[name=12010000]:checked" ).val() == "OTRO"){
			$( "#div12010100" ).show();
		} else {
			$( "#div12010100").hide();
			$( "#12010100").val("");
		}

		if( $("input[name=13010001]:checked").val() == "IE-EIB"){
			$(".noeib .efi").hide();
			$(".eib .efi").show();
		} else {
			$(".noeib .efi").show();
			$(".eib .efi").hide();
		}

		if( $("input[name=13010002]:checked").val() == "IE-EIB"){
			$(".noeib .efp").hide();
			$(".eib .efp").show();
		} else {
			$(".noeib .efp").show();
			$(".eib .efp").hide();
		}
	
		if( $("input[name=15010000]:checked").val() == "NO"){
			$(".rai").hide();
		} else {
			$(".rai").show();
		}

		if( $("input[name=15020000]:checked").val() == "NO"){
			$(".rap").hide();
		} else {
			$(".rap").show();
		}

		if( $("input[name=15030000]:checked").val() == "NO"){
			$(".ras").hide();
		} else {
			$(".ras").show();
		}

		if( $("input[name=16010001]:checked").val() == "SI"){ $("#div64010001").show();	} else {$("#div64010001").hide();}

		if( $("input[name=16020001]:checked").val() == "SI"){ $("#div64020001").show();	} else {$("#div64020001").hide();}

		if( $("input[name=16030001]:checked").val() == "SI"){ $("#div64030001").show();	} else {$("#div64030001").hide();}

		if( $("input[name=16010002]:checked").val() == "SI"){ $("#div64010002").show();	} else {$("#div64010002").hide();}

		if( $("input[name=16020002]:checked").val() == "SI"){ $("#div64020002").show();	} else {$("#div64020002").hide();}

		if( $("input[name=16030002]:checked").val() == "SI"){ $("#div64030002").show();	} else {$("#div64030002").hide();}

		if( $("input[name=16010003]:checked").val() == "SI"){ $("#div64010003").show();	} else {$("#div64010003").hide();}

		if( $("input[name=16020003]:checked").val() == "SI"){ $("#div64020003").show();	} else {$("#div64020003").hide();}

		if( $("input[name=16030003]:checked").val() == "SI"){ $("#div64030003").show();	} else {$("#div64030003").hide();}

		if( ($("input[name=19010002]:checked").val() == "SI") ){ $("#div65010002").show();	} else { $("#div65010002").hide(); }

		if( ($("input[name=19010003]:checked").val() == "SI") ){ $("#div65010003").show();	} else { $("#div65010003").hide(); }

		if( ($("input[name=19020001]:checked").val() == "SI") ){ $("#div65020001").show();	} else { $("#div65020001").hide(); }

		if( ($("input[name=19020002]:checked").val() == "SI") ){ $("#div65020002").show();	} else { $("#div65020002").hide(); }

		if( ($("input[name=19020003]:checked").val() == "SI") ){ $("#div65020003").show();	} else { $("#div65020003").hide(); }

		if( ($("input[name=19030002]:checked").val() == "SI") ){ $("#div65030002").show();	} else { $("#div65030002").hide(); }

		if( $("input[name=22010000]:checked").val() == "NO"){
			$( "#div23010000,#div24010000,#div25000000" ).hide();
		} else {
			$( "#div23010000,#div24010000,#div25000000" ).show();
		}

		if( $("#2401000001").is(":checked") ){ $(".25010000,#div67010000,#div68010000").show();	} else {$(".25010000,#div67010000,#div68010000").hide();}

		if( $("#2401000002").is(":checked") ){ $(".25020000,#div67020000,#div68020000").show();	} else {$(".25020000,#div67020000,#div68020000").hide();}

		if( $("#2401000003").is(":checked") ){ $(".25030000,#div67030000,#div68030000").show();	} else {$(".25030000,#div67030000,#div68030000").hide();}

		if( $("#2401000004").is(":checked") ){ $(".25040000,#div67040000,#div68040000").show();	} else {$(".25040000,#div67040000,#div68040000").hide();}

		if( $("#2401000005").is(":checked") ){ $(".25050000,#div67050000,#div68050000").show();	} else {$(".25050000,#div67050000,#div68050000").hide();}

		if( $("#2401000006").is(":checked") ){ $(".25060000,#div67060000,#div68060000").show();	} else {$(".25060000,#div67060000,#div68060000").hide();}

		if( $("#2401000007").is(":checked") ){ $(".25070000,#div67070000,#div68070000").show();	} else {$(".25070000,#div67070000,#div68070000").hide();}


		if( $("input[name=26010000]:checked").val() == "NO"){
			$( "#div27010000,#div28010000,#div29010000,#div30010000,#div31010000,#div32010000" ).hide();
		} else {
			$( "#div27010000,#div28010000,#div29010000,#div30010000,#div31010000,#div32010000" ).show();
		}

		if( ($("input[name=27010000]:checked").val() == "NO") || ($("input[name=27010000]:checked").val() == "NO SABE") ){
			$( "#div28010000,#div29010000,#div30010000,#div31010000,#div32010000" ).hide();
		} else {
			$( "#div28010000,#div29010000,#div30010000,#div31010000,#div32010000" ).show();
		}

		if( ($("input[name=29010000]:checked").val() == "NO") || ($("input[name=29010000]:checked").val() == "NO SABE") ){
			$( "#div30010000,#div31010000" ).hide();
		} else {
			$( "#div30010000,#div31010000" ).show();
		}

		tmpcon = "Opciones marcadas: ";
		if( $("#3101000001").is(":checked") ){ tmpcon += $("#3101000001").val()+","; }
		if( $("#3101000002").is(":checked") ){ tmpcon += $("#3101000002").val()+","; }
		if( $("#3101000003").is(":checked") ){ tmpcon += $("#3101000003").val()+","; }
		if( $("#3101000004").is(":checked") ){ tmpcon += $("#3101000004").val()+","; }
		//console.log(tmpcon);
		$("#obs69").html(tmpcon);

		if( ($("input[name=34010000]:checked").val() == "NO") ){
			$( "#div35000000,#div36010000,#div37010000,#div38000000" ).hide();
		} else {
			$( "#div35000000,#div36010000,#div37010000,#div38000000" ).show();
		}

		if( ($("input[name=35010105]:checked").val() == "SI") ){
			$("#div70000000").show();
		} else {
			$("#div70000000").hide();
		}

		if( ($("input[name=47010100]:checked").val() == "NO")  ){	$(".finodoro,#div47010200").hide();	} else {$(".finodoro,#div47010200").show();	}
		if( ($("input[name=47020100]:checked").val() == "NO")  ){	$(".fturco,#div47020200").hide();	} else {$(".fturco,#div47020200").show();	}
		if( ($("input[name=47030100]:checked").val() == "NO")  ){	$(".fhueco,#div47030200").hide();	} else {$(".fhueco,#div47030200").show();	}

		if( ($("input[name=48010000]:checked").val() == "NO") ){
			$( "#div49010000,#div50010000,#div86000000" ).hide();
		} else {
			$( "#div49010000,#div50010000,#div86000000" ).show();
		}


	if( $('#35010105').val() == "SI")$("#div70000000").show();

	if( $('#4401000001').is(":checked") )$("#div71010000").show();
	if( $('#4401000002').is(":checked") )$("#div72010000").show();
	if( $('#4401000003').is(":checked") )$("#div73010000").show();
	if( $('#4401000004').is(":checked") )$("#div74010000").show();
	if( $('#4401000005').is(":checked") )$("#div75010000").show();
	if( $('#4401000006').is(":checked") )$("#div76010000").show();
	if( $('#4401000007').is(":checked") )$("#div77010000").show();
	if( $('#4401000008').is(":checked") )$("#div78010000").show();

	if( $('#2401000001').is(":checked") )$(".25010000,#67010000,#68010000").show();
	if( $('#2401000002').is(":checked") )$(".25020000,#67020000,#68020000").show();
	if( $('#2401000003').is(":checked") )$(".25030000,#67030000,#68030000").show();
	if( $('#2401000004').is(":checked") )$(".25040000,#67040000,#68040000").show();
	if( $('#2401000005').is(":checked") )$(".25050000,#67050000,#68050000").show();
	if( $('#2401000006').is(":checked") )$(".25060000,#67060000,#68060000").show();

	
	if($("#4401000001").is(":checked") ){ $("#div71010000").show();} else{  $("#div71010000").hide(); }
	if($("#4401000002").is(":checked") ){ $("#div72010000").show();} else{ $("#div72010000").hide();  }
	if($("#4401000003").is(":checked") ){ $("#div73010000").show();} else{ $("#div73010000").hide();  }
	if($("#4401000004").is(":checked") ){ $("#div74010000").show();} else{ $("#div74010000").hide();  }
	if($("#4401000005").is(":checked") ){ $("#div75010000").show();} else{ $("#div75010000").hide();  }
	if($("#4401000006").is(":checked") ){ $("#div76010000").show();} else{ $("#div76010000").hide();  }
	if($("#4401000007").is(":checked") ){ $("#div77010000").show();} else{ 	$("#div77010000").hide();  }
	if($("#4401000010").is(":checked") ){ $("#div78010000").show();} else{ $("#div78010000").hide();  }

}

