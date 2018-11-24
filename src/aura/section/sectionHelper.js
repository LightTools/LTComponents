({
    /**
      * @description Method that changes styles of the component based on the state (i.e. expanded/collapsed).
      * @param Object component - component reference.
    */
    validateState : function(component) {
        // if state is expanded
        if (component.get("v.expanded") === true) {
            // render content
            $A.util.removeClass(component, "lt-section-collapsed");
            // expand content
            $A.util.addClass(component, "lt-section-expanded");
        } else { 
            // if state is collapsed - remove expanded class
            $A.util.removeClass(component, "lt-section-expanded");
            // remove content from rendering flow with small delay to allow animations
            window.setTimeout($A.getCallback(function() {
                // if component is valid and section still is collapsed
                if (component.isValid() && !component.get("v.expanded")) {
                    // add collapsed class to remove content from rendering flow
                    $A.util.addClass(component, "lt-section-collapsed");
                }
            }), 500); // 0.5s will be enough for collapse animations, otherwise you can increase this value
        }
    }
})