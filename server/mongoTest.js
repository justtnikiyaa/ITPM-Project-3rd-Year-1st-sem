const mongoose = require('mongoose');

console.log('Testing Mongoose Connection...');
mongoose.connect('mongodb+srv://nihindudulavin:Niksiphone10s@cluster0.m8hoiej.mongodb.net/unigig?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected Successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.log('Connection Failed:', err.message);
    
    console.log('\nRetrying with { family: 4 }...');
    mongoose.connect('mongodb+srv://nihindudulavin:Niksiphone10s@cluster0.m8hoiej.mongodb.net/unigig?retryWrites=true&w=majority&appName=Cluster0', { family: 4 })
      .then(() => {
        console.log('Connected Successfully with family: 4!');
        process.exit(0);
      })
      .catch(err2 => {
        console.log('Failed again:', err2.message);
        process.exit(1);
      });
  });
