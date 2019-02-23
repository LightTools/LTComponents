({
    /**
      * @description This is a common function to call Apex methods.
      * @param Object component - component reference.
      * @param String method - name of Apex method.
      * @param Function callback - external function to handle response from server.
      * @param Object params - Apex method parameters.
      * @param Object options - optional params (background, abortable, storable, ignoreExisting - valid only if storable === true).
    */
    callApex : function(component, method, callback, params, options) {
        let apexMethod = component.get("c." + method);
        apexMethod.setParams(params);
        apexMethod.setCallback(this, $A.getCallback(function(response) {
            if (component.isValid()) {
                try {
                    this.handleApexResponse(response, callback);
                } catch(e) {
                    console.error(e);
                }
            }
        }));
        // check options
        if (!$A.util.isEmpty(options)) {
            // check if background
            if (options.background === true) {
                apexMethod.setBackground();
            }
            // check if abortable
            if (options.abortable === true) {
                apexMethod.setAbortable();
            }
            // check if storable
            if (options.storable === true) {
                apexMethod.setStorable(
                    options.hasOwnProperty("ignoreExisting") ?
                    options.ignoreExisting :
                    false
                );
            }
        }
        $A.enqueueAction(apexMethod);
    },
    /**
      * @description This is a method to handle response from Apex and create result for callback function.
      * @param Object response - response from Apex.
      * @param Function callback - external function to handle response from server.
    */
    handleApexResponse : function(response, callback) {
        // create result
        let result = {
            "isSuccess": false,
            "state": response.getState(),
            "messages": null,
            "data": null
        },
        // inner methods
        createMessage = function(type, message, code, details) {
            return {
                "type": type,
                "message": message,
                "code": code,
                "details": details
            };
        },
        createErrors = function(errors) {
            let result = [],
            createErrorMessage = function(error) {
                try {
                    // try to parse custom error
                    error = JSON.parse(error.message);
                } catch (e) {
                    // just a standard error
                }
                return createMessage(
                    "ERROR",
                    error.message,
                    error.statusCode,
                    error.details
                );
            };
            for (let error of errors) {
                // for single message
                if (error.hasOwnProperty("message")) {
                    result.push(createErrorMessage(error));
                }
                // for pageErrors
                if (error.hasOwnProperty("pageErrors")) {
                    for (let pageError of error.pageErrors) {
                        result.push(createErrorMessage(pageError));
                    };
                }
                // for fieldErrors
                if (error.hasOwnProperty("fieldErrors")) {
                    for (let field in error.fieldErrors) {
                        for (let fieldError of error.fieldErrors[field]) {
                            result.push(Object.assign(
                                createErrorMessage(fieldError), {
                                    "field": field
                                }
                            ));
                        };
                    }
                }
            };
            // log errors
            console.error(result);
            // return result
            return result;
        };
        // check state
        switch (result.state) {
            case "SUCCESS":
                // set data
                result.data = response.getReturnValue();
                // set state
                result.isSuccess = true;
                break;
            case "ERROR":
                // add the error(s) to result
                result.messages = createErrors(response.getError());
                break;
            case "INCOMPLETE":
                // add error to result
                result.messages = [
                    createMessage(
                        "ERROR",
                        "No response from server or client is offline.",
                        "503"
                    )
                ];
                break;
        }
        // return result if callback exists
        if (!$A.util.isEmpty(callback)) {
            callback(result);
        }
    }
})