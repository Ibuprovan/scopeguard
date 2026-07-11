export type Plan = 'free' | 'pro'
export type ProjectStatus = 'active' | 'completed' | 'archived'
export type DeliverableStatus = 'pending' | 'in_progress' | 'completed'
export type ScopeRequestStatus = 'pending' | 'included_in_quote' | 'quoted'
export type ChangeOrderStatus = 'draft' | 'sent' | 'acknowledged' | 'negotiated'

export interface Profile {
  id: string
  email: string
  name: string | null
  plan: Plan
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  client_name: string
  hourly_rate: number
  status: ProjectStatus
  created_at: string
}

export interface Deliverable {
  id: string
  project_id: string
  name: string
  description: string | null
  status: DeliverableStatus
  sort_order: number
  created_at: string
}

export interface ScopeRequest {
  id: string
  project_id: string
  description: string
  estimated_hours: number | null
  is_out_of_scope: boolean
  status: ScopeRequestStatus
  created_at: string
}

export interface ChangeOrder {
  id: string
  project_id: string
  items: ChangeOrderItem[]
  total_amount: number | null
  status: ChangeOrderStatus
  share_token: string
  created_at: string
}

export interface ChangeOrderItem {
  id?: string
  description: string
  estimated_hours: number
  rate: number
  amount: number
}
