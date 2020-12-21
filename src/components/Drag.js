import {toLonLat} from "ol/proj";
import {Pointer as PointerInteraction} from "ol/interaction";
import Feature from "ol/Feature";
import {Point} from "ol/geom";
import {Vector as VectorLayer} from "ol/layer";
import {Vector as VectorSource} from "ol/source";
import {Fill, Icon, Stroke, Style} from "ol/style";
import logo from "../image/icon.png";

/**
 * @param {import("ol/MapBrowserEvent").default} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
function handleDownEvent(evt) {
    let map = evt.map;

    let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
}

/**
 * @param {import("ol/MapBrowserEvent").default} evt Map browser event.
 */
function handleDragEvent(evt) {
    let deltaX = evt.coordinate[0] - this.coordinate_[0];
    let deltaY = evt.coordinate[1] - this.coordinate_[1];

    let geometry = this.feature_.getGeometry();
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
}

/**
 * @param {import("ol/MapBrowserEvent").default} evt Event.
 */
function handleMoveEvent(evt) {
    if (this.cursor_) {
        let map = evt.map;
        let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
        });

        let element = evt.map.getTargetElement();
        if (feature) {
            if (element.style.cursor !== this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
}

/**
 * @return {boolean} `false` to stop the drag sequence.
 */
function handleUpEvent() {
    let coords = this.feature_.getGeometry().getCoordinates();
    console.log(coords, toLonLat(coords));

    this.coordinate_ = null;
    this.feature_ = null;
    return false;
}

export const Drag = /*@__PURE__*/(function (PointerInteraction) {
    function Drag() {
        PointerInteraction.call(this, {
            handleDownEvent: handleDownEvent,
            handleDragEvent: handleDragEvent,
            handleMoveEvent: handleMoveEvent,
            handleUpEvent: handleUpEvent,
        });

        /**
         * @type {import("ol/coordinate").Coordinate}
         * @private
         */
        this.coordinate_ = null;

        /**
         * @type {string|undefined}
         * @private
         */
        this.cursor_ = 'pointer';

        /**
         * @type {Feature}
         * @private
         */
        this.feature_ = null;

        /**
         * @type {string|undefined}
         * @private
         */
        this.previousCursor_ = undefined;
    }

    if ( PointerInteraction ) Drag.__proto__ = PointerInteraction;
    Drag.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
    Drag.prototype.constructor = Drag;

    return Drag;
}(PointerInteraction));


let pointFeature = new Feature(new Point([0, 0]));

export const vectorLayer = new VectorLayer({
    source: new VectorSource({
        features: [pointFeature],
    }),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 0.95,
            src: logo,
        }),
        stroke: new Stroke({
            width: 3,
            color: [255, 0, 0, 1],
        }),
        fill: new Fill({
            color: [0, 0, 255, 0.6],
        }),
    }),
});
vectorLayer.setZIndex(1)
