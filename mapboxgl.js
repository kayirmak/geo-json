import mapboxgl from "mapbox-gl";

// https://docs.mapbox.com/help/glossary/access-token/
mapboxgl.accessToken = "pk.eyJ1Ijoia2F5aXJtYWsiLCJhIjoiY2x3OHk3NTV4MjlqaDJxcHlkZTB2MWN2ZiJ9.0e_X94AohsSOn_26o4Ywyw";

const key = Symbol();

export { mapboxgl, key };
