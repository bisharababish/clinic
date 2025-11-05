// lib/deletionRequests.ts
import { supabase } from './supabase';

export interface DeletionRequest {
    id: string;
    user_id: number;
    requested_by_email: string;
    requested_by_role: string;
    user_details: {
        english_name: string;
        arabic_name?: string;
        email: string;
        role: string;
        id_number?: string;
        phone?: string;
    };
    reason: string;
    status: 'pending' | 'approved' | 'declined';
    admin_email?: string;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface NotificationData {
    id: string;
    user_email: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    related_table?: string;
    related_id?: string;
    created_at: string;
}

// Create a deletion request
export const createDeletionRequest = async (
    userId: number,
    userDetails: DeletionRequest['user_details'],
    reason: string,
    requestedByEmail: string,
    requestedByRole: string
): Promise<{ success: boolean; error?: string; data?: DeletionRequest }> => {
    try {
        const { data, error } = await supabase
            .from('deletion_requests')
            .insert({
                user_id: userId,
                requested_by_email: requestedByEmail,
                requested_by_role: requestedByRole,
                user_details: userDetails,
                reason: reason,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating deletion request:', error);
            return { success: false, error: error.message };
        }

        // Create notification for admins
        const notificationMessage = `${requestedByEmail} has requested to delete user: ${userDetails.english_name}|||${userDetails.arabic_name || userDetails.english_name}`;

        await createNotification(
            'admin',
            'New Deletion Request',
            notificationMessage,
            'warning',
            'deletion_requests',
            data.id
        );

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error creating deletion request:', error);
        return { success: false, error: 'Unexpected error occurred' };
    }
};

// Update deletion request status
export const updateDeletionRequest = async (
    requestId: string,
    status: 'approved' | 'declined',
    adminEmail: string,
    adminNotes?: string
): Promise<{ success: boolean; error?: string; data?: DeletionRequest }> => {
    try {
        const { data, error } = await supabase
            .from('deletion_requests')
            .update({
                status,
                admin_email: adminEmail,
                admin_notes: adminNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

        if (error) {
            console.error('Error updating deletion request:', error);
            return { success: false, error: error.message };
        }

        // Create notification for the requester
        const statusMessage = status === 'approved'
            ? `Your deletion request for user ${data.user_details.english_name} has been approved.`
            : `Your deletion request for user ${data.user_details.english_name} has been declined.`;

        await createNotification(
            data.requested_by_email,
            `Deletion Request ${status === 'approved' ? 'Approved' : 'Declined'}`,
            statusMessage,
            status === 'approved' ? 'success' : 'error',
            'deletion_requests',
            requestId
        );

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error updating deletion request:', error);
        return { success: false, error: 'Unexpected error occurred' };
    }
};

// Get deletion requests (with optional filtering)
export const getDeletionRequests = async (
    status?: 'pending' | 'approved' | 'declined'
): Promise<{ success: boolean; error?: string; data?: DeletionRequest[] }> => {
    try {
        let query = supabase
            .from('deletion_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching deletion requests:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error fetching deletion requests:', error);
        return { success: false, error: 'Unexpected error occurred' };
    }
};

export const deleteDeletionRequests = async (
    requestIds: string[]
): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log('=== DELETION DEBUG START ===');
        console.log('Attempting to delete requests with IDs:', requestIds);

        // Step 1: Verify requests exist and get current user
        const { data: currentUser, error: userError } = await supabase.auth.getUser();
        console.log('Current user:', currentUser.user?.email, currentUser.user?.id);

        if (userError) {
            console.error('User authentication error:', userError);
            return { success: false, error: 'Authentication error: ' + userError.message };
        }

        // Step 2: Check what requests exist before deletion
        const { data: beforeRequests, error: fetchError } = await supabase
            .from('deletion_requests')
            .select('*')
            .in('id', requestIds);

        console.log('Requests found before deletion:', beforeRequests);
        console.log('Fetch error:', fetchError);

        if (fetchError) {
            console.error('Error fetching requests:', fetchError);
            return { success: false, error: 'Failed to fetch requests: ' + fetchError.message };
        }

        if (!beforeRequests || beforeRequests.length === 0) {
            console.log('No requests found with provided IDs');
            return { success: false, error: 'No requests found with the provided IDs' };
        }

        // Step 3: Check RLS policies by trying a simple select first
        console.log('Testing RLS policies...');
        const { data: testSelect, error: testError } = await supabase
            .from('deletion_requests')
            .select('id')
            .eq('id', requestIds[0])
            .single();

        console.log('RLS test result:', { data: testSelect, error: testError });

        // Step 4: Try deletion with comprehensive error catching
        console.log('Attempting bulk deletion...');
        const deleteQuery = supabase
            .from('deletion_requests')
            .delete()
            .in('id', requestIds);

        // Add select to see what would be deleted
        const { data: deletedData, error: deleteError, status, statusText } = await deleteQuery.select('*');

        console.log('Delete operation complete:');
        console.log('- HTTP Status:', status);
        console.log('- Status Text:', statusText);
        console.log('- Error:', deleteError);
        console.log('- Deleted Data:', deletedData);
        console.log('- Expected to delete:', requestIds.length);
        console.log('- Actually deleted:', deletedData?.length || 0);

        if (deleteError) {
            console.error('DELETE ERROR DETAILS:', {
                message: deleteError.message,
                details: deleteError.details,
                hint: deleteError.hint,
                code: deleteError.code
            });

            // Try individual deletions to isolate the problem
            console.log('Bulk delete failed, trying individual deletions...');
            let successCount = 0;
            const errors: string[] = [];

            for (const requestId of requestIds) {
                console.log(`Trying to delete individual request: ${requestId}`);

                const { data: singleDelete, error: singleError } = await supabase
                    .from('deletion_requests')
                    .delete()
                    .eq('id', requestId)
                    .select('*');

                if (singleError) {
                    console.error(`Individual delete failed for ${requestId}:`, singleError);
                    errors.push(`${requestId}: ${singleError.message}`);
                } else {
                    console.log(`Successfully deleted ${requestId}:`, singleDelete);
                    successCount++;
                }
            }

            if (errors.length > 0) {
                return {
                    success: false,
                    error: `Deletion failed. Errors: ${errors.join('; ')}`
                };
            }

            console.log(`Individual deletions completed. Success count: ${successCount}`);
        }

        // Step 5: Verify the deletion worked
        console.log('Verifying deletion...');
        const { data: afterRequests, error: verifyError } = await supabase
            .from('deletion_requests')
            .select('*')
            .in('id', requestIds);

        console.log('Requests remaining after deletion:', afterRequests);
        console.log('Verify error:', verifyError);

        if (afterRequests && afterRequests.length > 0) {
            console.error('DELETION FAILED: Requests still exist after deletion attempt');
            return {
                success: false,
                error: `Deletion failed: ${afterRequests.length} requests still exist after deletion attempt`
            };
        }

        console.log('=== DELETION DEBUG END - SUCCESS ===');
        return { success: true };

    } catch (error) {
        console.error('UNEXPECTED ERROR in deleteDeletionRequests:', error);
        return {
            success: false,
            error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};
// Create notification
export const createNotification = async (
    userEmail: string,
    title: string,
    message: string,
    type: NotificationData['type'] = 'info',
    relatedTable?: string,
    relatedId?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        // If userEmail is 'admin', get all admin emails
        let targetEmails: string[] = [];

        if (userEmail === 'admin') {
            const { data: adminUsers, error: adminError } = await supabase
                .from('userinfo')
                .select('user_email')
                .eq('user_roles', 'Admin');

            if (adminError) {
                console.error('Error fetching admin emails:', adminError);
                return { success: false, error: adminError.message };
            }

            targetEmails = adminUsers.map(user => user.user_email);
        } else {
            targetEmails = [userEmail];
        }

        // Create notifications for all target emails
        // Note: related_id must be a valid UUID string or null
        // For service_requests which use integer IDs, we'll set it to null
        const notifications = targetEmails.map(email => ({
            user_email: email,
            title,
            message,
            type,
            related_table: relatedTable,
            // Only set related_id if it's a valid UUID format, otherwise set to null
            // This handles cases where service_requests use integer IDs (not UUIDs)
            related_id: relatedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(relatedId)
                ? relatedId
                : null
        }));

        const { error } = await supabase
            .from('notifications')
            .insert(notifications);

        if (error) {
            console.error('Error creating notifications:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error creating notifications:', error);
        return { success: false, error: 'Unexpected error occurred' };
    }
};

// Delete user after approval - COMPLETE DELETION
export const deleteUserAfterApproval = async (
    userId: number
): Promise<{ success: boolean; error?: string; details?: Record<string, unknown> }> => {
    try {
        console.log('🗑️ Starting complete user deletion for user ID:', userId);

        // First, check what will be deleted
        const { data: dependencies, error: checkError } = await supabase.rpc('check_user_dependencies', {
            user_id_to_delete: userId.toString() // Convert to string for BIGINT
        });

        if (checkError) {
            console.error('Error checking user dependencies:', checkError);
            return { success: false, error: `Failed to check user dependencies: ${checkError.message}` };
        }

        console.log('📊 User dependencies found:', dependencies);

        // Use the comprehensive deletion function
        const { data: deletionResult, error: deletionError } = await supabase.rpc('delete_user_completely', {
            user_id_to_delete: userId.toString() // Convert to string for BIGINT
        });

        if (deletionError) {
            console.error('Complete deletion failed:', deletionError);
            return { success: false, error: `Complete deletion failed: ${deletionError.message}` };
        }

        console.log('✅ Complete deletion successful:', deletionResult);

        // If auth user deletion failed, try manual deletion
        if (deletionResult.auth_deletion && !deletionResult.auth_deletion.success) {
            console.warn('⚠️ Auth user deletion failed, attempting manual deletion...');

            try {
                // Get user info for manual auth deletion
                const { data: userInfo } = await supabase
                    .from('userinfo')
                    .select('user_email, user_id')
                    .eq('userid', userId)
                    .single();

                if (userInfo?.user_email) {
                    // Try to delete from auth.users using admin API
                    const { error: authError } = await supabase.auth.admin.deleteUser(userInfo.user_id);

                    if (authError) {
                        console.warn('Manual auth deletion also failed:', authError);
                        return {
                            success: true,
                            error: `User data deleted but auth user deletion failed: ${authError.message}. Please delete manually from Supabase Auth.`,
                            details: deletionResult
                        };
                    } else {
                        console.log('✅ Manual auth user deletion successful');
                        return {
                            success: true,
                            details: { ...deletionResult, auth_deletion: { success: true, message: 'Manual deletion successful' } }
                        };
                    }
                }
            } catch (authDeletionError) {
                console.error('Manual auth deletion failed:', authDeletionError);
                return {
                    success: true,
                    error: `User data deleted but auth user deletion failed. Please delete manually from Supabase Auth.`,
                    details: deletionResult
                };
            }
        }

        return { success: true, details: deletionResult };
    } catch (error) {
        console.error('Unexpected error in complete user deletion:', error);
        return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` };
    }
};
