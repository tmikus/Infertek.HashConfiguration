if (!window.Infertek)
    window.Infertek = {};

window.Infertek.HashConfiguration = function (configuration, autoUpdateHash) {
    /// <summary>
    /// Initializes hash configuration for specified view model.
    /// </summary>
    /// <param name="configuration">View model to bind to hash configuration.</param>
    /// <param name="autoUpdateHash" type="Boolean">Does hash should be updated on ANY view model's change?</param>
    
    var excludeFromHashConfiguration = "excludeFromHashConfiguration";
	
	var dateTimeRegularExpression = /^(\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})$/gi;
    
    var loadConfigurationFromHash = function () {
        /// <summary>
        /// Loads configuration from hash and returns object.
        /// </summary>
        /// <returns type="Object">Object containing parsed configuration.</returns>
        
        if (location.hash == '')
            return null;
        
        var splittedHash = location.hash.substr(1).split('&');
        var hashConfig = {};
        for (var index = 0; index < splittedHash.length; index++) {
            var splittedProp = splittedHash[index].split('=');
            
            // Checking if property is valid ( is this prop. having key and value )
            if (splittedProp.length != 2)
                continue;
            
            hashConfig[decodeURI(splittedProp[0])] = decodeURI(splittedProp[1]);
        }
        return hashConfig;
    };
    
    var updateHashAccordinglyToConfiguration = function () {
        /// <summary>
        /// Updates hash accordingly to configuration.
        /// </summary>
        
        var hashString = '';
        for (var propertyName in configuration) {
            var propertyValue = configuration[propertyName];
            if (propertyValue && propertyValue[excludeFromHashConfiguration])
                continue;
            
            if ((ko.isObservable(propertyValue) && !propertyValue.pop && !propertyValue.push) || ko.isComputed(propertyValue))
                propertyValue = propertyValue();
            else if (typeof propertyValue === 'function')
                continue;
			
			if (Object.prototype.toString.call(propertyValue) == '[object Date]')
				propertyValue = propertyValue.format('yyyy-M-d h:m:s');
            
            if (!propertyValue || propertyValue === '')
                continue;
            
            if (hashString)
                hashString += '&';
            
            hashString += encodeURI(propertyName);
            hashString += '=';
            
            if (propertyValue)
                hashString += encodeURI(propertyValue)
        }
        
        window.Infertek.HashConfiguration.isUpdatingHash = true;
        location.hash = hashString;
        window.Infertek.HashConfiguration.isUpdatingHash = false;
    };
    
    var updateConfigurationAccordinglyToHash = function () {
        
        if (window.Infertek.HashConfiguration.isUpdatingHash)
            return;
        
        var hashConfiguration = loadConfigurationFromHash();
        if (hashConfiguration) {
            for (var propertyName in hashConfiguration) {
                if (configuration[propertyName] === undefined || configuration[propertyName][excludeFromHashConfiguration])
                    continue;
					
				var value = hashConfiguration[propertyName];
				
				dateTimeRegularExpression.lastIndex = 0;
				
				var dateTimeMatches = dateTimeRegularExpression.exec(value);
				if (dateTimeMatches != null) {
					value = new Date(parseInt(dateTimeMatches[1]),
									 parseInt(dateTimeMatches[2]) - 1,
									 parseInt(dateTimeMatches[3]),
									 parseInt(dateTimeMatches[4]),
									 parseInt(dateTimeMatches[5]),
									 parseInt(dateTimeMatches[6]));
				}
                
                if ((ko.isObservable(configuration[propertyName]) && !configuration[propertyName].pop && !configuration[propertyName].push) || ko.isComputed(configuration[propertyName]))
                    configuration[propertyName](value);
                else if (typeof configuration[propertyName] === 'function')
                    continue;
                else
                    configuration[propertyName] = value;
            }
        }
    };
    
    updateConfigurationAccordinglyToHash();
    
    if (autoUpdateHash) {
        for (var propertyName in configuration) {
            var propertyValue = configuration[propertyName];
            if (!propertyValue || propertyValue[excludeFromHashConfiguration])
                continue;
            
            if ((ko.isObservable(propertyValue) && !propertyValue.pop && !propertyValue.push) || ko.isComputed(propertyValue)) {
                propertyValue.subscribe(function () {
                    updateHashAccordinglyToConfiguration();
                });
            }
        }
    }
    
    $(window).on("hashchange", updateConfigurationAccordinglyToHash);
    
    this.updateHash = updateHashAccordinglyToConfiguration;
};

window.Infertek.HashConfiguration.excludeFromHash = function (property) {
    /// <summary>
    /// Excludes specfied property from hash configuration.
    /// </summary>
    /// <param name="property" type="Object">Property of view model to exclude.</param>
    
    if (Array.isArray(property)) {
        for (var index = 0; index < property.length; index++) {
            property[index].excludeFromHashConfiguration = true;
        }
    } else {
        property.excludeFromHashConfiguration = true;
    }
};

if (!Array.isArray)
    Array.isArray = function(array) {
        return array instanceof Array;   
    }

window.Infertek.HashConfiguration.isUpdatingHash = false;