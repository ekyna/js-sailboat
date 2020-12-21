import {assign} from "ol/obj";
import Layer from "ol/layer/Layer";
import WindLayerRenderer from "../renderer/WindLayer";
import {getWidth, getHeight, containsCoordinate} from 'ol/extent';
import {apply as applyTransform} from 'ol/transform';

function randomizeCoordinates(extent, coordinates) {
    coordinates[0] = Math.random() * getWidth(extent) + extent[0];
    coordinates[1] = Math.random() * getHeight(extent) + extent[1];
}

export default class WindLayer extends Layer {
    constructor(opt_options) {
        const options = opt_options ? opt_options : {};

        const baseOptions = assign({}, options);
        delete baseOptions.fading;
        delete baseOptions.ttl;
        delete baseOptions.uvBuffer;
        delete baseOptions.particleColor;
        delete baseOptions.particleSize;
        delete baseOptions.particleCount;

        super(baseOptions);

        // TODO Use console.assert()
        this.fading = options.fading || 0.8;
        this.ttl = options.ttl || 50;
        this.uvBuffer = options.uvBuffer;
        this.particleColor = options.particleColor || 'black';
        this.particleSize = options.particleSize || 1.5;

        this.particles = new Array(Number(options.particleCount || 1000));
        for (let i = 0; i < this.particles.length; ++i) {
            this.particles[i] = {
                ttl: Math.random() * this.ttl,
                coordinates: []
            };
        }

        this.pixel = [];
    }

    advanceParticles(frameState, context) {
        const pixel = this.pixel;
        const resolution = frameState.viewState.resolution;
        const pixelRatio = frameState.pixelRatio;
        this.particles.forEach(particle => {
            if (particle.coordinates.length === 0 || !containsCoordinate(frameState.extent, particle.coordinates)) {
                randomizeCoordinates(frameState.extent, particle.coordinates);
            }
            pixel[0] = particle.coordinates[0];
            pixel[1] = particle.coordinates[1];
            applyTransform(frameState.coordinateToPixelTransform, pixel);
            context.fillStyle = this.particleColor;
            context.fillRect(
                pixel[0] * pixelRatio, pixel[1] * pixelRatio,
                this.particleSize * pixelRatio, this.particleSize * pixelRatio
            );
            --particle.ttl;
            if (particle.ttl < 0) {
                randomizeCoordinates(frameState.extent, particle.coordinates);
                particle.ttl = this.ttl;
            }

            // Compute new position
            const [u, v] = this.uvBuffer.getUVSpeed(particle.coordinates);

            particle.coordinates[0] += u * resolution / 10;
            particle.coordinates[1] += v * resolution / 10;
        })
    }

    createRenderer() {
        return new WindLayerRenderer(this);
    }
}
