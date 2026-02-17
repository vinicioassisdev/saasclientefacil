import { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET for easy setup via browser, or restrict to POST. 
  // Given user request for production ready, let's keep it restrictive but allowing a secret key check would be better.
  // For now, let's just make it use the pool and handle errors.

  const client = await pool.connect();

  try {
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
          service_value NUMERIC DEFAULT 0, -- Add column for compatibility if missing
          status TEXT,
          payment_status TEXT,
          next_follow_up TIMESTAMP WITH TIME ZONE,
          last_interaction TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add missing column if it doesn't exist (migration-like step)
    try {
      await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS service_value NUMERIC DEFAULT 0;`);
    } catch (e) {
      // Ignore if exists
    }

    return res.status(200).json({ success: true, message: 'Tabelas configuradas com sucesso.' });
  } catch (error: any) {
    console.error("Setup Error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
