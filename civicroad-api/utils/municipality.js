const MUNICIPALITY_CENTERS = [
  {
    name: "Agadir",
    latitude: 30.42018,
    longitude: -9.59815,
  },
  {
    name: "Inezgane",
    latitude: 30.35535,
    longitude: -9.53639,
  },
  {
    name: "Ait Melloul",
    latitude: 30.34164,
    longitude: -9.50356,
  },
  {
    name: "Taghazout",
    latitude: 30.5456,
    longitude: -9.7097,
  },
  {
    name: "Aourir",
    latitude: 30.4924,
    longitude: -9.6355,
  },
  {
    name: "Drargua",
    latitude: 30.3804,
    longitude: -9.48269,
  },
  {
    name: "Dcheira El Jihadia",
    latitude: 30.3728,
    longitude: -9.53889,
  },
  {
    name: "Lqliaa",
    latitude: 30.2942,
    longitude: -9.45444,
  },
  {
    name: "Temsia",
    latitude: 30.3633,
    longitude: -9.41444,
  },
];

const MAX_ASSIGNMENT_DISTANCE_KM = 20;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(fromLatitude, fromLongitude, toLatitude, toLongitude) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const startLatitude = toRadians(fromLatitude);
  const endLatitude = toRadians(toLatitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function determineMunicipalityFromCoordinates(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  let closestMunicipality = null;
  let shortestDistanceKm = Number.POSITIVE_INFINITY;

  for (const municipality of MUNICIPALITY_CENTERS) {
    const distanceKm = calculateDistanceKm(
      latitude,
      longitude,
      municipality.latitude,
      municipality.longitude
    );

    if (distanceKm < shortestDistanceKm) {
      shortestDistanceKm = distanceKm;
      closestMunicipality = municipality.name;
    }
  }

  return shortestDistanceKm <= MAX_ASSIGNMENT_DISTANCE_KM
    ? closestMunicipality
    : null;
}

module.exports = {
  MUNICIPALITY_CENTERS,
  determineMunicipalityFromCoordinates,
};
