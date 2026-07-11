'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { deliverableSchema } from '@/lib/utils/validators';

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

async function verifyDeliverableOwnership(deliverableId: string, userId: string) {
  const supabase = await createClient();
  const { data: del } = await supabase
    .from('deliverables')
    .select('project_id')
    .eq('id', deliverableId)
    .maybeSingle();
  if (!del) throw new Error('Forbidden');
  await verifyProjectOwnership(del.project_id, userId);
  return del;
}

export async function createDeliverable(projectId: string, data: { name: string; description?: string }) {
  const validated = deliverableSchema.safeParse(data);
  if (!validated.success) {
    throw new Error('Validation failed: ' + validated.error.errors.map(e => e.message).join(', '));
  }
  const { name } = validated.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyProjectOwnership(projectId, user.id);

  const { count } = await supabase
    .from('deliverables')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  const { data: deliverable, error } = await supabase
    .from('deliverables')
    .insert({ project_id: projectId, name, description: data.description ?? null, sort_order: (count ?? 0) + 1 })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${projectId}`);
  return deliverable;
}

export async function updateDeliverableStatus(id: string, status: 'pending' | 'in_progress' | 'completed') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyDeliverableOwnership(id, user.id);

  const { data: deliverable, error } = await supabase
    .from('deliverables')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${deliverable.project_id}`);
  return deliverable;
}

export async function updateDeliverable(id: string, data: { name?: string; description?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyDeliverableOwnership(id, user.id);

  if (data.name) {
    const validated = deliverableSchema.safeParse(data);
    if (!validated.success) {
      throw new Error('Validation failed: ' + validated.error.errors.map(e => e.message).join(', '));
    }
  }

  const { data: deliverable, error } = await supabase
    .from('deliverables')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${deliverable.project_id}`);
  return deliverable;
}

export async function deleteDeliverable(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyDeliverableOwnership(id, user.id);

  const { data: deliverable } = await supabase
    .from('deliverables')
    .select('project_id')
    .eq('id', id)
    .single();

  if (!deliverable) throw new Error('Not found');

  const { error } = await supabase
    .from('deliverables')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath(`/projects/${deliverable.project_id}`);
}

export async function reorderDeliverables(items: { id: string; sort_order: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (items.length > 0) {
    await verifyDeliverableOwnership(items[0].id, user.id);
  }

  const promises = items.map(item =>
    supabase.from('deliverables').update({ sort_order: item.sort_order }).eq('id', item.id)
  );

  const results = await Promise.all(promises);
  const firstError = results.find(r => r.error);
  if (firstError?.error) throw firstError.error;

  // revalidate the first item's project
  if (items.length > 0) {
    const { data: d } = await supabase.from('deliverables').select('project_id').eq('id', items[0].id).single();
    if (d) revalidatePath(`/projects/${d.project_id}`);
  }
}

export async function getDeliverables(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}
