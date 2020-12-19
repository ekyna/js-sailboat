import 'ol/ol.css';

import Map from 'ol/Map';
import {Control, defaults as defaultControls} from 'ol/control';
import ScaleLine from 'ol/control/ScaleLine';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import Graticule from 'ol/layer/Graticule';
import Stroke from 'ol/style/Stroke';
import WindLayer from "./layer/Wind";
//import OSM from 'ol/source/OSM';
import Stamen from "ol/source/Stamen";

const WorldMap = (target) => {
    const map = new Map({
        layers: [
            new TileLayer({
                //source: new OSM(),
                source: new Stamen({layer: 'watercolor'}),
            }),
            new Graticule({
                // the style to use for the lines, optional.
                strokeStyle: new Stroke({
                    color: 'rgba(255,120,0,0.9)',
                    width: 2,
                    lineDash: [0.5, 4],
                }),
                showLabels: true,
                //wrapX: false,
            }),
            new WindLayer({
                fading: 0.8,
                ttl: 50,
                particleColor: 'black',
                particleSize: 1.5
            })
        ],
        target: target,
        view: new View({
            center: [0, 0],
            zoom: 2,
        }),
        controls: defaultControls().extend([
            new ScaleLine({
                units: 'nautical'
            })
        ])
    });
};

export default WorldMap;
