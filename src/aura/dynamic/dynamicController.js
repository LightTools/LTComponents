({
    initialize : function(component, event, helper) {
        helper.handleConfig(component);
    },
    callMethod : function(component, event, helper) {
        switch (event.getParam("name")) {
            case "append":
                helper.appendComponents(
                    component,
                    event.getParam("arguments").config
                );
                break;
        }
    }
})