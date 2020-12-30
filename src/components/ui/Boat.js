import {Feature} from "ol";
import {assign} from "ol/obj";
import Point from "ol/geom/Point";
import {fromLonLat} from "ol/proj";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

/**
 * @typedef {Object} PositionData
 * @property {number} longitude
 * @property {number} latitude
 * @property {number} speed
 * @property {number} direction
 */

/**
 * @typedef {Object} BoatData
 * @property {number} id
 * @property {string} name
 * @property {PositionData} position
 */

const shell = `<svg width="20" height="42" xmlns="http://www.w3.org/2000/svg">
<path fill="rgb(255,255,255)" d="M10.06,1.13c8.87,15.48,7.35,30.43,5.61,40H4.45 C2.71,31.57,1.19,16.61,10.06,1.13z"/>
</svg>`;

const sail = `<svg width="20" height="42" xmlns="http://www.w3.org/2000/svg">
<path fill="rgb(255,255,255)" d="M10.01,17.39c-0.18,0-0.38,0.06-0.57,0.2C4.22,20.49-1.29,31.23,1.3,38.78c-0.59-8.07,3.35-15.15,9.05-19.67 C11.31,18.45,10.77,17.39,10.01,17.39L10.01,17.39z"/>
</svg>`;

const DEFAULTS = {
    id: null,
    name: null,
    longitude: 0,
    latitude: 0,
    shellColor: 'rgb(255,51,0)',
    sailColor: 'rgb(0,64,255)',
};

export default class Boat extends Feature {
    /**
     * @param {BoatData} opt_options
     */
    constructor(opt_options) {
        const options = assign({}, DEFAULTS, opt_options);

        super({
            geometry: new Point([0, 0])
        });

        if (0 >= options.id) {
            throw "id options must be defined."
        }

        this.setId(options.id);

        this.setStyle([
            new Style({
                image: new Icon({
                    opacity: 1,
                    src: 'data:image/svg+xml;utf8,' + shell,
                    scale: 1,
                    color: options.shellColor,
                    rotation: 0
                })
            }),
            new Style({
                image: new Icon({
                    opacity: 1,
                    src: 'data:image/svg+xml;utf8,' + sail,
                    scale: 1,
                    color: options.sailColor,
                    rotation: 0
                })
            })
        ]);

        this.updatePosition(options.position);
    }

    updatePosition(position) {
        // TODO Use observable ?
        this.position = position;

        this.getGeometry().setCoordinates([
            position.longitude,
            position.latitude
        ]);

        // Converts degrees to radians
        let radian = position.direction * Math.PI / 180;

        this.getStyle()[0].getImage().setRotation(radian);
        this.getStyle()[1].getImage().setRotation(radian);
    }
}
