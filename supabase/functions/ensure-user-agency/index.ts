import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string;
  agency_name?: string;
}

interface Agency {
  id: string;
  name: string;
  subscription_plan: string;
  trial_ends_at: string;
}

interface TeamMember {
  id: string;
  email: string;
  agency_id: string;
  role: string;
  accepted_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          status: 'error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing authorization header',
          status: 'error'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { email, agency_name }: RequestBody = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ 
          error: 'Email is required',
          status: 'error'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🚀 Processing ensure-user-agency for: ${email}`)

    // Get user from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch user data',
          status: 'error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const user = authUsers.users.find(u => u.email === email)
    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          status: 'error'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ User found: ${user.id}`)

    // Check if user already has an agency association
    const { data: existingTeamMember, error: teamMemberError } = await supabase
      .from('team_members')
      .select(`
        id,
        email,
        agency_id,
        role,
        accepted_at,
        agencies (
          id,
          name,
          subscription_plan,
          trial_ends_at
        )
      `)
      .eq('id', user.id)
      .single()

    if (existingTeamMember && !teamMemberError) {
      console.log(`✅ User already has agency association: ${existingTeamMember.agency_id}`)
      return new Response(
        JSON.stringify({
          agency_id: existingTeamMember.agency_id,
          agency_name: (existingTeamMember.agencies as any)?.name,
          user_role: existingTeamMember.role,
          status: 'existing_association',
          message: 'User already associated with agency'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🏢 Creating new agency for user: ${email}`)

    // Create new agency
    const agencyName = agency_name || `${email.split('@')[0]}'s Agency`
    const { data: newAgency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        name: agencyName,
        subscription_plan: 'trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (agencyError || !newAgency) {
      console.error('Error creating agency:', agencyError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create agency',
          details: agencyError?.message,
          status: 'error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Agency created: ${newAgency.id}`)

    // Associate user with the new agency
    const { data: teamMember, error: teamMemberInsertError } = await supabase
      .from('team_members')
      .insert({
        id: user.id,
        email: user.email,
        agency_id: newAgency.id,
        role: 'owner',
        accepted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (teamMemberInsertError || !teamMember) {
      console.error('Error creating team member association:', teamMemberInsertError)
      
      // Cleanup: delete the created agency if team member creation fails
      await supabase
        .from('agencies')
        .delete()
        .eq('id', newAgency.id)

      return new Response(
        JSON.stringify({ 
          error: 'Failed to associate user with agency',
          details: teamMemberInsertError?.message,
          status: 'error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ User associated with agency successfully`)

    // Return success response
    return new Response(
      JSON.stringify({
        agency_id: newAgency.id,
        agency_name: newAgency.name,
        user_role: teamMember.role,
        trial_ends_at: newAgency.trial_ends_at,
        status: 'success',
        message: 'User successfully associated with new agency'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in ensure-user-agency:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        status: 'error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})