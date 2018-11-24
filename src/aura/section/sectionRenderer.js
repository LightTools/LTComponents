({
    afterRender : function(component, helper) {
        this.superAfterRender();
        // validate state of the section
        helper.validateState(component);
    }
})