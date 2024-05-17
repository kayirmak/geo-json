<script>
	import { onMount } from "svelte";
	import { mapboxgl } from "../mapboxgl";
	import * as turf from "@turf/turf";
	import { writable } from "svelte/store";

	export let geoJSONData;

	let markers = writable([]);

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

			map.addSource("route", {
				type: "geojson",
				data: {
					type: "Feature",
					properties: {},
					geometry: {
						type: "LineString",
						coordinates: [
							// [51.0338011, 24.4636136], // начальная точка
							// [56.4232657, 24.8338091], // конечная точка
						],
					},
				},
			});

			map.addLayer({
				id: "route",
				type: "line",
				source: "route",
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "red",
					"line-width": 8,
				},
			});
		});

		map.on("click", (e) => {
			if (e.originalEvent.target.closest(".mapboxgl-marker")) {
				e.originalEvent.target.closest(".mapboxgl-marker").remove();
				// console.log(e.originalEvent.target.closest(".mapboxgl-marker"));
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
				$markers = [...$markers, marker];
				// console.log("dblclick", marker._element);
			}
		});
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
