const bcrypt = require('bcrypt');

async function gerarHash() {
  const senhaNova = "admin123";
  
  const hash = await bcrypt.hash(senhaNova, 12);

  console.log("Nova senha:", senhaNova);
  console.log("Hash:", hash);
}

gerarHash();