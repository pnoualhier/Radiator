import { useState, useCallback } from 'react';

export interface GeoLocationState {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoLocationState>({
    loading: false,
    latitude: null,
    longitude: null,
    error: null,
  });

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "La géolocalisation n'est pas supportée par votre navigateur",
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      position => {
        setState({
          loading: false,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      },
      error => {
        let msg = 'Erreur de géolocalisation';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Autorisation de géolocalisation refusée';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Position non disponible';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Délai dépassé pour la géolocalisation';
        }
        setState(prev => ({ ...prev, loading: false, error: msg }));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    ...state,
    requestPosition,
  };
}
