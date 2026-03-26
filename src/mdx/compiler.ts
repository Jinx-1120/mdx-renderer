import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import { transform } from 'sucrase'

export async function compileMdx(source: string): Promise<string> {
  const file = await compile(source, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
  })
  return String(file)
}

export function transformUserComponents(source: string): string {
  const result = transform(source, {
    transforms: ['typescript', 'jsx'],
    jsxRuntime: 'classic',
  })
  return result.code
}

export function extractComponentNames(code: string): string[] {
  const regex = /(?:const|let|var|function)\s+([A-Z][a-zA-Z0-9]*)/g
  const names: string[] = []
  let match
  while ((match = regex.exec(code)) !== null) {
    names.push(match[1])
  }
  return names
}
