({
    /**
      * @description Method to run the batch.
      * @param Object component - component reference.
      * @param Object config - set of parameters for the batch. Should contain callback methods (handlers): 'start', 'execute', 'finish', 'fail', and value 'chunk' to set chunk size.
      * @return Boolean - returns true if the batch was runned successfully, otherwise returns false.
    */
    run : function(component, config) {
        // check if config is not empty and batch is not preparing or processing and save current state to result
        const result = !$A.util.isEmpty(config) && !this.isProcessingOrPreparing(component);
        // run batch if result = true
        if (result === true) {
            // initialize batch values
            const chunk = (
                config.hasOwnProperty("chunk") && !$A.util.isEmpty(config.chunk) ?
                config.chunk :
                1
            );
            let counter = 0,
            scope = null,
            data = null,
            eof = true,
            // initialize common callback method
            callback = $A.getCallback(function(response) {
                if (component.isValid()) {
                    // check if batch is not aborted
                    if (component.get("v.status") !== "aborted") { 
                        // check error
                        if (!$A.util.isEmpty(response.error)) {
                            this.fail(component, response.entry, response.error, config.fail);
                        } else {
                            // check caller name to select action
                            switch (response.entry) {
                                case this.start.name: // start
                                    // copy values
                                    scope = response.scope;
                                    eof = response.eof;
                                    // call execute
                                    this.execute(component, scope, data, counter, config.execute, callback);
                                    break;
                                case this.execute.name: // execute
                                    // copy values
                                    data = response.data;
                                    // increase counter
                                    counter++;
                                    // check is counter = chunk size or eof from response === true
                                    if (counter >= chunk || response.eof === true) {
                                        // reset counter
                                        counter = 0;
                                        // check main eof flag
                                        if (eof === true) {
                                            // call finish method
                                            this.finish(component, scope, data, config.finish);
                                        } else {
                                            // call start method again
                                            this.start(component, scope, config.start, callback);
                                        }
                                    } else {
                                        // call execute again
                                        this.execute(component, scope, data, counter, config.execute, callback);
                                    }
                                    break;
                            }
                        }                 
                    }
                }
            }.bind(this));
            // call start method
            this.start(component, scope, config.start, callback);
        }
        // return result
        return result;
    },
    /**
      * @description Method to abort the batch.
      * @param Object component - component reference.
      * @return Boolean - returns true if the batch was aborted successfully, otherwise returns false.
    */
    abort : function(component) {
        // get batch status
        const result = this.isProcessingOrPreparing(component);
        // if status is true
        if (result === true) {
            // abort the batch
            component.set("v.status", "aborted");
        }
        // return result
        return result;
    },
    /**
      * @description Method to get status of the batch.
      * @param Object component - component reference.
      * @return Boolean - returns true if status of the batch is preparing or processing, otherwise returns false.
    */
    isProcessingOrPreparing : function(component) {
        return ["preparing", "processing"].indexOf(component.get("v.status")) !== -1;
    },
    /**
      * @description Method to perform the first iteration of the batch.
      * @param Object component - component reference.
      * @param Object scope - data returned by handler.
      * @param Function handler - external callback function to handle the iteration. 
      * @param Function callback - internal function to catch result of the method.
    */
    start : function(component, scope, handler, callback) {
        // set batch status
        component.set("v.status", "preparing");
        // initialize promise
        new Promise($A.getCallback(function(iterationCallback) {
            if (component.isValid()) {
                if (!$A.util.isEmpty(handler)) {
                    try {
                        // call handler
                        handler(scope, $A.getCallback(function(response, eof, error) {
                            if (component.isValid()) {
                                // return response
                                iterationCallback({
                                    "scope": response,
                                    "eof": eof,
                                    "error": error
                                }); 
                            }
                        }));
                    } catch(e) {
                        // catch error
                        iterationCallback({
                            "error": e
                        });
                    }
                } else {
                    iterationCallback({});
                }
            }
        }.bind(this))).then($A.getCallback(function(result) {
            if (component.isValid()) {
                // call original callback with response
                callback({
                    "entry": this.start.name, // set function name
                    "scope": (
                        !$A.util.isEmpty(result.scope) ?
                        result.scope :
                        null // reset old data
                    ),
                    "eof": (
                        !$A.util.isEmpty(result.eof) ?
                        result.eof :
                        true
                    ),
                    "error": result.error
                });
            }
        }.bind(this)));
    },
    /**
      * @description Method to perform iterations of the batch based on chunk size.
      * @param Object component - component reference.
      * @param Object scope - data the coming from 'start' method for further processing.
      * @param Object data - data returned by handler.
      * @param Integer index - index of iteration.
      * @param Function handler - external callback function to handle the iteration. 
      * @param Function callback - internal function to catch result of the method.
    */
    execute : function(component, scope, data, index, handler, callback) {
        // set batch status
        component.set("v.status", "processing");
        // initialize promise
        new Promise($A.getCallback(function(iterationCallback) {
            if (component.isValid()) {
                if (!$A.util.isEmpty(handler)) {
                    try {
                        // call handler
                        handler(scope, data, index, $A.getCallback(function(response, eof, error) {
                            if (component.isValid()) {
                                // return response
                                iterationCallback({
                                    "data": response,
                                    "eof": eof,
                                    "error": error
                                }); 
                            }
                        }));
                    } catch(e) {
                        // catch error
                        iterationCallback({
                            "error": e
                        });
                    }
                } else {
                    iterationCallback({});
                }
            }
        }.bind(this))).then($A.getCallback(function(result) {
            if (component.isValid()) {
                // call original callback with response
                callback({
                    "entry": this.execute.name, // set function name
                    "data": (
                        !$A.util.isUndefined(result.data) ?
                        result.data :
                        data // save old data
                    ),
                    "eof": (
                        !$A.util.isEmpty(result.eof) ?
                        result.eof :
                        true
                    ),
                    "error": result.error
                });
            }
        }.bind(this)));
    },
    /**
      * @description Method to perform the last iteration of the batch.
      * @param Object component - component reference.
      * @param Object scope - data returned by 'start' method(s).
      * @param Object data - data returned by 'execute' method(s).
      * @param Function handler - external callback function to handle the iteration. 
      * @param Function callback - internal function to catch result of the method.
    */
    finish : function(component, scope, data, handler, callback) {
        // set batch status
        component.set("v.status", "completed");
        // check handler
        if (!$A.util.isEmpty(handler)) {
            try {
                handler(scope, data);
            } catch(e) {
                // return error
                callback({
                    "entry": this.finish.name, // set function name
                    "error": e
                });
            }
        }        
    },
    /**
      * @description Method to handle errors in the batch.
      * @param Object component - component reference.
      * @param Object entry - name of the failed method.
      * @param Object error - just an error message.
      * @param Function handler - external callback function to handle the iteration. 
    */
    fail : function(component, entry, error, handler) {
        // set batch status
        component.set("v.status", "failed");
        // call handler
        try {
            handler(entry, error);
        } catch(e) {
            // if handler fails, log error
            console.error(entry, error);
        }
    }
})