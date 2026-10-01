export function MobileIcon({ name, size = 22 }: { name: string; size?: number }) {

  const paths: Record<string, React.ReactNode> = {

    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-7h6v7" /></>,

    markets: <><path d="M3 20h18M4 16l5-5 4 3 6-8" /><path d="M16 6h3v3" /></>,

    trade: <><path d="M12 3v18M3 12h18" /></>,

    wallet: <><rect x="3" y="6" width="18" height="15" rx="2" /><path d="M3 9V5a2 2 0 0 1 2-2h13M15 14h6" /><circle cx="16.5" cy="14" r=".5" fill="currentColor" stroke="none" /></>,

    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,

    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,

    chevron: <path d="m9 5 7 7-7 7" />,

    arrow: <><path d="M5 19 19 5M9 5h10v10" /></>,

    plus: <path d="M12 4v16M4 12h16" />,

    send: <><path d="m4 12 16-8-6 16-3-7-7-1Z" /><path d="m11 13 9-9" /></>,

    eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,

    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,

    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,

    layers: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" /></>,

    check: <path d="m4 12 5 5L20 6" />,

    back: <><path d="m14 5-7 7 7 7M7 12h13" /></>,

    card: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h4" /></>,

    withdraw: <><path d="M12 4v15m-5-5 5 5 5-5M4 21h16" /></>,

  };

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;

}



