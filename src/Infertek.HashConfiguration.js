if (!window.Infertek)
    window.Infertek = {};

window.Infertek.HashConfiguration = function (configuration, autoUpdateHash) {
    
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
            if (ko.isObservable(propertyValue) || ko.isComputed(propertyValue))
                propertyValue = propertyValue();
            else if (typeof propertyValue === 'function')
                continue;
            
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
                if (configuration[propertyName] === undefined)
                    continue;
                
                if (ko.isObservable(configuration[propertyName]) || ko.isComputed(configuration[propertyName]))
                    configuration[propertyName](hashConfiguration[propertyName]);
                else if (typeof configuration[propertyName] === 'function')
                    continue;
                else
                    configuration[propertyName] = hashConfiguration[propertyName];
            }
        }
    };
    
    updateConfigurationAccordinglyToHash();
    
    if (autoUpdateHash) {
        for (var propertyName in configuration) {
            var propertyValue = configuration[propertyName];
            if (ko.isObservable(propertyValue) || ko.isComputed(propertyValue)) {
                propertyValue.subscribe(function () {
                    updateHashAccordinglyToConfiguration();
                });
            }
        }
    }
    
    $(window).on("hashchange", updateConfigurationAccordinglyToHash);
    
    this.updateHash = updateHashAccordinglyToConfiguration;
};

window.Infertek.HashConfiguration.isUpdatingHash = false;