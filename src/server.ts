import * as uuid from 'uuid';

const express = require('express');
const mutex = require('mutex');

const app = express();

var test_mutex = mutex( {id: uuid.v1(), strategy: { name: 'redis'} } );

app.use(express.static('public'));

var listener = app.listen(process.env.PORT, function() {
  console.log(`Initialized listener on port ${process.env.PORT}.`);
});

const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

app.all('/test', () => {
  console.log(`Locking test_mutex...`);
  
  test_mutex.lock('blah', { duration: 10*60*1000, maxWait: 5*60*1000 })
    .then( (lock) => {
      console.log(`Locked test_mutex.`);

      sleep(10*1000).then( () => {
        console.log(`Unlocking test_mutex...`);
        test_mutex.unlock(lock);
        console.log(`Unlocked test_mutex...`);
      });
    }).catch( (err: Error) => {
      console.log(`Error: ${err}.`);
    })
});
