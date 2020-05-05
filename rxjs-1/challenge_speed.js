const { getRace } = require('./race');
const { getCarSpeed } = require('./carSpeed');

const race = getRace();

const carNames = race.getCars();

console.log('Participants:', carNames.join('/'));

const carName = `Lightning McQueen`;

const speed$ = getCarSpeed(race, carName);
// adding `\r` allows to overwrite the message in the same line
speed$.subscribe(speed => {
  process.stdout.write(`Speed: ${speed.toFixed(2)}m/s\r`)
});

race.start();
