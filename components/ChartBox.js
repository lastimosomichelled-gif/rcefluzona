'use client';
import { useEffect, useRef } from 'react';
import {
  Chart, BarController, BarElement, DoughnutController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';

Chart.register(BarController, BarElement, DoughnutController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend);

export default function ChartBox({ kind, labels, data }) {
  const ref = useRef(null);
  useEffect(() => {
    const config =
      kind === 'bar'
        ? {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                label: 'Total units delivered',
                data,
                backgroundColor: 'rgba(35, 88, 39, 0.85)',
                borderColor: 'rgba(18, 62, 50, 1)',
                borderWidth: 1,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { title: { display: true, text: 'Fund source' } },
                y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Total units' } },
              },
              plugins: { legend: { display: false } },
            },
          }
        : {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: ['#7cb342', '#235827', '#d9534f'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
          };
    const chart = new Chart(ref.current, config);
    return () => chart.destroy();
  }, [kind, labels, data]);
  return <div className="chart-box"><canvas ref={ref} /></div>;
}
