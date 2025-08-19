import { supabase } from '@/integrations/supabase/client';

interface EnsureUserAgencyRequest {
  email: string;
  agency_name?: string;
}

interface EnsureUserAgencyResponse {
  agency_id: string;
  agency_name: string;
  user_role: string;
  trial_ends_at?: string;
  status: 'success' | 'existing_association' | 'error';
  message: string;
  error?: string;
  details?: string;
}

/**
 * Ensures a user has an agency association by calling the Supabase Edge Function
 * This function handles the creation of agencies and user associations automatically
 */
export async function ensureUserAgency(
  email: string, 
  agencyName?: string
): Promise<EnsureUserAgencyResponse> {
  try {
    console.log(`🚀 Calling ensure-user-agency for: ${email}`);
    
    // Get current session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('No valid session found');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ensure-user-agency', {
      body: {
        email,
        agency_name: agencyName
      } as EnsureUserAgencyRequest,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error calling ensure-user-agency function:', error);
      throw error;
    }

    console.log('✅ ensure-user-agency response:', data);
    return data as EnsureUserAgencyResponse;

  } catch (error) {
    console.error('Failed to ensure user agency:', error);
    throw error;
  }
}

/**
 * Helper function to be used in AuthContext when a user logs in
 * but doesn't have an agency association
 */
export async function handleMissingAgencyAssociation(
  userEmail: string,
  customAgencyName?: string
): Promise<{
  agency_id: string;
  agency_name: string;
  user_role: string;
}> {
  try {
    const result = await ensureUserAgency(userEmail, customAgencyName);
    
    if (result.status === 'error') {
      throw new Error(result.error || 'Failed to ensure agency association');
    }

    return {
      agency_id: result.agency_id,
      agency_name: result.agency_name,
      user_role: result.user_role
    };

  } catch (error) {
    console.error('Failed to handle missing agency association:', error);
    throw error;
  }
}

/**
 * Check if a user needs agency setup by attempting to load their team member data
 */
export async function checkUserAgencyStatus(userId: string): Promise<{
  hasAgency: boolean;
  agency_id?: string;
  role?: string;
}> {
  try {
    const { data: teamMember, error } = await supabase
      .from('team_members')
      .select(`
        agency_id,
        role,
        agencies (
          id,
          name
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !teamMember) {
      return { hasAgency: false };
    }

    return {
      hasAgency: true,
      agency_id: teamMember.agency_id,
      role: teamMember.role
    };

  } catch (error) {
    console.error('Error checking user agency status:', error);
    return { hasAgency: false };
  }
}