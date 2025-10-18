// src/lib/api.ts
export async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
    try {
        const response = await fetch(url, options);

        // Get text response to properly handle non-JSON responses
        const text = await response.text();

        // Try to parse as JSON
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error(`Invalid JSON response: ${text}`);
        }

        // Check if response is successful
        if (!response.ok) {
            const error = data.error || response.statusText;
            throw new Error(error);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Function to delete a user via the Supabase RPC function
export async function deleteUser(supabase, userid: number) {
    const { data, error } = await supabase.rpc('delete_user_by_admin', {
        user_id_to_delete: userid
    });

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
        throw new Error("Failed to delete user or you don't have permission");
    }

    return { success: true };
}
