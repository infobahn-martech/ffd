import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useGoogleMaps } from "../../../../../../hooks/useGoogleMaps";

const LocationAutocomplete = ({ value, onChange, placeholder, className = "", onLocationSelect }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const { isLoaded, error } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || error) return;

    // Initialize Google Places Autocomplete
    if (!autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['geocode', 'establishment'], // Search for addresses and places
          fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components'],
        }
      );

      // Add place changed listener
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place && place.formatted_address) {
          const locationData = {
            address: place.formatted_address,
            name: place.name || place.formatted_address,
            placeId: place.place_id,
            coordinates: place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            } : null,
            addressComponents: place.address_components || [],
          };

          setInputValue(place.formatted_address);
          
          // Call onChange with the formatted address
          const syntheticEvent = { target: { value: place.formatted_address } };
          onChange(syntheticEvent);

          // Call optional onLocationSelect callback with full location data
          if (onLocationSelect) {
            onLocationSelect(locationData);
          }
        }
      });
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, error, onChange, onLocationSelect]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(e);
  };

  return (
    <div className={`cf-input location-autocomplete ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder || "Search for a location..."}
        disabled={!isLoaded || !!error}
      />
      {error && (
        <div className="location-autocomplete-error">
          {error}
        </div>
      )}
      {!isLoaded && !error && (
        <div className="location-autocomplete-loading">
          Loading location services...
        </div>
      )}
    </div>
  );
};

LocationAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  onLocationSelect: PropTypes.func, // Optional callback with full location data
};

export default LocationAutocomplete;

