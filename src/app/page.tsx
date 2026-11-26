const taskTypes = [
  { icon: "◎", title: "Instagram", detail: "Follow, like and engage", color: "pink" },
  { icon: "▶", title: "YouTube", detail: "Watch and subscribe", color: "red" },
  { icon: "𝕏", title: "X / Twitter", detail: "Follow and repost", color: "dark" },
  { icon: "♪", title: "TikTok", detail: "Discover and engage", color: "violet" },
  { icon: "➤", title: "Telegram", detail: "Join channels and groups", color: "blue" },
  { icon: "f", title: "Facebook", detail: "Page and post engagement", color: "blue" },
];

const steps = [
  { number: "01", title: "Create your account", text: "Choose your path as an earner or advertiser." },
  { number: "02", title: "Complete real tasks", text: "Follow clear instructions and submit proof for review." },
  { number: "03", title: "Get rewarded", text: "Track approved earnings and request eligible payouts." },
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">t</span>taskvibe<span className="brand-dot">.</span></a>
        <nav><a href="#how">How it works</a><a href="#platforms">Platforms</a><a href="#roles">For business</a></nav>
        <div className="nav-actions"><a className="login" href="/login">Log in</a><a className="button button-small" href="/register">Get started <span>↗</span></a></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> THE SOCIAL TASK MARKETPLACE</div>
          <h1>Make every<br />scroll <em>count.</em></h1>
          <p className="hero-text">Real tasks. Real people. Real rewards. Grow your online presence or earn by doing the things you already love.</p>
          <div className="hero-actions"><a className="button" href="/register">Create your account <span>↗</span></a><a className="text-link" href="#how">See how it works <span>↓</span></a></div>
          <div className="trust-line"><div className="avatar-stack"><i>J</i><i>M</i><i>A</i><i>+</i></div><span>One platform. Two ways to grow.</span></div>
        </div>
        <div className="hero-art" aria-label="TaskVibe campaign preview">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="float-card float-top"><span className="mini-icon pink">◎</span><span><b>Example campaign</b><small>Instagram · preview</small></span><strong>Sample</strong></div>
          <div className="phone">
            <div className="phone-head"><span className="brand-mark">t</span><b>Good afternoon 👋</b><span className="bell">♧</span></div>
            <p className="phone-muted">Your progress is looking good.</p>
            <div className="balance-card"><small>TASKVIBE PREVIEW</small><strong>Find your <span>next task</span></strong><div className="balance-foot"><span>Campaigns appear here when published</span><span>•••</span></div></div>
            <div className="phone-section"><b>Example tasks</b><a href="#platforms">View all ↗</a></div>
            <div className="task-row"><span className="mini-icon pink">◎</span><span><b>Follow Instagram page</b><small>Social · 2 min</small></span><strong>$0.25</strong></div>
            <div className="task-row"><span className="mini-icon red">▶</span><span><b>Watch a YouTube video</b><small>Video · 3 min</small></span><strong>$0.40</strong></div>
            <div className="task-row"><span className="mini-icon violet">♪</span><span><b>Like a TikTok post</b><small>Social · 1 min</small></span><strong>$0.15</strong></div>
          </div>
          <div className="float-card float-bottom"><span className="success-icon">✓</span><span><b>Wallet connection</b><small>USDT · BEP-20</small></span><strong>Planned</strong></div>
          <div className="sparkle sparkle-a">✳</div><div className="sparkle sparkle-b">✦</div>
        </div>
      </section>

      <section className="stats-strip"><div><strong>01</strong><span>One simple platform</span></div><div><strong>02</strong><span>Two ways to participate</span></div><div><strong>24/7</strong><span>Tasks when you're ready</span></div><div><strong>USDT</strong><span>BEP-20 payout direction</span></div></section>

      <section className="section platforms" id="platforms">
        <div className="section-heading"><div><div className="eyebrow">YOUR FAVOURITE PLATFORMS</div><h2>Small actions.<br /><em>Big momentum.</em></h2></div><p>Discover social tasks across the platforms you use every day. Every campaign has clear requirements and a review process.</p></div>
        <div className="platform-grid">{taskTypes.map((task) => <article className="platform-card" key={task.title}><span className={"platform-icon " + task.color}>{task.icon}</span><div><h3>{task.title}</h3><p>{task.detail}</p></div><span className="arrow">↗</span></article>)}</div>
        <p className="fine-print">Platform availability and verification methods depend on supported APIs and each platform's rules.</p>
      </section>

      <section className="how-section" id="how"><div className="section-heading"><div><div className="eyebrow">GET STARTED IN THREE STEPS</div><h2>Good things<br />start <em>here.</em></h2></div><p>No complicated setup. Pick the role that fits you and take your next step.</p></div><div className="steps">{steps.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>

      <section className="roles-section" id="roles"><div className="role-intro"><div className="eyebrow">YOUR GOAL. YOUR DASHBOARD.</div><h2>One vibe.<br /><em>Two sides.</em></h2><p>Whether you're building a brand or building an extra income stream, TaskVibe brings the workflow together.</p></div><article className="role-card earner"><div className="role-label">FOR EARNERS <span>01 / 02</span></div><div className="role-symbol">↗</div><h3>Turn time<br />into rewards.</h3><p>Browse available campaigns, submit proof, and follow every approval from one clear dashboard.</p><a href="/register?role=earner">Create earner account <span>↗</span></a></article><article className="role-card advertiser"><div className="role-label">FOR ADVERTISERS <span>02 / 02</span></div><div className="role-symbol">✳</div><h3>Make your<br />brand matter.</h3><p>Launch campaigns, set budgets, review submissions, and see your community grow.</p><a href="/register?role=advertiser">Create advertiser account <span>↗</span></a></article></section>

      <footer><a className="brand" href="#"><span className="brand-mark">t</span>taskvibe<span className="brand-dot">.</span></a><span>Built for people with things to do.</span><span>© 2026 TaskVibe</span></footer>
    </main>
  );
}
