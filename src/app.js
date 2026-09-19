import React from "react";
import { createRoot } from "react-dom/client";
import {
  LEVELS, TOPICS, ASK_TOPICS, ASK_SUGGESTIONS, BADGES,
  XP_PER_LEVEL, XP_CORRECT, XP_MASTERY, XP_SHARP_BONUS,
  findAskTopic, detectFollowUp, buildAskResponse, adaptDifficulty, verdictFor
} from "./shared.js";
import { askFinBuddy } from "./finbuddy.js";

var h = React.createElement;
var FRAG = React.Fragment;
var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

function shuffle(items) {
  var copy = items.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copy[i]; copy[i] = copy[j]; copy[j] = temp;
  }
  return copy;
}

function shuffledQuestions(questions) {
  return shuffle(questions).map(function (question) {
    var choices = question.options.map(function (label, index) { return { label: label, correct: index === question.answer }; });
    choices = shuffle(choices);
    return Object.assign({}, question, { options: choices.map(function (choice) { return choice.label; }), answer: choices.findIndex(function (choice) { return choice.correct; }) });
  });
}

function tutorQuizFor(category) {
  var quizzes = {
    banking: { q: "Which detail should you never share with anyone claiming to be your bank?", options: ["Your OTP or PIN", "Your bank branch", "Your account nickname", "Your preferred language"], answer: 0, explain: "Banks never need your OTP or PIN over a call, message, or link." },
    saving: { q: "What is the main job of an emergency fund?", options: ["Cover unexpected necessary expenses", "Fund daily shopping", "Guarantee investment returns", "Replace insurance"], answer: 0, explain: "An emergency fund provides a readily available cushion for genuine surprises." },
    budgeting: { q: "What should a useful budget compare?", options: ["Income, essential spending, goals and flexible spending", "Only your credit limit", "Only investment returns", "Only cash withdrawals"], answer: 0, explain: "Seeing all these buckets together helps you make realistic choices." },
    credit: { q: "What is generally the healthiest credit-card habit?", options: ["Pay the full statement balance by the due date", "Pay only the minimum forever", "Spend up to the limit", "Ignore the statement"], answer: 0, explain: "Paying in full helps avoid costly revolving interest." },
    loans: { q: "What can a longer loan tenure usually mean?", options: ["Lower monthly EMI but more total interest", "No interest at all", "A guaranteed lower total cost", "No repayment schedule"], answer: 0, explain: "More time can reduce the monthly burden while increasing total interest." },
    investing: { q: "What does diversification aim to do?", options: ["Reduce dependence on one investment", "Guarantee profit", "Eliminate every risk", "Predict markets exactly"], answer: 0, explain: "Spreading investments can reduce concentration risk; it cannot guarantee returns." },
    insurance: { q: "What is insurance primarily designed to do?", options: ["Protect against specified financial losses", "Deliver guaranteed investment growth", "Replace all savings", "Pay everyday bills"], answer: 0, explain: "Insurance transfers certain risks for a premium; it is not a replacement for a plan." },
    taxes: { q: "Why keep records of income and eligible expenses?", options: ["To support accurate tax filing", "To avoid banking", "To get a free loan", "To increase market returns"], answer: 0, explain: "Records make it easier to file correctly and verify information." },
    scams: { q: "A message asks for your OTP to unblock an account. What is the safest response?", options: ["Do not share it; verify through the official app or number", "Reply with the OTP immediately", "Click every link in the message", "Forward your PIN too"], answer: 0, explain: "Urgency and credential requests are common scam signals. Use trusted official channels." }
  };
  var key = String(category || "").toLowerCase();
  return quizzes[key] || quizzes.banking;
}

var CATEGORY_NAMES = ["Banking", "Saving", "Budgeting", "Credit", "Loans", "Investing", "Insurance", "Taxes", "Scam Awareness"];
var DEFAULT_SCORES = { "Banking": 45, "Saving": 45, "Budgeting": 45, "Credit": 45, "Loans": 45, "Investing": 45, "Insurance": 45, "Taxes": 45, "Scam Awareness": 45 };
function topicCategory(id) { return ({ "what-is-a-bank": "Banking", "savings-vs-current": "Banking", "emi": "Loans", "interest-rate": "Loans", "budgeting": "Budgeting", "emergency-fund": "Saving", "credit-card": "Credit" })[id] || "Banking"; }
function loadAssessment() { try { return JSON.parse(localStorage.getItem("finquest-assessment")) || null; } catch (e) { return null; } }

function el(tag, props) {
  var kids = [];
  for (var i = 2; i < arguments.length; i++) {
    var k = arguments[i];
    if (k === null || k === undefined || k === false || k === true) continue;
    if (Array.isArray(k)) for (var j = 0; j < k.length; j++) { if (k[j] !== null && k[j] !== undefined && k[j] !== false) kids.push(k[j]); }
    else kids.push(k);
  }
  return h(tag, props || {}, kids);
}

var TOPIC_LIST = Object.keys(TOPICS).map(function (id) { return TOPICS[id]; });

function levelTopics(levelId) { return TOPIC_LIST.filter(function (t) { return t.level === levelId; }); }
function todayStr() { return new Date().toDateString(); }
function timeNow() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

/* ============================ APP ============================ */

function App() {
  var savedAssessment = loadAssessment();
  var scr = useState({ name: savedAssessment ? "map" : "assessment" }), screen = scr[0], setScreen = scr[1];
  var xpS = useState(0), xp = xpS[0], setXp = xpS[1];
  var stS = useState(0), streak = stS[0], setStreak = stS[1];
  var dayS = useState(""), setLastDay = dayS[1];
  var mS = useState({}), mastered = mS[0], setMastered = mS[1];
  var dS = useState({}), difficulty = dS[0], setDifficulty = dS[1];
  var logS = useState([]), log = logS[0], setLog = logS[1];
  var bS = useState({}), badges = bS[0], setBadges = bS[1];
  var corrS = useState(0), setCorrectCount = corrS[1];
  var msgS = useState([]), askMessages = msgS[0], setAskMessages = msgS[1];
  var atS = useState(null), askTopicId = atS[0], setAskTopicId = atS[1];
  var exS = useState(0), askExampleIndex = exS[0], setAskExampleIndex = exS[1];
  var askCountS = useState(0), askCount = askCountS[0], setAskCount = askCountS[1];
  var assessmentS = useState(savedAssessment), assessment = assessmentS[0], setAssessment = assessmentS[1];
  var scoreS = useState(savedAssessment ? savedAssessment.scores : DEFAULT_SCORES), categoryScores = scoreS[0], setCategoryScores = scoreS[1];
  var quizDoneS = useState(0), quizzesDone = quizDoneS[0], setQuizzesDone = quizDoneS[1];
  var simS = useState({ month: 1, cash: 18000, wellbeing: 72, score: 600, job: "Campus intern", savings: 3500, log: ["You begin with a modest safety net. Your choices shape the next month."] }), sim = simS[0], setSim = simS[1];
  var toastS = useState(null), toast = toastS[0], setToast = toastS[1];
  var bootS = useState(false), booted = bootS[0], setBooted = bootS[1];

  var toastTimer = useRef(null);
  function showToast(text) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(function () { setToast(null); }, 2600);
  }

  /* ---- derived ---- */
  function isMastered(id) { return !!mastered[id]; }
  function isLevelMastered(levelId) {
    var ts = levelTopics(levelId);
    if (!LEVELS[levelId - 1].topics) return false;
    return ts.every(function (t) { return isMastered(t.id); });
  }
  function isLevelUnlocked(levelId) {
    if (levelId === 1) return true;
    return isLevelMastered(levelId - 1);
  }
  function userLevel() {
    var ul = 1;
    for (var i = 1; i <= LEVELS.length; i++) if (isLevelUnlocked(i)) ul = i;
    return ul;
  }
  var masteredCount = TOPIC_LIST.filter(function (t) { return isMastered(t.id); }).length;

  /* ---- economy ---- */
  function awardXP(n) { setXp(function (v) { return v + n; }); }
  function bumpStreak() {
    var t = todayStr();
    setLastDay(function (last) {
      if (last !== t) { setStreak(function (v) { return v + 1; }); return t; }
      return last;
    });
  }
  function unlockBadge(id) {
    if (badges[id]) return;
    setBadges(function (b) { var nb = Object.assign({}, b); nb[id] = true; return nb; });
    var bd = BADGES.find(function (x) { return x.id === id; });
    if (bd) showToast("Badge unlocked · " + bd.emoji + " " + bd.name);
  }
  function tierFor(topicId) { return difficulty[topicId] || "standard"; }

  function completeRound(topicId, tier, correct, total) {
    var pct = Math.round((correct / total) * 100);
    var adapt = adaptDifficulty(tier, pct);
    var verdict = verdictFor(pct);
    setDifficulty(function (d) { var nd = Object.assign({}, d); nd[topicId] = adapt.next; return nd; });

    var xpEarned = correct * XP_CORRECT;
    awardXP(xpEarned);
    var masteredNow = false;
    if (pct >= 80) {
      if (!isMastered(topicId)) {
        masteredNow = true;
        setMastered(function (m) { var nm = Object.assign({}, m); nm[topicId] = true; return nm; });
        awardXP(XP_MASTERY); xpEarned += XP_MASTERY;
      }
      awardXP(XP_SHARP_BONUS); xpEarned += XP_SHARP_BONUS;
      unlockBadge("sharp-mind");
    }
    setCorrectCount(function (v) { return v + correct; });
    setQuizzesDone(function (v) { return v + 1; });
    setCategoryScores(function (scores) { var next = Object.assign({}, scores); var cat = topicCategory(topicId); next[cat] = Math.min(100, next[cat] + Math.round((correct / total) * 8)); return next; });
    setLog(function (l) { return [{ title: TOPICS[topicId].title, score: correct + "/" + total, xp: xpEarned, when: timeNow() }].concat(l); });
    bumpStreak();
    unlockBadge("first-steps");
    var newMasteredCount = masteredCount + (masteredNow ? 1 : 0);
    if (newMasteredCount === TOPIC_LIST.length) {
      unlockBadge("pathfinder");
      setTimeout(function () { showToast("Level 2 unlocked · Money & Income"); }, 600);
    }
    return { verdict: verdict, xpEarned: xpEarned, masteredNow: masteredNow, nextTier: adapt.next, pct: pct };
  }

  /* ---- navigation ---- */
  function go(name, extra) { setScreen(Object.assign({ name: name }, extra || {})); window.scrollTo(0, 0); }
  function goTab(name) {
    if (name === "ask") { if (!booted) { setBooted(true); } go("ask"); }
    else if (name === "life") go("life");
    else if (name === "scam") go("scam");
    else go(name === "map" ? "map" : "progress");
  }

  /* ---- Ask Anything ---- */
  async function sendAsk(text) {
    var t = text.trim();
    if (!t) return;
    setAskMessages(function (m) { return m.concat([{ from: "user", text: t }, { from: "ai", kind: "typing" }]); });
    setAskCount(function (c) { return c + 1; });
    var isExample = /\b(example|another)\b/i.test(t);
    try {
      var history = askMessages.filter(function (m) { return m.kind !== "typing"; }).slice(-6).map(function (m) { return { role: m.from === "ai" ? "assistant" : "user", text: m.text || "" }; });
      var finBuddyResult = await askFinBuddy(t, history);
      var tutorMessages = [{ from: "ai", kind: "text", text: finBuddyResult.answer, topicId: findAskTopic(t) ? findAskTopic(t).id : null, source: "gemini" }];
      if (finBuddyResult.allowed) tutorMessages.push({ from: "ai", kind: "tutor-quiz", quiz: tutorQuizFor(finBuddyResult.category) });
      setAskMessages(function (m) { return m.filter(function (x) { return x.kind !== "typing"; }).concat(tutorMessages); });
    } catch (error) {
      var ctx = { userLevel: userLevel(), topicId: askTopicId, exampleIndex: askExampleIndex };
      var replies = buildAskResponse(t, ctx);
      if (isExample) setAskExampleIndex(function (i) { return i + 1; });
      var firstTopic = null;
      replies.forEach(function (r) { if (!firstTopic && r.topicId) firstTopic = r.topicId; });
      if (firstTopic) setAskTopicId(firstTopic);
      if (replies.some(function (r) { return r.kind === "bridge"; })) unlockBadge("bridge-builder");
      setAskMessages(function (m) { return m.filter(function (x) { return x.kind !== "typing"; }).concat([{ from: "ai", kind: "error", text: "FinBuddy is taking a short break. Here is a built-in lesson while you try again." }], replies.map(function (r) { return Object.assign({ from: "ai" }, r); })); });
    }
  }
  useEffect(function () { if (askCount >= 3) unlockBadge("curious-cat"); }, [askCount]);

  /* ---- screens ---- */
  var body = null, activeTab = "map";
  if (screen.name === "assessment") {
    body = el(AssessmentScreen, { onComplete: function (result) { setAssessment(result); setCategoryScores(result.scores); try { localStorage.setItem("finquest-assessment", JSON.stringify(result)); } catch (e) {} go("map"); showToast("Your personal path is ready!"); } });
  } else if (screen.name === "map") {
    activeTab = "map";
    body = el(MapScreen, { go: go, userLevel: userLevel(), mastered: mastered, isLevelMastered: isLevelMastered, isLevelUnlocked: isLevelUnlocked, masteredCount: masteredCount, tierFor: tierFor, assessment: assessment, categoryScores: categoryScores, onLocked: function (n) { showToast("Master Level " + (n - 1) + " to unlock this stop"); } });
  } else if (screen.name === "level") {
    var lvl = LEVELS[screen.levelId - 1];
    body = el(LevelScreen, { level: lvl, go: go, isMastered: isMastered, tierFor: tierFor });
  } else if (screen.name === "topic") {
    body = el(TopicScreen, { topic: TOPICS[screen.topicId], tier: tierFor(screen.topicId), mastered: isMastered(screen.topicId), go: go });
  } else if (screen.name === "quiz") {
    body = el(QuizScreen, { topic: TOPICS[screen.topicId], tier: tierFor(screen.topicId), onAnswer: function (ok) { if (ok) awardXP(XP_CORRECT); }, onComplete: function (c, t2) { return completeRound(screen.topicId, tierFor(screen.topicId), c, t2); }, go: go });
  } else if (screen.name === "ask") {
    activeTab = "ask";
    body = el(AskScreen, { messages: askMessages, send: sendAsk, topicId: askTopicId, awardXP: awardXP, onChatAnswer: function (ok) { if (ok) { awardXP(XP_CORRECT); setCorrectCount(function (v) { return v + 1; }); bumpStreak(); unlockBadge("first-steps"); } } });
  } else if (screen.name === "progress") {
    activeTab = "progress";
    body = el(ProgressScreen, { xp: xp, streak: streak, masteredCount: masteredCount, totalTopics: TOPIC_LIST.length, correct: corrS[0], badges: badges, log: log, scores: categoryScores, quizzesDone: quizzesDone, simMonth: sim.month, go: go });
  } else if (screen.name === "life") {
    activeTab = "life";
    body = el(LifeScreen, { sim: sim, setSim: setSim, awardXP: awardXP, showToast: showToast, setCategoryScores: setCategoryScores });
  } else if (screen.name === "scenario") {
    body = el(ScenarioScreen, { awardXP: awardXP, setCategoryScores: setCategoryScores, go: go });
  } else if (screen.name === "scam") {
    activeTab = "scam";
    body = el(ScamScreen, { awardXP: awardXP, setCategoryScores: setCategoryScores });
  }

  return el("div", { className: "app-frame" },
    el(TopBar, { xp: xp, streak: streak, userLevel: userLevel(), levelTitle: LEVELS[userLevel() - 1].title }),
    el("div", { className: "scroll-area" }, body),
    el(TabBar, { active: activeTab, go: goTab }),
    toast ? el("div", { className: "toast" }, toast) : null
  );
}

/* ============================ TOP BAR ============================ */

function TopBar(p) {
  var into = p.xp % XP_PER_LEVEL;
  var pct = Math.min(100, Math.round((into / XP_PER_LEVEL) * 100));
  return el("div", { className: "topbar" },
    el("div", { className: "topbar-row" },
      el("div", { className: "brand" },
        el("div", { className: "brand-mark" }, "₹"),
        el("div", { className: "brand-name" }, "FinQuest")
      ),
      el("div", { className: "topbar-stats" },
        el("span", { className: "streak-pill" }, "🔥 ", p.streak),
        el("span", { className: "xp-pill" }, "⚡ ", p.xp, " XP")
      )
    ),
    el("div", { className: "level-line" },
      el("div", null,
        el("div", { className: "level-caption" }, "Level " + p.userLevel + " · " + p.levelTitle),
        el("div", { className: "progress-track" }, el("div", { className: "progress-fill", style: { width: pct + "%" } }))
      ),
      el("div", { className: "level-xp" }, into + "/" + XP_PER_LEVEL)
    )
  );
}

/* ============================ MAP (skill path) ============================ */

function AssessmentScreen(p) {
  var questions = [
    ["Banking", "What is the safest reason to use a bank account?", ["To keep and access money securely", "To double money every month", "To avoid all taxes"], 0],
    ["Saving", "An emergency fund is mainly for…", ["Unplanned necessary costs", "A planned holiday", "Daily trading"], 0],
    ["Budgeting", "A useful budget begins with…", ["Income and essential expenses", "A credit limit", "A social-media tip"], 0],
    ["Credit", "What is the best way to use a credit card?", ["Pay the full statement on time", "Spend up to the limit", "Pay only minimums forever"], 0],
    ["Loans", "A longer loan tenure normally means…", ["Lower EMI but more interest", "No interest", "A higher EMI and less interest"], 0],
    ["Investing", "Diversification aims to…", ["Reduce dependence on one investment", "Guarantee profits", "Avoid all risk"], 0],
    ["Insurance", "Insurance is designed to…", ["Protect against specific financial losses", "Create instant returns", "Replace emergency savings"], 0],
    ["Taxes", "Why should you keep income records?", ["For accurate tax filing and planning", "To avoid banking", "To raise a credit limit"], 0],
    ["Scam Awareness", "A legitimate bank will never ask you for…", ["Your OTP or PIN", "Your name", "A branch preference"], 0]
  ];
  var iS = useState(0), index = iS[0], setIndex = iS[1];
  var answersS = useState({}), answers = answersS[0], setAnswers = answersS[1];
  var q = questions[index];
  function answer(choice) {
    var updated = Object.assign({}, answers); updated[q[0]] = choice === q[3]; setAnswers(updated);
    if (index === questions.length - 1) {
      var scores = Object.assign({}, DEFAULT_SCORES); questions.forEach(function (item) { scores[item[0]] = updated[item[0]] ? 85 : 35; });
      var total = Math.round(Object.keys(updated).filter(function (key) { return updated[key]; }).length / questions.length * 100);
      p.onComplete({ overall: total, scores: scores, completedAt: new Date().toISOString() });
    } else setIndex(index + 1);
  }
  return el("main", { className: "assessment" },
    el("div", { className: "assessment-badge" }, "✦ FINQUEST STARTER CHECK"),
    el("div", { className: "assessment-progress" }, el("div", { style: { width: ((index + 1) / questions.length * 100) + "%" } })),
    el("span", { className: "assessment-count" }, "Question " + (index + 1) + " of " + questions.length + " · " + q[0]),
    el("h1", null, "Let’s build a path around you."),
    el("p", null, q[1]),
    el("div", { className: "assessment-options" }, q[2].map(function (option, optionIndex) { return el("button", { key: option, onClick: function () { answer(optionIndex); } }, el("b", null, String.fromCharCode(65 + optionIndex)), option); })),
    el("small", null, "This is a learning baseline, not a financial assessment or professional advice.")
  );
}

function MapScreen(p) {
  var stops = LEVELS.map(function (lv, i) {
    var unlocked = p.isLevelUnlocked(lv.id);
    var done = p.isLevelMastered(lv.id);
    var isCurrent = unlocked && !done;
    var topics = levelTopics(lv.id);
    var doneCount = topics.filter(function (t) { return p.mastered[t.id]; }).length;
    var stateCls = done ? "done" : isCurrent ? "current" : "locked";
    var icon = done ? "✓" : isCurrent ? String(lv.id) : "🔒";
    var caption;
    if (done) caption = "Mastered · " + topics.length + " topics";
    else if (isCurrent) caption = doneCount + " of " + topics.length + " topics mastered →";
    else if (lv.id === 2 && unlocked) caption = "Preview · syllabus in full build";
    else caption = "Master Level " + (lv.id - 1) + " to unlock";
    if (lv.id === 2 && unlocked && !lv.topics) { /* preview stop */ }

    return el(FRAG, { key: lv.id },
      el("div", {
        className: "map-stop " + stateCls,
        onClick: function () {
          if (unlocked) {
            if (!lv.topics) { p.go("level", { levelId: lv.id }); }
            else p.go("level", { levelId: lv.id });
          } else p.onLocked(lv.id);
        }
      },
        el("div", { className: "map-node " + stateCls }, icon),
        el("div", { className: "map-card " + stateCls },
          el("div", { className: "map-card-head" },
            el("span", { className: "map-card-title" }, lv.id + ". " + lv.title),
            isCurrent ? el("span", { className: "you-are-here" }, "you are here") : null
          ),
          el("div", { className: "map-card-sub" }, lv.tagline),
          el("div", { className: "map-card-state" }, caption)
        )
      ),
      i < LEVELS.length - 1 ? el("div", { className: "map-link" }) : null
    );
  });

  return el(FRAG, null,
    el("section", { className: "welcome-card" },
      el("div", { className: "welcome-copy" },
        el("span", { className: "overline" }, "TODAY'S FOCUS"),
        el("h1", null, "Build your money confidence."),
        el("p", null, p.masteredCount ? "Keep the momentum going—one clear concept at a time." : "Start small. Learn the language of money at your own pace."),
        el("button", { className: "continue-btn", onClick: function () { p.go("level", { levelId: p.userLevel }); } }, p.masteredCount ? "Continue your path  →" : "Start Level 1  →")
      ),
      el("div", { className: "welcome-orbit", "aria-hidden": "true" },
        el("span", { className: "orbit-rupee" }, "₹"),
        el("span", { className: "orbit-dot dot-one" }),
        el("span", { className: "orbit-dot dot-two" })
      )
    ),
    el("div", { className: "quick-stats" },
      el("div", null, el("strong", null, p.masteredCount), el("span", null, "topics mastered")),
      el("div", null, el("strong", null, p.userLevel), el("span", null, "current level")),
      el("div", null, el("strong", null, Math.max(0, TOPIC_LIST.length - p.masteredCount)), el("span", null, "still to explore"))
    ),
    p.assessment ? el("button", { className: "mission-card", onClick: function () { p.go("progress"); } }, el("span", null, "🎯"), el("span", null, el("b", null, "Today’s mission"), " Improve your lowest skill: " + Object.keys(p.categoryScores).sort(function (a, b) { return p.categoryScores[a] - p.categoryScores[b]; })[0]), el("i", null, "→")) : null,
    el("div", { className: "practice-grid" },
      el("button", { onClick: function () { p.go("scenario"); } }, el("span", null, "💭"), el("b", null, "What would you do?"), el("small", null, "Scenario challenge · +15 XP")),
      el("button", { onClick: function () { p.go("scam"); } }, el("span", null, "🛡️"), el("b", null, "Real or Scam?"), el("small", null, "Spot red flags · +10 XP"))
    ),
    el("button", { className: "ask-entry", onClick: function () { p.go("ask"); } },
      el("span", { className: "ask-entry-icon" }, "💬"),
      el("span", { className: "ask-entry-text" },
        el("span", { className: "ask-entry-title" }, "Ask anything"),
        el("span", { className: "ask-entry-sub" }, "No topic is locked — only mastery is. Advanced answers build you a bridge.")
      ),
      el("span", { className: "ask-entry-arrow" }, "→")
    ),
    el("div", { className: "path-title" }, "Your path"),
    el("div", { className: "map" }, stops)
  );
}

/* ============================ LEVEL ============================ */

function LevelScreen(p) {
  var topics = levelTopics(p.level.id);
  return el(FRAG, null,
    el("div", { className: "back-row", onClick: function () { p.go("map"); } }, "← Back to path"),
    el("div", { className: "level-head" },
      el("div", { className: "level-head-title" }, p.level.id + ". " + p.level.title),
      el("div", { className: "level-head-sub" }, p.level.tagline)
    ),
    !p.level.topics
      ? el("div", { className: "placeholder-note" },
          el("div", { className: "placeholder-emoji" }, "🚧"),
          el("div", { className: "placeholder-title" }, "Full syllabus drops in the complete build"),
          el("div", { className: "placeholder-sub" }, "You unlocked this stop with mastery — nice. Until its lessons land, Ask Anything already covers ideas from this level and beyond, bridged to what you know.")
        )
      : topics.map(function (t) {
          var m = p.isMastered(t.id);
          var tier = p.tierFor(t.id);
          return el("div", { key: t.id, className: "topic-row" + (m ? " mastered" : ""), onClick: function () { p.go("topic", { topicId: t.id }); } },
            el("div", { className: "topic-row-body" },
              el("div", { className: "topic-row-title" }, t.title),
              el("div", { className: "topic-row-tag" }, m ? "Mastered · quiz passed at 80%+" : "Next quiz: " + tier + " questions")
            ),
            m ? el("span", { className: "topic-check" }, "✓") : el("span", { className: "topic-go" }, "→")
          );
        })
  );
}

/* ============================ TOPIC (EXPLAIN) ============================ */

function TopicScreen(p) {
  var simpleS = useState(false), simple = simpleS[0], setSimple = simpleS[1];
  var exS = useState(0), exIdx = exS[0], setEx = exS[1];
  var t = p.topic;
  return el(FRAG, null,
    el("div", { className: "back-row", onClick: function () { p.go("level", { levelId: t.level }); } }, "← " + LEVELS[t.level - 1].title),
    el("div", { className: "explain-card" },
      el("div", { className: "eyebrow-chip" }, "Level " + t.level + " · " + (p.mastered ? "mastered" : "next quiz: " + p.tier + " questions")),
      el("h1", { className: "explain-title" }, t.title),
      el("p", { className: "explain-body" }, simple ? t.simpler : t.definition),
      el("div", { className: "block" },
        el("div", { className: "block-label" }, "🧪 See it in real life"),
        el("div", { className: "example-box" }, exIdx === 0 ? t.example : t.extraExample)
      ),
      !simple ? el("div", { className: "block" },
        el("div", { className: "block-label" }, "🪜 How it works"),
        el("ol", { className: "steps-list" }, t.steps.map(function (st, i) { return el("li", { key: i }, el("span", { className: "step-num" }, i + 1), el("span", null, st)); }))
      ) : null,
      el("div", { className: "remember-box" }, el("span", { className: "remember-icon" }, "🧠"), el("span", null, t.remember))
    ),
    el("a", { className: "video-lesson", href: t.video || "https://www.youtube.com/results?search_query=" + encodeURIComponent(t.title + " explained India"), target: "_blank", rel: "noreferrer" },
      el("span", { className: "video-play" }, "▶"), el("span", null, el("b", null, "Watch a short video lesson"), el("small", null, "Open a curated explainer search on YouTube")), el("span", { className: "video-arrow" }, "↗")),
    el("div", { className: "action-grid" },
      el("button", { className: "btn btn-ghost", onClick: function () { setSimple(!simple); } }, simple ? "Show the full version" : "Make it simpler"),
      el("button", { className: "btn btn-ghost", onClick: function () { setEx(exIdx === 0 ? 1 : 0); } }, "Another example"),
      el("button", { className: "btn btn-primary", onClick: function () { p.go("quiz", { topicId: t.id }); } }, "Start the quiz →")
    )
  );
}

/* ============================ QUIZ ============================ */

function QuizScreen(p) {
  var qS = useState(function () { return shuffledQuestions(p.topic.quiz[p.tier]); }), qs = qS[0], setQuestions = qS[1];
  var idxS = useState(0), idx = idxS[0], setIdx = idxS[1];
  var pickedS = useState(null), picked = pickedS[0], setPicked = pickedS[1];
  var correctS = useState(0), correct = correctS[0], setCorrect = correctS[1];
  var phaseS = useState("question"), phase = phaseS[0], setPhase = phaseS[1];
  var sumS = useState(null), summary = sumS[0], setSummary = sumS[1];
  var floatS = useState(0), floatKey = floatS[0], bumpFloat = floatS[1];

  var q = qs[Math.min(idx, qs.length - 1)];
  var total = qs.length;
  var isLast = idx === total - 1;

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    var ok = i === q.answer;
    if (ok) { setCorrect(correct + 1); p.onAnswer(true); bumpFloat(floatKey + 1); }
  }
  function next() {
    if (isLast) { setSummary(p.onComplete(correct, total)); setPhase("summary"); }
    else { setIdx(idx + 1); setPicked(null); }
  }

  if (phase === "summary") {
    var v = summary.verdict;
    return el(FRAG, null,
      el("div", { className: "back-row", onClick: function () { p.go("topic", { topicId: p.topic.id }); } }, "← " + p.topic.title),
      el("div", { className: "summary" },
        el("div", { className: "summary-emoji " + v.accent }, v.emoji),
        el("div", { className: "summary-title" }, v.title),
        el("div", { className: "summary-headline" }, v.headline),
        el("div", { className: "verdict-banner " + v.accent },
          el("div", { className: "verdict-copy" }, v.copy),
          el("div", { className: "next-tier" }, "Next round: ", el("b", null, summary.nextTier), " questions",
            summary.masteredNow ? el("span", { className: "mastered-note" }, " · Topic mastered ✓") : null)
        ),
        el("div", { className: "summary-stats" },
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, correct + "/" + total), el("div", { className: "sum-lab" }, "score")),
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, "+" + summary.xpEarned), el("div", { className: "sum-lab" }, "XP earned")),
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, summary.pct + "%"), el("div", { className: "sum-lab" }, "accuracy"))
        ),
        el("div", { className: "summary-actions" },
          v.key === "rebuild"
            ? el("button", { className: "btn btn-ghost", onClick: function () { p.go("topic", { topicId: p.topic.id }); } }, "Review the idea first")
            : null,
          el("button", { className: "btn btn-primary", onClick: function () { setQuestions(shuffledQuestions(p.topic.quiz[p.tier])); setIdx(0); setPicked(null); setCorrect(0); setSummary(null); setPhase("question"); } }, v.key === "rebuild" ? "Try the Gentle round" : "Go again"),
          el("button", { className: "btn btn-ghost", onClick: function () { p.go("map"); } }, "Back to path")
        )
      )
    );
  }

  var answered = picked !== null;
  var ok = answered && picked === q.answer;
  return el(FRAG, null,
    el("div", { className: "quiz-head" },
      el("span", { className: "back-row inline", onClick: function () { p.go("topic", { topicId: p.topic.id }); } }, "← Quit"),
      el("span", { className: "quiz-tier-chip" }, p.tier + " round")
    ),
    el("div", { className: "quiz-dots" }, qs.map(function (_, i) {
      return el("span", { key: i, className: "quiz-dot" + (i < idx || (i === idx && answered) ? " filled" : i === idx ? " current" : "") });
    })),
    el("div", { className: "quiz-card" },
      el("div", { className: "quiz-q" }, q.q),
      el("div", { className: "quiz-opts" }, q.options.map(function (opt, i) {
        var cls = "quiz-opt";
        if (answered) { if (i === q.answer) cls += " correct"; else if (i === picked) cls += " incorrect"; else cls += " dim"; }
        return el("button", { key: i, className: cls, onClick: function () { pick(i); } },
          el("span", { className: "opt-letter" }, String.fromCharCode(65 + i)), opt);
      })),
      answered ? el("div", { className: "feedback " + (ok ? "ok" : "bad") },
        el("div", { className: "feedback-title" },
          ok ? "Correct — take your XP" : "Not quite — here's the brick you missed",
          ok ? el("span", { key: floatKey, className: "xp-float" }, "+" + XP_CORRECT) : null
        ),
        el("div", { className: "feedback-text" }, q.explain),
        el("button", { className: "btn btn-primary feedback-next", onClick: next }, isLast ? "See your result →" : "Next question →")
      ) : null
    )
  );
}

/* ============================ ASK ANYTHING ============================ */

function BridgeChain(p) {
  return el("div", { className: "bridge" },
    p.chain.map(function (s, i) {
      return el(FRAG, { key: i },
        el("div", { className: "bridge-stop" + (i === p.chain.length - 1 ? " last" : "") },
          el("div", { className: "bridge-label" }, s.label),
          el("div", { className: "bridge-blurb" }, s.blurb)
        ),
        i < p.chain.length - 1 ? el("div", { className: "bridge-connector" }, el("div", { className: "bridge-line" }), el("div", { className: "bridge-arrow" }, "↓")) : null
      );
    })
  );
}

function InlineQuiz(p) {
  var idxS = useState(0), idx = idxS[0], setIdx = idxS[1];
  var pickedS = useState(null), picked = pickedS[0], setPicked = pickedS[1];
  var correctS = useState(0), correct = correctS[0], setCorrect = correctS[1];
  var floatS = useState(0), floatKey = floatS[0], setFloatKey = floatS[1];
  var doneS = useState(false), done = doneS[0], setDone = doneS[1];
  var q = p.quiz[Math.min(idx, p.quiz.length - 1)];
  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    var ok = i === q.answer;
    if (ok) { setCorrect(correct + 1); setFloatKey(floatKey + 1); p.onAnswer(true); }
  }
  function advance() {
    if (idx === p.quiz.length - 1) setDone(true);
    else { setIdx(idx + 1); setPicked(null); }
  }
  if (done) return el("div", { className: "inline-quiz done" }, "🎯 Quick check done — " + correct + "/" + p.quiz.length + " correct. " + (correct === p.quiz.length ? "Sharp." : "Ask me to explain any gap."));
  var answered = picked !== null;
  return el("div", { className: "inline-quiz" },
    el("div", { className: "inline-q" }, q.q),
    q.options.map(function (opt, i) {
      var cls = "inline-opt";
      if (answered) { if (i === q.answer) cls += " correct"; else if (i === picked) cls += " incorrect"; }
      return el("button", { key: i, className: cls, onClick: function () { pick(i); } }, opt);
    }),
    answered ? el(FRAG, null,
      el("div", { className: "inline-explain" }, picked === q.answer ? el("span", { className: "inline-xp" }, "Correct · ", el("span", { key: floatKey, className: "xp-float" }, "+" + XP_CORRECT)) : "Review this: ", q.explain),
      el("button", { className: "btn btn-dark inline-next", onClick: advance }, idx === p.quiz.length - 1 ? "Finish" : "Next →")
    ) : null
  );
}

function AskScreen(p) {
  var inputS = useState(""), input = inputS[0], setInput = inputS[1];
  var scrollRef = useRef(null);
  useEffect(function () {
    var node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.messages.length]);

  var lastAi = null;
  for (var i = p.messages.length - 1; i >= 0; i--) { if (p.messages[i].from === "ai" && p.messages[i].kind !== "typing") { lastAi = p.messages[i]; break; } }
  var showChips = lastAi && lastAi.topicId && (lastAi.kind === "text" || lastAi.kind === "chips" || lastAi.kind === "quiz");

  return el("div", { className: "chat-wrap" },
    el("div", { className: "chat-scroll", ref: scrollRef },
      el("div", { className: "msg-ai intro" },
        el("b", null, "Ask FinBuddy about money."), " Your AI tutor is scoped to finance, banking and financial literacy—UPI, budgets, investing basics, loans, scams and more. Every lesson ends with a quick Test Yourself challenge."
      ),
      p.messages.map(function (m, i) {
        if (m.from === "user") return el("div", { key: i, className: "msg-user" }, m.text);
        if (m.kind === "typing") return el("div", { key: i, className: "msg-ai typing" }, el("span", null), el("span", null), el("span", null));
        if (m.kind === "error") return el("div", { key: i, className: "msg-ai chat-error" }, "⚠ ", m.text);
        if (m.kind === "flag") return el("div", { key: i, className: "msg-ai flag" }, "🌉 ", m.text);
        if (m.kind === "bridge") return el("div", { key: i, className: "msg-ai bridge-wrap" }, el(BridgeChain, { chain: m.chain }));
        if (m.kind === "bridge-blurbs") return null;
        if (m.kind === "suggestions") return el("div", { key: i, className: "suggest-row" }, ASK_SUGGESTIONS.map(function (sug) {
          return el("button", { key: sug, className: "suggest-pill", onClick: function () { p.send(sug); } }, sug);
        }));
        if (m.kind === "quiz") return el("div", { key: i, className: "msg-ai" }, el(InlineQuiz, { quiz: m.quiz, onAnswer: p.onChatAnswer }));
        if (m.kind === "tutor-quiz") return el("div", { key: i, className: "msg-ai tutor-quiz" }, el("div", { className: "tutor-quiz-title" }, "🎯 Test yourself · +" + XP_CORRECT + " XP"), el(InlineQuiz, { quiz: [m.quiz], onAnswer: p.onChatAnswer }));
        return el("div", { key: i, className: "msg-ai" }, (m.text || "").split("\n").map(function (line, li) { return el("p", { key: li, className: "ai-line" }, line); }));
      }),
      showChips ? el("div", { className: "chip-row" },
        ["Ask “Why?”", "Another example", "Make it simpler", "Quiz me"].map(function (c) {
          return el("button", { key: c, className: "chip", onClick: function () { p.send(c); } }, c);
        })
      ) : null
    ),
    el("div", { className: "suggest-row bottom" }, ["Explain EMI simply", "What is an FD?", "How does a credit score work?", "What is SIP?", "How does UPI work?"].map(function (sug) {
      return el("button", { key: sug, className: "suggest-pill", onClick: function () { p.send(sug); } }, sug);
    })),
    el("form", { className: "chat-input-row", onSubmit: function (e) { e.preventDefault(); p.send(input); setInput(""); } },
      el("input", { className: "chat-input", value: input, placeholder: "Ask FinBuddy about money…", onChange: function (e) { setInput(e.target.value); } }),
      el("button", { className: "send-btn", type: "submit" }, "➤")
    )
  );
}

/* ============================ LIFE SIMULATOR ============================ */

function LifeScreen(p) {
  var scenarios = [
    { title: "Your first pay cheque lands", text: "₹24,000 arrives. Rent and essentials are ₹15,000. What gets your attention first?", choices: [
      { label: "Move ₹3,000 to emergency savings", cash: -3000, savings: 3000, wellbeing: 7, score: 0, note: "A buffer buys you choices when life gets noisy." },
      { label: "Upgrade your phone on credit", cash: 0, savings: 0, wellbeing: 2, score: -12, note: "Fun today, but new credit payments shrink next month's freedom." },
      { label: "Spend it all — I earned it", cash: -9000, savings: 0, wellbeing: -7, score: 0, note: "A treat is fine. A plan makes it sustainable." }
    ] },
    { title: "A surprise expense appears", text: "Your laptop repair costs ₹4,000 just before a project deadline.", choices: [
      { label: "Use your emergency savings", cash: 0, savings: -4000, wellbeing: 4, score: 0, note: "That is exactly what an emergency fund is for." },
      { label: "Pay the minimum on a credit card", cash: 0, savings: 0, wellbeing: -2, score: -18, note: "Minimum payments keep high-interest debt alive for longer." },
      { label: "Delay the repair and miss work", cash: 0, savings: 0, wellbeing: -11, score: 0, note: "Sometimes cash protection is productivity protection." }
    ] },
    { title: "Your manager offers a bonus", text: "You receive a ₹6,000 performance bonus. Your goals are still a year away.", choices: [
      { label: "Split it: save ₹4,000, enjoy ₹2,000", cash: -2000, savings: 4000, wellbeing: 5, score: 3, note: "A balanced rule gives both future-you and today-you a win." },
      { label: "Invest it after checking your goal and risk", cash: -6000, savings: 6000, wellbeing: 2, score: 5, note: "A goal-based investment plan is stronger than a hot tip." },
      { label: "Follow a social-media stock tip", cash: -6000, savings: -2000, wellbeing: -5, score: -7, note: "A tip is not a plan. Understand risk before putting money in." }
    ] }
  ];
  var scenario = scenarios[(p.sim.month - 1) % scenarios.length];
  function choose(choice) {
    p.setSim(function (old) {
      return { month: old.month + 1, cash: Math.max(0, old.cash + 24000 + choice.cash - 15000), savings: Math.max(0, old.savings + choice.savings), wellbeing: Math.max(0, Math.min(100, old.wellbeing + choice.wellbeing)), score: Math.max(300, Math.min(900, old.score + choice.score)), job: old.month >= 4 ? "Junior analyst" : old.job, log: [choice.note].concat(old.log).slice(0, 4) };
    });
    p.setCategoryScores(function (scores) { var next = Object.assign({}, scores); next.Saving = Math.min(100, next.Saving + 3); next.Budgeting = Math.min(100, next.Budgeting + 3); return next; });
    p.awardXP(8); p.showToast("Life choice logged · +8 XP");
  }
  return el(FRAG, null,
    el("section", { className: "sim-hero" }, el("span", { className: "sim-kicker" }, "FINANCE LIFE LAB"), el("h1", null, "Practice choices before they cost you."), el("p", null, "A consequence-free money story, one month at a time.")),
    el("div", { className: "sim-stats" },
      el("div", null, el("span", null, "Month"), el("strong", null, p.sim.month)),
      el("div", null, el("span", null, "Cash flow"), el("strong", null, "₹" + p.sim.cash.toLocaleString("en-IN"))),
      el("div", null, el("span", null, "Safety net"), el("strong", null, "₹" + p.sim.savings.toLocaleString("en-IN"))),
      el("div", null, el("span", null, "Credit"), el("strong", null, p.sim.score))
    ),
    el("div", { className: "wellbeing" }, el("span", null, "Life balance"), el("div", { className: "wellbeing-track" }, el("div", { style: { width: p.sim.wellbeing + "%" } })), el("b", null, p.sim.wellbeing + "%")),
    el("section", { className: "scenario-card" }, el("span", { className: "scenario-icon" }, "🗓️"), el("h2", null, scenario.title), el("p", null, scenario.text), el("div", { className: "choice-list" }, scenario.choices.map(function (choice, i) { return el("button", { key: i, onClick: function () { choose(choice); } }, el("b", null, String.fromCharCode(65 + i)), choice.label, el("span", null, "→")); }))),
    el("div", { className: "sim-insight" }, el("span", null, "💡"), el("div", null, el("b", null, "Latest lesson"), el("p", null, p.sim.log[0])))
  );
}

function ScenarioScreen(p) {
  var scenarios = [
    { category: "Budgeting", title: "The remaining ₹15,000", prompt: "You earn ₹35,000/month. Essentials are ₹20,000 and you have ₹10,000 in savings. What would you consider doing with the remaining ₹15,000?", choices: ["Build emergency savings first, then set a realistic goal allocation", "Put all of it into a stock tip", "Spend it before the month ends"], answer: 0, explain: "A larger cash buffer protects you from surprises. Once it is in place, goal-based investing can make sense. A hot tip ignores risk and a spending rush leaves no flexibility." },
    { category: "Credit", title: "The phone upgrade", prompt: "Your phone works, but a new one is available on a high-interest card instalment plan. What is the strongest first question?", choices: ["Can I pay the full cost without cutting essentials or savings?", "How quickly can I use the full card limit?", "Can I pay only the minimum due?"], answer: 0, explain: "Affordability comes before convenience. Minimum dues can make a lifestyle purchase expensive, while maxing a limit reduces room for emergencies." },
    { category: "Scam Awareness", title: "The urgent KYC message", prompt: "You receive an SMS claiming your account will close today unless you update KYC through a shortened link. What do you do?", choices: ["Open the official banking app or call the number on your card", "Tap the link and enter your OTP", "Forward it to every contact"], answer: 0, explain: "Urgency, short links and OTP requests are red flags. Verify using a trusted channel—never the link or number in a suspicious message." }
  ];
  var iS = useState(0), index = iS[0], setIndex = iS[1];
  var pickS = useState(null), picked = pickS[0], setPicked = pickS[1];
  var s = scenarios[index];
  function choose(i) { if (picked !== null) return; setPicked(i); if (i === s.answer) { p.awardXP(15); p.setCategoryScores(function (scores) { var next = Object.assign({}, scores); next[s.category] = Math.min(100, next[s.category] + 8); return next; }); } }
  return el("section", { className: "scenario-page" },
    el("div", { className: "back-row", onClick: function () { p.go("map"); } }, "← Back to learning"),
    el("span", { className: "eyebrow-chip" }, "WHAT WOULD YOU DO? · " + s.category), el("h1", null, s.title), el("p", { className: "scenario-prompt" }, s.prompt),
    el("div", { className: "scenario-options" }, s.choices.map(function (choice, i) { return el("button", { key: choice, className: picked === null ? "" : i === s.answer ? "right" : i === picked ? "wrong" : "muted", onClick: function () { choose(i); } }, el("b", null, String.fromCharCode(65 + i)), choice); })),
    picked !== null ? el("div", { className: "scenario-feedback" }, el("b", null, picked === s.answer ? "Great call · +15 XP" : "Not the safest move yet"), el("p", null, s.explain), el("button", { className: "btn btn-primary", onClick: function () { setPicked(null); setIndex((index + 1) % scenarios.length); } }, "Next scenario →")) : null
  );
}

function ScamScreen(p) {
  var cards = [
    { text: "⚠️ BANK ALERT: Your account is blocked. Click bit.ly/verify-now and share OTP to reactivate in 10 minutes.", scam: true, signs: "Urgency, a shortened link, and an OTP request. Banks do not ask for OTPs or PINs." },
    { text: "Your bank app displays a secure in-app notice: ‘New debit card dispatched. Track delivery in the app.’", scam: false, signs: "This is shown inside the official app and asks for no credentials or payment." },
    { text: "Guaranteed 40% returns! Send ₹5,000 by UPI today to reserve your investment slot.", scam: true, signs: "Guaranteed high returns and pressure to pay immediately are classic investment-scam signals." }
  ];
  var iS = useState(0), index = iS[0], setIndex = iS[1]; var answerS = useState(null), answer = answerS[0], setAnswer = answerS[1]; var card = cards[index];
  function decide(value) { if (answer !== null) return; setAnswer(value); if (value === card.scam) { p.awardXP(10); p.setCategoryScores(function (scores) { var next = Object.assign({}, scores); next["Scam Awareness"] = Math.min(100, next["Scam Awareness"] + 10); return next; }); } }
  return el("section", { className: "scam-page" }, el("span", { className: "eyebrow-chip" }, "SCAM DETECTOR"), el("h1", null, "Real or scam?"), el("p", null, "Read the message like a fraud analyst. Trust the warning signs, not the pressure."),
    el("div", { className: "scam-message" }, card.text), el("div", { className: "scam-actions" }, el("button", { onClick: function () { decide(false); } }, "✓ Real"), el("button", { onClick: function () { decide(true); } }, "⚠ Scam")),
    answer !== null ? el("div", { className: "scam-result " + (answer === card.scam ? "good" : "bad") }, el("b", null, answer === card.scam ? "Correct · +10 XP" : "Look closer next time"), el("p", null, card.signs), el("button", { className: "btn btn-primary", onClick: function () { setAnswer(null); setIndex((index + 1) % cards.length); } }, "Next message →")) : null
  );
}

/* ============================ PROGRESS ============================ */

function ProgressScreen(p) {
  var overall = Math.round(CATEGORY_NAMES.reduce(function (sum, name) { return sum + p.scores[name]; }, 0) / CATEGORY_NAMES.length);
  var weakest = CATEGORY_NAMES.slice().sort(function (a, b) { return p.scores[a] - p.scores[b]; })[0];
  return el(FRAG, null,
    el("div", { className: "dashboard-hero" }, el("span", null, "FINANCIAL LITERACY SCORE"), el("strong", null, overall), el("b", null, "/100"), el("p", null, "Focus next: improve your " + weakest + " skills."), el("button", { onClick: function () { p.go("scenario"); } }, "Practice " + weakest + " →")),
    el("div", { className: "path-title" }, "Your learning dashboard"),
    el("div", { className: "stat-row" },
      el("div", { className: "stat-cell" }, el("div", { className: "stat-num" }, p.xp), el("div", { className: "stat-lab" }, "total XP")),
      el("div", { className: "stat-cell" }, el("div", { className: "stat-num" }, p.streak), el("div", { className: "stat-lab" }, "day streak")),
      el("div", { className: "stat-cell" }, el("div", { className: "stat-num" }, p.masteredCount + "/" + p.totalTopics), el("div", { className: "stat-lab" }, "topics mastered")),
      el("div", { className: "stat-cell" }, el("div", { className: "stat-num" }, p.correct), el("div", { className: "stat-lab" }, "correct answers"))
    ),
    el("div", { className: "dashboard-mini" }, el("div", null, el("b", null, p.quizzesDone), el("span", null, "quizzes completed")), el("div", null, el("b", null, p.simMonth - 1), el("span", null, "simulation choices")), el("div", null, el("b", null, Object.keys(p.badges).length), el("span", null, "badges earned"))),
    el("div", { className: "path-title small" }, "Skills by category"),
    el("div", { className: "category-list" }, CATEGORY_NAMES.map(function (name) { return el("div", { key: name, className: "category-row" }, el("span", null, name), el("div", null, el("i", { style: { width: p.scores[name] + "%" } })), el("b", null, p.scores[name] + "%")); })),
    el("div", { className: "path-title small" }, "Badges"),
    el("div", { className: "badge-grid" }, BADGES.map(function (b) {
      var got = !!p.badges[b.id];
      return el("div", { key: b.id, className: "badge-cell" + (got ? "" : " locked") },
        el("div", { className: "badge-emoji" }, got ? b.emoji : "🔒"),
        el("div", { className: "badge-name" }, b.name),
        el("div", { className: "badge-rule" }, b.rule)
      );
    })),
    el("div", { className: "path-title small" }, "Recent rounds"),
    p.log.length === 0
      ? el("div", { className: "empty-note" }, "No rounds yet. Your quiz history will land here.")
      : el("div", { className: "log-list" }, p.log.slice(0, 8).map(function (l, i) {
          return el("div", { key: i, className: "log-row" },
            el("span", { className: "log-icon" }, "✓"),
            el("span", { className: "log-title" }, l.title),
            el("span", { className: "log-score" }, l.score),
            el("span", { className: "log-xp" }, "+" + l.xp + " XP"),
            el("span", { className: "log-when" }, l.when)
          );
        }))
  );
}

/* ============================ TAB BAR ============================ */

function TabBar(p) {
  var tabs = [{ id: "map", icon: "🗺️", label: "Learn" }, { id: "life", icon: "🌱", label: "Life" }, { id: "scam", icon: "🛡️", label: "Scams" }, { id: "ask", icon: "💬", label: "FinBuddy" }, { id: "progress", icon: "🏅", label: "Progress" }];
  return el("div", { className: "tabbar" }, tabs.map(function (t) {
    return el("button", { key: t.id, className: "tab" + (p.active === t.id ? " active" : ""), onClick: function () { p.go(t.id); } },
      el("span", { className: "tab-icon" }, t.icon), el("span", null, t.label));
  }));
}

createRoot(document.getElementById("root")).render(h(App, null));
