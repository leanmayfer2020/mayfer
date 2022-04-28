(function ($) {
    "use strict";

    /*[ Load page ]
    ===========================================================*/
    $(".animsition").animsition({
        inClass: 'fade-in',
        outClass: 'fade-out',
        inDuration: 0,
        outDuration: 0,
        linkElement: '.animsition-link',
        loading: false,
        loadingParentElement: 'html',
        loadingClass: 'animsition-loading-1',
        loadingInner: '<div data-loader="ball-scale"></div>',
        timeout: false,
        timeoutCountdown: 5000,
        onLoadEvent: true,
        browser: [ 'animation-duration', '-webkit-animation-duration'],
        overlay : false,
        overlayClass : 'animsition-overlay-slide',
        overlayParentElement : 'html',
        transition: function(url){ window.location.href = url; }
    });
    
    /*[ Back to top ]
    ===========================================================*/
    var windowH = $(window).height()/2;

    $(window).on('scroll',function(){
        if ($(this).scrollTop() > windowH) {
            $("#myBtn").css('display','flex');
        } else {
            $("#myBtn").css('display','none');
        }
    });

    $('#myBtn').on("click", function(){
        $('html, body').animate({scrollTop: 0}, 300);
    });


    /*[ Show header dropdown ]
    ===========================================================*/
    $('.js-show-header-dropdown').on('click', function(){
        $(this).parent().find('.header-dropdown')
    });

    var menu = $('.js-show-header-dropdown');
    var sub_menu_is_showed = -1;

    for(var i=0; i<menu.length; i++){
        $(menu[i]).on('click', function(){ 
            
                if(jQuery.inArray( this, menu ) == sub_menu_is_showed){
                    $(this).parent().find('.header-dropdown').toggleClass('show-header-dropdown');
                    sub_menu_is_showed = -1;
                }
                else {
                    for (var i = 0; i < menu.length; i++) {
                        $(menu[i]).parent().find('.header-dropdown').removeClass("show-header-dropdown");
                    }

                    $(this).parent().find('.header-dropdown').toggleClass('show-header-dropdown');
                    sub_menu_is_showed = jQuery.inArray( this, menu );
                }
        });
    }

    $(".js-show-header-dropdown, .header-dropdown").click(function(event){
        event.stopPropagation();
    });

    $(window).on("click", function(){
        for (var i = 0; i < menu.length; i++) {
            $(menu[i]).parent().find('.header-dropdown').removeClass("show-header-dropdown");
        }
        sub_menu_is_showed = -1;
    });


     /*[ Fixed Header ]
    ===========================================================*/
    var posWrapHeader = $('.topbar').height();
    var header = $('.container-menu-header');

    $(window).on('scroll',function(){

        if($(this).scrollTop() >= posWrapHeader) {
            $('.header1').addClass('fixed-header');
            $(header).css('top',-posWrapHeader); 

        }  
        else {
            var x = - $(this).scrollTop(); 
            $(header).css('top',x); 
            $('.header1').removeClass('fixed-header');
        } 

        if($(this).scrollTop() >= 200 && $(window).width() > 992) {
            $('.fixed-header2').addClass('show-fixed-header2');
            $('.header2').css('visibility','hidden'); 
            $('.header2').find('.header-dropdown').removeClass("show-header-dropdown");
            
        }  
        else {
            $('.fixed-header2').removeClass('show-fixed-header2');
            $('.header2').css('visibility','visible'); 
            $('.fixed-header2').find('.header-dropdown').removeClass("show-header-dropdown");
        } 

    });
    
    /*[ Show menu mobile ]
    ===========================================================*/
    $('.btn-show-menu-mobile').on('click', function(){
        $(this).toggleClass('is-active');
        $('.wrap-side-menu').slideToggle();
    });

    var arrowMainMenu = $('.arrow-main-menu');

    for(var i=0; i<arrowMainMenu.length; i++){
        $(arrowMainMenu[i]).on('click', function(){
            $(this).parent().find('.sub-menu').slideToggle();
            $(this).toggleClass('turn-arrow');
        })
    }

    $(window).resize(function(){
        if($(window).width() >= 992){
            if($('.wrap-side-menu').css('display') == 'block'){
                $('.wrap-side-menu').css('display','none');
                $('.btn-show-menu-mobile').toggleClass('is-active');
            }
            if($('.sub-menu').css('display') == 'block'){
                $('.sub-menu').css('display','none');
                $('.arrow-main-menu').removeClass('turn-arrow');
            }
        }
    });


    /*[ remove top noti ]
    ===========================================================*/
    $('.btn-romove-top-noti').on('click', function(){
        $(this).parent().remove();
    })


    /*[ Block2 button wishlist ]
    ===========================================================*/
    $('.block2-btn-addwishlist').on('click', function(e){
        e.preventDefault();
        $(this).addClass('block2-btn-towishlist');
        $(this).removeClass('block2-btn-addwishlist');
        $(this).off('click');
    });

    /*[ +/- num product ]
    ===========================================================*/
    $('.btn-num-product-down').on('click', function(e){
        e.preventDefault();
        var cartId = $("#cart").data("cartid");
        var product = $(this).data("salableid");
        var productQuantity = "#num-product-" + product;
        var quantity = $(productQuantity).val();
        var action = $(this).data("action");
        handlerQuantity(cartId, product, productQuantity, quantity, action);
        var numProduct = parseInt(quantity)-1;
        if(numProduct > 0) $(this).next().val(quantity--);
        $(productQuantity).val(quantity--);
        
    });

    $('.btn-num-product-up').on('click', function(e){
        e.preventDefault();
        var cartId = $("#cart").data("cartid");
        var product = $(this).data("salableid");
        var productQuantity = "#num-product-" + product;
        var quantity = $(productQuantity).val();
        var action = $(this).data("action");
        handlerQuantity(cartId, product, productQuantity, quantity, action);
        var numProduct = parseInt(quantity)+1;
        if(numProduct > 0) $(this).next().val(quantity++);
        $(productQuantity).val(quantity++);
    });

    function handlerQuantity(cartId, product, productQuantity, quantity, action){
        if(action=="menor"){ quantity--; }else{ quantity++; }
        if(quantity>=1){
            var data = {"salable_id" : product,"quantity" : quantity}
            $.ajax({
                type: "POST",
                url: api_path + "cart/" + cartId,
                dataType: "json",
                data: data,
                success: function (msg) {
                    updateTotals(cartId);
                }
            });
        }
    }

    function updateTotals(cartId){
        var name = "";
        var total = "";
        $.ajax({
           type: "GET",
           url: api_path + "cart/"+cartId,
           dataType: "json",
           success: function (cart) {
               $("#total_cart").html(cart.total_price);
               for(var i=0; i<cart.products.length; i++){
                   name = "#subtotal-" + cart.products[i].salable_id;
                   total = "$" + (cart.products[i].price * cart.products[i].quantity);
                   $(name).html(total);
               }
           }
       });
    }

    $("#billingFormSubmit").on("click", function(){
        console.log("Validate Billing Form"); 
        var check = false;
        var counter = 0;

        if($("#first_name").val() == ""){ counter++; }
        if($("#last_name").val() == ""){ counter++; }
        if($("#email").val() == ""){ counter++; }
        if($("#phone").val() == ""){ counter++; }
        if($("#document_type").val() == "0"){ counter++; }
        if($("#document_number").val() == ""){ counter++; }
        if($("#gender").val() == "0"){ counter++; }
        if($("#city").val() == "0"){ counter++; }
        if($("#street_name").val() == ""){ counter++; }
        if($("#street_number").val() == ""){ counter++; }
        if($("#zip_code").val() == ""){ counter++; }
        if($("#delivery_type").val() == ""){ counter++; }

        console.log("Validate Billing Form Response ", counter); 

        if(counter==0){ 
            console.log("NO HAY errores");
            document.billingForm.submit();
        }else{
            console.log("Hay errores");
            $("#errorFormBilling").css("display", "block");
        }
    })


    /*[ Show content Product detail ]
    ===========================================================*/
    $('.active-dropdown-content .js-toggle-dropdown-content').toggleClass('show-dropdown-content');
    $('.active-dropdown-content .dropdown-content').slideToggle('fast');

    $('.js-toggle-dropdown-content').on('click', function(){
        $(this).toggleClass('show-dropdown-content');
        $(this).parent().find('.dropdown-content').slideToggle('fast');
    });


    /*[ Play video 01]
    ===========================================================*/
    var srcOld = $('.video-mo-01').children('iframe').attr('src');

    $('[data-target="#modal-video-01"]').on('click',function(){
        $('.video-mo-01').children('iframe')[0].src += "&autoplay=1";

        setTimeout(function(){
            $('.video-mo-01').css('opacity','1');
        },300);      
    });

    $('[data-dismiss="modal"]').on('click',function(){
        // $('.video-mo-01').children('iframe')[0].src = srcOld;
        // $('.video-mo-01').css('opacity','0');
    });


    $("#sorting").on("change", function(){
        location.href = window.location.href.split("?")[0] + "?sort_by=" + $("#sorting").val();
    })

    const expression = "/\S+@\S+/";

    $('#sendEmail').on("click", function(){
        console.log("Send Email");
        var email = $("#email-subscription").val();
        var recaptcha = $("#recaptcha_validate_owner").val();
        var data = {"email" : email, "owner": recaptcha}

        var emailFilter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;

        if (!emailFilter.test(data.email)) {
            $("#email-success").css("display", "none");
            $("#email-error").css("display", "none");
            $("#email-errorformat").css("display", "block");
            return false;
        }else{
            $.ajax({
                type: "POST",
                url: api_path + "email/",
                dataType: "json",
                data: data,
                success: function (msg) {
                    if(typeof msg._id !== "undefined"){
                        $("#email-success").css("display", "block");
                        $("#email-error").css("display", "none");
                        $("#email-errorformat").css("display", "none");
                    }else{
                        $("#email-error").css("display", "block");
                        $("#email-success").css("display", "none");
                        $("#email-errorformat").css("display", "none");
                    }
                    return msg;
                },
                error: function (msg) {
                    $("#email-error").css("display", "block");
                    $("#email-success").css("display", "none");
                    $("#email-errorformat").css("display", "none");
                    return msg;
                }
            });
        }
    });


    $('#sendNewMessage').on("click", function(){
        console.log("Send Message");
        
        var full_name = $("#full_name").val();
        var phone = $("#phone").val();
        var email = $("#email").val();
        var message = $("#message").val();
        var recaptcha = $("#recaptcha_validate_owner").val();
        
        var emailFilter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;

        if(full_name == "" || phone == "" || email == "" || message == ""){
            $("#message-errorformat").css("display", "none");
            $("#message-error").css("display", "block");
        }else if(!emailFilter.test(email)){
            $("#message-error").css("display", "none");
            $("#message-errorformat").css("display", "block");
        }else{
            console.log("Send Message SUBMIT");
            $("#messageForm").submit();
        }
    });

    $(".iconInputSearch").on("click", function(){
        $("#formSearch").submit();
    });
    $(".iconInputSearchMobile").on("click", function(){
        $("#formSearchMobile").submit();
    });
    

})(jQuery);