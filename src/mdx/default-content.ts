export const defaultMdxContent = `# Welcome to MDX Playground

This is a **live MDX editor**. Edit the content on the left and see the preview on the right.

## Markdown Features

- Lists, **bold**, *italic*, \`inline code\`
- [Links](https://mdxjs.com) and images
- Tables, blockquotes, and more

> Blockquotes are supported too!

| Feature | Status |
|---------|--------|
| Markdown | Supported |
| JSX | Supported |
| Tailwind | Supported |

## Using Components

<Callout type="tip">
  You can use built-in components like this Callout directly in your MDX content.
</Callout>

<Callout type="warning">
  This is a warning callout. Use it to highlight important information.
</Callout>

<Tabs>
  <Tab label="JavaScript">
    console.log('Hello from JS!')
  </Tab>
  <Tab label="Python">
    print('Hello from Python!')
  </Tab>
</Tabs>

## Steps Example

<Steps>
  <Step>Install the dependencies</Step>
  <Step>Write your MDX content</Step>
  <Step>See the live preview</Step>
</Steps>

## Badges

<Badge variant="primary">v1.0.0</Badge> <Badge variant="success">Stable</Badge> <Badge variant="warning">Beta</Badge>

## Tailwind CSS Support

<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
  <h3 className="text-xl font-bold mb-2">Tailwind CSS Works!</h3>
  <p>You can use Tailwind CSS classes directly in your MDX content.</p>
</div>

<div className="mt-4 grid grid-cols-2 gap-4">
  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-lg text-center font-medium">
    Card 1
  </div>
  <div className="bg-amber-100 text-amber-800 p-4 rounded-lg text-center font-medium">
    Card 2
  </div>
</div>
`

export const defaultComponentSource = ''
