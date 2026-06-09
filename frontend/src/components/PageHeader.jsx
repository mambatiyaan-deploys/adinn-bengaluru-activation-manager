import React from 'react';

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-2 text-[11px] font-black uppercase tracking-[0.34em] text-adinn-red">{eyebrow}</p>}
          <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h1>
          {description && <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-slate-600 md:text-base">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-3 no-print">{actions}</div>}
      </div>
    </div>
  );
}
