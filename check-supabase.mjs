import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://kzvgdokrdnypmckavbql.supabase.co',
  'sb_publishable_hfGxUX69tIkrXHARBJkY1Q_hagFUQTe'
)

async function checkTables() {
  console.log('Checking tables...')
  
  const tables = [
    'users',
    'profiles',
    'heart_rate_metrics',
    'blood_oxygen_metrics',
    'blood_pressure_metrics',
    'blood_sugar_metrics',
    'steps_metrics',
    'temperature_metrics',
    'devices'
  ]

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`Table "${table}": ERROR - ${error.message} (${error.code})`)
    } else {
      console.log(`Table "${table}": OK - ${count} rows`)
      if (table === 'users' || table === 'profiles') {
        const { data: oneRow, error: rowError } = await supabase.from(table).select('*').limit(1)
        if (rowError) {
          console.log(`  Error reading one row from ${table}: ${rowError.message}`)
        } else if (oneRow && oneRow.length > 0) {
          console.log(`  Columns in ${table}: ${Object.keys(oneRow[0]).join(', ')}`)
        } else {
          console.log(`  Table ${table} is empty, cannot determine columns.`)
        }
      }
    }
  }
}

checkTables()
