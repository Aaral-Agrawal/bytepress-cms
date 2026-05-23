'use client';
 
import { useState, useEffect } from 'react';

function useCounter(target, suffix = '', duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(timer); return; }
      setVal(Math.round(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val + suffix;
}

export default function AnimatedCounters({
  blogsCount: targetBlogs = 2400,
  authorsCount: targetAuthors = 180,
  catsCount: targetCats = 48,
  readersCount: targetReaders = 320,
}) {
  const blogsCount   = useCounter(targetBlogs, '');
  const authorsCount = useCounter(targetAuthors, '');
  const catsCount    = useCounter(targetCats, '');
  const readersCount = useCounter(targetReaders, '');

  return (
    <div className="flex gap-8 mt-10 pt-8 border-t border-gray-100
      animate-fade-up [animation-delay:0.4s]">
      {[
        { num: blogsCount,   label: 'Articles'   },
        { num: authorsCount, label: 'Authors'    },
        { num: catsCount,    label: 'Categories' },
        { num: readersCount, label: 'Readers'    },
      ].map(({ num, label }) => (
        <div key={label} className="text-center">
          <span className="block text-2xl font-black text-gray-900 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}>
            {num}
          </span>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}