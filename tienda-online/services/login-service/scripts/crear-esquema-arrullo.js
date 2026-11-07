import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/config/entorno.js';
const schema=await readFile(new URL('../database/esquema.sql',import.meta.url),'utf8');
const connection=await mysql.createConnection({...dbConfig,database:undefined,multipleStatements:true});
try { await connection.query(schema); console.log('Esquema del servicio de login aplicado.'); } finally { await connection.end(); }
