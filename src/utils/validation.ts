export function generateHints(expected: any, actual: any): string[] {
  const hints: string[] = []
  
  if (typeof expected !== typeof actual) {
    hints.push(`Expected type: ${typeof expected}, but got: ${typeof actual}`)
  }
  
  if (typeof expected === 'object' && expected !== null && actual !== null) {
    const expectedKeys = Object.keys(expected)
    const actualKeys = Object.keys(actual || {})
    
    const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key))
    const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key))
    
    if (missingKeys.length > 0) {
      hints.push(`Missing keys: ${missingKeys.join(', ')}`)
    }
    
    if (extraKeys.length > 0) {
      hints.push(`Unexpected keys: ${extraKeys.join(', ')}`)
    }
  }
  
  return hints
}

export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) {
    return 1.0
  }
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}