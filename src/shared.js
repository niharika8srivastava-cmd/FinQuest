/* ============================================================
   FinQuest — content & data (all mock, no network)
   ============================================================ */

export var LEVELS = [
  { id: 1, title: "Banking Basics", tagline: "Accounts, banks & how money moves", topics: true },
  { id: 2, title: "Money & Income", tagline: "Earning, budgeting & taxes", topics: true },
  { id: 3, title: "Saving & Investing", tagline: "From piggy bank to portfolios", topics: true },
  { id: 4, title: "Credit & Borrowing", tagline: "Loans, credit cards & scores", topics: true },
  { id: 5, title: "Markets & Risk", tagline: "How markets price things", topics: false },
  { id: 6, title: "Smart Protection", tagline: "Insurance & emergency funds", topics: false },
  { id: 7, title: "Advanced Finance", tagline: "Derivatives, markets & strategy", topics: false }
];

/* Every topic carries three quiz tiers so difficulty can genuinely adapt:
   gentle / standard / sharp. Percent thresholds drive tier movement.      */
export var TOPICS = {
  "what-is-a-bank": {
    id: "what-is-a-bank", level: 1, title: "What is a Bank?",
    tagline: "3 min · the safest place your money knows",
    definition: "A bank is a safe middleman for money: it holds your deposits, pays you a little interest, and lends a careful portion of those deposits to people and businesses who need it.",
    example: "You deposit ₹10,000 in a savings account. The bank keeps it safe and pays you, say, 3% a year. It lends part of the pooled deposits to Riya, who buys a scooter and pays the bank 9% interest. That gap is how the bank earns and stays in business.",
    steps: [
      "People and businesses deposit money they don't need right now.",
      "The bank keeps a small fraction ready for withdrawals and lends the rest to borrowers.",
      "Borrowers pay interest; the bank shares a slice of that with depositors.",
      "Rules and deposit insurance keep the system trustworthy."
    ],
    remember: "A bank borrows short (your deposits) and lends long (their loans) — it lives on the difference between the two interest rates.",
    simpler: "A bank is like a very organised friend who keeps everyone's money in one big safe. It pays you a little for storing yours, and lends some of it to others who pay it back with extra.",
    extraExample: "A kirana shop owner deposits daily earnings instead of keeping cash at home — safer, and it slowly grows.",
    quiz: {
      gentle: [
        { q: "What is the simplest, safest job a bank does for you?", options: ["Keeps your money safe in an account", "Prints new currency for you", "Decides how much tax you pay", "Sells you insurance only"], answer: 0, explain: "Safekeeping is job one — deposits sit in an account you can reach anytime, insured within limits." },
        { q: "When you keep money in a savings account, the bank usually pays you…", options: ["Interest", "A monthly salary", "A dividend", "Nothing, ever"], answer: 0, explain: "Banks pay small interest on savings because they lend a portion of deposits to borrowers at higher rates." }
      ],
      standard: [
        { q: "Why does a bank pay you interest at all?", options: ["It earns interest from borrowers and shares a slice with you", "It is a birthday gift from the RBI", "It charges locker rent and refunds it", "It collects fines from latecomers"], answer: 0, explain: "Your deposit is the bank's raw material. It lends it out at a higher rate and passes a small part of that income to you." },
        { q: "Banks don't keep 100% of deposits as cash in the vault. Why is that okay?", options: ["Only a fraction is needed for daily withdrawals, and deposit insurance protects savers", "Cash in vaults earns no interest, so banks hide it", "ATMs refill themselves overnight", "Customers agreed never to withdraw"], answer: 0, explain: "Fractional reserve works because withdrawals spread out over time — and insurance (like DICGC cover in India) backstops depositors." },
        { q: "Savings vs current account — which is built for a shop's daily transactions?", options: ["Current account", "Savings account", "Both are identical", "Neither — use cash only"], answer: 0, explain: "Current accounts exist for frequent business payments and receipts; savings accounts are for parking money." }
      ],
      sharp: [
        { q: "A 'bank run' happens when…", options: ["Many depositors rush to withdraw at once because they doubt the bank", "An ATM runs out of cash on a Sunday", "A bank relocates its head office", "A new banking app launches"], answer: 0, explain: "Bank runs are about trust. If everyone pulls money simultaneously, even a healthy bank can wobble — which is why insurance and central banks exist." },
        { q: "Why is the interest you receive always lower than what a borrower pays?", options: ["The spread between the two rates is the bank's income and covers its costs and risks", "Banks keep the difference as a penalty", "The RBI collects the gap as tax", "It is lower only in big cities"], answer: 0, explain: "That gap — the net interest margin — pays staff, branches, technology, and loan losses." }
      ]
    }
  },
  "savings-vs-current": {
    id: "savings-vs-current", level: 1, title: "Savings vs Current Accounts",
    tagline: "4 min · two accounts, two different jobs",
    definition: "A savings account is for parking money — it pays interest and limits transactions. A current account is for moving money — unlimited transactions, zero interest, built for businesses.",
    example: "Meera, a salaried designer, keeps her salary in a savings account and earns ~3% while paying rent by UPI. Her landlord, who runs a textile shop, uses a current account to handle 60+ supplier payments a week — speed and volume, not interest.",
    steps: [
      "Ask: is this money parked, or is it in constant motion?",
      "Parked → savings account: earns interest, limited free transactions.",
      "In motion (business) → current account: unlimited transactions, no interest, possible fees.",
      "Match the account to the job; using savings for heavy business traffic can get it flagged or charged."
    ],
    remember: "Savings = grow. Current = flow. If money is a car, savings is the parking lot and current is the highway.",
    simpler: "Savings account: your money sleeps and earns pocket money. Current account: your money works all day moving around, so it earns nothing.",
    extraExample: "A freelancer paid monthly with 5–6 expenses → savings. A trader paying 40 vendors weekly → current.",
    quiz: {
      gentle: [
        { q: "Which account is designed for daily business payments and receipts?", options: ["Current account", "Savings account", "Fixed deposit", "Recurring deposit"], answer: 0, explain: "Current accounts are built for constant, high-volume transactions." },
        { q: "Which account usually pays you interest?", options: ["Savings account", "Current account", "Both pay the same", "Neither pays anything"], answer: 0, explain: "Savings accounts reward parking money; current accounts reward you with liquidity instead." }
      ],
      standard: [
        { q: "Why do current accounts usually pay zero interest?", options: ["Their job is transactions, not saving — banks may even charge for the service", "The RBI bans interest on all accounts", "They are only for students", "Banks simply forgot to add it"], answer: 0, explain: "Unlimited transactions, overdrafts and statements cost the bank real money — that's the trade-off." },
        { q: "What does an overdraft let a current-account holder do?", options: ["Spend a little beyond the balance up to an agreed limit, paying interest on the excess", "Withdraw money only on weekends", "Skip taxes on business income", "Earn double interest for a month"], answer: 0, explain: "An overdraft is a short-term credit line attached to the account — handy for timing gaps between payments." },
        { q: "Who is a savings account best suited for?", options: ["Someone parking an emergency fund and earning a small return", "A shop settling 50 supplier payments a day", "A company running monthly payroll for 200 staff", "A stock trader moving money hourly"], answer: 0, explain: "Parking + small growth + occasional payments = savings account territory." }
      ],
      sharp: [
        { q: "A freelancer is paid irregularly but makes frequent small UPI payments. Best setup?", options: ["A savings account with a good digital limit; a current account once volumes grow", "A 5-year fixed deposit", "Cash under the mattress", "Five current accounts with zero balance"], answer: 0, explain: "Low volume + personal use → savings. Business-scale volume → current. Stage matters." },
        { q: "Why are savings accounts often free while current accounts carry fees?", options: ["Current accounts cost more to run — unlimited transactions, overdrafts, statements", "Savings accounts are run by volunteers", "The RBI pays banks for savings accounts", "Fees are charged randomly by algorithm"], answer: 0, explain: "Pricing follows cost: heavy transaction services get priced; simple savings balances get cross-subsidised." }
      ]
    }
  },
  "emi": {
    id: "emi", level: 1, title: "What is an EMI?",
    tagline: "4 min · the monthly rhythm of every loan",
    definition: "EMI — Equated Monthly Instalment — is a fixed monthly payment that pays off a loan over time. Each EMI is part principal (the money you borrowed) and part interest (the cost of borrowing).",
    example: "You take a ₹5,00,000 car loan at 9% for 5 years → EMI ≈ ₹10,379. Every month, that amount leaves your account. Early on, most of it is interest; later, most of it is principal. By month 60 the loan is gone.",
    steps: [
      "Loan amount + interest + tenure → the bank computes one fixed monthly figure.",
      "Early EMIs are mostly interest (the balance is big).",
      "As the balance shrinks, the interest share shrinks — the principal share grows.",
      "Longer tenure → smaller EMI, but more total interest. Shorter → bigger EMI, less total interest."
    ],
    remember: "An EMI is a seesaw: interest starts heavy, principal ends heavy. Stretch the loan and you buy time with extra interest.",
    simpler: "EMI is like paying for a phone in fixed monthly slices until it's fully yours — except each slice also includes a fee for the shop that let you take it early.",
    extraExample: "₹1,00,000 at 12% for 1 year → EMI ≈ ₹8,885/month. For 2 years → ≈ ₹4,707/month, but total interest nearly doubles.",
    quiz: {
      gentle: [
        { q: "EMI stands for…", options: ["Equated Monthly Instalment", "Easy Money Investment", "Equal Money Income", "Every Month Interest"], answer: 0, explain: "Equated = fixed; Monthly = every month; Instalment = a slice of repayment." },
        { q: "A typical EMI is made up of…", options: ["Part principal + part interest", "Only interest", "Only penalties", "One yearly lump sum"], answer: 0, explain: "Every EMI chips away at the borrowed amount (principal) and covers interest on what's still outstanding." }
      ],
      standard: [
        { q: "In the early EMIs of a home loan, the bigger share is…", options: ["Interest", "Principal", "Insurance premium", "Processing fees"], answer: 0, explain: "Interest is charged on the outstanding balance, which is largest at the start — so early EMIs are interest-heavy." },
        { q: "You borrow ₹1,00,000 at 12% for a year. Interest is calculated on…", options: ["The outstanding balance, which falls as you repay", "The original ₹1,00,000 forever", "The EMI amount itself", "Nothing — rates are decorative"], answer: 0, explain: "Reducing-balance interest is why prepaying principal saves real money." },
        { q: "Same loan, same rate — you stretch the tenure from 5 to 10 years. What happens?", options: ["EMI shrinks, total interest grows a lot", "EMI grows", "Nothing changes", "The loan becomes interest-free"], answer: 0, explain: "Time is the multiplier of interest. Half the EMI, roughly double the pain." }
      ],
      sharp: [
        { q: "Same loan: 10-year tenure vs 20-year tenure. Which statement is true?", options: ["The 20-year EMI is lower, but total interest paid is far higher", "The 10-year EMI is lower", "Total interest is identical either way", "The 20-year loan is always cheaper overall"], answer: 0, explain: "Tenure trades monthly comfort against lifetime cost — do the full-cost maths before stretching." },
        { q: "You prepay a chunk of principal early in a loan. What do you mostly save?", options: ["Future interest, since the balance shrinks immediately", "Only late fees", "Nothing at all", "Income tax"], answer: 0, explain: "Early prepayment attacks the balance while interest is heaviest — maximum savings per rupee." }
      ]
    }
  },
  "interest-rate": {
    id: "interest-rate", level: 1, title: "How Interest Rates Work",
    tagline: "4 min · the price of money itself",
    definition: "An interest rate is the price of borrowing money — a percentage charged (on loans) or paid (on deposits), almost always quoted per year. It prices risk: safer borrowers pay less, riskier loans cost more.",
    example: "Home loan ~8.5%, personal loan ~12%, credit card ~36% — same economy, very different prices. The difference is risk: a home can be pledged as security; a credit card loan is unsecured and often delayed.",
    steps: [
      "Rates are quoted 'per annum' (p.a.) — always check the period.",
      "Riskier loan → higher rate. Secured (home, gold) < unsecured (personal, card).",
      "Inflation eats returns: real return ≈ nominal rate − inflation.",
      "Central banks move policy rates up to cool spending, down to encourage it."
    ],
    remember: "The interest rate is money's rent — and the landlord charges more when there's a bigger chance you won't pay.",
    simpler: "Interest is the fee for using someone else's money. The less sure they are you'll return it, the bigger the fee.",
    extraExample: "Savings at 4% with inflation at 6% means your money quietly loses ~2% of buying power every year.",
    quiz: {
      gentle: [
        { q: "An interest rate tells you…", options: ["The price of borrowing money, as a % per year", "How old a bank is", "Your account number", "The number of branches a bank has"], answer: 0, explain: "It's literally the rental price of money, quoted per annum." },
        { q: "A higher interest rate on a loan means…", options: ["Borrowing is more expensive", "Borrowing is cheaper", "Money becomes free", "No effect on cost"], answer: 0, explain: "Rate × balance × time = interest cost. Raise the rate, raise the cost." }
      ],
      standard: [
        { q: "Why do personal loans charge more than home loans?", options: ["They are unsecured — no collateral — so lenders charge for the extra risk", "They are easier to collect", "The RBI caps only home-loan rates", "Personal loans require more paperwork to type"], answer: 0, explain: "Collateral lowers risk, risk lowers price. A home can be sold if the borrower defaults; an unsecured loan cannot." },
        { q: "Inflation is 6% and your savings earn 4%. Your real return is roughly…", options: ["−2% — your money buys less each year", "+10%", "+4%", "+2%"], answer: 0, explain: "Real return = nominal − inflation. Positive nominal, negative real." },
        { q: "When the central bank raises policy rates, loans generally become…", options: ["Costlier, cooling borrowing and spending", "Cheaper", "Frozen forever", "Unregulated"], answer: 0, explain: "Rate hikes make credit dearer across the economy — a brake on inflation." }
      ],
      sharp: [
        { q: "Fixed vs floating rate: which one moves with the market?", options: ["Floating", "Fixed", "Both move daily", "Neither ever moves"], answer: 0, explain: "Floating rates reset with the benchmark; fixed stays constant for its term — each transfers different risk." },
        { q: "Banks quote rates 'per annum' but often compute them daily. Why does that matter?", options: ["Daily calculation means you earn or pay interest on interest within the year — the effective rate exceeds the nominal one", "It makes no difference at all", "It only applies on weekends", "It halves the headline rate"], answer: 0, explain: "Compounding frequency quietly lifts the true rate — compare effective rates, not headlines." }
      ]
    }
  }
  ,"budgeting": {
    id: "budgeting", level: 2, title: "Build a Budget That Works", tagline: "6 min · give every rupee a role",
    definition: "A budget is a spending plan, not a punishment. It compares what comes in with what must go out, then deliberately reserves room for goals and joy. The useful version is one you can repeat every month.",
    example: "A ₹30,000 monthly income could start as ₹16,000 essentials, ₹5,000 goals, ₹3,000 flexible fun and ₹6,000 for irregular expenses. The exact split changes; knowing the split is the win.",
    steps: ["Write reliable take-home income, not your best month.", "List fixed needs first: rent, food, travel, minimum debt payments.", "Create small buckets for goals and irregular costs before spending on wants.", "Review weekly and adjust the next month without guilt."],
    remember: "A budget is a map for your money, not a report card on your worth.", simpler: "Tell each rupee its job before it disappears.", extraExample: "If annual insurance is ₹12,000, set aside ₹1,000 monthly so renewal is boring instead of a crisis.",
    quiz: { gentle: [{ q: "What is a budget mainly for?", options: ["Giving income a plan", "Stopping all fun spending", "Predicting stock prices", "Increasing a credit limit"], answer: 0, explain: "A good budget makes choices visible; it does not ban every want." }, { q: "Which should usually be listed first?", options: ["Essential fixed costs", "A random purchase", "A market tip", "A new loan"], answer: 0, explain: "Start with obligations so your plan is realistic." }], standard: [{ q: "Why create a monthly sinking fund for annual bills?", options: ["It spreads a known cost into manageable pieces", "It earns guaranteed high returns", "It removes the bill", "It improves a credit score instantly"], answer: 0, explain: "Saving a little each month converts a lump sum into a planned expense." }, { q: "Your spending plan fails every month. Best first move?", options: ["Review real transactions and lower unrealistic categories", "Borrow more", "Ignore the gap", "Set every category to zero"], answer: 0, explain: "A budget should describe real life before it can improve it." }], sharp: [{ q: "A variable-income freelancer should base core expenses on…", options: ["A conservative low-income month", "Their highest-ever invoice", "A credit-card limit", "Expected gifts"], answer: 0, explain: "Planning from the floor protects essentials in slow months." }, { q: "Which change improves a budget's resilience most?", options: ["Building an irregular-expense and emergency buffer", "Tracking only income", "Hiding subscriptions", "Using more cards"], answer: 0, explain: "Buffers make inevitable surprises less disruptive." }] }
  },
  "emergency-fund": {
    id: "emergency-fund", level: 3, title: "Your Emergency Fund", tagline: "7 min · a calm buffer for real life",
    definition: "An emergency fund is cash kept for unplanned, necessary costs such as job loss, urgent repairs or medical bills. It is designed for stability and access, not for chasing high returns.",
    example: "If essential monthly spending is ₹20,000, a first milestone could be ₹20,000, then grow toward 3–6 months based on job stability and dependants.",
    steps: ["Calculate monthly essentials only.", "Set a starter target of one month before aiming higher.", "Keep it separate, accessible and low-risk.", "Rebuild it after a genuine emergency."],
    remember: "An emergency fund is not idle money; it is financial first aid.", simpler: "It is a money cushion for the things you did not schedule.", extraExample: "A repair paid from savings costs ₹4,000. The same repair on revolving card debt can cost much more over time.",
    quiz: { gentle: [{ q: "What is an emergency fund for?", options: ["Unexpected necessary expenses", "A planned vacation", "Daily stock trading", "Luxury shopping"], answer: 0, explain: "Its job is to absorb shocks, not fund regular wants." }, { q: "Where should it usually live?", options: ["A safe, accessible account", "Locked in a long-term asset", "In a volatile trade", "Only as cash at home"], answer: 0, explain: "You need quick access with low risk." }], standard: [{ q: "How do you size an emergency fund?", options: ["Use essential monthly spending and personal risk", "Match a friend's amount", "Use only salary", "Use a credit limit"], answer: 0, explain: "Job stability, dependants and fixed costs change the right target." }, { q: "Why not invest emergency money aggressively?", options: ["It may be down when you urgently need it", "It is illegal", "It cannot earn returns", "Banks prohibit it"], answer: 0, explain: "The purpose is certainty and access." }], sharp: [{ q: "A salaried worker with dependants and one income should generally…", options: ["Aim for a larger buffer than a dual-income household", "Skip a buffer", "Borrow for every surprise", "Use only credit cards"], answer: 0, explain: "More people relying on one income increases the cost of disruption." }, { q: "You use emergency savings for a hospital bill. Next best action?", options: ["Create a plan to rebuild it steadily", "Pretend it never happened", "Stop saving entirely", "Take speculative bets"], answer: 0, explain: "The fund did its job; restoring it prepares you for the next shock." }] }
  },
  "credit-card": {
    id: "credit-card", level: 4, title: "Credit Cards Without the Trap", tagline: "7 min · borrow short, repay smart",
    definition: "A credit card is short-term borrowing with a billing cycle. Paying the full statement balance by the due date generally avoids purchase interest; paying only the minimum can leave expensive debt rolling forward.",
    example: "A ₹10,000 purchase paid in full at the due date costs ₹10,000. Carrying it at a high monthly rate can turn a small purchase into a long repayment story.",
    steps: ["Treat the card as a payment tool, not extra income.", "Use only what you could cover from your bank balance.", "Set autopay for the full statement balance where feasible.", "Check statements for fees, fraud and utilization."],
    remember: "The minimum due keeps an account open. The full due keeps interest from growing.", simpler: "A card lets you pay later. Paying all of it on time is the magic part.", extraExample: "Set a spending alert at 30% of your limit so you notice drift before the bill does.",
    quiz: { gentle: [{ q: "What usually avoids purchase interest on a card?", options: ["Paying the full statement balance by the due date", "Paying only the minimum", "Missing the due date", "Increasing the limit"], answer: 0, explain: "The grace period generally relies on clearing the statement in full." }, { q: "A credit limit is…", options: ["A borrowing ceiling, not a spending target", "Free income", "A savings goal", "A tax refund"], answer: 0, explain: "Available credit is debt capacity, not money you own." }], standard: [{ q: "Why is the minimum payment risky?", options: ["The remaining balance can accrue costly interest", "It pays the bill faster", "It improves rewards", "It cancels future bills"], answer: 0, explain: "Small minimums can make repayment drag on." }, { q: "What is a sensible card habit?", options: ["Review the statement and pay it in full", "Ignore notifications", "Use it for cash withdrawals", "Pay after several months"], answer: 0, explain: "Reviewing catches both overspending and errors." }], sharp: [{ q: "High credit utilization can signal what to lenders?", options: ["Potential dependence on borrowing", "Guaranteed wealth", "No need to repay", "A higher salary"], answer: 0, explain: "Using most available credit can look risky even if payments are current." }, { q: "Which purchase is most dangerous to finance on revolving card debt?", options: ["A recurring expense you cannot repay next month", "A planned bill paid in full", "A reimbursed work expense", "A small tracked purchase"], answer: 0, explain: "Recurring costs plus high interest create a hard-to-exit cycle." }] }
  }
};

/* Ask Anything knowledge base. `level` > user's level triggers a bridge chain. */
export var ASK_TOPICS = [
  {
    id: "emi", name: "EMI", level: 1,
    keywords: ["emi", "instalment", "installment", "loan payment", "monthly payment", "home loan emi"],
    explain: "EMI means Equated Monthly Instalment — one fixed payment every month that slowly pays off your loan. Each EMI is part principal (the borrowed amount) and part interest (the borrowing cost). Early EMIs are mostly interest; later ones are mostly principal.",
    why: "Because most people can't pay ₹5 lakh at once, but almost anyone can pay ₹10,379 a month. EMIs convert a big future obligation into small scheduled bites — and the lender earns interest for the wait.",
    examples: [
      "Car loan ₹5,00,000 at 9% for 5 years → EMI ≈ ₹10,379 every month for 60 months.",
      "Phone on 'no-cost EMI': ₹60,000 over 6 months = ₹10,000/month — the interest is usually hidden in a higher price.",
      "Stretching the same loan from 3 to 6 years can nearly double the total interest you pay."
    ],
    simpler: "EMI = the monthly slice you pay back on a loan, with a small fee (interest) baked in, until the loan is fully yours.",
    quiz: [
      { q: "In early EMIs, the larger share is…", options: ["Interest", "Principal", "Penalties", "Fees"], answer: 0, explain: "The balance is biggest at the start, so interest dominates early EMIs." },
      { q: "A longer tenure means…", options: ["Smaller EMI, more total interest", "Bigger EMI, less interest", "No change", "Free loan"], answer: 0, explain: "Time multiplies interest — longer loans cost more in total." }
    ]
  },
  {
    id: "compound-interest", name: "Compound interest", level: 1,
    keywords: ["compound", "compounding", "interest on interest", "grow my money", "power of compounding"],
    explain: "Compound interest means you earn interest on your interest. Money grows slowly at first, then faster and faster — a snowball rolling downhill. ₹10,000 at 10% becomes ₹11,000 in year one, then year two earns 10% on ₹11,000, not on ₹10,000.",
    why: "Because growth feeds on itself. The longer you leave money compounding, the more each year builds on the last — which is why starting at 25 beats starting at 35 even with smaller amounts.",
    examples: [
      "₹10,000 at 10% → ₹15,900 after 5 years → ₹25,900 after 10 — without adding a rupee.",
      "₹5,000/month invested at 12% for 20 years ≈ ₹49.9 lakh. Starting 5 years later ≈ ₹30 lakh. Five years cost ₹20 lakh.",
      "Debt compounds against you too — a ₹50,000 card balance at 36% doubles roughly every 2 years if unpaid."
    ],
    simpler: "Simple interest pays you on the original amount. Compound interest pays you on the original amount PLUS everything it has already earned. Your money starts earning its own pocket money.",
    quiz: [
      { q: "Compounding means earning interest on…", options: ["Principal + previously earned interest", "Only the principal", "Only the first year", "Nothing extra"], answer: 0, explain: "That 'interest on interest' is the whole magic of compounding." },
      { q: "Who benefits most from compounding?", options: ["Whoever starts earliest and waits longest", "Whoever invests the biggest lump sum last minute", "Whoever changes plans monthly", "Nobody benefits"], answer: 0, explain: "Time is the main ingredient — the curve gets steep late." }
    ]
  },
  {
    id: "inflation", name: "Inflation", level: 2,
    keywords: ["inflation", "prices rising", "cost of living", "purchasing power", "why things get expensive"],
    bridge: [
      { label: "Saving", blurb: "Money parked safely in an account." },
      { label: "Purchasing power", blurb: "What ₹100 can actually buy." },
      { label: "Inflation", blurb: "When prices rise, the same ₹100 buys less — purchasing power falls." }
    ],
    explain: "Inflation is the slow rise of prices across the economy. At 6% inflation, what costs ₹100 today costs ~₹106 next year — so money kept idle quietly shrinks in real value. That's why savings need to earn more than inflation to truly grow.",
    why: "Because most central banks aim for a little inflation (around 2–6%) — it encourages spending and investing now rather than hoarding, keeping the economy moving.",
    examples: [
      "A ₹100 thali costing ₹106 next year is inflation at 6%.",
      "Your grandfather's ₹1,000 was a month's budget; today it's a weekend — that's decades of inflation.",
      "Savings at 4% with inflation at 6% = losing ~2% of buying power yearly, even though the number grew."
    ],
    simpler: "Inflation = prices climbing. Your ₹100 buys less every year, so idle cash melts like ice in the sun.",
    quiz: [
      { q: "At 6% inflation, ₹100 next year buys…", options: ["A little less than today", "A little more", "Exactly the same", "Nothing at all"], answer: 0, explain: "Prices rose 6%, so the same note buys ~6% less stuff." }
    ]
  },
  {
    id: "credit-score", name: "Credit score", level: 2,
    keywords: ["credit score", "cibil", "credit rating", "creditworthiness", "credit history"],
    bridge: [
      { label: "Borrowing", blurb: "Taking a loan or using a credit card." },
      { label: "Repayment", blurb: "Paying back on time — or not. This is recorded." },
      { label: "Credit score", blurb: "A 300–900 number summarising your repayment trustworthiness." }
    ],
    explain: "A credit score (like CIBIL in India, 300–900) is a grade for how reliably you've repaid borrowed money. Pay on time and it climbs; miss EMIs and it falls. A high score gets you lower interest rates and faster approvals; a low one makes lenders wary or expensive.",
    why: "Because lenders don't know you personally, so they use your history as a forecast. Your past payments are the best available predictor of your future ones.",
    examples: [
      "Score 750+: home loans offered at the advertised low rates. Score 600: higher rate, more scrutiny, or rejection.",
      "One missed card payment can dent your score for months.",
      "Using under 30% of your card limit and paying in full helps your score climb."
    ],
    simpler: "Your credit score is like a report card for borrowed money. Pay on time → good grades → cheaper loans in future.",
    quiz: [
      { q: "What does a high credit score get you?", options: ["Lower interest rates and easier approvals", "Free money", "Higher inflation", "Nothing at all"], answer: 0, explain: "Trust is priced — good scores borrow cheaper." }
    ]
  },
  {
    id: "mutual-funds", name: "Mutual funds", level: 3,
    keywords: ["mutual fund", "mutual funds", "sip", "nav", "index fund", "etf", "fund manager"],
    bridge: [
      { label: "Basic assets", blurb: "Things that hold value: gold, land, company shares." },
      { label: "Investing", blurb: "Buying assets so money grows instead of sitting idle." },
      { label: "Pooling", blurb: "Many people chip in small amounts into one common pot." },
      { label: "Mutual funds", blurb: "The pooled pot, managed by a professional, invested across many assets." }
    ],
    explain: "A mutual fund pools money from thousands of investors and a professional manager invests it across stocks, bonds, or gold. You own units of the pool; as its value rises, your units are worth more. SIPs let you invest a fixed amount monthly — small, steady, automated.",
    why: "Because most people lack the time, money, or expertise to buy 30–50 stocks themselves. Funds give instant diversification and professional management for a small fee.",
    examples: [
      "₹5,000/month SIP in an index fund for 15 years at 12% ≈ ₹24.9 lakh.",
      "One fund unit might cost ₹40 (its NAV); buy 125 units with ₹5,000.",
      "An index fund simply copies the Nifty 50 — no manager picking stocks, so fees stay tiny."
    ],
    simpler: "A mutual fund is a shared lunchbox: everyone puts in a little, a professional cooks, and everyone eats a share of the meal.",
    quiz: [
      { q: "What does a mutual fund pool?", options: ["Money from many investors", "Only bank deposits", "Gold biscuits", "Insurance policies"], answer: 0, explain: "Pooling is the core idea — small sums become a large, diversified portfolio." },
      { q: "A SIP is…", options: ["A fixed monthly investment into a fund", "A type of loan", "A savings account", "A tax form"], answer: 0, explain: "Systematic Investment Plan — automation plus rupee-cost averaging." }
    ]
  },
  {
    id: "stocks", name: "Stocks & shares", level: 3,
    keywords: ["stock", "stocks", "shares", "share market", "equity", "sensex", "nifty", "trading"],
    bridge: [
      { label: "Companies", blurb: "Businesses that sometimes need money to grow." },
      { label: "Ownership shares", blurb: "A company sliced into tiny ownable pieces." },
      { label: "Stock market", blurb: "The marketplace where those pieces change hands." },
      { label: "Stocks", blurb: "One share = one tiny slice of ownership in a company." }
    ],
    explain: "A stock (share) is a tiny slice of ownership in a company. Companies sell slices to raise money; buyers hope the business grows and the slice becomes more valuable, sometimes with dividends along the way. Prices move with news, results, and mood — which is the risk part.",
    why: "Because ownership rewards growth: unlike a loan, shareholders participate in the company's upside. Historically, equity has outpaced most other assets over long periods — the reward for bearing that risk.",
    examples: [
      "Buy 10 shares at ₹500 each (₹5,000). Price rises to ₹650 → your slice is worth ₹6,500.",
      "Sensex/Nifty are scoreboards tracking the biggest companies' shares.",
      "Shares can fall too — a ₹500 share can become ₹350. Ownership has no guaranteed floor."
    ],
    simpler: "Buying a share is buying a crumb of a company. If the company grows, your crumb grows. If it shrinks, so does your crumb.",
    quiz: [
      { q: "A share represents…", options: ["A small piece of company ownership", "A fixed deposit receipt", "A loan to the government", "An insurance cover"], answer: 0, explain: "Shares are ownership, not lending — that's why returns are uncapped and so are losses." }
    ]
  },
  {
    id: "derivatives", name: "Derivatives", level: 5,
    keywords: ["derivative", "derivatives", "futures", "options", "hedging", "hedge", "call option", "put option", "f&o"],
    bridge: [
      { label: "Basic assets", blurb: "Things people own and trade: wheat, gold, shares." },
      { label: "Investments", blurb: "Buying assets hoping they grow in value." },
      { label: "Risk", blurb: "Prices move — sometimes against you. Risk needs managing." },
      { label: "Financial contracts", blurb: "Formal promises about a future price or trade." },
      { label: "Derivatives", blurb: "Contracts whose value is *derived* from something else — a share, crop, or commodity." }
    ],
    explain: "A derivative is a contract that derives its value from something else — shares, gold, wheat, even interest rates. Futures lock a price for a future date; options give the *right* (not obligation) to buy or sell at a set price. Farmers use them to lock crop prices; companies use them to manage risk. Traders also use them to bet — which is why derivatives can be powerful or dangerous.",
    why: "Because uncertainty is expensive. If you're a farmer who needs to sell wheat in 3 months, or an airline that needs fuel in 6, a derivative transfers price risk to someone willing to bear it — for a fee. That's hedging, their original purpose.",
    examples: [
      "A farmer signs a futures contract to sell wheat at ₹2,000/quintal in 3 months — rain or shine, the price is locked.",
      "You buy a call option on Share X at a ₹500 strike. If it hits ₹600, your option is gold; if it sinks to ₹400, you only lose the small premium you paid.",
      "An airline buys oil futures so a fuel-price spike doesn't wreck its budget — insurance made of contracts."
    ],
    simpler: "A derivative is a bet about tomorrow's price, written down as a contract. It can be a seatbelt (locking prices = hedging) or a casino chip (betting on moves) — same tool, different hands.",
    quiz: [
      { q: "A derivative's value comes from…", options: ["An underlying asset like shares, gold, or wheat", "Thin air", "Bank deposits", "Government salaries"], answer: 0, explain: "The name says it: value *derived* from something else." },
      { q: "An option gives you…", options: ["The right, not the obligation, to buy or sell at a set price", "A guaranteed profit", "A bank loan", "Company voting rights always"], answer: 0, explain: "The premium you pay is the max you can lose — the seller carries the bigger risk." },
      { q: "Using futures to lock in a future selling price is called…", options: ["Hedging", "Gambling", "Saving", "Arbitraging your salary"], answer: 0, explain: "Hedging removes price uncertainty — the original purpose of derivatives." }
    ]
  }
];

export var ASK_SUGGESTIONS = ["Explain derivatives", "What is a mutual fund?", "How does a credit score work?", "What is inflation?", "Explain compounding"];

export var BADGES = [
  { id: "first-steps", emoji: "🐾", name: "First Steps", rule: "Finish your first quiz" },
  { id: "sharp-mind", emoji: "⚡", name: "Sharp Mind", rule: "Score 80%+ in any round" },
  { id: "bridge-builder", emoji: "🌉", name: "Bridge Builder", rule: "Bridge an advanced topic" },
  { id: "curious-cat", emoji: "🐈", name: "Curious Cat", rule: "Ask 3 questions" },
  { id: "pathfinder", emoji: "🧭", name: "Pathfinder", rule: "Master all of Level 1" }
];

export var XP_PER_LEVEL = 100;
export var XP_CORRECT = 10;
export var XP_MASTERY = 20;
export var XP_SHARP_BONUS = 15;

/* ============================================================
   FinQuest — mock AI engine (rule-based, swappable for a real API)
   Every reply is built here; the UI only renders what it gets back.
   ============================================================ */

export function normalizeInput(text) {
  return " " + String(text || "").toLowerCase().replace(/[^a-z0-9?\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
}

export function findAskTopic(text) {
  var n = normalizeInput(text);
  var best = null, bestScore = 0;
  for (var i = 0; i < ASK_TOPICS.length; i++) {
    var t = ASK_TOPICS[i], score = 0;
    for (var k = 0; k < t.keywords.length; k++) {
      var kw = " " + t.keywords[k].toLowerCase() + " ";
      if (n.indexOf(kw) !== -1) score += kw.length > 4 ? 3 : 2; /* longer phrases = stronger signal */
      else if (n.indexOf(t.keywords[k].toLowerCase()) !== -1) score += 1;
    }
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return bestScore > 0 ? best : null;
}

export function detectFollowUp(text) {
  var n = normalizeInput(text);
  if (/\bquiz|test me|question\b/.test(n)) return "quiz";
  if (/\bwhy\b/.test(n)) return "why";
  if (/\b(simpler|simple|easier|dumb it down|layman)\b/.test(n)) return "simpler";
  if (/\b(example|another|instance)\b/.test(n)) return "example";
  return null;
}

/* The brain. Returns an array of chat messages (in order) the UI should append. */
export function buildAskResponse(text, ctx) {
  var followUp = detectFollowUp(text);
  var current = ctx.topicId ? ASK_TOPICS.find(function (t) { return t.id === ctx.topicId; }) : null;

  if (followUp && current) {
    if (followUp === "why") return [{ kind: "text", text: current.why, topicId: current.id }];
    if (followUp === "simpler") return [{ kind: "text", text: current.simpler, topicId: current.id }];
    if (followUp === "example") {
      var idx = (ctx.exampleIndex || 0) % current.examples.length;
      return [{ kind: "text", text: current.examples[idx], topicId: current.id }];
    }
    if (followUp === "quiz") return [{ kind: "quiz", topicId: current.id, quiz: current.quiz }];
  }

  var topic = findAskTopic(text);
  if (!topic) {
    return [{
      kind: "text", topicId: null,
      text: "I don't have that one yet in this demo build — but nothing here is locked. Try one of these, even if it sounds advanced:"
    }, { kind: "suggestions" }];
  }

  if (topic.level <= ctx.userLevel) {
    return [{ kind: "text", text: topic.explain, topicId: topic.id }, { kind: "chips", topicId: topic.id }];
  }

  /* Advanced topic → the knowledge bridge. USP lives here. */
  return [
    { kind: "flag", topicId: topic.id, text: "\u201C" + topic.name + "\u201D is a Level " + topic.level + " idea \u2014 past your stop on the path. Instead of locking you out, here\u2019s the bridge from where you stand:", chain: topic.bridge },
    { kind: "bridge", topicId: topic.id, chain: topic.bridge },
    { kind: "text", text: topic.bridge.map(function (s) { return s.label + ": " + s.blurb; }).join("\n") + "\n\nAnd now, the idea itself \u2014 " + topic.explain, topicId: topic.id },
    { kind: "chips", topicId: topic.id }
  ];
}

/* Adaptive difficulty: where does the NEXT round land? */
export function adaptDifficulty(currentTier, pct) {
  var order = ["gentle", "standard", "sharp"];
  var i = order.indexOf(currentTier);
  if (pct >= 80) return { next: order[Math.min(i + 1, 2)], verdict: "sharp", note: "You cleared 80%+, so the next round upgrades to tougher questions." };
  if (pct >= 50) return { next: order[i], verdict: "solid", note: "Solid round \u2014 same difficulty next time. One more pass at 80%+ earns mastery." };
  return { next: "gentle", verdict: "rebuild", note: "Under 50% \u2014 the next round drops to Gentle questions and rebuilds the base with you." };
}

export function verdictFor(pct) {
  if (pct >= 80) return {
    key: "sharp", title: "Sharp round", emoji: "⚡",
    headline: "You\u2019re ahead of this stop.",
    copy: "80%+ means the idea has clicked. Next round on this topic steps up to harder questions \u2014 and mastery is banked.",
    accent: "green"
  };
  if (pct >= 50) return {
    key: "solid", title: "Solid round", emoji: "🌤️",
    headline: "The base is forming.",
    copy: "50\u201379%: you have the shape of it, with a few gaps. Same difficulty next time \u2014 push past 80% to master the topic.",
    accent: "orange"
  };
  return {
    key: "rebuild", title: "Let\u2019s rebuild the base", emoji: "🧱",
    headline: "No shame \u2014 this is how learning works.",
    copy: "Under 50% usually means a missing brick underneath, not a lack of ability. Next round drops to Gentle questions \u2014 or review the idea first.",
    accent: "red"
  };
}
