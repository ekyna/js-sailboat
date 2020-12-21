import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {OSM} from 'ol/source';
import {Tile as TileLayer} from 'ol/layer';

import ScaleLine from 'ol/control/ScaleLine';
import Graticule from 'ol/layer/Graticule';
import {Stroke} from 'ol/style';

import WindLayer from "./layer/Wind";
import UVBuffer from "./buffer/UV";
import {Drag, vectorLayer} from "./Drag";

const WorldMap = (target) => {
    // Base map
    const map = new Map({
        target: target,
        view: new View({
            center: [0, 0],
            zoom: 2,
        }),
        layers: [
            new TileLayer({
                source: new OSM(),
                //source: new Stamen({layer: 'watercolor'}),
            }),
        ],
    });

    // Adds the lon/lat grid
    map.addLayer(new Graticule({
        // the style to use for the lines, optional.
        strokeStyle: new Stroke({
            color: 'rgba(255,120,0,0.9)',
            width: 2,
            lineDash: [0.5, 4],
        }),
        showLabels: true,
        //wrapX: false,
    }));

    // Adds the scale line
    map.addControl(new ScaleLine({
        units: 'nautical'
    }));

    // Loads wind uv data then adds wind layer
    fetch('http://localhost:8080/1p00/uv/000.wind')
        .then(uvs => uvs.arrayBuffer())
        .then(uvs => {
            const array = new Int16Array(uvs);
            const us = [];
            const vs = [];

            for (let i = 0; i < array.length; i+=2) {
                us.push(array[i] / 100);
                vs.push(array[i + 1] / 100);
            }

            map.addLayer(
                new WindLayer({
                    fading: 0.8,
                    ttl: 50,
                    particleColor: 'black',
                    particleSize: 1,
                    particleCount: 5000,
                    uvBuffer: new UVBuffer(new Float32Array(us), new Float32Array(vs), 360, 181)
                })
            )
        });

    // Drag point to get coordinates
    map.addInteraction(new Drag());
    map.addLayer(vectorLayer);
};

export default WorldMap;
