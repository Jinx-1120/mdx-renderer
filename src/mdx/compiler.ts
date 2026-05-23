import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'

export async function compileMdx(source: string): Promise<string> {
  // Strip HTML comments before compiling — MDX treats <!-- --> as invalid JSX
  const stripped = source.replace(/<!--[\s\S]*?-->/g, '')
  const file = await compile(stripped, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
  })
  return String(file)
}
