import WorldMap from './components/WorldMap'
import BoatLayer from "./components/layer/Boat";

const map = WorldMap(document.getElementById('map'));

let playerBoat = null;

/**
 * Starts the game.
 *
 * @param {BoatData} boat
 */
function start(boat) {
    playerBoat = boat;

    console.log('Start game');

    // Adds the boats layer to the map
    map.addLayer(new BoatLayer({
        playerBoat: playerBoat
    }));

    // Hides the lobby
    document.getElementById('lobby').style.display = 'none';
}

/**
 * Submits the form data.
 *
 * @param {string} url
 * @param {FormData} data
 * @returns {Promise<any>}
 */
async function submitForm(url, data) {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data))
    });

    if (!response.ok) {
        const data = await response.json();

        if (data.hasOwnProperty('errors')) {
            throw new Error(Object.values(data.errors).join('<br>'));
        } else if (data.hasOwnProperty('error')) {
            throw new Error(data.error);
        } else {
            throw new Error('An error has occurred');
        }
    }

    return await response.json();
}

/* -------------------------- Register -------------------------- */

const register_form = document.getElementById('register');
const register_errors = document.getElementById('register_error');

register_form.addEventListener('submit', (e) => {
    register_errors.innerText = '';

    submitForm(process.env.BOAT_ENDPOINT + "/boat", new FormData(register_form))
        .then(boat => start(boat))
        .catch(error => {
            register_errors.innerText = error.message;
        });

    e.preventDefault();
    e.stopPropagation();

    return false;
});

/* -------------------------- Login -------------------------- */

const login_form = document.getElementById('login');
const login_errors = document.getElementById('login_error');

login_form.addEventListener('submit', (e) => {
    login_errors.innerText = '';

    submitForm(process.env.BOAT_ENDPOINT + "/login", new FormData(login_form))
        .then(boat => start(boat))
        .catch(error => {
            login_errors.innerText = error.message;
        });

    e.preventDefault();
    e.stopPropagation();

    return false;
});
