"use client";



import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";

import { useAccount } from "@/features/account/account-context";

import { KycStatusPill } from "@/features/account/status-pill";

import { logout } from "@/features/auth/actions";

import { MarketLogo } from "@/features/market/components/market-logo";

import { cryptoAssets, forexPairs, stocks, type Instrument } from "@/features/market/instruments";

import { strategies } from "@/features/investments/strategies";

import { portfolioActions, usePortfolio } from "@/features/portfolio/store";

import { PaymentHistory } from "@/features/payments/payment-history";

import { usePortfolioValuation } from "@/features/portfolio/valuation";

import { formatAmount, formatDateTime, formatPrice, money, percent } from "@/lib/format";

import { MarketSnapshotChart } from "./market-snapshot-chart";

import styles from "./mobile-app.module.css";
import { MobileIcon as Icon } from "./mobile-icon";
import { MobileHeader } from "./mobile-shell";



type Tab = "home" | "markets" | "trade" | "wallet" | "profile" | "invest" | "card";

type Category = "All" | "Stocks" | "Crypto" | "Forex";

type Side = "Buy" | "Sell";

const nav: { id: Tab; label: string }[] = [

  { id: "home", label: "Home" }, { id: "markets", label: "Markets" }, { id: "trade", label: "Trade" },

  { id: "wallet", label: "Wallet" }, { id: "profile", label: "Profile" },

];

const categories: Category[] = ["All", "Stocks", "Crypto", "Forex"];




function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {

  return <div className={styles.sectionTitle}><h2>{title}</h2>{action && <button type="button" onClick={onAction}>{action} <Icon name="chevron" size={14} /></button>}</div>;

}



function AssetRow({ asset, price, change, detail, onClick, trailing }: { asset: Instrument; price: number; change: number; detail?: string; onClick?: () => void; trailing?: React.ReactNode }) {

  const content = <><MarketLogo symbol={asset.symbol} className={styles.assetLogo} /><div className={styles.assetName}><strong>{asset.name}</strong><span>{detail ?? asset.symbol}</span></div><div className={styles.assetNumbers}><strong>{formatPrice(price, asset.decimals, asset.kind !== "forex")}</strong><span className={change >= 0 ? styles.gain : styles.loss}>{percent(change)}</span></div>{trailing ?? (onClick && <Icon name="chevron" size={16} />)}</>;

  return onClick ? <button type="button" className={styles.assetRow} onClick={onClick}>{content}</button> : <div className={styles.assetRow}>{content}</div>;

}



export default function MobileApp({ availablePlans }: { availablePlans: { id: string; name: string; minInvestment: number; duration: string }[] }) {

  const router = useRouter();

  const account = useAccount();

  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: Tab = ["home", "markets", "trade", "wallet", "profile", "invest", "card"].includes(requestedTab ?? "") ? requestedTab as Tab : "home";

  const [category, setCategory] = useState<Category>("All");

  const [query, setQuery] = useState("");

  const [balanceVisible, setBalanceVisible] = useState(true);

  const [selected, setSelected] = useState("TSLA");

  const [side, setSide] = useState<Side>("Buy");

  const [amount, setAmount] = useState("100");

  const [notice, setNotice] = useState("");

  const [trading, setTrading] = useState(false);

  const [walletFlow, setWalletFlow] = useState<"send" | null>(null);

  const [walletAsset, setWalletAsset] = useState("BTC");

  const [walletAmount, setWalletAmount] = useState("");

  const [destination, setDestination] = useState("");

  const [fundingNotice, setFundingNotice] = useState("");

  const [planNotice, setPlanNotice] = useState("");

  const portfolio = usePortfolio();

  const valuation = usePortfolioValuation();

  const { quotes, total, stocks: stocksValue, crypto: cryptoValue, cash } = valuation;

  const selectedAsset = [...stocks, ...cryptoAssets].find(asset => asset.symbol === selected) ?? stocks[0];

  const selectedQuote = quotes[selectedAsset.symbol];

  const allAssets = [...stocks, ...cryptoAssets, ...forexPairs];

  const displayed = allAssets.filter(asset => (category === "All" || asset.kind.toLowerCase() === category.toLowerCase().replace(/s$/, "")) && `${asset.symbol} ${asset.name}`.toLowerCase().includes(query.toLowerCase()));

  const ownedStocks = stocks.filter(asset => (portfolio.holdings[asset.symbol] ?? 0) > 0);

  const ownedCrypto = cryptoAssets.filter(asset => (portfolio.crypto[asset.symbol] ?? 0) > 0);

  const homeAssets = [...ownedStocks.slice(0, 2), ...ownedCrypto.slice(0, 1)];

  const invested = stocksValue + cryptoValue + valuation.plans;



  function go(next: Tab) { router.replace(`/dashboard?tab=${next}`, { scroll: false }); setNotice(""); setFundingNotice(""); window.scrollTo({ top: 0, behavior: "instant" }); }

  function openWalletFlow(flow: "cash" | "withdraw") {

    router.push(flow === "withdraw" ? "/withdrawals" : "/deposits");

  }

  function selectTrade(symbol: string) { setSelected(symbol); setAmount("100"); go("trade"); }

  function buyStock() { setSide("Buy"); setSelected("TSLA"); setAmount("100"); go("trade"); }

  async function submitTrade(event: React.FormEvent) {

    event.preventDefault();

    if (trading) return;

    setTrading(true);

    setNotice("Processing order…");

    const value = Number(amount);

    const result = selectedAsset.kind === "stock"

      ? await portfolioActions.tradeStockDollars(selectedAsset.symbol, side, value)

      : side === "Buy" ? await portfolioActions.buyCrypto(selectedAsset.symbol, value) : await portfolioActions.sellCrypto(selectedAsset.symbol, value);

    setNotice(result.message);

    setTrading(false);

  }

  async function submitTransfer(event: React.FormEvent) {

    event.preventDefault();

    const value = Number(walletAmount);

    const result = await portfolioActions.withdrawCrypto(walletAsset, value, destination);

    setFundingNotice(result.message);

    if (result.ok) { setWalletAmount(""); setDestination(""); setWalletFlow(null); }

  }

  return <div className={styles.backdrop}><div className={styles.app}>

    <MobileHeader />
    <main className={styles.content} id="mobile-main">

      {tab === "home" && <>

        <div className={styles.welcome}><div><span>YOUR INVESTING WORLD</span><h1>Good to see you.</h1></div><button className={styles.avatar} aria-label="Open profile" onClick={() => go("profile")}><Icon name="profile" size={21} /></button></div>

        <div className={styles.balanceCard}><div className={styles.balanceLabel}>TOTAL ACCOUNT VALUE <button aria-label={balanceVisible ? "Hide balance" : "Show balance"} onClick={() => setBalanceVisible(value => !value)}><Icon name="eye" size={17} /></button></div><div className={styles.balanceAmount}>{balanceVisible ? money(total) : "••••••••"}</div><div className={styles.balanceMeta}><span className={styles.balanceCash}><small>AVAILABLE TO INVEST</small><strong>{balanceVisible ? money(cash) : "••••"}</strong></span></div><div className={styles.balanceGlow} /></div>

        <div className={styles.quickActions} aria-label="Quick actions"><button onClick={() => openWalletFlow("cash")}><span><Icon name="plus" /></span>Deposit</button><button onClick={buyStock}><span><Icon name="markets" /></span>Buy stock</button><button onClick={() => go("invest")}><span><Icon name="layers" /></span>Invest</button><button onClick={() => go("card")}><span><Icon name="card" /></span>Card</button><button onClick={() => openWalletFlow("withdraw")}><span><Icon name="withdraw" /></span>Withdraw</button></div>

        <div className={styles.accountStats} aria-label="Account totals"><div><span>Deposits</span><strong>{money(portfolio.deposits + valuation.approvedDeposits)}</strong></div><div><span>Investment</span><strong>{money(invested)}</strong></div><div><span>Profit</span><strong>{money(account.planPayments.profitAmount)}</strong></div></div>

        <Link href="/plans" className={styles.backLink}>Start a plan / view payment status <Icon name="chevron" size={16} /></Link>

        <SectionTitle title="Market trends" action="See all" onAction={() => go("markets")} />

        <MarketSnapshotChart onTrade={buyStock} />

        <SectionTitle title="My assets" action="See all" onAction={() => go("wallet")} />

        <div className={styles.assetList}>{homeAssets.length ? homeAssets.map(asset => <AssetRow key={asset.symbol} asset={asset} price={quotes[asset.symbol].price} change={quotes[asset.symbol].change} detail={asset.kind === "stock" ? `${formatAmount(portfolio.holdings[asset.symbol])} shares` : `${formatAmount(portfolio.crypto[asset.symbol])} ${asset.symbol}`} onClick={() => selectTrade(asset.symbol)} />) : <div className={styles.emptyAssets}><p>No assets yet. Deposit funds, then explore stocks and crypto.</p><button type="button" onClick={() => openWalletFlow("cash")}>Deposit <Icon name="arrow" size={15} /></button></div>}</div>

        <div className={styles.promoCard}><span>INVEST IN WHAT MOVES YOU</span><h2>Markets in your pocket.</h2><p>Explore stocks and crypto, then practice your next move with funds.</p><button onClick={() => go("markets")}>Explore markets <Icon name="arrow" size={16} /></button></div>

      </>}



      {tab === "markets" && <>

        <div className={styles.screenHeading}><span>EXPLORE</span><h1>Markets</h1><p>Follow the companies and digital assets on your radar.</p></div>

        <label className={styles.searchBox}><Icon name="search" size={19} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search assets" aria-label="Search assets" /></label>

        <div className={styles.categoryTabs} role="group" aria-label="Market category">{categories.map(value => <button key={value} aria-pressed={category === value} className={category === value ? styles.active : ""} onClick={() => setCategory(value)}>{value}</button>)}</div>

        <div className={styles.listHeading}><span>{displayed.length} ASSETS</span><span>SIMULATED PRICES</span></div>

        <div className={styles.assetList}>{displayed.map(asset => <AssetRow key={asset.symbol} asset={asset} price={quotes[asset.symbol].price} change={quotes[asset.symbol].change} detail={asset.symbol} onClick={() => asset.kind === "forex" ? setNotice("Forex pairs are for market discovery.") : selectTrade(asset.symbol)} />)}{displayed.length === 0 && <p className={styles.empty}>No assets found. Try a company name or ticker symbol.</p>}</div>

        {notice && <p className={styles.inlineNotice} role="status">{notice}</p>}

      </>}



      {tab === "trade" && <>

        <div className={styles.screenHeading}><span>PRACTICE TRADING</span><h1>Make your move.</h1><p>Place an order with funds at simulated prices.</p></div>

        <div className={styles.orderCard}><div className={styles.ticketTabs}><button className={side === "Buy" ? styles.active : ""} aria-pressed={side === "Buy"} onClick={() => { setSide("Buy"); setNotice(""); }}>Buy</button><button className={side === "Sell" ? styles.active : ""} aria-pressed={side === "Sell"} onClick={() => { setSide("Sell"); setNotice(""); }}>Sell</button></div>

          <form onSubmit={submitTrade}><label className={styles.fieldLabel} htmlFor="mobile-asset">ASSET</label><select id="mobile-asset" className={styles.orderSelect} value={selected} onChange={event => { setSelected(event.target.value); setNotice(""); }}>{[...stocks, ...cryptoAssets].map(asset => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} · {asset.name}</option>)}</select>

            <div className={styles.selectedAsset}><MarketLogo symbol={selected} className={styles.assetLogo} /><div><strong>{selectedAsset.name}</strong><span>{selectedAsset.kind === "stock" ? "Stock" : "Digital asset"} · Simulated quote</span></div><strong>{formatPrice(selectedQuote.price, selectedAsset.decimals)}</strong></div>

            <label className={styles.fieldLabel} htmlFor="mobile-amount">{side === "Sell" && selectedAsset.kind === "crypto" ? `AMOUNT IN ${selected}` : "AMOUNT IN USD"}</label><div className={styles.amountInput}><span>{side === "Sell" && selectedAsset.kind === "crypto" ? selected : "$"}</span><input id="mobile-amount" type="number" min={side === "Sell" && selectedAsset.kind === "crypto" ? "0.00000001" : "1"} step="any" inputMode="decimal" required value={amount} onChange={event => setAmount(event.target.value)} /></div>

            <div className={styles.amountChips}>{side === "Sell" && selectedAsset.kind === "crypto" ? [0.25, 0.5, 0.75, 1].map(share => <button type="button" key={share} disabled={!(portfolio.crypto[selected] > 0)} onClick={() => setAmount(String((portfolio.crypto[selected] ?? 0) * share))}>{share === 1 ? "Max" : `${share * 100}%`}</button>) : [25,100,250,500].map(value => <button type="button" key={value} onClick={() => setAmount(String(value))}>${value}</button>)}</div>

            <div className={styles.orderSummary}><div><span>Available cash</span><strong>{money(cash)}</strong></div><div><span>{side === "Sell" ? "You hold" : "Estimated quantity"}</span><strong>{side === "Sell" ? selectedAsset.kind === "stock" ? `${formatAmount(portfolio.holdings[selected] ?? 0)} shares` : `${formatAmount(portfolio.crypto[selected] ?? 0)} ${selected}` : selectedAsset.kind === "stock" ? `${formatAmount(Number(amount || 0) / selectedQuote.price, 4)} shares` : `${formatAmount(Number(amount || 0) / selectedQuote.price, 8)} ${selected}`}</strong></div></div>

            <button type="submit" disabled={trading} className={styles.primaryButton}>{side} {selected} <Icon name="arrow" size={18} /></button><p className={styles.orderDisclaimer}>Order · no real money or assets move.</p><p className={styles.inlineNotice} role="status">{notice}</p>

          </form></div>

      </>}



      {tab === "invest" && <>

        <button type="button" className={styles.backLink} onClick={() => go("home")}><Icon name="back" size={17} /> Home</button>

        <div className={styles.screenHeading}><span>INVESTMENT PLANS</span><h1>Invest your way.</h1><p>Choose a plan and submit a payment screenshot for approval.</p></div>

        <div className={styles.investSummary}><span>INVESTMENT</span><strong>{money(invested)}</strong><small>Stocks, digital assets and recurring plans</small></div>

        <SectionTitle title="Start a plan" />

        <div className={styles.planList}>{availablePlans.map(plan => <div className={styles.planCard} key={plan.id}>

          <div><strong>{plan.name}</strong><span>From {money(plan.minInvestment)} · {plan.duration}</span></div>

          <Link href={`/plans/${plan.id}`} className={styles.primaryButton}>Start with {plan.name} <Icon name="arrow" size={18} /></Link>

        </div>)}</div>

        {!availablePlans.length && <p className={styles.empty}>No plans are available yet.</p>}

        <PaymentHistory />

        {planNotice && <p className={styles.inlineNotice} role="status">{planNotice}</p>}

        {portfolio.plans.length > 0 && <SectionTitle title="Recurring plans" />}

        <div className={styles.planList}>{portfolio.plans.map(plan => <div className={styles.planCard} key={plan.id}><div><strong>{strategies.find(strategy => strategy.id === plan.strategyId)?.name ?? plan.strategyId}</strong><span>{money(plan.amount)} {plan.frequency} · {plan.status}</span></div><b>{money(plan.invested)}</b><button type="button" onClick={async () => setPlanNotice((await portfolioActions.contribute(plan.id)).message)}>Contribute now</button><button type="button" onClick={() => portfolioActions.togglePlan(plan.id)}>{plan.status === "active" ? "Pause" : "Resume"}</button></div>)}</div>

        <p className={styles.profileNote}>These are concept portfolios using cash. Your profit is managed by an admin.</p>

      </>}



      {tab === "card" && <>

        <button type="button" className={styles.backLink} onClick={() => go("home")}><Icon name="back" size={17} /> Home</button>

        <div className={styles.screenHeading}><span>YOUR CARD</span><h1>Spend with clarity.</h1><p>A preview of how an Aurevia card could fit into your account.</p></div>

        <div className={styles.previewCard}><div className={styles.previewCardTop}><span>AUREVIA</span></div><div className={styles.previewCardChip} /><strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 0000</strong><div className={styles.previewCardBottom}><span>PREVIEW CARD</span><span>USD</span></div></div>

        <div className={styles.cardInfo}><Icon name="card" size={23} /><div><strong>Card preview only</strong><p>No card has been issued. Payments, card details, and spending controls need a licensed card provider and a secure backend.</p></div></div>

        <button type="button" className={styles.primaryButton} onClick={() => go("wallet")}>View wallet <Icon name="arrow" size={18} /></button>

      </>}



      {tab === "wallet" && <>

        <div className={styles.screenHeading}><span>YOUR WALLET</span><h1>Money, in motion.</h1><p>Keep an eye on your balances and activity.</p></div>

        <div className={styles.walletBalance}><span>AVAILABLE TO INVEST</span><div>{money(cash)}</div><p>USD balance</p><div className={styles.walletDecoration}>A</div></div>

        <div className={styles.walletActions}><button onClick={() => openWalletFlow("cash")}><span><Icon name="plus" /></span>Deposit</button><button onClick={() => openWalletFlow("withdraw")}><span><Icon name="withdraw" /></span>Withdraw</button><button onClick={() => router.push("/deposits")}><span><Icon name="wallet" /></span>Receive</button><button onClick={() => { setWalletFlow("send"); setFundingNotice(""); }}><span><Icon name="send" /></span>Send</button></div>

        <div className={styles.walletOverview}><div><span>Stock holdings</span><strong>{money(stocksValue)}</strong></div><div><span>Digital assets</span><strong>{money(cryptoValue)}</strong></div></div>

        <div className={styles.walletOverview}><div><span>Plan balance</span><strong>{money(account.planPayments.balanceAmount)}</strong></div><div><span>Available to withdraw</span><strong>{money(account.planPayments.availableWithdrawalAmount)}</strong></div></div>

        <Link href="/withdrawals" className={styles.backLink}>Withdrawal requests and status <Icon name="chevron" size={16} /></Link>

        {walletFlow && <form className={styles.transferCard} onSubmit={submitTransfer}>

          <div className={styles.sectionTitle}><h2>Send crypto</h2><button type="button" onClick={() => setWalletFlow(null)}>Close ×</button></div>

          <p>Simulated transfer only. No blockchain transaction occurs.</p>

          <label className={styles.fieldLabel} htmlFor="transfer-asset">ASSET</label><select id="transfer-asset" value={walletAsset} onChange={event => setWalletAsset(event.target.value)}>{cryptoAssets.map(asset => <option key={asset.symbol} value={asset.symbol}>{asset.name} ({asset.symbol})</option>)}</select>

          <label className={styles.fieldLabel} htmlFor="transfer-amount">AMOUNT IN {walletAsset}</label>

          <input id="transfer-amount" value={walletAmount} onChange={event => setWalletAmount(event.target.value)} type="number" min="0.00000001" step="any" inputMode="decimal" required placeholder="0.00" />

          {walletFlow === "send" && <><label className={styles.fieldLabel} htmlFor="transfer-destination">DESTINATION</label><input id="transfer-destination" value={destination} onChange={event => setDestination(event.target.value)} required minLength={10} placeholder="Enter a sample wallet address" /></>}

          <button className={styles.primaryButton} type="submit">Send crypto <Icon name="arrow" size={18} /></button>

        </form>}

        {fundingNotice && <p className={styles.inlineNotice} role="status">{fundingNotice}</p>}

        <SectionTitle title="Crypto balances" /><div className={styles.assetList}>{cryptoAssets.filter(asset => (portfolio.crypto[asset.symbol] ?? 0) > 0).map(asset => <AssetRow key={asset.symbol} asset={asset} price={(portfolio.crypto[asset.symbol] ?? 0) * quotes[asset.symbol].price} change={quotes[asset.symbol].change} detail={`${formatAmount(portfolio.crypto[asset.symbol] ?? 0, 8)} ${asset.symbol}`} onClick={() => selectTrade(asset.symbol)} />)}</div>

        <SectionTitle title="Recent activity" action="View all" onAction={() => go("profile")} /><div className={styles.activityList}>{portfolio.activity.length ? portfolio.activity.slice(0, 3).map(item => <div key={item.id} className={styles.activityItem}><span className={styles.activityIcon}><Icon name={item.module === "wallet" ? "wallet" : "trade"} size={18} /></span><div><strong>{item.module === "wallet" ? "Wallet transfer" : item.module === "stocks" || item.module === "crypto" ? "Trade completed" : "Account activity"}</strong><span>{formatDateTime(item.time)}</span></div><Icon name="chevron" size={15} /></div>) : <p className={styles.empty}>Your activity will appear here.</p>}</div>

      </>}



      {tab === "profile" && <>

        <div className={styles.screenHeading}><span>YOUR ACCOUNT</span><h1>Profile</h1><p>Manage your experience.</p></div>

        <div className={styles.profileCard}><div className={styles.profileAvatar}><Icon name="profile" size={28} /></div><div><h2>{account.name}</h2><p>{account.email}</p></div><KycStatusPill status={account.kycStatus} /></div>

        <div className={styles.profileStats}><div><strong>{portfolio.watchlist.length}</strong><span>Watchlisted</span></div><div><strong>{ownedStocks.length + ownedCrypto.length}</strong><span>Holdings</span></div><div><strong>{portfolio.plans.length}</strong><span>Plans</span></div></div>

        <SectionTitle title="Your activity" /><div className={styles.activityList}>{portfolio.activity.length ? portfolio.activity.slice(0, 8).map(item => <div key={item.id} className={styles.activityItem}><span className={styles.activityIcon}><Icon name="clock" size={18} /></span><div><strong>{item.text}</strong><span>{formatDateTime(item.time)}</span></div></div>) : <p className={styles.empty}>No activity yet. Try a trade or wallet action.</p>}</div>

        <SectionTitle title="Explore more" /><div className={styles.profileLinks}>{account.kycStatus !== "approved" && <Link href="/verify"><span><Icon name="check" size={19} /> Verify identity</span><Icon name="chevron" size={17} /></Link>}<Link href="/investments"><span><Icon name="layers" size={19} /> Automated plans</span><Icon name="chevron" size={17} /></Link><Link href="/marketplace"><span><Icon name="markets" size={19} /> Tesla marketplace</span><Icon name="chevron" size={17} /></Link><Link href="/#plans"><span><Icon name="profile" size={19} /> Account tiers</span><Icon name="chevron" size={17} /></Link><Link href="/"><span><Icon name="back" size={19} /> Company website</span><Icon name="chevron" size={17} /></Link></div>

        <button type="button" className={styles.resetButton} onClick={() => { if (window.confirm("Reset your watchlist, alerts, and reminders? Your balance and holdings will be kept.")) portfolioActions.reset(); }}>Reset preferences</button>

        <form action={logout}><button type="submit" className={styles.resetButton}>Log out</button></form>

        <p className={styles.profileNote}>Your balance and holdings are saved to your account. Prices and chart history are simulated.</p>

      </>}

    </main>

    <nav className={styles.bottomNav} aria-label="App navigation">{nav.map(item => <button key={item.id} type="button" className={`${styles.navItem} ${tab === item.id ? styles.navActive : ""} ${item.id === "trade" ? styles.navTrade : ""}`} aria-current={tab === item.id ? "page" : undefined} onClick={() => go(item.id)}><span className={styles.navIcon}><Icon name={item.id} size={item.id === "trade" ? 23 : 21} /></span><span>{item.label}</span></button>)}</nav>

  </div></div>;

}

