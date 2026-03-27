// Built-in component JS code embedded in the iframe.
// Uses React UMD global (React.createElement, React.useState, React.Children).

export const builtinComponentsCode = `
var Callout = function({ type = 'info', children }) {
  var styles = {
    info:    { bg: '#eff6ff', border: '#3b82f6' },
    tip:     { bg: '#f0fdf4', border: '#22c55e' },
    warning: { bg: '#fffbeb', border: '#f59e0b' },
    error:   { bg: '#fef2f2', border: '#ef4444' },
  };
  var darkStyles = {
    info:    { bg: '#1e293b', border: '#3b82f6' },
    tip:     { bg: '#1a2e1a', border: '#22c55e' },
    warning: { bg: '#2e2a1a', border: '#f59e0b' },
    error:   { bg: '#2e1a1a', border: '#ef4444' },
  };
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var s = isDark ? Object.assign({}, styles[type], darkStyles[type]) : styles[type];
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

var Tab = function({ children }) { return React.createElement('div', null, children); };

var Tabs = function({ children }) {
  var ref = React.useState(0);
  var active = ref[0], setActive = ref[1];
  var tabs = React.Children.toArray(children).filter(function(c) { return c && c.props; });
  return React.createElement('div', {
    style: { marginBottom: '16px', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }
  },
    React.createElement('div', {
      style: { display: 'flex', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5' }
    }, tabs.map(function(tab, i) {
      return React.createElement('button', {
        key: i,
        onClick: function() { setActive(i); },
        style: {
          padding: '8px 16px',
          border: 'none',
          background: active === i ? '#fff' : 'transparent',
          borderBottom: active === i ? '2px solid #3b82f6' : '2px solid transparent',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: active === i ? '600' : '400',
        }
      }, tab.props.label || 'Tab ' + (i + 1));
    })),
    React.createElement('div', { style: { padding: '12px 16px' } },
      tabs[active] || null
    )
  );
};

var CodeBlock = function({ lang, children }) {
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

var Step = function({ children }) {
  return React.createElement('div', {
    style: { paddingLeft: '24px', paddingBottom: '16px', borderLeft: '2px solid #e0e0e0', marginLeft: '11px' }
  }, children);
};

var Steps = function({ children }) {
  return React.createElement('div', {
    style: { marginBottom: '16px' }
  }, React.Children.toArray(children).map(function(child, i) {
    return React.createElement('div', { key: i, style: { display: 'flex', gap: '0' } },
      React.createElement('div', {
        style: {
          width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '600', flexShrink: '0', marginTop: '2px',
        }
      }, i + 1),
      React.createElement('div', { style: { flex: 1 } }, child)
    );
  }));
};

var Badge = function({ variant = 'default', children }) {
  var colors = {
    default: { bg: '#e5e7eb', text: '#374151' },
    primary: { bg: '#dbeafe', text: '#1e40af' },
    success: { bg: '#dcfce7', text: '#166534' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    danger:  { bg: '#fee2e2', text: '#991b1b' },
  };
  var c = colors[variant] || colors.default;
  return React.createElement('span', {
    style: {
      display: 'inline-block', padding: '2px 8px', borderRadius: '9999px',
      fontSize: '12px', fontWeight: '500', background: c.bg, color: c.text,
    }
  }, children);
};

var AccordionItem = function({ title, children }) {
  var ref = React.useState(false);
  var open = ref[0], setOpen = ref[1];
  return React.createElement('div', {
    style: { borderBottom: '1px solid #e0e0e0' }
  },
    React.createElement('button', {
      onClick: function() { setOpen(!open); },
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

var Accordion = function({ children }) {
  return React.createElement('div', {
    style: { border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }
  }, children);
};
`

export const builtinComponentNames = [
  'Callout', 'Tab', 'Tabs', 'CodeBlock', 'Step', 'Steps', 'Badge', 'AccordionItem', 'Accordion'
]
