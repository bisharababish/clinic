// File: pages/api/admin/create-user.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Create a Supabase client with the service role key
    // IMPORTANT: This key has admin privileges and should only be used in server-side code
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Authenticate the user making the request
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user, error: authError } = await supabaseAdmin.auth.api.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: authError?.message || 'Not authenticated' });
    }

    // Check if the user has the 'admin' role
    // Assuming user_metadata contains user_roles
    const userRoles = user.user_metadata?.user_roles || [];
    if (!userRoles.includes('admin')) {
        return res.status(403).json({ error: 'Not authorized' });
    }

    try {
        const { email, password, metadata } = req.body;

        // Create user with auto-confirmation
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirms the email
            user_metadata: metadata
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
            success: true,
            user: data.user
        });
    } catch (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}