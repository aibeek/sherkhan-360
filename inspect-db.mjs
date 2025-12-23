import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://kzvgdokrdnypmckavbql.supabase.co',
  'sb_publishable_hfGxUX69tIkrXHARBJkY1Q_hagFUQTe'
)

async function inspectTables() {
  const tables = [
    'users',
    'devices', 
    'blood_oxygen_metrics',
    'blood_pressure_metrics',
    'blood_sugar_metrics',
    'heart_rate_metrics',
    'steps_metrics',
    'temperature_metrics'
  ]

  for (const table of tables) {
    console.log(`\n=== ${table} ===`)
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log('Error:', error.message)
    } else if (data && data[0]) {
      console.log('Columns:', Object.keys(data[0]))
      console.log('Sample:', data[0])
    } else {
      console.log('Empty table')
    }
  }
}

inspectTables()
