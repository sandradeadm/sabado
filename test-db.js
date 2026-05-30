const { Pool } = require('pg');
require('dotenv').config();

exports.testConnection = async () => {
 try{
        const result = await pool.query('SELECT NOW();');
        console.log('conexión exitosa:', result.rows[0]);
    } catch (error){
        console.error('Error al conectar con la base de datos:', error);
    } finally {
        await pool.end();
    }
}