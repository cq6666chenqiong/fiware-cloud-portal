var BP = BP || {};

// Current version is **0.1**.

BP.VERSION = '0.1';

// It has been developed by GING (New Generation Internet Group) in
// the Technical University of Madrid.
BP.AUTHORS = 'GING';

BP.API = (function (_BP, undefined) {

    var x2js;
    var vdc_id;

    var orgName = 'FIWARE';
    var bpUrl = '/paas/rest/';
    var xmlHead = '<?xml version="1.0" encoding="UTF-8"?>';


    var check = function () {
        x2js = x2js || new X2JS();
        vdc_id = JSTACK.Keystone.params.access.token.tenant.id;
        bpUrl = UTILS.Auth.getCurrentRegion() + '/paas/rest/';
        //vdc_id = '6571e3422ad84f7d828ce2f30373b3d4';
    }

    var sendRequest = function (method, url, body, callback, callbackError) {

        var req = new XMLHttpRequest();

        var token = JSTACK.Keystone.params.token;

        req.onreadystatechange = onreadystatechange = function () {

            if (req.readyState == '4') {

                switch (req.status) {

                    case 100:
                    case 200:
                    case 201:
                    case 202:
                    case 203:
                    case 204:
                    case 205:
                        //console.log('Respuesta: ', req.responseText);
                        callback(req.responseText);
                        break;
                    default:
                        callbackError({message:req.status + " Error", body:req.responseText});
                }
            }
        }

        req.open(method, bpUrl + url, true);

        req.setRequestHeader('Accept', 'application/xml');
        req.setRequestHeader('Content-Type', 'application/xml');
        req.setRequestHeader('X-Auth-Token', token);
        req.setRequestHeader('Tenant-ID', vdc_id);

        req.timeout = 2000000;
        req.send(body);

    };

    //-----------------------------------------------
    // Blueprint Catalogue
    //-----------------------------------------------

    var getBlueprintCatalogList = function (callback, callbackError) {

        check();

        sendRequest('GET', 'catalog/org/' + orgName + '/environment', undefined, function (resp) {
            var bpList = x2js.xml_str2json(resp);
            callback(bpList.environmentDtoes.environmentDto_asArray);
        }, callbackError);
    };

    var getBlueprintCatalog = function (bp_id, callback, callbackError) {

        check();
        sendRequest('GET', 'catalog/org/' + orgName + '/environment/' + bp_id, undefined, function (resp) {
            var bp = x2js.xml_str2json(resp);
            callback(bp.environmentDto);
        }, callbackError);
    };


    // 404 en /tier

    // var getBlueprintCatalogTierList = function (bp_id, callback, callbackError) {

    //  check();

    //  sendRequest('GET', 'catalog/org/' + orgName + '/environment/' + bp_id + '/tier', undefined, function (resp) {
    //      var bpt = x2js.xml_str2json(resp);
    //      callback(bpt.tierDtoes.tierDtos_asArray);
    //  }, callbackError);
    // };

    // var getBlueprintCatalogTier = function (bp_id, tier_id, callback, callbackError) {

    //  check();

    //  sendRequest('GET', 'catalog/org/' + orgName + '/environment/' + bp_id + '/tier/' + tier_id, undefined, function (resp) {
    //      var bpt = x2js.xml_str2json(resp);
    //      callback(bpt.tierDtos);
    //  }, callbackError);
    // };

    //-----------------------------------------------
    // Blueprint Templates
    //-----------------------------------------------

    var getBlueprintTemplateList = function (callback, callbackError) {

        check();

        sendRequest('GET', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment', undefined, function (resp) {
            var bpList = x2js.xml_str2json(resp);
            callback(bpList.environmentDtoes.environmentDto_asArray);
        }, callbackError);
    };

    var getBlueprintTemplate = function (bp_id, callback, callbackError) {

        check();

        sendRequest('GET', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id, undefined, function (resp) {
            var bp = x2js.xml_str2json(resp);
            for (var t in bp.environmentDto.tierDtos_asArray) {
                bp.environmentDto.tierDtos_asArray[t].id = bp.environmentDto.tierDtos_asArray[t].name;
            }
            callback(bp.environmentDto);
        }, callbackError);
    };

    var createBlueprintTemplate = function (bp, callback, callbackError) {

        check();

        var b = {environmentDto: bp};

        var xmlTempl = xmlHead + x2js.json2xml_str(b);

        sendRequest('POST', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment', xmlTempl, callback, callbackError);

    };

    var deleteBlueprintTemplate = function (bp_id, callback, callbackError) {

        check();

        sendRequest('DELETE', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id, undefined, callback, callbackError);
    };

    var getBlueprintTemplateTierList = function (bp_id, callback, callbackError) {

        check();

        sendRequest('GET', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id + '/tier', undefined, function (resp) {
            var bpt = x2js.xml_str2json(resp);
            callback(bpt.tierDtoes.tierDtos_asArray);
        }, callbackError);
    };

    var getBlueprintTemplateTier = function (bp_id, tier_id, callback, callbackError) {

        check();

        sendRequest('GET', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id + '/tier/' + tier_id, undefined, function (resp) {
            var bpt = x2js.xml_str2json(resp);
            callback(bpt.tierDtos);
        }, callbackError);
    };

    var createBlueprintTemplateTier = function (bp_id, tier, callback, callbackError) {

        check();

        var t = {tierDto: tier};

        var xmlTier = xmlHead + x2js.json2xml_str(t);

        sendRequest('POST', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id + '/tier', xmlTier, function (resp) {
            callback(resp)
        }, callbackError);
    };

    var updateBlueprintTemplateTier = function (bp_id, tier, callback, callbackError) {

        check();

        var t = {tierDto: tier};

        var xmlTier = xmlHead + x2js.json2xml_str(t);

        sendRequest('PUT', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id + '/tier/' + tier.name, xmlTier, function (resp) {
            callback(resp)
        }, callbackError);
    };

    var deleteBlueprintTemplateTier = function (bp_id, tier_id, callback, callbackError) {

        check();

        sendRequest('DELETE', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id + '/tier/' + tier_id, undefined, function (resp) {
            callback();
        }, callbackError);
    };

    var getBlueprintTemplateTierProductList = function (bp_id, tier_id, callback, callbackError) {

        check();

        sendRequest('GET', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id + '/tier/' + tier_id + '/productRelease', undefined, function (resp) {
            var bpt = x2js.xml_str2json(resp);
            callback(bpt.tierDtos);
        }, callbackError);
    };

    var addBlueprintTemplateTierProduct = function (bp_id, tier_id, product, callback, callbackError) {

        check();

        var p = {productReleaseDtos: product};

        var xmlProd = xmlHead + x2js.json2xml_str(p);

        sendRequest('POST', 'catalog/org/' + orgName + '/vdc/' + vdc_id + '/environment/' + bp_id + '/tier/' + tier_id + '/productRelease', xmlProd, function (resp) {
            callback(resp);
        }, callbackError);
    };


    //-----------------------------------------------
    // Blueprint Instances
    //-----------------------------------------------

    var getBlueprintInstanceList = function (callback, callbackError) {

        check();

        sendRequest('GET', 'envInst/org/' + orgName + '/vdc/' + vdc_id + '/environmentInstance', undefined, function (resp) {
            var bpList = x2js.xml_str2json(resp);
            callback(bpList.environmentInstancePDtoes.environmentInstancePDto_asArray);
        }, callbackError);
    };

    var getBlueprintInstance = function (bp_id, callback, callbackError) {

        check();

        sendRequest('GET', 'envInst/org/' + orgName + '/vdc/' + vdc_id + '/environmentInstance/' + bp_id, undefined, function (resp) {
            var bp = x2js.xml_str2json(resp);
            callback(bp.environmentInstancePDto);
        }, callbackError);
    };

    var launchBlueprintInstance = function (bp, callback, callbackError) {

        check();

        var b = {environmentInstanceDto: bp};

        var xmlInst = xmlHead + x2js.json2xml_str(b);
        
        sendRequest('POST', 'envInst/org/' + orgName + '/vdc/' + vdc_id + '/environmentInstance', xmlInst, function (resp) {

            console.log('resppp', resp);
            callback();
        }, callbackError);
    };

    var stopBlueprintInstance = function (bp_id, callback, callbackError) {

        check();

        sendRequest('DELETE', 'envInst/org/' + orgName + '/vdc/' + vdc_id + '/environmentInstance/' + bp_id, undefined, function (resp) {
            callback(resp);
        }, callbackError);
    };

    var addVMToTier = function (bp_id, tierDto, callback, callbackError) {

        check();

        var t = {tierDto: tierDto};

        var xmlTier = xmlHead + x2js.json2xml_str(t);

        sendRequest('POST', 'envInst/org/' + orgName + '/vdc/' + vdc_id + '/environmentInstance/' + bp_id + '/tierInstance', xmlTier, function (resp) {
            callback(resp);
        }, callbackError);
    };

    var removeVMFromTier = function (bp_id, inst_id, callback, callbackError) {

        check();

        sendRequest('DELETE', 'envInst/org/' + orgName + '/vdc/' + vdc_id + '/environmentInstance/' + bp_id + '/tierInstance/' + inst_id, undefined, function (resp) {
            callback(resp);
        }, callbackError);
    };

    //Task Management

    var getTask = function (task_id, callback, callbackError) {

        check();

        sendRequest('GET', 'vdc/' + vdc_id + '/task/' + task_id, undefined, function (resp) {
            var task = x2js.xml_str2json(resp);
            callback(task.task);
        }, callbackError);
    };

    var getTasks = function (callback, callbackError) {

        check();

        sendRequest('GET', 'vdc/' + vdc_id + '/task', undefined, function (resp) {
            var task = x2js.xml_str2json(resp);
            callback(task.tasks);
        }, callbackError);
    };

    return {
        getBlueprintCatalogList: getBlueprintCatalogList,
        getBlueprintCatalog: getBlueprintCatalog,
        // getBlueprintCatalogTierList: getBlueprintCatalogTierList,
        // getBlueprintCatalogTier: getBlueprintCatalogTier,
        getBlueprintTemplateList: getBlueprintTemplateList,
        getBlueprintTemplate: getBlueprintTemplate,
        getBlueprintTemplateTierList: getBlueprintTemplateTierList,
        getBlueprintTemplateTier: getBlueprintTemplateTier,
        deleteBlueprintTemplateTier: deleteBlueprintTemplateTier,
        createBlueprintTemplate: createBlueprintTemplate,
        deleteBlueprintTemplate: deleteBlueprintTemplate,


        createBlueprintTemplateTier: createBlueprintTemplateTier,
        updateBlueprintTemplateTier: updateBlueprintTemplateTier,



        getBlueprintInstanceList: getBlueprintInstanceList,
        getBlueprintInstance: getBlueprintInstance,
        launchBlueprintInstance: launchBlueprintInstance,
        stopBlueprintInstance: stopBlueprintInstance,
        addVMToTier: addVMToTier,
        removeVMFromTier: removeVMFromTier,

        getBlueprintTemplateTierProductList: getBlueprintTemplateTierProductList,
        addBlueprintTemplateTierProduct: addBlueprintTemplateTierProduct,





        getTask: getTask,
        getTasks: getTasks
    };

}(BP));
