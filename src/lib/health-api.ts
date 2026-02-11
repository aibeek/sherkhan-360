import { supabase } from './supabase'

// Типы данных
export type User = {
  id: string
  full_name: string
  email: string
  profile_image_url?: string | null
  created_at: string
  last_login?: string | null
  updated_at: string
}

export type Device = {
  id: string
  user_id: string
  name: string
  mac_address: string
  model: string
  firmware_version: string
  is_connected: boolean
  last_sync: string
  real_time_tracking: boolean | null
  created_at: string
  updated_at: string
}

export type BloodOxygenMetric = {
  id: string
  user_id: string
  device_id: string
  oxygen_saturation: number
  timestamp: string
  created_at: string
}

export type BloodPressureMetric = {
  id: string
  user_id: string
  device_id: string
  systolic: number
  diastolic: number
  timestamp: string
  created_at: string
}

export type BloodSugarMetric = {
  id: string
  user_id: string
  device_id: string
  blood_sugar: number
  timestamp: string
  created_at: string
}

export type HeartRateMetric = {
  id: string
  user_id: string
  device_id: string
  heart_rate: number
  timestamp: string
  created_at: string
}

export type StepsMetric = {
  id: string
  user_id: string
  device_id: string
  steps: number
  calories: number
  distance: number
  timestamp: string
  created_at: string
}

export type TemperatureMetric = {
  id: string
  user_id: string
  device_id: string
  temperature: number
  timestamp: string
  created_at: string
}

// API функции
export async function getBloodOxygenMetrics(userId?: string, deviceId?: string, from?: string, to?: string) {
  let query = supabase.from('blood_oxygen_metrics').select('*').order('timestamp', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  if (deviceId) query = query.eq('device_id', deviceId)
  if (from) query = query.gte('timestamp', from)
  if (to) query = query.lte('timestamp', to)
  const { data, error } = await query
  if (error) throw error
  return data as BloodOxygenMetric[]
}

export async function getBloodPressureMetrics(userId?: string, deviceId?: string, from?: string, to?: string) {
  let query = supabase.from('blood_pressure_metrics').select('*').order('timestamp', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  if (deviceId) query = query.eq('device_id', deviceId)
  if (from) query = query.gte('timestamp', from)
  if (to) query = query.lte('timestamp', to)
  const { data, error } = await query
  if (error) throw error
  return data as BloodPressureMetric[]
}

export async function getBloodSugarMetrics(userId?: string, deviceId?: string, from?: string, to?: string) {
  let query = supabase.from('blood_sugar_metrics').select('*').order('timestamp', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  if (deviceId) query = query.eq('device_id', deviceId)
  if (from) query = query.gte('timestamp', from)
  if (to) query = query.lte('timestamp', to)
  const { data, error } = await query
  if (error) throw error
  return data as BloodSugarMetric[]
}

export async function getHeartRateMetrics(userId?: string, deviceId?: string, from?: string, to?: string) {
  let query = supabase.from('heart_rate_metrics').select('*').order('timestamp', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  if (deviceId) query = query.eq('device_id', deviceId)
  if (from) query = query.gte('timestamp', from)
  if (to) query = query.lte('timestamp', to)
  const { data, error } = await query
  if (error) throw error
  return data as HeartRateMetric[]
}

export async function getStepsMetrics(userId?: string, deviceId?: string, from?: string, to?: string) {
  let query = supabase.from('steps_metrics').select('*').order('timestamp', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  if (deviceId) query = query.eq('device_id', deviceId)
  if (from) query = query.gte('timestamp', from)
  if (to) query = query.lte('timestamp', to)
  const { data, error } = await query
  if (error) throw error
  return data as StepsMetric[]
}

export async function getTemperatureMetrics(userId?: string, deviceId?: string, from?: string, to?: string) {
  let query = supabase.from('temperature_metrics').select('*').order('timestamp', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  if (deviceId) query = query.eq('device_id', deviceId)
  if (from) query = query.gte('timestamp', from)
  if (to) query = query.lte('timestamp', to)
  const { data, error } = await query
  if (error) throw error
  return data as TemperatureMetric[]
}

export async function getDevices(userId?: string) {
  let query = supabase.from('devices').select('*')
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) throw error
  return data as Device[]
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('full_name', { ascending: true })
  
  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }
  
  console.log('Fetched users:', data?.length || 0, 'users')
  return (data || []) as User[]
}
