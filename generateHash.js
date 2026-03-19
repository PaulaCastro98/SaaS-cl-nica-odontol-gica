 // generate-hash.js
 const bcrypt = require('bcryptjs');

 async function generateNewHash() {
   const password = 'senha123'; // A senha que você quer usar
   const saltRounds = 10;
   const newHash = await bcrypt.hash(password, saltRounds);
   console.log('Novo Hash:', newHash);
 }

 generateNewHash();