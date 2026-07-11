import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(100),
  client_name: z.string().min(1, '客户名称不能为空').max(100),
  hourly_rate: z.coerce.number().min(1, '时薪必须大于0').max(99999),
})

export const deliverableSchema = z.object({
  name: z.string().min(1, '交付物名称不能为空').max(500),
})

export const scopeRequestSchema = z.object({
  description: z.string().min(1, '需求描述不能为空').max(1000),
  estimated_hours: z.coerce.number().min(0, '工时不能为负').max(9999).optional(),
  is_out_of_scope: z.boolean().default(true),
})
