import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {TileJSON} from 'ol/source';
import {Tile as TileLayer} from 'ol/layer';

import ScaleLine from 'ol/control/ScaleLine';
import Graticule from 'ol/layer/Graticule';
import {Stroke} from 'ol/style';

import WindLayer from "./layer/Wind";
import UVBuffer from "./buffer/UV";
import WeatherVane from "./ui/WeatherVane";
import {Select} from "ol/interaction";

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
                source: new TileJSON({
                    url: 'https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json?secure=1',
                    crossOrigin: '',
                }),
                /*source: new OSM({
                    attributions: false
                }),*/
                //source: new Stamen({layer: 'watercolor'}),
            }),
        ],
    });

    // Adds the lon/lat grid
    map.addLayer(new Graticule({
        // the style to use for the lines, optional.
        strokeStyle: new Stroke({
            color: 'rgb(183,73,0)',
            width: 1.2,
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
    let date = new Date(),
        dd = date.getUTCDate(),
        mm = date.getUTCMonth() + 1,
        yyyy = date.getUTCFullYear(),
        hh = date.getUTCHours();

    (dd < 10) && (dd = '0' + dd);
    (mm < 10) && (mm = '0' + mm);
    (0 !== hh % 3) && (hh = parseInt(hh / 3) * 3);
    (hh < 10) && (hh = '0' + hh);

    //fetch('http://localhost:8080/1p00/uv/000.wind')
    fetch(process.env.WIND_ENDPOINT + '/wind/' + yyyy + mm + dd + '/' + hh + '/1p00-uv.wind')
        .then(uvs => uvs.arrayBuffer())
        .then(uvs => {
            const array = new Int16Array(uvs);
            const us = [];
            const vs = [];

            for (let i = 0; i < array.length; i+=2) {
                us.push(array[i] / 100);
                vs.push(array[i + 1] / 100);
            }

            const uvBuffer = new UVBuffer(new Float32Array(us), new Float32Array(vs), 360, 181);

            map.addLayer(
                new WindLayer({
                    fading: 0.95,
                    ttl: 50,
                    particleColor: 'rgb(0,65,160)',
                    particleSize: .7,
                    particleCount: 5000,
                    uvBuffer: uvBuffer
                })
            );

            //WeatherVane(uvBuffer, map)
        });

    const pickFeature = new Select({
        style: null, // DO not change selected feature's style
    });

    map.addInteraction(pickFeature);
    pickFeature.on('select', function (e) {
        console.log(e.target.getFeatures().getLength());
        /*document.getElementById('status').innerHTML =
            '&nbsp;' +
            e.target.getFeatures().getLength() +
            ' selected features (last operation selected ' +
            e.selected.length +
            ' and deselected ' +
            e.deselected.length +
            ' features)';*/
    });

    return map;
};

export default WorldMap;
