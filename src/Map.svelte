<script>
	import { onMount } from "svelte";
	import { mapboxgl } from "../mapboxgl";

	export let geoJSONData;

	onMount(() => {
		const map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/streets-v12",
			center: [54, 24],
			zoom: 7,
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
				paint: {
					"line-color": "#3b3b3b",
				},
			});
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
		height: 800px;
	}
</style>
