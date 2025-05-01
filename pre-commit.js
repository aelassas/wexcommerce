import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { constants } from 'node:fs'
import asyncFs from 'node:fs/promises'
import chalk from 'chalk'

const execAsync = promisify(exec)

// Configuration for the pre-commit checks
const config = {
  projects: {
    api: {
      folder: 'api',
      container: 'wc-dev-api',
      checks: ['lint', 'typeCheck', 'sizeCheck'],
    },
    backend: {
      folder: 'backend',
      container: 'wc-dev-backend',
      checks: ['lint', 'typeCheck', 'sizeCheck'],
    },
    frontend: {
      folder: 'frontend',
      container: 'wc-dev-frontend',
      checks: ['lint', 'typeCheck', 'sizeCheck'],
    },
  },
  timeout: 2000, // Timeout for Docker commands in milliseconds
  dockerComposeFile: 'docker-compose.dev.yml',
  maxFileSizeKB: 5 * 1024, // 5MB file size limit
  batchSize: 50, // Number of files to process in a batch for size check
  lintFilter: /\.(ts|tsx|js|jsx)$/,
  typeCheckFilter: /\.(ts|tsx)$/,
}

// Logger utilities
const logger = {
  fixMessage: (message) => {
    const isVSCodeTerminal = process.env.TERM_PROGRAM?.includes('vscode')
    return isVSCodeTerminal ? message.replace(/(ℹ️|⚠️)/g, '$1 ') : message
  },

  formatMessage: (folder, message) => {
    return `[${chalk.cyan(folder)}] ${message}`
  },

  log: (message) => {
    console.log(logger.fixMessage(message))
  },

  logProject: (project, message) => {
    logger.log(logger.formatMessage(project.folder, message))
  },

  logError: (message, ...args) => {
    console.error(chalk.red(logger.fixMessage(message)), ...args)
  },

  logProjectError: (project, message, ...args) => {
    logger.logError(logger.formatMessage(project.folder, message), ...args)
  }
}

// Docker environment detection
const docker = {
  isInsideDocker: async () => {
    try {
      const cgroup = await asyncFs.readFile('/proc/1/cgroup', 'utf8')
      return cgroup.includes('docker') || cgroup.includes('containerd')
    } catch {
      return false
    }
  },

  isDockerRunning: async () => {
    try {
      await execAsync('docker info', { timeout: config.timeout })
      return true
    } catch {
      return false
    }
  },

  isContainerRunning: async (containerName) => {
    try {
      const { stdout } = await execAsync(
        `docker ps --filter "name=${containerName}" --filter "status=running" --format "{{.Names}}"`,
        { timeout: config.timeout },
      )
      const isRunning = stdout.trim().includes(containerName)
      return isRunning
    } catch {
      return false
    }
  }
}

// Git operations
const git = {
  // Get all staged files at once, more efficient than multiple git calls
  getChangedFiles: async () => {
    try {
      const { stdout } = await execAsync('git diff --cached --name-only')
      return stdout.trim().split('\n').filter(Boolean)
    } catch (err) {
      logger.logError('❌ Failed to get changed files:', err.message)
      return []
    }
  },
  getChangedFilesInProject: async (project) => {
    try {
      const { folder } = project
      const { stdout } = await execAsync(`git diff --cached --name-only ${folder}/`)
      return stdout.trim().split('\n').filter(Boolean).map((file) => file.replace(`${folder}/`, ''))
    } catch (err) {
      logProjectError(project, '❌ Failed to get changed files:', err)
      return []
    }
  }
}

// File system operations
const fs = {
  pathExists: async (filePath) => {
    try {
      await asyncFs.access(filePath, constants.F_OK)
      return true
    } catch {
      return false
    }
  },

  getFileStats: async (filePath) => {
    try {
      const stats = await asyncFs.stat(filePath)
      return stats
    } catch {
      return null
    }
  },

  // Process files in parallel batches
  processBatch: async (files, processor, batchSize = config.batchSize) => {
    const results = []

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      const batchResults = await Promise.all(batch.map(processor))
      results.push(...batchResults)
    }

    return results
  }
}

// Command execution
const cmd = {
  escapeShellArg: (arg) => {
    return arg.replace(/(["'\\$`!])/g, '\\$1')
  },

  run: async (command, options = {}) => {
    try {
      const { stdout, stderr } = await execAsync(command, {
        ...options,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      })

      if (stdout) {
        process.stdout.write(stdout)
      }
      if (stderr) {
        process.stderr.write(stderr)
      }
    } catch (err) {
      if (err.stdout) {
        process.stdout.write(err.stdout)
      }
      if (err.stderr) {
        process.stderr.write(err.stderr)
      }
      throw err
    }
  },

  runInContext: async (project, command, runInDocker) => {
    const { folder, container } = project
    const safeFolder = cmd.escapeShellArg(folder)
    const safeCmd = cmd.escapeShellArg(command)

    if (runInDocker && container) {
      const dockerCmd = `docker compose -f ${config.dockerComposeFile} exec -T ${container} sh -c "cd /bookcars/${safeFolder} && ${safeCmd}"`
      return cmd.run(dockerCmd, { cwd: process.cwd() })
    }

    return cmd.run(safeCmd, { cwd: safeFolder })
  }
}

// Process files by project
const processFiles = {
  groupFilesByFolder: (files) => {
    // Create lookup map for faster folder checks
    const folderMap = new Map()
    Object.values(config.projects).forEach((project) => {
      folderMap.set(project.folder, [])
    })

    for (const file of files) {
      const [folder, ...rest] = file.split('/')
      if (folderMap.has(folder)) {
        folderMap.get(folder).push(rest.join('/'))
      }
    }

    // Convert map to object for compatibility with the rest of the code
    return Object.fromEntries(folderMap)
  },

  filterFiles: (files, regex) => {
    return files.filter((file) => regex.test(file))
  }
}

// Check implementations
const checks = {
  lint: async (project, files, runInDocker) => {
    if (files.length === 0) {
      return
    }

    const targets = processFiles.filterFiles(files, config.lintFilter)

    if (targets.length === 0) {
      logger.logProject(project, `ℹ️ No lintable files.`)
      return
    }

    logger.logProject(project, `🔍 Running ESLint on ${targets.length} file(s)...`)

    try {
      // Join targets into a single string to avoid command line length issues
      await cmd.runInContext(
        project,
        `npx eslint ${targets.join(' ')} --cache --cache-location .eslintcache --quiet`,
        runInDocker,
      )
      logger.logProject(project, `${chalk.green('✅ ESLint passed.')}`)
    } catch (err) {
      logger.logProjectError(project, `❌ ESLint failed.`)
      throw err
    }
  },

  typeCheck: async (project, files, runInDocker) => {
    if (files.length === 0) {
      return
    }

    const targets = processFiles.filterFiles(files, config.typeCheckFilter)

    if (targets.length === 0) {
      logger.logProject(project, `ℹ️ No TypeScript files to check.`)
      return
    }

    logger.logProject(project, `🔍 Running TypeScript check...`)

    try {
      // Always run type-check, but we could optimize by only checking affected files
      await cmd.runInContext(
        project,
        `npm run type-check`,
        runInDocker,
      )
      logger.logProject(project, `${chalk.green('✅ TypeScript check passed.')}`)
    } catch (err) {
      logger.logProjectError(project, `❌ TypeScript check failed.`)
      throw err
    }
  },

  sizeCheck: async (project, files) => {
    if (files.length === 0) {
      return
    }

    const { folder } = project
    logger.logProject(project, `📏 Checking file sizes...`)

    const oversizedFiles = []

    // Process files in parallel batches for better performance
    await fs.processBatch(files, async (file) => {
      const filePath = path.join(folder, file)
      const stats = await fs.getFileStats(filePath)

      if (stats) {
        const sizeKB = stats.size / 1024
        if (sizeKB > config.maxFileSizeKB) {
          oversizedFiles.push({ file, sizeKB: sizeKB.toFixed(2) })
        }
      }
    })

    if (oversizedFiles.length > 0) {
      logger.logProjectError(project, `❌ Found ${oversizedFiles.length} files exceeding size limit (${config.maxFileSizeKB}KB):`)
      oversizedFiles.forEach(({ file, sizeKB }) => {
        logger.logProjectError(project, `  - ${file} (${sizeKB}KB)`)
      })
      throw new Error(`Oversized files detected in ${folder}`)
    }

    logger.logProject(project, `${chalk.green('✅ All files are within size limits.')}`)
  }
}

// Main execution function
const main = async () => {
  const label = 'pre-commit'
  console.time(label)
  logger.log('🚀 Starting pre-commit checks...')

  try {
    // Run these checks in parallel to save time
    const [insideDocker, dockerRunning, changedFiles] = await Promise.all([
      docker.isInsideDocker(),
      docker.isDockerRunning(),
      git.getChangedFiles(),
    ])

    // Determine if we should run in Docker
    let runInDocker = false

    if (insideDocker) {
      logger.log('🐳 Inside Docker environment. Running checks locally...')
    } else if (dockerRunning) {
      const containersNeeded = Object.values(config.projects)
        .filter((project) => project.container)
        .map((project) => project.container)
      const runningContainers = await Promise.all(
        containersNeeded.map((container) => docker.isContainerRunning(container))
      )

      runInDocker = runningContainers.every(Boolean)

      if (runInDocker) {
        logger.log('🐳 Docker and containers are running. Running checks inside Docker...')
      } else {
        logger.log('⚠️ Docker is running, but some containers are not. Running checks locally...')
      }
    } else {
      logger.log('⚠️ Docker is not running. Running checks locally...')
    }

    // Group files by project folder
    const projectFiles = processFiles.groupFilesByFolder(changedFiles)

    const tasks = []

    for (const [projectName, project] of Object.entries(config.projects)) {
      const { folder, checks: projectChecks } = project

      if (!folder) {
        logger.logProject({ folder: projectName }, '⚠️ Missing folder config. Skipping.')
        continue
      }

      if (!(await fs.pathExists(folder))) {
        logger.logProject(project, '⚠️ Folder not found. Skipping.')
        continue
      }

      const files = projectFiles[folder]

      if (files.length === 0) {
        logger.logProject(project, 'ℹ️ No changed files. Skipping.')
        continue
      }

      if (!projectChecks || projectChecks.length === 0) {
        logger.logProject(project, 'ℹ️ No checks configured. Skipping.')
        continue
      }

      const folderTasks = []

      if (projectChecks.includes('lint')) {
        folderTasks.push(checks.lint(project, files, runInDocker))
      }

      if (projectChecks.includes('typeCheck')) {
        folderTasks.push(checks.typeCheck(project, files, runInDocker))
      }

      if (projectChecks.includes('sizeCheck')) {
        folderTasks.push(checks.sizeCheck(project, files))
      }

      // Run checks in parallel per project
      tasks.push(Promise.all(folderTasks))
    }

    // Wait for all tasks to complete, and if any fails, it will throw an error
    await Promise.all(tasks)

    logger.log(`\n${chalk.green('✅ All checks passed. Proceeding with commit.')}`)
    console.timeEnd(label)
    process.exit(0)
  } catch {
    logger.logError('\n🚫 Commit aborted due to pre-commit errors.')
    console.timeEnd(label)
    process.exit(1)
  }
}

main() // Run pre-commit checks
