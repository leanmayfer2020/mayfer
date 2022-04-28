$(document).ready(function() {
	$(".exampleModal").on("click", function(){
		var Id = $(this).data('id');
		var leyend = $(this).data('leyend');
		var url = base_url+"/mercadopago/"+Id;
		$.ajax({
			type: "GET",
			url: url,
			success: function(data){
				$("#meli_Legales").html(data.info);
				$("#meli_imagen").attr("src",data.picture)
				$("#meli_imagen").attr("src",data.picture);
				$("#meli_financiacion").html(leyend);
				$("#meli_costo").html($(".cft").html());
				// $("#meli_costo_leyenda").html("COSTO FINANCIERO TOTAL (C.F.T.)");
			},
			error: function(data) {
				console.log(data);
			}
		});

        $("#meli_Legales").html("");
        $("#meli_imagen").attr("src","");
        $("#meli_financiacion").html("");
        $("#meli_costo").html("");

		event.preventDefault();
	});
});

