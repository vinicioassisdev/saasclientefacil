
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    if (req.method === 'GET') {
      const usersRes = await client.query('SELECT * FROM users');
      const clientsRes = await client.query('SELECT * FROM clients');
      
      // Mapeia de snake_case (SQL) para camelCase (TS/React)
      const mappedUsers = usersRes.rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        plan: u.plan,
        status: u.status,
        createdAt: u.created_at
      }));

      const mappedClients = clientsRes.rows.map(c => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        service: c.service,
        budget: parseFloat(c.budget),
        status: c.status,
        paymentStatus: c.payment_status,
        nextFollowUp: c.next_follow_up,
        lastInteraction: c.last_interaction,
        createdAt: c.created_at
      }));
      
      return res.status(200).json({
        users: mappedUsers,
        clients: mappedClients
      });
    }

    if (req.method === 'POST') {
      const { users, clients } = req.body;

      if (users && Array.isArray(users)) {
        for (const user of users) {
          await client.query(`
            INSERT INTO users (id, name, email, role, plan, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              role = EXCLUDED.role,
              plan = EXCLUDED.plan,
              status = EXCLUDED.status
          `, [user.id, user.name, user.email, user.role, user.plan, user.status, user.createdAt]);
        }
      }

      if (clients && Array.isArray(clients)) {
        for (const c of clients) {
          await client.query(`
            INSERT INTO clients (id, user_id, name, phone, email, service, budget, status, payment_status, next_follow_up, last_interaction, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              email = EXCLUDED.email,
              service = EXCLUDED.service,
              budget = EXCLUDED.budget,
              status = EXCLUDED.status,
              payment_status = EXCLUDED.payment_status,
              next_follow_up = EXCLUDED.next_follow_up,
              last_interaction = EXCLUDED.last_interaction
          `, [c.id, c.userId, c.name, c.phone, c.email, c.service, c.budget, c.status, c.paymentStatus, c.nextFollowUp, c.lastInteraction, c.createdAt]);
        }
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error("Database Error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
}
