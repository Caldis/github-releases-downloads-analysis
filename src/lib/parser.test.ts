import { describe, expect, it } from 'vitest'

import { parseRepoInput } from './parser'

describe('parseRepoInput', () => {
  it('parses a GitHub repository URL', () => {
    expect(parseRepoInput('https://github.com/openai/codex')).toEqual({
      owner: 'openai',
      repo: 'codex',
    })
  })

  it('parses owner/repo shorthand', () => {
    expect(parseRepoInput('vitejs/vite')).toEqual({
      owner: 'vitejs',
      repo: 'vite',
    })
  })

  it('removes a .git suffix from owner/repo input', () => {
    expect(parseRepoInput('facebook/react.git')).toEqual({
      owner: 'facebook',
      repo: 'react',
    })
  })
})
