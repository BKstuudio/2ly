'use client';

import { use, useEffect, useId, useState } from 'react';
import type { ReactElement } from 'react';
import { useTheme } from 'next-themes';

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
    const cached = cache.get(key);
    if (cached) return cached as Promise<T>;
    const promise = setPromise();
    cache.set(key, promise);
    return promise;
}

export function Mermaid(props: { chart: string }): ReactElement | null {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) return null;
    return <MermaidContent chart={props.chart} />;
}

function MermaidContent(props: { chart: string }): ReactElement {
    const id = useId();
    const { resolvedTheme } = useTheme();
    const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'inherit',
        themeCSS: 'margin: 1.5rem auto 0;',
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
    });

    const { svg, bindFunctions } = use(
        cachePromise(`${props.chart}-${resolvedTheme}`, () => {
            return mermaid.render(id, props.chart.replaceAll('\\n', '\n'));
        }),
    ) as { svg: string; bindFunctions?: (container: Element) => void };

    return (
        <div
            ref={(container) => {
                if (container && typeof bindFunctions === 'function') bindFunctions(container);
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}


