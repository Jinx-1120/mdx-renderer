
// Each component is a JS string using React.createElement.
// React is imported in the iframe module scope.

export const builtinComponentsCode = `
const Callout = ({ type = 'info', children }) => {
  const styles = {
    info:    { bg: '#eff6ff', border: '#3b82f6', icon: 'i' },
    tip:     { bg: '#f0fdf4', border: '#22c55e', icon: '\\u2714' },
    warning: { bg: '#fffbeb', border: '#f59e0b', icon: '!' },
    error:   { bg: '#fef2f2', border: '#ef4444', icon: '\\u2718' },
  };
  const darkStyles = {
    info:    { bg: '#1e293b', border: '#3b82f6' },
    tip:     { bg: '#1a2e1a', border: '#22c55e' },
    warning: { bg: '#2e2a1a', border: '#f59e0b' },
    error:   { bg: '#2e1a1a', border: '#ef4444' },
  };
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const s = isDark ? { ...styles[type], ...darkStyles[type] } : styles[type];
  return React.createElement('div', {
    style: {
      padding: '12px 16px',
      borderLeft: '4px solid ' + s.border,
      background: s.bg,
      borderRadius: '4px',
      marginBottom: '16px',
      fontSize: '14px',
      lineHeight: '1.6',
    }
  }, children);
};

const Tab = ({ children }) => React.createElement('div', null, children);

const Tabs = ({ children }) => {
  const [active, setActive] = React.useState(0);
  const tabs = React.Children.toArray(children).filter(c => c && c.props);
  return React.createElement('div', {
    style: { marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }
  },
    React.createElement('div', {
      style: { display: 'flex', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5' }
    }, tabs.map((tab, i) =>
      React.createElement('button', {
        key: i,
        onClick: () => setActive(i),
        style: {
          padding: '8px 16px',
          border: 'none',
          background: active === i ? '#fff' : 'transparent',
          borderBottom: active === i ? '2px solid #3b82f6' : '2px solid transparent',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: active === i ? '600' : '400',
        }
      }, tab.props.label || 'Tab ' + (i + 1))
    )),
    React.createElement('div', { style: { padding: '12px 16px' } },
      tabs[active] || null
    )
  );
};

const CodeBlock = ({ lang, children }) => {
  return React.createElement('pre', {
    style: {
      background: '#f6f8fa',
      padding: '16px',
      borderRadius: '6px',
      overflow: 'auto',
      marginBottom: '16px',
    }
  }, React.createElement('code', {
    className: lang ? 'language-' + lang : '',
    style: { fontSize: '14px', fontFamily: "'SFMono-Regular', Consolas, monospace" }
  }, children));
};

const Step = ({ children }) => React.createElement('div', {
  style: { paddingLeft: '24px', paddingBottom: '16px', borderLeft: '2px solid #e0e0e0', marginLeft: '11px' }
}, children);

const Steps = ({ children }) => React.createElement('div', {
  style: { marginBottom: '16px' }
}, React.Children.toArray(children).map((child, i) =>
  React.createElement('div', { key: i, style: { display: 'flex', gap: '0' } },
    React.createElement('div', {
      style: {
        width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: '600', flexShrink: '0', marginTop: '2px',
      }
    }, i + 1),
    React.createElement('div', { style: { flex: 1 } }, child)
  )
));

const Badge = ({ variant = 'default', children }) => {
  const colors = {
    default: { bg: '#e5e7eb', text: '#374151' },
    primary: { bg: '#dbeafe', text: '#1e40af' },
    success: { bg: '#dcfce7', text: '#166534' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    danger:  { bg: '#fee2e2', text: '#991b1b' },
  };
  const c = colors[variant] || colors.default;
  return React.createElement('span', {
    style: {
      display: 'inline-block', padding: '2px 8px', borderRadius: '9999px',
      fontSize: '12px', fontWeight: '500', background: c.bg, color: c.text,
    }
  }, children);
};

const AccordionItem = ({ title, children }) => {
  const [open, setOpen] = React.useState(false);
  return React.createElement('div', {
    style: { borderBottom: '1px solid #e0e0e0' }
  },
    React.createElement('button', {
      onClick: () => setOpen(!open),
      style: {
        width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '14px', fontWeight: '500', textAlign: 'left',
      }
    }, title, React.createElement('span', {
      style: { transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }
    }, '\\u25BC')),
    open ? React.createElement('div', { style: { padding: '0 16px 12px' } }, children) : null
  );
};

const Accordion = ({ children }) => React.createElement('div', {
  style: { border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }
}, children);
`

export const builtinComponentNames = [
  'Callout', 'Tab', 'Tabs', 'CodeBlock', 'Step', 'Steps', 'Badge', 'AccordionItem', 'Accordion'
]
