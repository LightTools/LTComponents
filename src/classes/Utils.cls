/** 
  * @description Contains useful methods and classes.
  * @author Sergey Chepurnenko
*/
public with sharing class Utils {

    // class constants

    private static final String DEBUG_PROXY_CLASS_NAME = 'DebugProxy';
    private static final IDebugProxy DEBUG_PROXY = Utils.getDebugProxy();

    private static final DescribeCache DESCRIBE_CACHE {
        get {
            // if describe cache is null
            if (Utils.isNull(Utils.DESCRIBE_CACHE)) {
                // create describe cache
                Utils.DESCRIBE_CACHE = new DescribeCache();
            }
            // return instance
            return Utils.DESCRIBE_CACHE;
        }
        set;
    }

    public static final String DEBUG_SEPARATOR = ' -> ';
    public static final String WHITESPACE = ' ';
    public static final String EMPTY_STRING = '';

    // inner interfaces

    /** 
      * @description An interface for a custom debug proxy class.
      * @author Sergey Chepurnenko
    */
    public interface IDebugProxy {

        // required methods

        void debug(String sender, Object log);

    }

    // inner classes

    /** 
      * @description Describe Cache feature.
      * @author Sergey Chepurnenko
    */
    private class DescribeCache {

        // class private properties

        private Map<String, DescribeSObjectResult> objectsDescribe {
            private get {
                if (Utils.isNull(this.objectsDescribe)) {
                    this.objectsDescribe = new Map<String, DescribeSObjectResult>();
                }
                return this.objectsDescribe;  
            }
            private set;
        }

        private Map<String, Map<String, DescribeFieldResult>> fieldsDescribe {
            private get {
                if (Utils.isNull(this.fieldsDescribe)) {
                    this.fieldsDescribe = new Map<String, Map<String, DescribeFieldResult>>();
                }
                return this.fieldsDescribe;  
            }
            private set;
        }

        // class public properties

        /**
          * @description Global Describe info. 
        */
        public Map<String, SObjectType> globalDescribe {
            public get {
                if (Utils.isNull(this.globalDescribe)) {
                    this.globalDescribe = Schema.getGlobalDescribe();
                }
                return this.globalDescribe;  
            }
            private set;
        }

        /**
          * @description Method to get sObject's describe result.
          * @param String objectName - sObject's name.
          * @return DescribeSObjectResult - describe of sObject.
        */
        public DescribeSObjectResult getObjectDescribe(String objectName) {
            // if sObject exists
            if (!this.objectsDescribe.containsKey(objectName) &&
                    this.globalDescribe.containsKey(objectName)) {
                // add sObject describe to cache
                this.objectsDescribe.put(
                    objectName,
                    this.globalDescribe.get(objectName).getDescribe()
                );  
            }
            // return result
            return this.objectsDescribe.get(objectName);
        }

        /**
          * @description Method to get sObject's Field describe result.
          * @param String fieldName - name of sObject's field name.
          * @param String objectName - sObject's name.
          * @return DescribeFieldResult - describe of sObject.
        */
        public DescribeFieldResult getFieldDescribe(String fieldName, String objectName) {
            // create empty result
            DescribeFieldResult result;
            // get object describe
            DescribeSObjectResult objectDescribe = this.getObjectDescribe(objectName);
            // validate describe result
            if (Utils.isNotNull(objectDescribe)) {
                // get object fields from describe
                Map<String, SObjectField> objectFields = objectDescribe.fields.getMap();
                // initialize current fields cache
                Map<String, DescribeFieldResult> objectFieldsCache = this.fieldsDescribe.get(objectName);
                // if cache is empty (this should happen only for first time)
                if (Utils.isNull(objectFieldsCache)) {
                    // create a new cache
                    objectFieldsCache = new Map<String, DescribeFieldResult>();
                    // add all fields from object to cache
                    for (SObjectField objectField : objectDescribe.fields.getMap().values()) {
                        // get current field describe
                        DescribeFieldResult objectFieldDescribe = objectField.getDescribe();
                        // add field name and describe to cache
                        objectFieldsCache.put(objectFieldDescribe.getName(), objectFieldDescribe);
                        // in case of reference field
                        if (objectFieldDescribe.getType() == DisplayType.Reference) {
                            // add reference name and describe to cache
                            objectFieldsCache.put(objectFieldDescribe.getRelationshipName(), objectFieldDescribe);
                        }
                    }
                    // update fields cache for oobject
                    this.fieldsDescribe.put(objectName, objectFieldsCache);
                }
                // set result
                result = objectFieldsCache.get(fieldName);
            }
            // return result
            return result;
        }

    }

    /** 
      * @description Represent of sObject field.
      * @author Sergey Chepurnenko
    */
    private class Field {

        // class constants

        private final String SEPARATOR_REFERENCE = '.';

        // class variables

        private DescribeFieldResult describe;

        // class constructors

        /**
          * @description Constructor for the class.
          * @param String field - name of field.
          * @param DescribeSObjectResult objectDescribe - describe of sObject.
        */
        public Field(String fieldName, DescribeSObjectResult objectDescribe) {
            // validate params
            if (String.isNotBlank(fieldName) &&
                    Utils.isNotNull(objectDescribe)) {
                // check field type
                if (fieldName.contains(this.SEPARATOR_REFERENCE)) {
                    // in case of referecne, get first field from chain
                    String objectReference = fieldName.substringBefore(this.SEPARATOR_REFERENCE).replace('__r', '__c');
                    // get reference field describe
                    DescribeFieldResult objectReferenceDescribe = Utils.DESCRIBE_CACHE.getFieldDescribe(
                        objectReference,
                        objectDescribe.getName()
                    );
                    // if this reference field is Reference and is accessible
                    if (Utils.isNotNull(objectReferenceDescribe) &&
                            objectReferenceDescribe.isAccessible()) {
                        // get the other fields from the chain
                        String objectReferenceFields = fieldName.substringAfter(this.SEPARATOR_REFERENCE);
                        // get describe for the first reference
                        this.describe = new Field(
                            objectReferenceFields,
                            Utils.getDescribe(objectReferenceDescribe.getReferenceTo()[0])
                        ).getFieldDescribe();
                    }
                } else {
                    // for normal field just get describe from cache
                    this.describe = Utils.DESCRIBE_CACHE.getFieldDescribe(
                        fieldName,
                        objectDescribe.getName()
                    );
                }
            }
        }

        // class public methods

        /**
          * @description Method to get describe for a field.
          * @return DescribeFieldResult - field describe.
        */
        public DescribeFieldResult getFieldDescribe() {
            return this.describe;
        }

    }

    /** 
      * @description Enhanced Exception class.
      * @author Sergey Chepurnenko
    */
    public virtual class CustomException extends Exception {

        // class constants

        private final String KEY_CODE = 'statusCode';
        private final String KEY_MESSAGE = 'message';

        // class methods

        /**
          * @description Method to set exception's message with code.
          * @param String code - specific exception's code.
          * @param String message - exception's message.
        */
        public virtual void setMessage(String code, String message) {
            // call method from super class
            super.setMessage(
                // wrap code and message to JSON
                new Wrapper().set(this.KEY_CODE, code)
                             .set(this.KEY_MESSAGE, message)
                             .toJSON()
            );
        }
    }

    // class private methods

    private static IDebugProxy getDebugProxy() {
        // create empty result
        IDebugProxy result;
        // check if Debug Proxy implementation exists
        Type debugProxy = Type.forName(Utils.DEBUG_PROXY_CLASS_NAME);
        // if Debug Proxy class exists
        if (Utils.isNotNull(debugProxy)) {
            // try to create an instance
            try {
                // create an instance
                result = (IDebugProxy)debugProxy.newInstance();
            } catch (Exception e) {
                // class doesn't implement IDebugProxy interface
            }
        }
        // return result
        return result;
    }

    // class public methods

    // --------------------------------------------------------------------------------------------------------------------------------------
    // Generic
    // --------------------------------------------------------------------------------------------------------------------------------------

    public static void debug(String sender, Object log) {
        // check if Debug Proxy is not null
        if (Utils.isNotNull(Utils.DEBUG_PROXY)) {
            Utils.DEBUG_PROXY.debug(sender, log);
        } else { // if is null - use system.debug
            System.debug((
                String.isNotBlank(sender) ?
                sender + Utils.DEBUG_SEPARATOR :
                Utils.EMPTY_STRING
            ) + log);
        }
    }

    public static void debug(Object log) {
        Utils.debug(null, log);
    }

    public static Boolean isNull(Object source) {
        return source == null;
    }

    public static Boolean isNotNull(Object source) {
        return !Utils.isNull(source);
    }

    // --------------------------------------------------------------------------------------------------------------------------------------
    // Exceptions
    // --------------------------------------------------------------------------------------------------------------------------------------

    /**
      * @description Method to convert Apex exceptions to Aura exceptions.
      * @param String sender - class or method name.
      * @param Exception e - Apex exception.
    */
    public static Exception createAuraException(String sender, Exception e) {
        // debug exception
        Utils.debug(sender, e);
        // no need to wrap DML exceptions
        if (e instanceof DmlException) {
            // just return DmlException
            return e;
        }
        // wrap exception to AuraHandledException 
        return new AuraHandledException(e.getMessage());
    }

    /**
      * @description Method to convert Apex exceptions to Aura exceptions.
      * @param Exception e - Apex exception.
    */
    public static Exception createAuraException(Exception e) {
        return Utils.createAuraException(null, e);
    }

    // --------------------------------------------------------------------------------------------------------------------------------------
    // Describe
    // --------------------------------------------------------------------------------------------------------------------------------------

    public static Map<String, SObjectType> getGlobalDescribe() {
        return Utils.DESCRIBE_CACHE.globalDescribe;
    }

    public static DescribeSObjectResult getDescribe(String objectName) {
        return Utils.DESCRIBE_CACHE.getObjectDescribe(objectName);
    }

    public static DescribeSObjectResult getDescribe(SObjectType objectType) {
        return Utils.getDescribe(String.valueOf(objectType));
    }

    public static DescribeFieldResult getDescribe(String fieldName, DescribeSObjectResult objectDescribe) {
        return new Field(
            fieldName,
            objectDescribe
        ).getFieldDescribe();
    }

    public static DescribeFieldResult getDescribe(String fieldName, String objectName) {
        return Utils.getDescribe(
            fieldName,
            Utils.getDescribe(objectName)
        );
    }

    public static DescribeFieldResult getDescribe(String fieldName, SObjectType objectType) {
        return Utils.getDescribe(
            fieldName,
            String.valueOf(objectType)
        );
    }

    // --------------------------------------------------------------------------------------------------------------------------------------
    // FLS
    // --------------------------------------------------------------------------------------------------------------------------------------

    public static Boolean isAccessible(String fieldName, DescribeSObjectResult objectDescribe) {
        // get field describe
        DescribeFieldResult fieldDescribe = Utils.getDescribe(fieldName, objectDescribe);
        // create result
        return (
            Utils.isNotNull(fieldDescribe) ?
            fieldDescribe.isAccessible() :
            false
        );
    }

    public static Boolean isAccessible(String fieldName, String objectName) {
        return Utils.isAccessible(
            fieldName,
            Utils.getDescribe(objectName)
        );
    }

    public static Boolean isCreateable(String fieldName, DescribeSObjectResult objectDescribe) {
        // get field describe
        DescribeFieldResult fieldDescribe = Utils.getDescribe(fieldName, objectDescribe);
        // create result
        return (
            Utils.isNotNull(fieldDescribe) ?
            fieldDescribe.isCreateable() :
            false
        );
    }

    public static Boolean isCreateable(String fieldName, String objectName) {
        return Utils.isCreateable(
            fieldName,
            Utils.getDescribe(objectName)
        );
    }

    public static Boolean isUpdateable(String fieldName, DescribeSObjectResult objectDescribe) {
        // get field describe
        DescribeFieldResult fieldDescribe = Utils.getDescribe(fieldName, objectDescribe);
        // create result
        return (
            Utils.isNotNull(fieldDescribe) ?
            fieldDescribe.isUpdateable() :
            false
        );
    }

    public static Boolean isUpdateable(String fieldName, String objectName) {
        return Utils.isUpdateable(
            fieldName,
            Utils.getDescribe(objectName)
        );
    }

}