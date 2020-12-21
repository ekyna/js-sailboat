import CanvasLayerRenderer from "ol/renderer/canvas/Layer";
import {apply, makeScale, makeInverse, toString as transformToString} from "ol/transform";

const tmpPreviousCenterPixel = [];

/**
 * @param {import("ol/PluggableMap").FrameState} frameState
 * @param {HTMLCanvasElement} canvas
 * @returns {boolean}
 */
function resizeCanvasIfNeeded(frameState, canvas) {
    let [width, height] = frameState.size;
    width *= frameState.pixelRatio;
    height *= frameState.pixelRatio;
    // if (frameState.viewState.rotation !== 0) {
    //   width = Math.max(width, height) * 1.5;
    //   height = width;
    // }

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
}

export default class WindLayerRenderer extends CanvasLayerRenderer {
    /**
     * @param {import("../layer/Wind.js").default} windLayer Wind layer.
     */
    constructor(windLayer) {
        super(windLayer);

        this.canvases_ = [
            document.createElement('canvas'),
            document.createElement('canvas') // minor: could make it lazy
        ];

        this.previousFrame_ = {
            canvasId: 0,
            centerX: 0,
            centerY: 0,
            resolution: Infinity,
        };
    }

    /**
     * @inheritDoc
     */
    getFeatures(pixel) {
        return new Promise(
            function (resolve) {
                return resolve([]);
            }
        );
    }

    /**
     * @inheritDoc
     */
    prepareFrame(frameState) {
        const layer = this.getLayer();

        const previousCanvas = this.canvases_[this.previousFrame_.canvasId];
        let nextCanvas = previousCanvas;
        const resized = resizeCanvasIfNeeded(frameState, previousCanvas);
        let nextCanvasId = this.previousFrame_.canvasId;

        const [currentCenterX, currentCenterY] = frameState.viewState.center;
        const nextResolution = frameState.viewState.resolution;
        if (!resized && this.previousFrame_.resolution === nextResolution) {
            tmpPreviousCenterPixel[0] = this.previousFrame_.centerX;
            tmpPreviousCenterPixel[1] = this.previousFrame_.centerY;
            apply(frameState.coordinateToPixelTransform, tmpPreviousCenterPixel);

            const dx = tmpPreviousCenterPixel[0] - frameState.size[0] / 2;
            const dy = tmpPreviousCenterPixel[1] - frameState.size[1] / 2;
            if (dx !== 0 || dy !== 0) {
                nextCanvasId = (nextCanvasId + 1) % 2;
                nextCanvas = this.canvases_[nextCanvasId];
                resizeCanvasIfNeeded(frameState, nextCanvas);
                const newContext = nextCanvas.getContext('2d');
                newContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
                newContext.drawImage(previousCanvas, dx, dy);
            }
        }

        this.previousFrame_.canvasId = nextCanvasId;
        this.previousFrame_.centerX = currentCenterX
        this.previousFrame_.centerY = currentCenterY;
        this.previousFrame_.resolution = nextResolution;

        const context = nextCanvas.getContext('2d');

        if (nextCanvas.fillStyle !== 'dimgray') {
            nextCanvas.fillStyle = 'dimgray';
        }

        layer.advanceParticles(frameState, context);

        context.globalAlpha = layer.fading;
        context.globalCompositeOperation = 'destination-in';
        context.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';

        frameState.animate = true;

        return true;
    }

    /**
     * @inheritDoc
     */
    renderFrame(frameState, target) {
        const pixelRatio = frameState.pixelRatio;
        const layerState = frameState.layerStatesArray[frameState.layerIndex];

        // set forward and inverse pixel transforms
        makeScale(this.pixelTransform, 1 / pixelRatio, 1 / pixelRatio);
        makeInverse(this.inversePixelTransform, this.pixelTransform);

        const canvasTransform = transformToString(this.pixelTransform);

        this.useContainer(target, canvasTransform, layerState.opacity);

        const canvas = this.canvases_[this.previousFrame_.canvasId];
        const width = canvas.width;
        const height = canvas.height;
        this.context.drawImage(canvas, 0, 0, width, height);

        return this.container;
    }
}
