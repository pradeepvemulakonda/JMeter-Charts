var ObjectID = require('mongodb').ObjectID,
	CollectionDriver;
/**
 * A facade to mongodb driver
 * @param db
 * @returns a new instance of CollectionDriver
 */
CollectionDriver = function(db) {
	  this.db = db;
};
	
/**
 * fetch a collection from mongodb
 * @param collectionName name of the collection
 * @param callback - call back to be executed once fetched
 */
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
	this.db.collection(collectionName, function(error, fetchedCollection) {
		if( error ) {
			callback(error);
		}
		else {
			callback(null, fetchedCollection);
		}
	});
};	

/**
 * Returns all the objects found in the collection
 * @param collectionName
 * @param callback
 */
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, fetchedCollection) {
      if( error ) {
    	  callback(error);
      } else {
        fetchedCollection.find().toArray(function(error, results) {
          if( error ) { 
        	  callback(error);
          } else {
        	  callback(null, results);
          }
        });
      }
    });
};

/**
 * This filters the fetched collection based on id and returns the single row
 * @param collectionName
 * @param id id to search for in the fetched collection
 * @param callback
 */
CollectionDriver.prototype.get = function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, fetchedCollection) {
        if (error) {
        	callback(error);
        } else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            if (!checkForHexRegExp.test(id)) {
            	callback({error: "invalid id"});
            } else {
            	fetchedCollection.findOne({'_id':new ObjectID(id)}, function(error,doc) {
            		if (error) {
            			callback(error);
                	} else {
                		callback(null, doc);
                	}
            	});
            }	
        }
    });
};

/**
 * Saves the passed in project object to the mongodb database
 * @param collectionName The name of the collection to save.
 * @param obj the object that needs to be saved as part of the collection.
 * @param callback that is executed when the data is saved successfully.
 */
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if( error ){
    	  callback(error);
      } else {
        obj.created_at = new Date();
        the_collection.insert(obj, function() {
          callback(null, obj);
        });
      }
    });
};

/**
 * Update the passed in collection based on the object id for the collection
 * @param collectionName
 * @param obj
 * @param entityId
 * @param callback
 */
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error){
        	callback(error);
        } else {
            obj._id = ObjectID(entityId); //A convert to a real obj id
            obj.updated_at = new Date(); //B
            the_collection.save(obj, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, obj);
            });
        }
    });
};

/**
 * close the passed in db instance
 */
CollectionDriver.prototype.shutdown = function() {
	console.info('CLosing DB instance for db'+ this.db.toString());
	this.db.close();
};

exports.CollectionDriver = CollectionDriver;