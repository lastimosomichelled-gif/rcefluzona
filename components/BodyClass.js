'use client';
import { useEffect } from 'react';

// style.css targets classes on <body> (e.g. body.app-page, body.auth).
export default function BodyClass({ name }) {
  useEffect(() => {
    const names = name.split(' ');
    document.body.classList.add(...names);
    return () => document.body.classList.remove(...names);
  }, [name]);
  return null;
}
