import React from 'react';
import { BRAND_LOGO_URL, BRAND_NAME } from '../constants/branding';

const BrandSignature: React.FC = () => (
    <div className="w-full border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-3">
            <img
                src={BRAND_LOGO_URL}
                alt={`${BRAND_NAME} logo`}
                className="h-10 w-auto object-contain"
            />
            <span className="text-sm font-semibold tracking-wide text-slate-800">
                Made by brand {BRAND_NAME}
            </span>
        </div>
    </div>
);

export default BrandSignature;
