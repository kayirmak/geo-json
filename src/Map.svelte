<script>
	import { onMount } from "svelte";
	import { mapboxgl } from "../mapboxgl";
	import * as turf from "@turf/turf";
	import { writable } from "svelte/store";

	export let geoJSONData;

	let markers = writable([]);
	let newRoute = writable([]);

	onMount(() => {
		let bounds = turf.bbox(geoJSONData);
		const map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/streets-v12",
			center: [0, 22],
			zoom: 8,
			maxBounds: bounds,
		});
		map.on("load", () => {
			map.addSource("geojson-data", {
				type: "geojson",
				data: geoJSONData,
			});
			map.addLayer({
				id: "geojson-layer",
				type: "line",
				source: "geojson-data",
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "#3b3b3b",
				},
			});
		});

		let start = [0, 0];
		let end = [0, 0];
		map.on("click", (e) => {
			if (e.originalEvent.target.closest(".mapboxgl-marker")) {
				$newRoute = [];
				start = null;
				end = null;
				e.originalEvent.target.closest(".mapboxgl-marker").remove();
				$markers = $markers.filter(
					(marker) =>
						marker._element.classList !== e.originalEvent.target.closest(".mapboxgl-marker").classList
				);
			} else if ($markers.length < 2) {
				const marker = new mapboxgl.Marker({
					color: "#green",
					draggable: true,
				})
					.setLngLat([e.lngLat.lng, e.lngLat.lat])
					.addTo(map);

				marker._element.classList.add(($markers.length + 1) % 2 === 0 ? "end" : "start");

				marker.on("dragend", () => {
					const [start, end] = markersPosition(marker);

					findAndDisplayPath(start, end, "DRAGEND");
				});
				markersPosition(marker);
			}
			findAndDisplayPath(start, end);
		});

		const markersPosition = (marker) => {
			$markers = [...$markers, marker];
			start = [$markers[0]?._lngLat.lng, $markers[0]?._lngLat.lat];
			end = [$markers[1]?._lngLat.lng, $markers[1]?._lngLat.lat];
			return [start, end];
		};

		const findAndDisplayPath = (start, end, type = "") => {
			let route = findShortestPath(start, end);
			route.geometry.coordinates = $newRoute;
			showPath(route, type);
		};

		const findShortestPath = (start, end) => {
			if (start && end) {
				const startPoint = turf.point(start);
				const endPoint = turf.point(end);

				const min1 = Math.min(start[0], end[0]);
				const max1 = Math.max(start[0], end[0]);
				const min2 = Math.min(start[1], end[1]);
				const max2 = Math.max(start[1], end[1]);
				for (const item of geoJSONData.features) {
					item.geometry?.coordinates.map((coor) => {
						if (coor[0] >= min1 && coor[0] <= max1 && coor[1] >= min2 && coor[1] <= max2) {
							$newRoute = [...$newRoute, coor];
						}
					});
				}

				const route = turf.shortestPath(startPoint, endPoint, {
					features: geoJSONData.features,
				});
				return route;
			}
			return null;
		};

		const showPath = (route, type) => {
			if (!map.getSource("router")) {
				map.addSource("router", {
					type: "geojson",
					data: route,
				});
			}

			if (!map.getLayer("route-layer")) {
				map.addLayer({
					id: "route-layer",
					type: "line",
					source: "router",
					layout: {},
					paint: {
						"line-color": "#ff0000",
						"line-width": 4,
					},
				});
			} else if (type === "DRAGEND") {
				map.removeLayer("route-layer");
				map.removeSource("router");
				map.addSource("router", {
					type: "geojson",
					data: route,
				});
				map.addLayer({
					id: "route-layer",
					type: "line",
					source: "router",
					layout: {},
					paint: {
						"line-color": "#ff0000",
						"line-width": 4,
					},
				});
			}

			if (!route) {
				map.removeLayer("route-layer");
				map.removeSource("router");
			}

			const bounds = route?.geometry?.coordinates.reduce(
				(bounds, coord) => {
					return bounds.extend(coord);
				},
				new mapboxgl.LngLatBounds(start, start)
			);

			map.fitBounds(bounds, { padding: 20 });
		};
	});
</script>

<div id="map"></div>

<style>
	#map {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100vh;
	}
</style>
