({
    toggleState : function(component, event) {
        // toggle state of the section
        component.set("v.expanded", !component.get("v.expanded"));
    },
    handleState : function(component, event, helper) {
        // call state validator
        helper.validateState(component);
        // send event (no need to send any data as we can get values from the component using event.getSource() method)
        component.getEvent("ontoggle").fire();
    }
})