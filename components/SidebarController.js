'use client';
import { useEffect } from 'react';

// Same open/close behaviour as the original inline script.
export default function SidebarController() {
  useEffect(() => {
    const body = document.body;
    const toggle = document.querySelector('.sidebar-toggle');
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (!toggle || !backdrop) return;
    const mobile = window.matchMedia('(max-width: 800px)');

    const updateToggle = (isOpen) => {
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      toggle.querySelector('span').textContent = isOpen ? '×' : '☰';
    };
    const closeSidebar = () => {
      body.classList.remove('sidebar-open');
      body.classList.add('sidebar-collapsed');
      updateToggle(false);
    };
    const onToggle = () => {
      if (mobile.matches) {
        const isOpen = body.classList.toggle('sidebar-open');
        body.classList.toggle('sidebar-collapsed', !isOpen);
        updateToggle(isOpen);
      } else {
        const isOpen = body.classList.toggle('sidebar-collapsed') === false;
        updateToggle(isOpen);
      }
    };
    const onChange = () => {
      body.classList.remove('sidebar-open', 'sidebar-collapsed');
      if (mobile.matches) body.classList.add('sidebar-collapsed');
      updateToggle(!mobile.matches);
    };

    toggle.addEventListener('click', onToggle);
    backdrop.addEventListener('click', closeSidebar);
    mobile.addEventListener('change', onChange);
    if (mobile.matches) closeSidebar();

    return () => {
      toggle.removeEventListener('click', onToggle);
      backdrop.removeEventListener('click', closeSidebar);
      mobile.removeEventListener('change', onChange);
      body.classList.remove('sidebar-open', 'sidebar-collapsed');
    };
  }, []);
  return null;
}
