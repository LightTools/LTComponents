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
                    "state": null,
                    "errors": null,
                    "components": null
                };
                // create components from response if it's not empty, as the error state doesn't mean that there are no components in response
                if (!$A.util.isEmpty(response)) {
                    try {
                        // check for empty items
                        for (let item of response) {
                            // if item is not empty
                            if (!$A.util.isEmpty(item)) {
                                // check if array of components in result is null and create a new array
                                if ($A.util.isEmpty(result.components)) {
                                    // create a new array in result
                                    result.components = [];
                                }
                                // add not empty item to result
                                result.components.push(item);
                            }
                        }
                        // create components
                        callback(result.components);
                    } catch(e) {
                        // override state
                        state = "ERROR";
                        // override errors
                        errors = e;
                    }
                }
                // assign state to result
                result.state = state;
                // check state and assign errors
                switch (state) {
                    case "SUCCESS":
                        // set isSuccess in result
                        result.isSuccess = true;
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
            }
        }.bind(this));
        // try to create components
        try {
            // call aura
            $A.createComponents(
                // set config [[component name, {attributes}],...]
                config,
                // set callback function
                handleResponse
            );
        } catch(e) {
            // return null as response
            handleResponse(null, "ERROR", e);
        }
    }
})