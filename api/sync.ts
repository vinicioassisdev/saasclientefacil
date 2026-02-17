import { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic Auth Check
  const expectedSecret = process.env.SYNC_SECRET;
  if (expectedSecret && req.headers['x-sync-secret'] !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await pool.connect();

  try {
    if (req.method === 'GET') {
      const usersRes = await client.query('SELECT * FROM users');
      const clientsRes = await client.query('SELECT * FROM clients');

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
        budget: parseFloat(c.service_value || c.budget || 0), // Handle potential column name differences
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

      await client.query('BEGIN'); // Start transaction

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
        // Collect all client IDs being synced to handle deletions
        // We need to know which users are being synced. 
        // Assuming the sync includes ALL clients for the users present in the payload.
        // If a client is missing for a user that IS in the payload (implicitly via client association), it should be deleted.

        // 1. Upsert provided clients
        const userIdsInSync = new Set<string>();
        const clientIdsInSync = new Set<string>();

        for (const c of clients) {
          userIdsInSync.add(c.userId);
          clientIdsInSync.add(c.id);

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

        // 2. Handle deletions
        // If we have user IDs, find all clients in DB for those users that are NOT in clientIdsInSync
        if (userIdsInSync.size > 0) {
          const userIdsArray = Array.from(userIdsInSync);
          // Get all client IDs for these users currently in DB
          const query = `SELECT id FROM clients WHERE user_id = ANY($1)`;
          const dbClientsRes = await client.query(query, [userIdsArray]);

          const dbClientIds = dbClientsRes.rows.map(row => row.id);
          const toDelete = dbClientIds.filter(id => !clientIdsInSync.has(id));

          if (toDelete.length > 0) {
            await client.query(`DELETE FROM clients WHERE id = ANY($1)`, [toDelete]);
          }
        }
      }

      await client.query('COMMIT');
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Database Error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
