
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Criar tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'user',
          plan TEXT DEFAULT 'free',
          status TEXT DEFAULT 'ativo',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar tabela de clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          service TEXT,
          budget NUMERIC DEFAULT 0,
          status TEXT,
          payment_status TEXT,
          next_follow_up TIMESTAMP WITH TIME ZONE,
          last_interaction TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return res.status(200).json({ success: true, message: 'Tabelas criadas com sucesso.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
}
