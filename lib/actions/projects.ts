'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { projectSchema } from '@/lib/utils/validators';

export async function createProject(data: { name: string; client_name?: string; hourly_rate?: number }) {
  const validated = projectSchema.safeParse(data);
  if (!validated.success) {
    throw new Error('Validation failed: ' + validated.error.errors.map(e => e.message).join(', '));
  }
  const { name, client_name, hourly_rate } = validated.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    });
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, name, client_name, hourly_rate })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard');
  return project;
}

export async function getProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectStatus(id: string, status: 'active' | 'completed' | 'archived') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${id}`);
  revalidatePath('/dashboard');
  return data;
}
