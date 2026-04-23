import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../../../providers/AppThemeProvider';
import { Button, type ButtonColorOverrides } from '../../button/Button';
import { menuItems } from '../../../menu-items/menu-items';

/** Текст пунктов меню на цветной плашке — всегда белый */
const navMenuText: ButtonColorOverrides = {
  contrastText: 'rgba(255, 255, 255, 0.965)',
};

/** Подсветка текущей страницы в сайдбаре */
const navItemActive: ButtonColorOverrides = {
  main: 'rgba(255, 255, 255, 0.32)',
  hover: 'rgba(255, 255, 255, 0.4)',
  active: 'rgba(255, 255, 255, 0.48)',
  contrastText: 'rgba(255, 255, 255, 0.99)',
  ripple: 'color-mix(in srgb, rgba(255, 255, 255, 0.5) 45%, transparent)',
};

function itemPath(href: string) {
  return href === '' ? '/' : `/${href}`;
}

function isItemActive(pathname: string, href: string) {
  const p = itemPath(href).replace(/\/$/, '') || '/';
  const loc = pathname.replace(/\/$/, '') || '/';
  return loc === p;
}

export default function Navbar() {
  const { colors } = useContext(ThemeContext);
  const { pathname } = useLocation();

  return (
    <div style={{ backgroundColor: colors.layout.background, minWidth: '200px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {menuItems.map((item) => {
          const active = isItemActive(pathname, item.href);
          const ItemIcon =
            active && item.activeIcon ? item.activeIcon : item.icon;
          return (
            <Button
              key={item.href}
              to={itemPath(item.href)}
              variant="translucent"
              colorOverrides={active ? navItemActive : undefined}
              style={{
                borderRadius: '0',
                padding: '6px 10px',
                minHeight: '0px',
                boxShadow: 'none',
                justifyContent: 'flex-start',
                gap: '10px',
                fontWeight: active ? 600 : 500,
                borderLeft: active
                  ? '3px solid rgba(255, 255, 255, 0.85)'
                  : '3px solid transparent',
                boxSizing: 'border-box',
              }}
              aria-current={active ? 'page' : undefined}
            >
              {ItemIcon ? (
                <ItemIcon
                  style={{ fontSize: '1.25rem' }}
                  aria-hidden
                />
              ) : null}
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  )
}