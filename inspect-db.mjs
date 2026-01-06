import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://kzvgdokrdnypmckavbql.supabase.co',
  'sb_publishable_hfGxUX69tIkrXHARBJkY1Q_hagFUQTe'
)

const TARGET_DEVICE = '74ccf818-b61c-ea13-2a7b-b6901465106d'

async function inspectTables() {
  console.log(`=== Data for device: ${TARGET_DEVICE} ===\n`)
  
  // Get all heart rate data for this device
  const { data: heartData } = await supabase
    .from('heart_rate_metrics')
    .select('*')
    .eq('device_id', TARGET_DEVICE)
    .order('timestamp', { ascending: true })
  
  console.log('Heart Rate records:', heartData?.length || 0)
  if (heartData && heartData.length > 0) {
    console.log('First:', heartData[0].timestamp, '- HR:', heartData[0].heart_rate)
    console.log('Last:', heartData[heartData.length-1].timestamp, '- HR:', heartData[heartData.length-1].heart_rate)
    const avgHr = heartData.reduce((s, x) => s + x.heart_rate, 0) / heartData.length
    console.log('Average HR:', Math.round(avgHr))
  }
  
  // Get steps
  const { data: stepsData } = await supabase
    .from('steps_metrics')
    .select('*')
    .eq('device_id', TARGET_DEVICE)
  
  console.log('\nSteps records:', stepsData?.length || 0)
  if (stepsData && stepsData.length > 0) {
    const totalSteps = stepsData.reduce((s, x) => s + x.steps, 0)
    console.log('Total steps:', totalSteps)
  }
  
  // Get oxygen
  const { data: oxygenData } = await supabase
    .from('blood_oxygen_metrics')
    .select('*')
    .eq('device_id', TARGET_DEVICE)
  
  console.log('\nOxygen records:', oxygenData?.length || 0)
  
  // Get temperature
  const { data: tempData } = await supabase
    .from('temperature_metrics')
    .select('*')
    .eq('device_id', TARGET_DEVICE)
  
  console.log('Temperature records:', tempData?.length || 0)
  if (tempData && tempData.length > 0) {
    console.log('Sample temp:', tempData[0].temperature)
  }
  
  // Check active intervals based on new formula
  console.log('\n=== Checking Active Intervals (new formula) ===')
  console.log('Active if >= 2 conditions: HR>=85, steps>0, skinTemp>33')
  
  if (heartData) {
    let activeCount = 0
    for (const hr of heartData) {
      let conditions = 0
      if (hr.heart_rate >= 85) conditions++
      
      // Find matching steps
      const step = stepsData?.find(s => s.timestamp === hr.timestamp)
      if (step && step.steps > 0) conditions++
      
      // Find matching temp
      const temp = tempData?.find(t => t.timestamp === hr.timestamp)
      if (temp && temp.temperature > 33) conditions++
      
      if (conditions >= 2) activeCount++
    }
    console.log('Active intervals:', activeCount, 'of', heartData.length)
  }
}

inspectTables()
