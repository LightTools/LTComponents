({
    afterRender : function(component, helper) {
        this.superAfterRender();
        // create chart instance
        helper.initializeInstance(component);
    },
    unRender : function(component, helper) {
        this.superUnrender();
        // destroy chart instance
        helper.destroyInstance(component);
    }
})