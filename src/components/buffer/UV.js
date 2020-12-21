import {transform, transformExtent} from 'ol/proj';


export default class UVBuffer {
    /**
     * @param {Float32Array} us
     * @param {Float32Array} vs
     * @param {number} width
     * @param {number} height
     */
    constructor(us, vs, width, height) {
        if (us.length !== width * height) {
            throw new Error(`Us size ${us.length} is not consistent with data dimensions: ${width}x${height}`);
        }
        if (vs.length !== width * height) {
            throw new Error(`Vs size ${vs.length} is not consistent with data dimensions: ${width}x${height}`);
        }

        this.uBuffer_ = us;
        this.vBuffer_ = vs;

        this.extent = transformExtent([-180, -90, 180, 90], 'EPSG:4326', 'EPSG:3857');
        this.dataWidth_ = width;
        this.dataHeight_ = height;

        this.speedBuffer_ = new Float32Array(us.length);
        this.simpleSpeedBuffer = new Uint8Array(us.length);
        this.rotationBuffer_ = new Float32Array(us.length);

        for (let i = 0; i < us.length; ++i) {
            const u = us[i];
            const v = vs[i];
            const speed = Math.sqrt(u * u + v * v);
            const rotation = Math.atan2(v, u);
            this.speedBuffer_[i] = speed;
            this.simpleSpeedBuffer[i] = Math.ceil(speed);
            this.rotationBuffer_[i] = rotation;
        }
    }

    getUVSpeed(coordinate) {
        const width = this.dataWidth_;
        //const height = this.dataHeight_;
        //const position = positionFromCoordinate(this.extent, width, height, coordinate);
        const position = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
        const u = interpolatePosition(width, position, this.uBuffer_);
        const v = interpolatePosition(width, position, this.vBuffer_);
        return [u,v];
    }
}

/**
 * @param {import("ol/Extent").default} extent geographical extent of the data
 * @param {number} width number or columns of the data 2 dimensional array
 * @param {number} height number of rows of the data 2 dimensional array
 * @param {number[]} coordinate coordinates
 * @return {number[]} position in the data 2 dimensional array
 */
export function positionFromCoordinate(extent, width, height, coordinate) {
    // extent:  `[minx, miny, maxx, maxy]`
    // Ratio of the extent where the coordinate is located
    const xRatio = (coordinate[0] - extent[0]) / (extent[2] - extent[0]);
    const yRatio = (coordinate[1] - extent[1]) / (extent[3] - extent[1]);

    const x = xRatio * (width - 1);
    const y = yRatio * (height - 1);

    return [x, y];
}

/**
 * @param {number} width number or columns
 * @param {number[]} position
 * @param {Float32Array} buffer
 * @return {number}
 */
export function interpolatePosition(width, position, buffer) {
    //position = [55, 100];
    let [x, y] = position;
    x %= 360;
    y += 90; y %= 180;

    if (x >= width) {
        throw new Error('Out of bound');
    }

    if (y * width + x >= (buffer.length)) {
        throw new Error('Out of buffer bound');
    }

    const x1 =  Math.floor(x);
    const y1 =  Math.floor(y);
    const x2 =  Math.ceil(x);
    const y2 =  Math.ceil(y);

    const dx = x - x1;
    const dy = y - y1;

    const fx2y1 = buffer[x2 + width * y1];
    const fx1y1 = buffer[x1 + width * y1];
    const fx1y2 = buffer[x1 + width * y2];
    const fx2y2 = buffer[x2 + width * y2];
    const dfx = fx2y1 - fx1y1;
    const dfy = fx1y2 - fx1y1;
    const dfxy = fx1y1 + fx2y2 - fx2y1 - fx1y2;

    //return fx1y1;
    return dfx * dx + dfy * dy + dfxy * dx * dy + fx1y1;
}
