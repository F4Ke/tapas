const { getRace } = require('./race');
const { getLeaderBoard } = require('./carsLeaderBoard');

const Table = require('easy-table')

const race = getRace();

const carNames = race.getCars();

console.log('Participants:', carNames.join('/'));

const leaderBoard$ = getLeaderBoard(race);

leaderBoard$.subscribe(leaderBoard => {
  const t = new Table();
  leaderBoard.forEach(function(car) {
    t.cell('#', car.position)
    t.cell('Name', car.carName)
    t.cell('Gap Distance', `${car.leaderGapDistance.toFixed(2)}m`)
    t.cell('Gap Time', `${car.leaderGapTime.toFixed(2)}ms`)
    t.newRow()
  });
  process.stdout.write(t.toString());
  // clear current the table at next writing
  process.stdout.moveCursor(0, -4)
});

race.start();
