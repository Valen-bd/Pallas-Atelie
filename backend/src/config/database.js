const mongoose = require('mongoose');

/**
 * Monta a URI de conexão com o MongoDB a partir de variáveis individuais
 * ou retorna a MONGO_URI direta como fallback.
 */
function getMongoURI() {
    const {
        DB_USER,
        DB_PASSWORD,
        DB_HOST,
        DB_PORT,
        DB_NAME = 'pallas_atelie',
        DB_OPTIONS = 'retryWrites=true&w=majority',
        MONGO_URI
    } = process.env;

    // Caso variáveis individuais estejam configuradas no .env
    if (DB_HOST) {
        const isSrv = DB_HOST.includes('mongodb.net') || DB_HOST.startsWith('cluster');
        const auth = (DB_USER && DB_PASSWORD)
            ? `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@`
            : '';
        const portStr = (!isSrv && DB_PORT) ? `:${DB_PORT}` : '';
        const protocol = isSrv ? 'mongodb+srv' : 'mongodb';
        const query = DB_OPTIONS ? `?${DB_OPTIONS}` : '';

        return `${protocol}://${auth}${DB_HOST}${portStr}/${DB_NAME}${query}`;
    }

    // Fallback para MONGO_URI direta
    if (MONGO_URI) {
        return MONGO_URI;
    }

    // Fallback local padrão sem autenticação
    return 'mongodb://127.0.0.1:27017/pallas_atelie';
}

const connectDB = async () => {
    try {
        const uri = getMongoURI();
        await mongoose.connect(uri);
        console.log('✅ MongoDB conectado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
module.exports.getMongoURI = getMongoURI;