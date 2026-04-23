import React from 'react';
import { Activity, DollarSign, Package, User, Users } from 'lucide-react';

const cards = [
  {
    title: 'Total Revenue',
    value: '$128,450',
    growth: '+12.5% from last month',
    growthTone: 'text-emerald-600',
    Icon: DollarSign,
  },
  {
    title: 'Total Orders',
    value: '2,846',
    growth: '+8.1% from last month',
    growthTone: 'text-emerald-600',
    Icon: Package,
  },
  {
    title: 'Total Customers',
    value: '1,924',
    growth: '+5.3% from last month',
    growthTone: 'text-emerald-600',
    Icon: Users,
  },
  {
    title: 'Active Now',
    value: '326',
    growth: '-2.4% from last hour',
    growthTone: 'text-rose-600',
    Icon: Activity,
  },
];

const activityItems = [
  { name: 'Vaibhav', action: "added 'Pixel 8'", time: '2 mins ago' },
  { name: 'Riya', action: "updated 'iPhone 15 Pro' price", time: '8 mins ago' },
  { name: 'Aman', action: "created subcategory 'Smart Watches'", time: '14 mins ago' },
  { name: 'Neha', action: "deleted category 'Accessories'", time: '27 mins ago' },
  { name: 'Karan', action: "added 'Galaxy Buds 2 Pro'", time: '41 mins ago' },
];

const DashboardHome = () => {
  return (
    <section>
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">ShopEase control panel overview</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, value, growth, growthTone, Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600">
                <Icon size={18} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
            </div>

            <p className="mt-5 text-2xl font-bold text-zinc-900">{value}</p>
            <p className={`mt-1 text-sm font-medium ${growthTone}`}>{growth}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-zinc-900">Sales Over Time</h2>
            <p className="mt-1 text-sm text-zinc-500">Performance trend placeholder</p>
          </div>
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-500">
            Sales Over Time
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Recent Activity</h2>
          <p className="mt-1 text-sm text-zinc-500">Latest actions across the control panel</p>

          <div className="mt-5">
            {activityItems.map((item, index) => {
              const last = index === activityItems.length - 1;
              return (
                <div key={`${item.name}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {!last && <span className="absolute left-4 top-8 h-full w-px bg-zinc-200" />}
                  <div className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-800">
                      <span className="font-semibold">{item.name}</span> {item.action}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
};

export default DashboardHome;
