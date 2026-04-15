import React from 'react';

type FeaturePageShellProps = {
    title: string;
    description: string;
};

const FeaturePageShell: React.FC<FeaturePageShellProps> = ({ title, description }) => (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
    </section>
);

export default FeaturePageShell;
