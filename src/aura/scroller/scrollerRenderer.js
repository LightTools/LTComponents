({
    afterRender : function(component, helper) {
        this.superAfterRender();
        // add listeners when rendering is done
        helper.addEventListeners(component);
    }
})