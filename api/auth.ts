import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // Pegamos as credenciais das variáveis de ambiente (Servidor - Seguro)
    const masterEmail = process.env.ADMIN_EMAIL;
    const masterPassword = process.env.ADMIN_PASSWORD;

    if (email.toLowerCase().trim() === masterEmail?.toLowerCase().trim() && password === masterPassword) {
        // Retorna o objeto de usuário administrador
        return res.status(200).json({
            user: {
                id: 'admin-001',
                name: 'Diretor ClienteSimples',
                email: masterEmail,
                role: 'admin',
                plan: 'pro',
                status: 'ativo',
                createdAt: new Date().toISOString()
            },
            message: 'Login administrativo realizado com sucesso.'
        });
    }

    // Se não for admin, o frontend pode continuar verificando no banco ou 
    // podemos retornar que não é admin para o frontend tentar o fluxo normal.
    return res.status(401).json({ error: 'Credenciais inválidas ou você não tem permissão de administrador.' });
}
