({
	doInit : function(component, event, helper) {
		var stdctrl_L = component.get("v.SPIdList");
      	var SPId_L = [];
        for(var i=0; i<stdctrl_L.length; i++)
        {
            SPId_L.push(stdctrl_L[i]["Id"]);
        }
        component.set("v.SPIdList", SPId_L);

        var productCheck = component.get("c.checkProducts");
        productCheck.setParams({"spIdList": component.get("v.SPIdList")});
        productCheck.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('Response for Products Check: ' + response.getReturnValue());
                if(response.getReturnValue() != 'Success')
                {
                    component.set("v.noError", false);
                    let toastParams = {
                        title: "Error",
                        message: response.getReturnValue(), // Default error message
                        type: "error"
                    };
                    let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams(toastParams);
                    toastEvent.fire();                
                }
            }
            else{
                console.log(response.getReturnValue());
            }
        });
        $A.enqueueAction(productCheck);        

        //Set default value for Business Entity Picklist	
		component.set("v.selectedBusinessEntity", "S2B, Inc.");
		component.set("v.purchaseOrder.FOB_Point__c", "Ex Work");
		component.set("v.purchaseOrder.Payment_Terms__c", "CCD");
        component.set("v.Tax", 0);
        component.set("v.POLTotal", 0);
        component.set("v.CTTotal", 0);
        component.set("v.GrandTotal", 0);
        //get Business Entity List
        var actionPopulateBEList = component.get("c.populateBusinessEntityList");
        actionPopulateBEList.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.BusinessEntityOptions", c);
				var setBEDefault = component.get('c.onSelectBusinessEntity');
    			$A.enqueueAction(setBEDefault);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(actionPopulateBEList);

        //get supplier
        var fillSupplier = component.get("c.initPOSupplier");
        var spIdList = component.get("v.SPIdList");
        fillSupplier.setParams({"spId": spIdList[0]});
        fillSupplier.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                component.set("v.purchaseOrder.Supplier__c", response.getReturnValue());
                var supplierID = response.getReturnValue();
				var actionPopulateAddressList = component.get("c.returnSuplierAddresses");
		        actionPopulateAddressList.setParams({"SupplierId": supplierID});
		        actionPopulateAddressList.setCallback(this, function(response) {
		            var state = response.getState();
		            if(state == "SUCCESS"){
		                component.set("v.SupplierAddressOptions", response.getReturnValue());
		                var setDefaultAddress = component.get("c.returnDefaultAddress");
				        setDefaultAddress.setParams({"SupplierId": supplierID});
				        setDefaultAddress.setCallback(this, function(response) {
				            var state = response.getState();
				            if(state == "SUCCESS"){
				                component.set("v.selectedSupplierAdress", response.getReturnValue());
				                console.log('++++Default Address: ' + response.getReturnValue());
								var setAddressDefault = component.get('c.onSelectSupplierAddress');
				    			$A.enqueueAction(setAddressDefault);
				            } else {
				                console.log('There was a problem : '+response.getError());
				                console.log('Error: ' + JSON.stringify(response.getError()));
				            }
				        });
		                $A.enqueueAction(setDefaultAddress);
		            } else {
		                console.log('There was a problem : '+response.getError());
		            }
		        });
                $A.enqueueAction(actionPopulateAddressList);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(fillSupplier);

        var fillSupplierName = component.get("c.returnPOSupplierName");
        fillSupplierName.setParams({"spId": spIdList[0]});
        fillSupplierName.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.SupplierName", c);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(fillSupplierName);

        var actionPopulateProductList = component.get("c.returnProductList");
        actionPopulateProductList.setParams({"spID": SPId_L[0]});
        actionPopulateProductList.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.SupplierProductOptions", c);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(actionPopulateProductList);

        var generatePOLines = component.get("c.generatePOLines");
        generatePOLines.setParams({"spIdList": spIdList});
        generatePOLines.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.purchaseOrderLines", c);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(generatePOLines);

        var initCharges = component.get("c.initNewCC");
        initCharges.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.chargesList", c);
                var sortCharges = component.get('c.sortCharges');
                $A.enqueueAction(sortCharges);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(initCharges);
	},
	onSelectBusinessEntity : function(component, event, helper) {
		var action = component.get("c.returnEntityIDByName");
        action.setParams({"entityName": component.get("v.selectedBusinessEntity")});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.purchaseOrder.Business_Entity__c", c);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(action);
	},
	onSelectSupplierAddress : function(component, event, helper) {
		console.log('++++onSelectSupplierAddress Supplier Address: ' + component.get("v.purchaseOrder.Supplier__c"))
		console.log('++++onSelectSupplierAddress selectedSupplierAdress: ' + component.get("v.purchaseOrder.Supplier_Address__c"))
		var action = component.get("c.returnIDByAddress");
        action.setParams({"SupplierId": component.get("v.purchaseOrder.Supplier__c"), "selectedAddress": component.get("v.selectedSupplierAdress")});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.purchaseOrder.Supplier_Address__c", c);
                console.log('++++onSelectSupplierAddress c: ' + c);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(action);
		var action2 = component.get("c.returnOriginPortByAddress");
        action2.setParams({"SupplierId": component.get("v.purchaseOrder.Supplier__c"), "selectedAddress": component.get("v.selectedSupplierAdress")});
        action2.setCallback(this, function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                var c = response.getReturnValue();
                component.set("v.selectedOriginPort", c);
                component.set("v.purchaseOrder.Origin_Port__c", c);
                console.log(component.get("v.selectedOriginPort"));
                console.log(component.get("v.purchaseOrder.Origin_Port__c"));
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(action2);
	},
	onSelectOriginPort : function(component, event, helper) {
		component.set("v.purchaseOrder.Origin_Port__c", component.get("v.selectedOriginPort"));
	}, 

	onSelectSupplierProduct : function(component, event,helper) {  
        var eventID = event.target.id;
        var itemNumber = eventID.substr(0, eventID.indexOf('-'));
        var txtVal = document.getElementById(eventID).value;
        // console.log('Selected Value is '+txtVal);  
        // console.log('Selected taget id is '+ eventID);  
        // console.log('Selected itemNumber: '+ itemNumber);

        var productList = component.get("v.SupplierProductOptions");
        for(var i=0; i<productList.length; i++)
        {
            if(productList[i].productName == txtVal)
            {
                document.getElementById(itemNumber + '-TITLE').value = productList[i].productTitle;
                document.getElementById(itemNumber + '-Price').value = productList[i].productPrice;
                var polines = component.get("v.purchaseOrderLines");
                for(var j=0; j<polines.length; j++)
                {
                    if(polines[j].sequenceNum == itemNumber)
                    {
                        polines[j].pol.Purchase_Price__c = productList[i].productPrice;
                        polines[j].pol.Item_Title__c = productList[i].productTitle;
                        polines[j].selectedItem = txtVal;
                    }
                }
                component.set("v.purchaseOrderLines", polines);
            }
        }
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    onClickDelete : function (component, event, helper) {
        console.log('Selected taget id is '+event.target.id);
        var polines = component.get("v.purchaseOrderLines");
        var newPOLs = [];
        for(var i=0; i<polines.length; i++)
        {
            if(polines[i].sequenceNum != event.target.id) newPOLs.push(polines[i]);
        }
        component.set("v.purchaseOrderLines", newPOLs);
        var sortPOL = component.get('c.sortPOLs');
        $A.enqueueAction(sortPOL);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    onClickAdd : function (component, event, helper) {
        var action = component.get("c.initNewPOL");
	    action.setCallback(this, function(response){
	        var state = response.getState();
	        if (state === "SUCCESS") {
    	        var polines = component.get("v.purchaseOrderLines");
	            var newPOL = response.getReturnValue();
	            polines.push(newPOL);
	            component.set("v.purchaseOrderLines", polines);
                var sortPOL = component.get('c.sortPOLs');
                $A.enqueueAction(sortPOL);
            } else {
                console.log('There was a problem : '+response.getError());
            }
	    });
	    $A.enqueueAction(action);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    sortPOLs : function (component, event, helper) {
        var action = component.get("c.sortPOL");
        action.setParams({"polList": component.get("v.purchaseOrderLines")});
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var polines = response.getReturnValue();
                component.set("v.purchaseOrderLines", polines);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    onChangePriceQTY : function (component, event, helper) {
        var eventID = event.target.id;
        var itemNumber = eventID.substr(0, eventID.indexOf('-'));
        var inputVal = document.getElementById(eventID).value;
        var polines = component.get("v.purchaseOrderLines");
        for(var i=0; i<polines.length; i++)
        {
            if(polines[i].sequenceNum == itemNumber)
            {
                polines[i].pol.Quantity__c = document.getElementById(itemNumber + '-QTY').value;
                polines[i].pol.Purchase_Price__c = document.getElementById(itemNumber + '-Price').value;
            }
        }
        component.set("v.purchaseOrderLines", polines);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    onClickAddCharge : function (component, event, helper) {
        var action = component.get("c.initNewCC");
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var polines = component.get("v.chargesList");
                var newPOL = response.getReturnValue();
                polines.push(newPOL);
                component.set("v.chargesList", polines);
                var sortCharges = component.get('c.sortCharges');
                $A.enqueueAction(sortCharges);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(action);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    sortCharges : function (component, event, helper) {
        var action = component.get("c.sortChargeList");
        action.setParams({"chargeList": component.get("v.chargesList")});
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var polines = response.getReturnValue();
                component.set("v.chargesList", polines);
            } else {
                console.log('There was a problem : '+response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    onSelectCharge : function(component, event,helper) {  
        var eventID = event.target.id;
        var itemNumber = eventID.substr(0, eventID.indexOf('-'));
        var txtVal = document.getElementById(eventID).value;
        console.log('Selected Value is '+txtVal);  
        console.log('Selected taget id is '+ eventID);  
        console.log('Selected itemNumber: '+ itemNumber);

        var chargeL = component.get("v.chargesList");
        for(var i=0; i<chargeL.length; i++)
        {
            if(chargeL[i].sequenceNum == itemNumber)
            {
                chargeL[i].selectedCharge = txtVal;
            }
        }
        component.set("v.chargesList", chargeL);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    onChangeChargeAmount : function(component, event,helper) {  
        var eventID = event.target.id;
        var itemNumber = eventID.substr(0, eventID.indexOf('-'));
        var txtVal = document.getElementById(eventID).value;
        console.log('Selected Value is '+txtVal);  
        console.log('Selected taget id is '+ eventID);  
        console.log('Selected itemNumber: '+ itemNumber);

        var chargeL = component.get("v.chargesList");
        for(var i=0; i<chargeL.length; i++)
        {
            if(chargeL[i].sequenceNum == itemNumber)
            {
                chargeL[i].amount = txtVal;
            }
        }
        component.set("v.chargesList", chargeL);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    onClickDeleteCharge : function (component, event, helper) {
        console.log('Selected taget id is '+event.target.id);
        var chargesList = component.get("v.chargesList");
        var newCharges = [];
        for(var i=0; i<chargesList.length; i++)
        {
            if(chargesList[i].sequenceNum != event.target.id) newCharges.push(chargesList[i]);
        }
        component.set("v.chargesList", newCharges);
        var sortCharges = component.get('c.sortCharges');
        $A.enqueueAction(sortCharges);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    onChangeTax : function (component, event, helper) {
        component.set("v.Tax", document.getElementById("theTax").value);
        var getTotals = component.get('c.calculateTotals');
        $A.enqueueAction(getTotals);
    },

    calculateTotals : function (component, event, helper) {
        var polines = component.get("v.purchaseOrderLines");
        var chargesList = component.get("v.chargesList");
        var taxVal = component.get("v.Tax");
        var POLTotalVal = 0;
        var CTTotalVal = 0;
        var GrandTotalVal = 0;
        console.log('+++++polines: ' + polines);
        console.log('+++++chargesList: ' + chargesList);
        console.log('+++++taxVal: ' + taxVal);
        for(var i=0; i<polines.length; i++)
        {
            POLTotalVal += Number(polines[i].pol.Purchase_Price__c * polines[i].pol.Quantity__c);
        }
        for(var i=0; i<chargesList.length; i++)
        {
            CTTotalVal += Number(chargesList[i].amount);
        }
        CTTotalVal += Number(taxVal);
        GrandTotalVal = Number(POLTotalVal + CTTotalVal);
        component.set("v.POLTotal", POLTotalVal);
        component.set("v.CTTotal", CTTotalVal);
        component.set("v.GrandTotal", GrandTotalVal);
    },

	handleCancel : function (component, event, helper) {
	    var action = component.get("c.getListViews");
	    action.setCallback(this, function(response){
	        var state = response.getState();
	        if (state === "SUCCESS") {
	            var listviews = response.getReturnValue();
	            var navEvent = $A.get("e.force:navigateToList");
	            navEvent.setParams({
	                "listViewId": listviews.Id,
	                "listViewName": null,
	                "scope": "Supplier_Products__c"
	            });
	            navEvent.fire();
	        }
	    });
	    $A.enqueueAction(action);
	}, 
	handleCreatePO : function (component, event, helper) {
		component.set("v.purchaseOrder.Note_to_Supplier__c", component.find("NoteToSupplier").get("v.value"));
		component.set("v.purchaseOrder.Memo__c", component.find("Memo").get("v.value"));
        console.log(JSON.stringify(component.get("v.purchaseOrder")));
        console.log(JSON.stringify(component.get("v.purchaseOrderLines")));
        var action = component.get("c.commitPO");
        action.setParams({"PO": component.get("v.purchaseOrder"), "POLinesClassList": component.get("v.purchaseOrderLines"), "ChargesClassList": component.get("v.chargesList"), "TaxVal": component.get("v.Tax")});
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('Success ID: ' + response.getReturnValue());
                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                  "recordId": response.getReturnValue(),
                  "slideDevName": "Purchase Order"
                });
                navEvt.fire();
            }
            else{
                alert(response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }, 
    alertCharges : function (component, event, helper) {
        console.log(JSON.stringify(component.get("v.chargesList")));
    }
})