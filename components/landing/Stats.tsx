'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 500, suffix: '+', label: 'Dossiers traites' },
  { value: 95, suffix: '%', label: 'Taux de satisfaction' },
  { value: 80, suffix: '%', label: 'Subvention moyenne' },
  { value: 48, suffix: 'h', label: 'Delai de reponse' },
];

function useCountUp(target: number, isVisible: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [target, isVisible]);
  return count;
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-primary px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} visible={visible} />
        ))}
      </div>
    </section>
  );
}

function StatItem({
  stat,
  visible,
}: {
  stat: (typeof stats)[number];
  visible: boolean;
}) {
  const count = useCountUp(stat.value, visible);
  return (
    <div className="text-center text-primary-content">
      <p className="text-3xl font-bold sm:text-4xl md:text-5xl">
        {count}
        {stat.suffix}
      </p>
      <p className="mt-1 text-sm text-primary-content/70">{stat.label}</p>
    </div>
  );
}
