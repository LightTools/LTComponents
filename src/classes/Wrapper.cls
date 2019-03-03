/** 
  * @description Universal wrapper class based on Map.
  * @author Sergey Chepurnenko
*/
public virtual class Wrapper {

    // class variables

    /**
      * @description Map to store wrapper values.
    */
    private Map<String, Object> params {
        private get {
            // if wrapper params are null
            if (Utils.isNull(this.params)) {
                // create empty map to store wrapper values
                this.params = new Map<String, Object>();
            }
            // return params
            return this.params;
        }
        private set;
    }

    // class constructors

    /**
      * @description Default constructor without param.
    */
    public Wrapper() {}

    /**
      * @description Constructor with param.
      * @param Map<String, Object> source - wrapper parameters.
    */
    public Wrapper(Map<String, Object> source) {
        this.set(source);
    }

    /**
      * @description Constructor with param.
      * @param Object source - an instance of Map.
    */
    public Wrapper(Object source) {
        this((Map<String, Object>)source);
    }

    /**
      * @description Constructor with param.
      * @param String source - serialized javascript object.
    */
    public Wrapper(String source) {
        if (String.isNotBlank(source)) {
            this((Map<String, Object>)JSON.deserializeUntyped(source));
        }
    }

    /**
      * @description Constructor with param.
      * @param Wrapper source - another wrapper.
    */
    public Wrapper(Wrapper source) {
        if (Utils.isNotNull(source)) {
            this(source.params);
        }
    }

    // class static methods

    /**
      * @description Method to create a new instance of Wrapper.
    */
    public static Wrapper newInstance() {
        return new Wrapper();
    }

    /**
      * @description Method to create a new instance of Wrapper.
      * @param Map<String, Object> source - wrapper parameters.
    */
    public static Wrapper newInstance(Map<String, Object> source) {
        return new Wrapper(source);
    }

    /**
      * @description Method to create a new instance of Wrapper.
      * @param Object source - an instance of Map.
    */
    public static Wrapper newInstance(Object source) {
        return new Wrapper(source);
    }

    /**
      * @description Method to create a new instance of Wrapper.
      * @param String source - serialized javascript object.
    */
    public static Wrapper newInstance(String source) {
        return new Wrapper(source);
    }

    /**
      * @description Method to create a new instance of Wrapper.
      * @param Wrapper source - another wrapper.
    */
    public static Wrapper newInstance(Wrapper source) {
        return new Wrapper(source);
    }

    // class instance methods

    /**
      * @description Method to get the wrapper's keys.
      * @return Set - set of the wrapper's keys.
    */
    public virtual Set<String> keys() {
        return this.params.keySet();
    }

    /**
      * @description Method to get the wrapper's values.
      * @return List - list of the wrapper's values.
    */
    public virtual List<Object> values() {
        return this.params.values();
    }

    /**
      * @description Method to check if key exists in the wrapper.
      * @param String key - key in the wrapper to check.
      * @return Boolean - if key exists in the wrapper - true, otherwise false.
    */
    public virtual Boolean containsKey(String key) {
        return this.params.containsKey(key);
    }

    /**
      * @description Method to get a value from the wrapper.
      * @param String key - key in the wrapper.
      * @return Object - value from the wrapper.
    */
    public virtual Object get(String key) {
        return this.params.get(key);
    }

    /**
      * @description Method to get a String value from the wrapper.
      * @param String key - key in the wrapper.
      * @return String - value from the wrapper.
    */
    public virtual String getString(String key) {
        return String.valueOf(this.get(key));
    }

    /**
      * @description Method to get a Boolean value from the wrapper.
      * @param String key - key in the wrapper.
      * @return Boolean - value from the wrapper.
    */
    public virtual Boolean getBoolean(String key) {
        return Boolean.valueOf(this.get(key));
    }

    /**
      * @description Method to get a Integer value from the wrapper.
      * @param String key - key in the wrapper.
      * @return Integer - value from the wrapper.
    */
    public virtual Integer getInteger(String key) {
        return Integer.valueOf(this.get(key));
    }

    /**
      * @description Method to get a Decimal value from the wrapper.
      * @param String key - key in the wrapper.
      * @return Decimal - value from the wrapper.
    */
    public virtual Decimal getDecimal(String key) {
        return Decimal.valueOf(this.getString(key));
    }

    /**
      * @description Method to get a List value from the wrapper.
      * @param String key - key in the wrapper.
      * @return List<Object> - value from the wrapper.
    */
    public virtual List<Object> getList(String key) {
        return (List<Object>)this.get(key);
    }

    /**
      * @description Method to get a Map value from the wrapper.
      * @param String key - key in the wrapper.
      * @return Map<String, Object> - value from the wrapper.
    */
    public virtual Map<String, Object> getMap(String key) {
        return (Map<String, Object>)this.get(key);
    }

    /**
      * @description Method to get a Wrapper value from the wrapper.
      * @param String key - key in the wrapper.
      * @return Wrapper - value from the wrapper.
    */
    public virtual Wrapper getWrapper(String key) {
        return Wrapper.newInstance(this.get(key));
    }

    /**
      * @description Method to store a value in the wrapper.
      * @param String key - key in the wrapper.
      * @param Object value - value of any type.
      * @return Wrapper - itself instance.
    */
    public virtual Wrapper set(String key, Object value) {
        this.params.put(key, value);
        return this;
    }

    /**
      * @description Method to add wrapper params from a Map.
      * @param Map<String, Object> source - values to add.
      * @return Wrapper - itself instance.
    */
    public virtual Wrapper set(Map<String, Object> source) {
        if (Utils.isNotNull(source)) {
            this.params.putAll(source);
        }
        return this;
    }

    /**
      * @description Method to make the wrapper empty.
      * @return Wrapper - itself instance.
    */
    public virtual Wrapper clear() {
        this.params.clear();
        return this;
    }

    /**
      * @description Method to remove a value form the wrapper.
      * @param String key - key in the wrapper.
      * @return Object - removed value.
    */
    public virtual Object remove(String key) {
        return this.params.remove(key);
    }

    /**
      * @description Method to check if the wrapper is an empty.
      * @return String - JSON.
    */
    public virtual Boolean isEmpty() {
        return this.params.isEmpty();
    }

    /**
      * @description Method to convert the map to JSON.
      * @return String - JSON.
    */
    public virtual String toJSON() {
        return JSON.serialize(this.params);
    }

}