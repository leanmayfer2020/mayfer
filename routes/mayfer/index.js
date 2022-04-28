"use strict"

const express  = require('express');
const router   = express.Router();
const uaparser = require('ua-parser-js');
const main     = require('../../controllers/MainController');
const api      = require('../../controllers/ApiController');
const admin    = require('../../controllers/AdminController');
const pedidos    = require('../../controllers/PedidosController');
const push    = require('../../controllers/PushController');
const srv      = require('../../services/service');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.all('*', function (req, res, next) {

    let app = req.app,
        ua  = new uaparser(req.get('User-Agent'));

    if(ua.getDevice().type === "mobile" || ua.getDevice().type === "wearable" || ua.getDevice().type === "embedded"){
    	res.locals.device = "mobile";	
    }else{
    	res.locals.device = "desktop";
    }
    console.log("Device => ", res.locals.device);
    next();
});

//PUSH NOTIFICATIONS ==========================================================================
router.post("/subscribe-push", (req, res, next) => push.subscribe(req, res, next));
router.post("/save-push", (req, res, next) => push.save(req, res, next));
//MOCK DATA FOR MONGO ==========================================================================
router.get('/mongo-setup', (req, res, next) => main.mongoSetup(req, res, next));
// API =========================================================================================
router.post('/api/email', (req, res, next) => api.addEmail(req, res, next));
router.post('/api/cart/test/:cart', (req, res, next) => api.changeQuantityTest(req, res, next));
router.get('/api/cart/:cart', (req, res, next) => api.getCart(req, res, next));
router.post('/api/cart', (req, res, next) => api.createCart(req, res, next));
router.post('/api/cart/:cart', (req, res, next) => api.addProductCart(req, res, next));
router.put('/api/cart', (req, res, next) => api.updateCart(req, res, next));
router.get('/api/product/:product', (req, res, next) => api.getProduct(req, res, next));
router.get('/api/products/:category_id', (req, res, next) => api.getProducts(req, res, next));
router.get('/api/products', (req, res, next) => api.getProducts(req, res, next));
router.get('/api/product/search/:q', (req, res, next) => api.searchProduct(req, res, next));
router.get('/api/categories', (req, res, next) => api.getCategories(req, res, next));
router.get('/api/products_list/sort', (req, res, next) => api.getProductsBySort(req, res, next));


//FRONT  ========================================================================================
// router.get('/', (req, res, next) => main.hometmp(req, res, next));
router.get('/', (req, res, next) => main.home(req, res, next));
router.get('/tmp', (req, res, next) => main.hometmp(req, res, next));
router.get('/home', (req, res, next) => main.home(req, res, next));
router.get('/productos/:category_id', (req, res, next) => main.productsList(req, res, next));
router.get('/productos/:category_name/:category_id', (req, res, next) => main.productsList(req, res, next));
router.get('/productos', (req, res, next) => main.productsList(req, res, next));
router.get('/contacto', (req, res, next) => main.contact(req, res, next));
router.get('/sucursales', (req, res, next) => main.store(req, res, next));
router.post('/contacto', (req, res, next) => main.contactSave(req, res, next));
router.get('/producto/:product_id', (req, res, next) => main.getUniqueProduct(req, res, next));
router.get('/producto/:product_name/:product_id', (req, res, next) => main.getUniqueProduct(req, res, next));
router.get('/productos/buscador/:q', (req, res, next) => main.search(req, res, next));
router.post('/productos/buscador', (req, res, next) => main.getSearch(req, res, next));
router.get('/search/', (req, res, next) => main.search(req, res, next));
router.get('/carrito', (req, res, next) => main.listCart(req, res, next));
router.get('/carrito/producto/eliminar', (req, res, next) => main.removeCartProduct(req, res, next));
router.get('/carrito/duplicate/:cart_id', (req, res, next) => main.duplicateCart(req, res, next));
router.post('/carrito', (req, res, next) => main.addCartProduct(req, res, next));
router.get('/facturacion', (req, res, next) => main.billingForm(req, res, next));
router.post('/facturacion', (req, res, next) => main.billingSave(req, res, next));
// router.get('/medios-de-pago', (req, res, next) => main.landingMediosDePago(req, res, next));
router.get('/envios', (req, res, next) => main.landingEnvios(req, res, next));
router.get('/atencion-al-cliente', (req, res, next) => main.landingAtencionAlCliente(req, res, next));

// PAGOS
router.get('/pago', (req, res, next) => main.paymentCart(req, res, next));
router.get('/pago/failure', (req, res, next) => main.paymentVerifyFailure(req, res, next));
router.get('/pago/pending', (req, res, next) => main.paymentVerifyPending(req, res, next));
router.post('/pago', (req, res, next) => main.paymentCart(req, res, next));
router.get('/pago/success', (req, res, next) => main.paymentVerifySuccess(req, res, next));


// PAGO SUCCESS
// router.get('/pago/:status_operation', (req, res, next) => main.handlerPayment(req, res, next));
// router.post('/pago/:status_operation', (req, res, next) => main.handlerPayment(req, res, next));

//MERCADOPAGO FINANCIAL DATA -> GET
router.get('/nosotros', (req, res, next) => main.landingNosotros(req, res, next));
router.get('/medios-de-pago', (req, res, next) => main.mercadoPagoData(req, res, next));
router.get('/mercadopago', (req, res, next) => main.mercadoPagoData(req, res, next));
router.get('/mercadopago/:paymentId', (req, res, next) => main.mercadoPagoDataDetails(req, res, next));

/*   ADMIN   */


router.get('/admin/banners', (req, res, next) => admin.getBanners(req, res, next));
router.get('/admin/banners/nuevo', (req, res, next) => admin.addBanner(req, res, next));
router.post('/admin/banners/nuevo', (req, res, next) => admin.saveBanner(req, res, next));
router.get('/admin/banners/eliminar/:banner_id', (req, res, next) => admin.removeBanner(req, res, next));

router.get('/admin/logout', (req, res, next) => admin.logout(req, res, next));
router.get('/admin/login', (req, res, next) => admin.login(req, res, next));
router.post('/admin/login', (req, res, next) => admin.setUser(req, res, next));
router.get('/admin/documentacion', (req, res, next) => admin.getDocumentation(req, res, next));
router.get('/admin/productos', (req, res, next) => admin.getProducts(req, res, next));
router.get('/admin/productos/nuevo', (req, res, next) => admin.addProducts(req, res, next));
router.get('/admin', (req, res, next) => admin.getPanel(req, res, next));
router.get('/admin/panel', (req, res, next) => admin.getPanel(req, res, next));
router.get('/admin/categorias', (req, res, next) => admin.getCategories(req, res, next));
router.post('/admin/productos/nuevo', multipartMiddleware, (req, res, next) => admin.saveProduct(req, res, next));
router.get('/admin/categorias/nuevo', (req, res, next) => admin.addCategory(req, res, next));
router.post('/admin/categorias/nuevo', (req, res, next) => admin.saveCategory(req, res, next));
router.get('/admin/categorias/eliminar/:category_id', (req, res, next) => admin.removeCategory(req, res, next));
router.get('/admin/productos/eliminar/:product_id', (req, res, next) => admin.removeProduct(req, res, next));
router.get('/admin/pedidos', (req, res, next) => admin.getPurchases(req, res, next));
router.get('/admin/pedidos/:cart_id', (req, res, next) => admin.getPurchaseDetail(req, res, next));
router.get('/admin/categorias/editar/:category_id', (req, res, next) => admin.editCategory(req, res, next));
router.post('/admin/categorias/editar/', (req, res, next) => admin.editCategorySave(req, res, next));
router.get('/admin/productos/editar/:product_id', (req, res, next) => admin.editProduct(req, res, next));
router.post('/admin/productos/editar/', multipartMiddleware, (req, res, next) => admin.editProductSave(req, res, next));

router.get('/admin/envios', (req, res, next) => admin.getDeliveries(req, res, next));
router.get('/admin/envios/nuevo', (req, res, next) => admin.addDelivery(req, res, next));
router.post('/admin/envios/nuevo', (req, res, next) => admin.saveDelivery(req, res, next));
router.get('/admin/envios/eliminar/:delivery_id', (req, res, next) => admin.removeDelivery(req, res, next));
router.get('/admin/envios/editar/:delivery_id', (req, res, next) => admin.editDelivery(req, res, next));
router.post('/admin/envios/editar/', (req, res, next) => admin.editDeliverySave(req, res, next));

router.get('/admin/mensajes', (req, res, next) => admin.getMessages(req, res, next));

router.get('/traffic', (req, res, next) => test.sendTraffic(req, res, next));

module.exports = router;
