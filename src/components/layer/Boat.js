import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {assign} from "ol/obj";
import Boat from "../ui/Boat";

export default class BoatLayer extends VectorLayer {
    constructor(opt_options) {
        const options = opt_options ? opt_options : {};

        const baseOptions = assign({}, options);
        delete baseOptions.boat;
        baseOptions.source = new VectorSource({
            features: []
        });

        super(baseOptions);

        this.playerBoat = options.boat;

        this.update();

        setInterval(() => {
            this.update()
        }, 60000);
    }

    update() {
        fetch(process.env.BOAT_ENDPOINT + '/boat')
            .then(response => response.json())
            .then(data => {
                console.log(data);

                if (!data.hasOwnProperty('boats')) {
                    return;
                }

                let boats = data.boats;

                for (let i= 0; i < boats.length; i++) {
                    let data = boats[i];
                    let boat = this.getSource().getFeatureById(data.id);
                    if (boat) {
                        boat.updatePosition(data.position);

                        continue;
                    }

                    boat = new Boat(data);
                    this.getSource().addFeature(boat);
                }
            });
    }
}
