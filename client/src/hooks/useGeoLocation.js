
export const useGeoLocation = () => {
  const getGeoLocation = async () => {
  try {
    if (!navigator.geolocation) {
      return null;
    }

    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // Catch permission denied and return null
          console.warn("Geolocation error:", error);
          resolve(null);
        }
      );
    });
  } catch (err) {
    console.error("getGeoLocation failed:", err);
    return null;
  }
};

  return { getGeoLocation };
};
