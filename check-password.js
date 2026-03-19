const bcrypt = require('bcryptjs');

async function checkPassword() {
  const passwordToTest = 'senha123'; // A senha que você está usando no formulário de login
  const storedHash = '$2a$10$xyz123abc456def789ghi.jklmnopqrstuvw.xyz1234567890'; // O hash que você me forneceu do DB

  try {
    const isMatch = await bcrypt.compare(passwordToTest, storedHash);
    console.log(`A senha '${passwordToTest}' corresponde ao hash do DB?`, isMatch);
if (!isMatch) {
  console.log('\n--- AVISO: Senha NÃO corresponde ao hash! ---');
  console.log('Você precisará gerar um novo hash para "senha123" e atualizar o banco de dados.');
  console.log('Para gerar um novo hash, execute o script abaixo:');
  console.log('const bcrypt = require("bcryptjs"); async function generate() { const newHash = await bcrypt.hash("senha123", 10); console.log("Novo Hash:", newHash); } generate();');
}
  } catch (error) {
    console.error('Erro ao comparar senhas:', error);
  }
}

checkPassword();