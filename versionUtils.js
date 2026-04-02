// ── Version Comparison Engine ───────────────────────────────────

/**
 * Parse a version string into comparable components
 * Supports semantic versioning and various formats
 */
function parseVersion(version) {
  if (!version || typeof version !== 'string') {
    return { major: 0, minor: 0, patch: 0, prerelease: [], build: [], original: version || '0.0.0' }
  }

  // Remove common prefixes and clean the version
  const cleanVersion = version
    .replace(/^v/i, '')           // Remove 'v' prefix
    .replace(/[^\d\.\-a-zA-Z]/g, '') // Keep only digits, dots, hyphens, letters
    .trim()

  // Split into main version and pre-release/build parts
  const [mainPart, ...restParts] = cleanVersion.split('-')
  const [buildPart] = (restParts.join('-') || '').split('+')
  
  // Parse main version (x.y.z)
  const mainParts = mainPart.split('.')
  const major = parseInt(mainParts[0]) || 0
  const minor = parseInt(mainParts[1]) || 0
  const patch = parseInt(mainParts[2]) || 0

  // Parse pre-release identifiers (alpha, beta, rc, etc.)
  const prerelease = []
  if (buildPart) {
    const preParts = buildPart.split('.')
    for (const part of preParts) {
      if (/^\d+$/.test(part)) {
        prerelease.push(parseInt(part))
      } else {
        prerelease.push(part.toLowerCase())
      }
    }
  }

  return {
    major,
    minor,
    patch,
    prerelease,
    build: [], // Build metadata (ignored for comparison)
    original: version
  }
}

/**
 * Compare two version strings
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parsed1 = parseVersion(v1)
  const parsed2 = parseVersion(v2)

  // Compare major version
  if (parsed1.major !== parsed2.major) {
    return parsed1.major < parsed2.major ? -1 : 1
  }

  // Compare minor version
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor < parsed2.minor ? -1 : 1
  }

  // Compare patch version
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch < parsed2.patch ? -1 : 1
  }

  // Compare pre-release (no pre-release > pre-release)
  if (parsed1.prerelease.length === 0 && parsed2.prerelease.length > 0) {
    return 1
  }
  if (parsed1.prerelease.length > 0 && parsed2.prerelease.length === 0) {
    return -1
  }

  // Compare pre-release identifiers
  const maxLength = Math.max(parsed1.prerelease.length, parsed2.prerelease.length)
  for (let i = 0; i < maxLength; i++) {
    const part1 = parsed1.prerelease[i]
    const part2 = parsed2.prerelease[i]

    // Missing identifier is considered lower
    if (part1 === undefined && part2 !== undefined) return -1
    if (part1 !== undefined && part2 === undefined) return 1

    // Numeric comparison
    if (typeof part1 === 'number' && typeof part2 === 'number') {
      if (part1 !== part2) return part1 < part2 ? -1 : 1
    }
    // String comparison
    else if (typeof part1 === 'string' && typeof part2 === 'string') {
      if (part1 !== part2) return part1 < part2 ? -1 : 1
    }
    // Mixed types: numbers < strings
    else {
      return typeof part1 === 'number' ? -1 : 1
    }
  }

  return 0 // Versions are equal
}

/**
 * Check if version1 is newer than version2
 */
function isNewer(version1, version2) {
  return compareVersions(version1, version2) > 0
}

/**
 * Check if version1 is older than version2
 */
function isOlder(version1, version2) {
  return compareVersions(version1, version2) < 0
}

/**
 * Check if two versions are equal
 */
function isEqual(version1, version2) {
  return compareVersions(version1, version2) === 0
}

/**
 * Get the newest version from an array of versions
 */
function getNewestVersion(versions) {
  if (!versions || versions.length === 0) return null

  return versions.reduce((newest, current) => {
    return isNewer(current, newest) ? current : newest
  })
}

/**
 * Get the oldest version from an array of versions
 */
function getOldestVersion(versions) {
  if (!versions || versions.length === 0) return null

  return versions.reduce((oldest, current) => {
    return isOlder(current, oldest) ? current : oldest
  })
}

/**
 * Sort versions in ascending order (oldest to newest)
 */
function sortVersions(versions) {
  if (!versions || versions.length === 0) return []

  return [...versions].sort(compareVersions)
}

/**
 * Sort versions in descending order (newest to oldest)
 */
function sortVersionsDescending(versions) {
  if (!versions || versions.length === 0) return []

  return [...versions].sort((a, b) => compareVersions(b, a))
}

/**
 * Check if an update is significant (major or minor version change)
 */
function isSignificantUpdate(fromVersion, toVersion) {
  const from = parseVersion(fromVersion)
  const to = parseVersion(toVersion)

  return to.major > from.major || to.minor > from.minor
}

/**
 * Get version category (major, minor, patch, prerelease)
 */
function getVersionCategory(version) {
  const parsed = parseVersion(version)
  
  if (parsed.prerelease.length > 0) {
    return 'prerelease'
  }
  if (parsed.patch > 0) {
    return 'patch'
  }
  if (parsed.minor > 0) {
    return 'minor'
  }
  return 'major'
}

/**
 * Format version for display
 */
function formatVersion(version, options = {}) {
  const { includePrefix = false, short = false } = options
  const parsed = parseVersion(version)
  
  let formatted = `${parsed.major}.${parsed.minor}.${parsed.patch}`
  
  if (!short && parsed.prerelease.length > 0) {
    formatted += `-${parsed.prerelease.join('.')}`
  }
  
  if (includePrefix) {
    formatted = `v${formatted}`
  }
  
  return formatted
}

/**
 * Validate version string format
 */
function isValidVersion(version) {
  if (!version || typeof version !== 'string') return false
  
  const parsed = parseVersion(version)
  return parsed.original !== '0.0.0' || version === '0.0.0'
}

export {
  parseVersion,
  compareVersions,
  isNewer,
  isOlder,
  isEqual,
  getNewestVersion,
  getOldestVersion,
  sortVersions,
  sortVersionsDescending,
  isSignificantUpdate,
  getVersionCategory,
  formatVersion,
  isValidVersion
}
