({
    /**
      * @description Creates components based on 'config' attribute and replaces body of the component.
      * @param Object component - component reference.
    */
    handleConfig : function(component) {
        // get config
        let config = component.get("v.config");
        // if config is not empty
        if (!$A.util.isEmpty(config)) {
            // create components
            this.createComponents(component, config, $A.getCallback(function(response) {
                if (component.isValid()) {
                    // override body
                    component.set("v.body", response);
                }
            }));
        }
    },
    /**
      * @description Creates components based on 'config' parameter and appends the new components to the end of body.
      * @param Object component - component reference.
      * @param List config - Components along with attributes that need to be created. Example: [[component, {attributes}],[...],...]
    */
    appendComponents : function(component, config) {
        // if config is not empty
        if (!$A.util.isEmpty(config)) {
            // create components
            this.createComponents(component, config, $A.getCallback(function(response) {
                if (component.isValid()) {
                    // get existing body
                    let body = component.get("v.body");
                    // append response
                    component.set("v.body", (
                        // if body is not empty
                        !$A.util.isEmpty(body) ?
                        // add new components to body
                        body.concat(response) :
                        // replace body with response if body is empty
                        response
                    ));
                }
            }));
        }
    },
    /**
      * @description Method to create components based on 'config' parameter.
      * @param Object component - component reference.
      * @param List config - Components along with attributes that need to be created. Example: [[component, {attributes}],[...],...]
      * @param Function callback - function to handle created components.
    */
    createComponents : function(component, config, callback) {
        // define inner callback to handle response
        let handleResponse = $A.getCallback(function(response, state, errors) {
            if (component.isValid()) {
                // create result to return with onchange event
                let result = {
                    "isSuccess": false,
                    "state": state,
                    "errors": null
                };
                // check state
                switch (state) {
                    case "SUCCESS":
                        // return response
                        try {
                            callback(response);
                            // set isSuccess in result in case of real success
                            result.isSuccess = true;
                        } catch(e) {
                            // set error to result
                            result.errors = e;
                            // change state in result
                            result.state = "ERROR";
                        }
                        break;
                    case "ERROR":
                        // set error to result
                        result.errors = errors;
                        break;
                    case "INCOMPLETE":
                        // set error to result
                        result.errors = "No response from server or client is offline.";
                        break;
                }
                // log errors
                if (!$A.util.isEmpty(result.errors)) {
                    console.error(result.errors);
                }
                // send onchange event
                component.getEvent("onchange").fire({
                    "data": result
                });
                // call after change
                this.afterChange(component, result);
            }
        }.bind(this));
        // try to create components
        try {
            // if beforeChange returns true
            if (this.beforeChange(component)) {
                // call aura
                $A.createComponents(
                    // set config [[component name, {attributes}],...]
                    config,
                    // set callback function
                    handleResponse
                );
            }
        } catch(e) {
            // return null as response
            handleResponse(null, "ERROR", e);
        }
    },
    /**
      * @description This method is being called before creation starts. Can be overridden in component that extends dynamic.
      * @param Object component - component reference.
      * @return Boolean - true/false to allow/reject components creation.
    */
    beforeChange : function(component) {
        return true;
    },
    /**
      * @description This method is being called when creation finishing. Can be overridden in component that extends dynamic.
      * @param Object component - component reference.
      * @param Object result - contains creation state and error messages.
    */
    afterChange : function(component, result) {}
})