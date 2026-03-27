import { builtinComponentsCode, builtinComponentNames } from './builtins'
import markdownThemeCss from '../styles/markdown-theme.css?raw'

export function generateIframeTemplate(theme: 'light' | 'dark'): string {
  return `<!DOCTYPE html>
<html data-theme="${theme}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
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
  <script>
    // jsx-runtime shim using the single global React instance
    var jsxRuntime = (function() {
      var createElement = React.createElement;
      var Fragment = React.Fragment;
      function jsx(type, props, key) {
        if (key !== undefined) {
          props = Object.assign({}, props, { key: key });
        }
        return createElement(type, props);
      }
      return { jsx: jsx, jsxs: jsx, Fragment: Fragment };
    })();

    ${builtinComponentsCode}

    var builtinComponents = { ${builtinComponentNames.join(', ')} };

    var root = ReactDOM.createRoot(document.getElementById('root'));
    var errorEl = document.getElementById('error-display');

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }

    function hideError() {
      errorEl.style.display = 'none';
    }

    window.addEventListener('message', function(event) {
      var data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'theme') {
        document.documentElement.setAttribute('data-theme', data.theme);
        document.getElementById('root').setAttribute('data-theme', data.theme);
        return;
      }

      if (data.type !== 'render') return;

      try {
        hideError();

        // Parse user-defined components
        var userComponents = {};
        if (data.userComponentCode && data.userComponentCode.trim()) {
          try {
            var fn = new Function('React', data.userComponentCode);
            userComponents = fn(React) || {};
          } catch (e) {
            showError('Component Error: ' + e.message);
          }
        }

        // Execute compiled MDX (function-body format expects {jsx, jsxs, Fragment})
        var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        var mdxFn = new AsyncFunction(data.code);
        mdxFn(jsxRuntime).then(function(mod) {
          var MDXContent = mod.default;
          var allComponents = Object.assign({}, builtinComponents, userComponents);
          root.render(React.createElement(MDXContent, { components: allComponents }));
        }).catch(function(e) {
          showError('Render Error: ' + e.message);
          window.parent.postMessage({ type: 'error', message: e.message }, '*');
        });
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
