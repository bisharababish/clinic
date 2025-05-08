// File: pages/api/admin/delete-user-db.ts
// This API route will delete users from the database using direct SQL for maximum reliability

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`API Route: Attempting to delete user with ID ${userId} from database`);

    try {
        // Initialize Supabase admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Method 1: Direct SQL execution using PostgreSQL connection
        // This bypasses all RLS policies and constraints
        try {
            // Connect directly to PostgreSQL using connection string from service role
            const connectionString = process.env.SUPABASE_POSTGRES_CONNECTION || 
                                    `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}.supabase.co:5432/postgres`;
            
            const pool = new Pool({ connectionString });
            
            // Execute direct SQL query
            const result = await pool.query(`DELETE FROM userinfo WHERE userid = $1 RETURNING userid`, [userId]);
            await pool.end();
            
            if (result.rowCount > 0) {
                console.log(`API Route: Successfully deleted user ${userId} using direct SQL`);
                return res.status(200).json({ 
                    success: true, 
                    message: 'User deleted from database using direct SQL'
                });
            } else {
                console.log(`API Route: User ${userId} not found in direct SQL delete`);
            }
        } catch (sqlError) {
            console.error("API Route: Direct SQL delete failed:", sqlError);
            // Continue to fallback methods
        }

        // Method 2: Try Supabase admin delete (fallback)
        try {
            console.log("API Route: Trying admin delete method");
            const { error: deleteError } = await supabaseAdmin
                .from('userinfo')
                .delete()
                .eq('userid', userId);

            if (deleteError) {
                console.error("API Route: Admin delete failed:", deleteError);
                throw deleteError;
            }

            // Verify deletion
            const { data: checkData } = await supabaseAdmin
                .from('userinfo')
                .select('userid')
                .eq('userid', userId)
                .maybeSingle();

            if (checkData) {
                console.error("API Route: User still exists after admin delete attempt");
                throw new Error("User still exists after delete operation");
            }

            console.log("API Route: Successfully deleted user via admin client");
            return res.status(200).json({ 
                success: true, 
                message: 'User deleted from database via admin client'
            });
        } catch (adminDeleteError) {
            console.error("API Route: Admin delete failed:", adminDeleteError);
        }

        // Method 3: Try a direct REST API call to delete (final fallback)
        try {
            console.log("API Route: Trying REST API delete method");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/userinfo?userid=eq.${userId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    }
                }
            );

            if (response.ok) {
                console.log("API Route: Successfully deleted user via REST API");
                return res.status(200).json({ 
                    success: true, 
                    message: 'User deleted from database via REST API'
                });
            } else {
                throw new Error(`REST API delete failed with status: ${response.status}`);
            }
        } catch (restError) {
            console.error("API Route: REST API delete failed:", restError);
        }

        // If we reach here, all methods failed
        return res.status(500).json({ 
            error: 'Failed to delete user from database after trying all methods'
        });
    } catch (error) {
        console.error("API Route: Unexpected error:", error);
        return res.status(500).json({ 
            error: error.message || 'Internal server error'
        });
    }
}