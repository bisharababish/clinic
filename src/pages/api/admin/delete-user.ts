// pages/api/admin/delete-user.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js'; // Add this import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get userid from request body
    const { userid } = req.body;

    if (!userid) {
        return res.status(400).json({ error: 'Missing userid parameter' });
    }

    try {
        // Create a Supabase client with the service role key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return res.status(500).json({ error: 'Missing Supabase configuration' });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // First check if the user exists
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('userinfo')
            .select('userid, user_email, english_username_a, english_username_d')
            .eq('userid', userid)
            .single();

        if (fetchError) {
            console.error("Error finding user:", fetchError);
            return res.status(404).json({ error: 'User not found in database' });
        }

        console.log("Found user to delete:", user);

        // Delete from userinfo table
        const { error: deleteError } = await supabaseAdmin
            .from('userinfo')
            .delete()
            .eq('userid', userid);

        if (deleteError) {
            console.error("Error deleting user from userinfo:", deleteError);
            return res.status(500).json({
                error: 'Database error deleting user',
                details: deleteError.message
            });
        }

        // If user has Supabase Auth account, delete that too
        if (user && user.user_email) {
            try {
                // Get auth users
                const { data: authData } = await supabaseAdmin.auth.admin.listUsers();

                if (authData && authData.users) {
                    // Type assertion to help TypeScript understand the users array
                    const authUsers = authData.users as User[];

                    // Find user by email (case insensitive)
                    const matchedUser = authUsers.find(authUser => {
                        const authEmail = authUser.email || '';
                        const userEmail = user.user_email || '';
                        return authEmail.toLowerCase() === userEmail.toLowerCase();
                    });

                    if (matchedUser && matchedUser.id) {
                        // Delete auth user
                        await supabaseAdmin.auth.admin.deleteUser(matchedUser.id);
                        console.log("Deleted auth user:", matchedUser.id);
                    }
                }
            } catch (authError) {
                console.error("Error with auth user deletion:", authError);
                // Continue even if auth deletion fails
            }
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            deleted_user: user
        });

    } catch (error) {
        console.error("Server error during deletion:", error);
        return res.status(500).json({
            error: 'Server error during user deletion',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}