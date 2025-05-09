// Existing file: pages/api/admin/delete-user.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userid } = req.body;

    if (!userid) {
        return res.status(400).json({ error: 'Missing userid parameter' });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseAdminKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

        // First check if the user exists
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('userinfo')
            .select('userid, user_email')
            .eq('userid', userid)
            .single();

        if (fetchError) {
            console.error("Error finding user:", fetchError);
            return res.status(404).json({ error: 'User not found in database' });
        }

        // DIRECT DELETION instead of RPC
        const { error: deleteError } = await supabaseAdmin
            .from('userinfo')
            .delete()
            .eq('userid', userid);

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            return res.status(500).json({ error: `Database error: ${deleteError.message}` });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            deleted_user: user
        });

    } catch (error) {
        console.error("Server error during deletion:", error);
        return res.status(500).json({ error: 'Server error during user deletion' });
    }
}