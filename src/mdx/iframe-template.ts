import { builtinComponentsCode, builtinComponentNames } from './builtins'
import markdownThemeCss from '../styles/markdown-theme.css?raw'

export function generateIframeTemplate(theme: 'light' | 'dark'): string {
  return `<!DOCTYPE html>
<html data-theme="${theme}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18?bundle",
      "react-dom/client": "https://esm.sh/react-dom@18/client?bundle",
      "react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime?bundle"
    }
  }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${markdownThemeCss}</style>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    #error-display {
      display: none;
      padding: 12px 16px;
      background: #fef2f2;
      color: #dc2626;
      font-family: monospace;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
      border-bottom: 2px solid #fca5a5;
    }
    [data-theme='dark'] #error-display {
      background: #2e1a1a;
      color: #f38ba8;
      border-bottom-color: #6b2020;
    }
  </style>
</head>
<body>
  <div id="error-display"></div>
  <div id="root" class="markdown-body"></div>
  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

    ${builtinComponentsCode}

    const builtinComponents = { ${builtinComponentNames.join(', ')} };

    const root = createRoot(document.getElementById('root'));
    const errorEl = document.getElementById('error-display');

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }

    function hideError() {
      errorEl.style.display = 'none';
    }

    window.addEventListener('message', async (event) => {
      const { type, code, userComponentCode, theme } = event.data;

      if (type === 'theme') {
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('root').setAttribute('data-theme', theme);
        return;
      }

      if (type !== 'render') return;

      try {
        hideError();

        // Parse user-defined components
        let userComponents = {};
        if (userComponentCode && userComponentCode.trim()) {
          try {
            const fn = new Function('React', userComponentCode);
            userComponents = fn(React) || {};
          } catch (e) {
            showError('Component Error: ' + e.message);
          }
        }

        // Execute compiled MDX
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const mdxFn = new AsyncFunction(code);
        const mod = await mdxFn({ jsx, jsxs, Fragment });
        const MDXContent = mod.default;

        // Merge components and render
        const allComponents = { ...builtinComponents, ...userComponents };
        root.render(React.createElement(MDXContent, { components: allComponents }));
      } catch (e) {
        showError('Render Error: ' + e.message);
        window.parent.postMessage({ type: 'error', message: e.message }, '*');
      }
    });

    // Signal iframe is ready
    window.parent.postMessage({ type: 'ready' }, '*');
  </script>
</body>
</html>`
}
