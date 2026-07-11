'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { scopeRequestSchema } from '@/lib/utils/validators';

async function verifyProjectOwnership(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) throw new Error('Forbidden');
}

async function verifyScopeRequestOwnership(requestId: string, userId: string) {
  const supabase = await createClient();
  const { data: req } = await supabase
    .from('scope_requests')
    .select('project_id')
    .eq('id', requestId)
    .maybeSingle();
  if (!req) throw new Error('Forbidden');
  await verifyProjectOwnership(req.project_id, userId);
  return req;
}

export async function createScopeRequest(
  projectId: string,
  data: { description: string; estimated_hours?: number; is_out_of_scope: boolean }
) {
  const validated = scopeRequestSchema.safeParse(data);
  if (!validated.success) {
    throw new Error('Validation failed: ' + validated.error.errors.map(e => e.message).join(', '));
  }
  const { description, estimated_hours, is_out_of_scope } = validated.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyProjectOwnership(projectId, user.id);

  const { data: request, error } = await supabase
    .from('scope_requests')
    .insert({
      project_id: projectId,
      description,
      estimated_hours: estimated_hours ?? null,
      is_out_of_scope,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${projectId}`);
  return request;
}

export async function getScopeRequests(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // No ownership check needed since the query is project-scoped,
  // but verify project belongs to user for defense-in-depth
  await verifyProjectOwnership(projectId, user.id);

  const { data, error } = await supabase
    .from('scope_requests')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateScopeRequest(
  id: string,
  data: { description?: string; estimated_hours?: number; is_out_of_scope?: boolean }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyScopeRequestOwnership(id, user.id);

  const { data: updated, error } = await supabase
    .from('scope_requests')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${updated.project_id}`);
  return updated;
}

export async function deleteScopeRequest(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyScopeRequestOwnership(id, user.id);

  const { data: request } = await supabase
    .from('scope_requests')
    .select('project_id')
    .eq('id', id)
    .single();

  if (!request) throw new Error('Not found');

  const { error } = await supabase
    .from('scope_requests')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath(`/projects/${request.project_id}`);
}
