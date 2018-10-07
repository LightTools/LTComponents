({
    callMethod : function(component, event, helper) {
        switch (event.getParam("name")) {
            case "run":
                return helper.run(component, event.getParam("arguments").config);
                break;
            case "abort":
                return helper.abort(component);
                break;
            case "getStatus":
                return component.get("v.status");
                break;
        }
    }
})