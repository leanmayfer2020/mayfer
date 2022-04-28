
$(document).ready(function() {
    $("#price").change(function() {
    	console.log("CHANGE");
        var base_price = parseFloat($("#price").val());
        var web_price = Math.ceil((base_price  * percentageMercadoPago / 100) + base_price);
        $("#web_price").val(web_price);
    });

    $('#categoryForm').on('submit', function() {
    	if($('#category_name').val() == ""){
			alert("El nombre de la categoría no puede estar vacío!");
			return false;
		}
    });

    $('#deliveryForm').on('submit', function() {
    	if($('#delivery_city').val() == "" || $('#delivery_cost').val() == ""){
			alert("La localidad y el costo no pueden estar vacío!");
			return false;
		}
    });

    $('#productForm').on('submit', function() {
    	var msj = "";
    	var errors = 0;
    	
    	if($('#category_id').val() == "" || $('#category_id').val() == 0 || $('#category_id').val() == "0"){
			msj += "\n- Debes seleccionar una categoría para tu producto.";
			errors++;
		}

    	if($('#description').val() == ""){
			msj += "\n- El nombre del producto no puede ser vacío.";
			errors++;
		}

		if($('#summary').val() == ""){
			msj += "\n- La descripción del producto no puede ser vacía.";
			errors++;
		}

		if($('#model').val() == ""){
			msj += "\n- El modelo del producto no puede ser vacía.";
			errors++;
		}

		if($('#measures').val() == ""){
			msj += "\n- Las medidas del producto no puede estar vacía.";
			errors++;
		}else{
			var cadena = $('#measures').val();
			var indices = [];
			for(var i = 0; i < cadena.length; i++) {
				if (cadena[i].toLowerCase() === "x") indices.push(i);
			}
			if(indices.length != 3){
				msj += "\n- Formato incorrecto en las medidas del producto. (" + indices.length + ")";
				errors++;	
			}
		}

		// if($('#price').val() == "" || $('#price').val() == 0){
		// 	msj += "\n- El precio del producto no puede ser vacío o nulo.";
		// 	errors++;
		// }

		// if($('#web_price').val() == "" || $('#web_price').val() == 0){
		// 	msj += "\n- El precio Web del producto no puede ser vacío o nulo.";
		// 	errors++;
		// }

		if($('#brand').val() == ""){
			msj += "\n- La marca del producto no puede ser vacía.";
			errors++;
		}
		
	    	if($("#imagesHandler").prop( "checked" )){
			if($('#attachment1').val() == "" && $('#attachment2').val() == "" && $('#attachment3').val() == ""){
				msj += "\n- Debes cargar al menos una imágen del producto.";
				errors++;
			}
		}

		if(errors>0){
			alert(msj);
			return false;
		}

    });

    $('#bannerForm').on('submit', function() {
    	var msj = "";
    	var errors = 0;

    	if($('#banner').val() == "" || $('#banner').val() == ""){
			msj += "\n- El banner para desktop no pueden estar vacío.";
			errors++;
		}

		if($('#mobile').val() == "" || $('#mobile').val() == ""){
			msj += "\n- El banner para mobile no pueden estar vacío.";
			errors++;
		}
		if(errors>0){
			alert(msj);
			return false;
		}
    });

    $('#attachment1').on('change', function() {
    	$("#imagesHandler").prop("checked", true)
    });
    $('#attachment2').on('change', function() {
    	$("#imagesHandler").prop("checked", true)
    });
    $('#attachment3').on('change', function() {
    	$("#imagesHandler").prop("checked", true)
    });
	
});
