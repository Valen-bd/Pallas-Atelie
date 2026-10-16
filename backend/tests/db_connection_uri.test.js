require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { getMongoURI } = require('../src/config/database');

const uri = getMongoURI();
console.log('URI gerada com sucesso:', uri.replace(/:[^:@]+@/, ':***@'));

if (uri.startsWith('mongodb+srv://') && uri.includes('pallas_atelie')) {
    console.log('✅ Teste de montagem da URI passou com sucesso!');
    process.exit(0);
} else {
    console.error('❌ Formato inesperado da URI:', uri);
    process.exit(1);
}
