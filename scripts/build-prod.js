import { execSync } from 'child_process'

console.log('=== Production Deployment Build Started ===\n')

function runCommand(command) {
  console.log(`> Executing: ${command}`)
  execSync(command, { stdio: 'inherit' })
}

// 1. Optional database migrations (safe fallback if run in build stage)
if (process.env.RUN_MIGRATIONS === 'true' && process.env.DATABASE_URL) {
  try {
    console.log('🔄 Running database migrations...')
    runCommand('npx --yes tsx server/database/migrate.ts')
    console.log('✅ Database migrations successfully applied.\n')
  } catch (err) {
    console.warn('⚠️ Migration note (non-fatal):', err.message || err)
  }
}

// 2. Compiling Nuxt
try {
  console.log('📦 Compiling Nuxt application for production...')
  runCommand('npx nuxt build')
  console.log('\n✅ Nuxt build completed successfully!')
  console.log('\n=== Production Deployment Build Finished ===')
} catch (error) {
  console.error('\n❌ Nuxt build failed with error:')
  console.error(error)
  process.exit(1)
}
