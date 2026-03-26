import { describe, it, expect } from 'vitest'
import { compileMdx, transformUserComponents, extractComponentNames } from '../mdx/compiler'

describe('compileMdx', () => {
  it('compiles simple markdown to function-body code', async () => {
    const result = await compileMdx('# Hello World\n\nSome paragraph text.')
    expect(result).toContain('_jsxs')
    expect(result).toContain('Hello World')
  })

  it('compiles MDX with JSX elements', async () => {
    const result = await compileMdx('# Title\n\n<Callout>test</Callout>')
    expect(result).toContain('Callout')
  })

  it('supports GFM tables', async () => {
    const mdx = '| A | B |\n|---|---|\n| 1 | 2 |'
    const result = await compileMdx(mdx)
    expect(result).toContain('thead')
  })

  it('throws on invalid MDX syntax', async () => {
    await expect(compileMdx('<Unclosed')).rejects.toThrow()
  })
})

describe('transformUserComponents', () => {
  it('transforms JSX to React.createElement', () => {
    const code = 'const Box = () => <div>hello</div>'
    const result = transformUserComponents(code)
    expect(result).toContain('React.createElement')
    expect(result).not.toContain('<div>')
  })

  it('handles TypeScript annotations', () => {
    const code = 'const Box = ({ title }: { title: string }) => <div>{title}</div>'
    const result = transformUserComponents(code)
    expect(result).toContain('React.createElement')
  })
})

describe('extractComponentNames', () => {
  it('extracts PascalCase const declarations', () => {
    const code = 'const MyCard = () => {}\nconst helper = () => {}\nconst Badge = () => {}'
    expect(extractComponentNames(code)).toEqual(['MyCard', 'Badge'])
  })

  it('extracts function declarations', () => {
    const code = 'function Alert() {}\nfunction helper() {}'
    expect(extractComponentNames(code)).toEqual(['Alert'])
  })

  it('returns empty array for no components', () => {
    expect(extractComponentNames('const x = 1')).toEqual([])
  })
})
