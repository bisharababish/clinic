// File: pages/api/admin/delete-user-db.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get data from request
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'Missing required user_id parameter' });
    }

    try {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Delete from database by user_id (uuid/text)
        const { error: dbError } = await supabase
            .from('userinfo')
            .delete()
            .eq('user_id', user_id);

        if (dbError) {
            console.error("Database deletion error:", dbError);
            return res.status(500).json({
                error: 'Failed to delete user from database',
                details: dbError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error("Server error during deletion:", error);
        return res.status(500).json({
            error: 'Internal server error during deletion',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}