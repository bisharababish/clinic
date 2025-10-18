// backend/routes/admin.ts
// This file goes in your Express backend

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase with SERVICE_ROLE_KEY (admin only!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

interface DeleteUserRequest {
  userId: number;
  authUserId: string;
}

router.post('/delete-user', async (req: Request, res: Response) => {
  try {
    const { userId, authUserId } = req.body as DeleteUserRequest;

    if (!userId || !authUserId) {
      return res.status(400).json({ 
        error: 'User ID and Auth User ID are required',
        success: false 
      });
    }

    console.log(`Deleting user: ${userId} (auth: ${authUserId})`);

    // Step 1: Delete from auth.users using Admin API
    // This is the only way to do it - from a backend with service role key
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);

    if (authError) {
      console.error('Auth deletion error:', authError);
      return res.status(400).json({ 
        error: 'Failed to delete auth user',
        detail: authError.message,
        success: false
      });
    }

    console.log('Auth user deleted successfully');

    return res.status(200).json({
      success: true,
      message: 'Auth user deleted successfully',
      userId,
      authUserId
    });

  } catch (error) {
    console.error('Delete user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Internal server error',
      detail: errorMessage,
      success: false
    });
  }
});

export default router;
