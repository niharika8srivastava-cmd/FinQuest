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
var REWARDS = [
  { id: "small-win", cost: 10, emoji: "☕", name: "Small win", description: "A tiny celebration for showing up." },
  { id: "focus-break", cost: 25, emoji: "🎧", name: "Focus break", description: "A little reset after a good learning streak." },
  { id: "treat-yourself", cost: 50, emoji: "🍪", name: "Treat yourself", description: "A well-earned medium-sized reward." },
  { id: "big-momentum", cost: 100, emoji: "🌟", name: "Big momentum", description: "For turning practice into a habit." },
  { id: "special-milestone", cost: 250, emoji: "🏆", name: "Special milestone", description: "A celebration for serious progress." }
];
function topicCategory(id) { return ({ "what-is-a-bank": "Banking", "savings-vs-current": "Banking", "emi": "Loans", "interest-rate": "Loans", "budgeting": "Budgeting", "emergency-fund": "Saving", "credit-card": "Credit" })[id] || "Banking"; }
var ADVENTURE_WORLDS = [
  { levelId: 1, icon: "🌱", name: "Money Basics", reward: "+25 XP" },
  { levelId: 2, icon: "🏙️", name: "Banking City", reward: "+40 XP" },
  { levelId: 3, icon: "🛍️", name: "Smart Spending", reward: "+55 XP" },
  { levelId: 4, icon: "⛰️", name: "Investment Valley", reward: "+70 XP" },
  { levelId: 5, icon: "🌲", name: "Protection Forest", reward: "+85 XP" },
  { levelId: 6, icon: "🏰", name: "Financial Mastery", reward: "+100 XP" }
];
function loadAssessment() { try { return JSON.parse(localStorage.getItem("finquest-assessment")) || null; } catch (e) { return null; } }
function loadStoredNumber(key, fallback) { try { var value = Number(localStorage.getItem(key)); return Number.isFinite(value) && value >= 0 ? value : fallback; } catch (e) { return fallback; } }
function loadRedemptions() { try { var value = JSON.parse(localStorage.getItem("finquest-redemptions")); return Array.isArray(value) ? value : []; } catch (e) { return []; } }

function el(tag, props) {
  var kids = [];
  for (var i = 2; i < arguments.length; i++) {
    var k = arguments[i];
    if (k === null || k === undefined || k === false || k === true) continue;
    if (Array.isArray(k)) for (var j = 0; j < k.length; j++) { if (k[j] !== null && k[j] !== undefined && k[j] !== false) kids.push(k[j]); }
    else kids.push(k);
  }
  if (!kids.length) return h(tag, props || {});
  return h.apply(null, [tag, props || {}].concat(kids));
}

var TOPIC_LIST = Object.keys(TOPICS).map(function (id) { return TOPICS[id]; });

function levelTopics(levelId) { return TOPIC_LIST.filter(function (t) { return t.level === levelId; }); }
function todayStr() { return new Date().toDateString(); }
function timeNow() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function loadThemePreference() { try { var value = localStorage.getItem("finquest-theme"); return value === "dark" || value === "light" || value === "system" ? value : "system"; } catch (e) { return "system"; } }

/* ============================ APP ============================ */

function App() {
  var savedAssessment = loadAssessment();
  var scr = useState({ name: savedAssessment ? "map" : "assessment" }), screen = scr[0], setScreen = scr[1];
  var xpS = useState(function () { return loadStoredNumber("finquest-xp", 0); }), xp = xpS[0], setXp = xpS[1];
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
  var redemptionS = useState(loadRedemptions), redemptions = redemptionS[0], setRedemptions = redemptionS[1];
  var bootS = useState(false), booted = bootS[0], setBooted = bootS[1];
  var themeS = useState(loadThemePreference), themePreference = themeS[0], setThemePreference = themeS[1];

  var toastTimer = useRef(null);
  function showToast(text) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(function () { setToast(null); }, 2600);
  }

  useEffect(function () {
    document.documentElement.dataset.theme = themePreference;
    try { localStorage.setItem("finquest-theme", themePreference); } catch (e) {}
  }, [themePreference]);

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
  function awardXP(n) { setXp(function (v) { var next = v + n; try { localStorage.setItem("finquest-xp", String(next)); } catch (e) {} return next; }); }
  function redeemReward(reward) {
    if (xp < reward.cost) return;
    var entry = { id: reward.id, name: reward.name, cost: reward.cost, emoji: reward.emoji, when: timeNow() };
    setXp(function (v) { var next = v - reward.cost; try { localStorage.setItem("finquest-xp", String(next)); } catch (e) {} return next; });
    setRedemptions(function (items) { var next = [entry].concat(items); try { localStorage.setItem("finquest-redemptions", JSON.stringify(next)); } catch (e) {} return next; });
    showToast(reward.name + " redeemed · " + reward.cost + " points spent");
  }
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

  function completeRound(topicId, tier, correct, total, details) {
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
    var levelUp = false;
    if (masteredNow) {
      var currentLevel = userLevel();
      var currentLevelTopics = levelTopics(TOPICS[topicId].level);
      levelUp = TOPICS[topicId].level === currentLevel && currentLevelTopics.every(function (topic) { return topic.id === topicId || isMastered(topic.id); });
    }
    if (newMasteredCount === TOPIC_LIST.length) {
      unlockBadge("pathfinder");
      setTimeout(function () { showToast("Level 2 unlocked · Money & Income"); }, 600);
    }
    return { verdict: verdict, xpEarned: xpEarned, masteredNow: masteredNow, levelUp: levelUp, nextTier: adapt.next, pct: pct, initialCorrect: correct, initialMisses: details ? details.initialMisses : 0, finalMastered: details ? details.finalMastered : correct };
  }

  /* ---- navigation ---- */
  function go(name, extra) { setScreen(Object.assign({ name: name }, extra || {})); window.scrollTo(0, 0); }
  function goTab(name) {
    if (name === "ask") { if (!booted) { setBooted(true); } go("ask"); }
    else if (name === "life") go("life");
    else if (name === "scam") go("scam");
    else if (name === "rewards") go("rewards");
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
    body = el(MapScreen, { go: go, xp: xp, streak: streak, userLevel: userLevel(), mastered: mastered, isLevelMastered: isLevelMastered, isLevelUnlocked: isLevelUnlocked, masteredCount: masteredCount, tierFor: tierFor, assessment: assessment, categoryScores: categoryScores, onLocked: function (n) { showToast("Master Level " + (n - 1) + " to unlock this stop"); } });
  } else if (screen.name === "level") {
    var lvl = LEVELS[screen.levelId - 1];
    body = el(LevelScreen, { level: lvl, go: go, isMastered: isMastered, tierFor: tierFor });
  } else if (screen.name === "topic") {
    body = el(TopicScreen, { topic: TOPICS[screen.topicId], tier: tierFor(screen.topicId), mastered: isMastered(screen.topicId), go: go });
  } else if (screen.name === "quiz") {
    body = el(QuizScreen, { topic: TOPICS[screen.topicId], tier: tierFor(screen.topicId), onAnswer: function (ok) { if (ok) awardXP(XP_CORRECT); }, onComplete: function (c, t2, details) { return completeRound(screen.topicId, tierFor(screen.topicId), c, t2, details); }, go: go });
  } else if (screen.name === "ask") {
    activeTab = "ask";
    body = el(AskScreen, { messages: askMessages, send: sendAsk, topicId: askTopicId, awardXP: awardXP, onChatAnswer: function (ok) { if (ok) { awardXP(XP_CORRECT); setCorrectCount(function (v) { return v + 1; }); bumpStreak(); unlockBadge("first-steps"); } } });
  } else if (screen.name === "progress") {
    activeTab = "progress";
    body = el(ProgressScreen, { xp: xp, streak: streak, userLevel: userLevel(), masteredCount: masteredCount, totalTopics: TOPIC_LIST.length, correct: corrS[0], badges: badges, log: log, scores: categoryScores, quizzesDone: quizzesDone, simMonth: sim.month, go: go });
  } else if (screen.name === "rewards") {
    activeTab = "rewards";
    body = el(RewardsScreen, { xp: xp, rewards: REWARDS, redemptions: redemptions, redeem: redeemReward });
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
    el(TopBar, { xp: xp, streak: streak, userLevel: userLevel(), levelTitle: LEVELS[userLevel() - 1].title, theme: themePreference, setTheme: setThemePreference }),
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
        el("span", { className: "xp-pill" }, "⚡ ", p.xp, " XP"),
        el(ThemeControl, { value: p.theme, onChange: p.setTheme })
      )
    ),
    el("div", { className: "level-line" },
      el("div", null,
        el("div", { className: "level-caption" }, "Level " + p.userLevel + " · " + p.levelTitle),
        el("div", { className: "progress-track" }, el("div", { className: "progress-fill", style: { width: pct + "%" } }))
      ),
      el("div", { className: "level-xp" }, into + "/" + XP_PER_LEVEL + " XP")
    )
  );
}

function ThemeControl(p) {
  var options = [{ value: "system", icon: "🖥", label: "System" }, { value: "light", icon: "☀️", label: "Light" }, { value: "dark", icon: "🌙", label: "Dark" }];
  return el("div", { className: "theme-control", role: "group", "aria-label": "Appearance" },
    options.map(function (option) {
      return el("button", { key: option.value, type: "button", className: "theme-option" + (p.value === option.value ? " active" : ""), "aria-label": option.label, "aria-pressed": p.value === option.value, title: option.label, onClick: function () { p.onChange(option.value); } },
        el("span", { "aria-hidden": "true" }, option.icon), el("span", { className: "theme-option-label" }, option.label)
      );
    })
  );
}

  var FINNY_STATES = {
    happy: { label: "Happy", face: "bright", spark: "✦" },
    thinking: { label: "Thinking", face: "focused", spark: "?" },
    confused: { label: "Confused", face: "curious", spark: "…" },
    encouraging: { label: "Encouraging", face: "warm", spark: "↑" },
    celebrating: { label: "Celebrating", face: "bright", spark: "⚡" },
    explaining: { label: "Explaining", face: "focused", spark: "✧" },
    concerned: { label: "Concerned", face: "soft", spark: "!" }
  };

  function FinnyState(p) {
    var state = FINNY_STATES[p.value] || FINNY_STATES.happy;
    return el("span", { className: "finny-state finny-state-" + (p.value || "happy") }, state.label);
  }

  function FinnyMascot(p) {
    var stateName = FINNY_STATES[p.state] ? p.state : "happy";
    var state = FINNY_STATES[stateName];
    return el("div", { className: "finny-mascot finny-mascot-" + (p.size || "medium") + " finny-mascot-state-" + stateName + " finny-face-" + state.face, role: "img", "aria-label": "Finny, " + state.label.toLowerCase() },
      el("span", { className: "finny-wing finny-wing-left", "aria-hidden": "true" }),
      el("span", { className: "finny-wing finny-wing-right", "aria-hidden": "true" }),
      el("span", { className: "finny-horn", "aria-hidden": "true" }, state.spark),
      el("span", { className: "finny-body", "aria-hidden": "true" }),
      el("span", { className: "finny-eye finny-eye-left", "aria-hidden": "true" }),
      el("span", { className: "finny-eye finny-eye-right", "aria-hidden": "true" }),
      el("span", { className: "finny-mouth", "aria-hidden": "true" }),
      el("span", { className: "finny-cheek finny-cheek-left", "aria-hidden": "true" }),
      el("span", { className: "finny-cheek finny-cheek-right", "aria-hidden": "true" })
    );
  }

  function FinnyMessage(p) {
    return el("div", { className: "finny-message" + (p.compact ? " compact" : "") },
      el(FinnyMascot, { state: p.state || "happy", size: p.compact ? "small" : "medium" }),
      el("div", { className: "finny-message-copy" },
        p.title ? el("strong", null, p.title) : null,
        el("p", null, p.message),
        p.state ? el(FinnyState, { value: p.state }) : null
      )
    );
  }

  function FinnyRecommendation(p) {
    var state = p.score <= 45 ? "encouraging" : p.score >= 80 ? "celebrating" : "explaining";
    var message = p.score <= 45
      ? "I noticed you're still building confidence in " + p.category + ". A short quest here will strengthen your path."
      : p.score >= 80
        ? "You're shining in " + p.category + ". Keep that momentum moving to the next world."
        : "Your next smart move is a quick refresh in " + p.category + ". Small steps compound. ";
    return el("section", { className: "finny-recommendation" },
      el(FinnyMascot, { state: state, size: "medium" }),
      el("div", { className: "finny-recommendation-copy" },
        el("div", { className: "finny-recommendation-label" }, "FINNY'S QUEST TIP", el(FinnyState, { value: state })),
        el("strong", null, "Ready for your next quest?"),
        el("p", null, message),
        el("button", { className: "finny-recommendation-action", onClick: p.onAction }, "Open progress →")
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
  var xpIntoLevel = p.xp % XP_PER_LEVEL;
  var xpPercent = Math.min(100, Math.round((xpIntoLevel / XP_PER_LEVEL) * 100));
  var worlds = ADVENTURE_WORLDS.map(function (world, index) {
    var topics = levelTopics(world.levelId);
    var unlocked = p.isLevelUnlocked(world.levelId);
    var done = topics.length > 0 && p.isLevelMastered(world.levelId);
    var current = unlocked && !done;
    var completed = topics.filter(function (topic) { return p.mastered[topic.id]; }).length;
    var state = done ? "done" : current ? "current" : "locked";
    var progress = topics.length ? completed + "/" + topics.length : "—/—";
    return el(FRAG, { key: world.name },
      el("button", {
        className: "adventure-world " + state,
        onClick: function () { unlocked ? p.go("level", { levelId: world.levelId }) : p.onLocked(world.levelId); },
        "aria-label": world.name + ", " + progress,
        "aria-disabled": !unlocked
      },
        el("span", { className: "world-icon" }, done ? "✓" : unlocked ? world.icon : "🔒"),
        el("span", { className: "world-copy" },
          el("span", { className: "world-name" }, world.name),
          el("span", { className: "world-progress" }, progress, " completed"),
          current ? el("span", { className: "world-status" }, "Current quest") : done ? el("span", { className: "world-status" }, "World complete") : el("span", { className: "world-status" }, "Unlock the next world")
        ),
        el("span", { className: "world-reward" }, "🏆 ", world.reward)
      ),
      index < ADVENTURE_WORLDS.length - 1 ? el("div", { className: "adventure-connector " + (done ? "complete" : "") }, el("span", null, "✦")) : null
    );
  });

  return el(FRAG, null,
    el("section", { className: "adventure-hero" },
      el("div", { className: "adventure-hero-copy" },
        el("span", { className: "adventure-kicker" }, "FINQUEST ADVENTURE MAP"),
        el("h1", null, "Your money story starts here."),
        el("p", null, "Choose your next world, master the path, and turn money knowledge into momentum."),
        el("button", { className: "continue-btn", onClick: function () { p.go("level", { levelId: p.userLevel }); } }, p.masteredCount ? "Continue quest →" : "Enter Money Basics →")
      ),
      el("div", { className: "adventure-avatar", "aria-label": "FinQuest player avatar" }, "✦")
    ),
    el("section", { className: "player-hud", "aria-label": "Player progress" },
      el("div", { className: "player-avatar" }, "₹"),
      el("div", { className: "player-level" }, el("span", null, "LEVEL " + p.userLevel), el("strong", null, LEVELS[p.userLevel - 1].title)),
      el("div", { className: "player-xp" }, el("div", { className: "hud-label" }, "XP PROGRESS", el("b", null, xpIntoLevel + " / " + XP_PER_LEVEL + " XP")), el("div", { className: "hud-track" }, el("div", { style: { width: xpPercent + "%" } }))),
      el("div", { className: "hud-stat streak" }, el("span", null, "🔥"), el("strong", null, p.streak + " Day"), el("small", null, "Quest streak")),
      el("div", { className: "hud-stat coins" }, el("span", null, "🪙"), el("strong", null, "—"), el("small", null, "Coins unavailable"))
    ),
    el(FinnyRecommendation, { category: Object.keys(p.categoryScores).sort(function (a, b) { return p.categoryScores[a] - p.categoryScores[b]; })[0], score: Math.min.apply(null, Object.keys(p.categoryScores).map(function (key) { return p.categoryScores[key]; })), onAction: function () { p.go("progress"); } }),
    el("div", { className: "adventure-section-heading" }, el("span", null, "THE REALMS"), el("strong", null, "Choose your next quest")),
    el("div", { className: "adventure-path" }, worlds),
    p.assessment ? el("button", { className: "mission-card", onClick: function () { p.go("progress"); } }, el("span", null, "🎯"), el("span", null, el("b", null, "Today’s mission"), " Improve your lowest skill: " + Object.keys(p.categoryScores).sort(function (a, b) { return p.categoryScores[a] - p.categoryScores[b]; })[0]), el("i", null, "→")) : null,
    el("div", { className: "practice-grid" },
      el("button", { onClick: function () { p.go("scenario"); } }, el("span", null, "💭"), el("b", null, "What would you do?"), el("small", null, "Scenario challenge · +15 XP")),
      el("button", { onClick: function () { p.go("scam"); } }, el("span", null, "🛡️"), el("b", null, "Real or Scam?"), el("small", null, "Spot red flags · +10 XP"))
    ),
    el("button", { className: "ask-entry", onClick: function () { p.go("ask"); } },
      el("span", { className: "ask-entry-icon" }, "💬"),
      el("span", { className: "ask-entry-text" }, el("span", { className: "ask-entry-title" }, "Ask anything"), el("span", { className: "ask-entry-sub" }, "Your AI companion can explain any stop on the map.")),
      el("span", { className: "ask-entry-arrow" }, "→")
    )
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
  var questQuestions = t.quiz[p.tier] || [];
  var difficultyStars = p.tier === "sharp" ? "★★★" : p.tier === "standard" ? "★★☆" : "★☆☆";
  return el(FRAG, null,
    el("div", { className: "back-row", onClick: function () { p.go("level", { levelId: t.level }); } }, "← " + LEVELS[t.level - 1].title),
    el("section", { className: "quest-briefing" },
      el("div", { className: "quest-briefing-top" },
        el("div", { className: "quest-emblem" }, "⚡"),
        el("div", null, el("span", { className: "quest-kicker" }, "QUEST BRIEFING"), el("div", { className: "quest-location" }, LEVELS[t.level - 1].title))
      ),
      el("div", { className: "quest-difficulty" }, "Difficulty ", el("strong", null, difficultyStars)),
      el("h1", { className: "explain-title" }, t.title),
      el("p", { className: "quest-prompt" }, "You need to help a learner understand this money mission."),
      el(FinnyMessage, { state: "encouraging", compact: true, title: "Finny's briefing", message: p.mastered ? "This quest is already in your spellbook. Sharpen it for a stronger streak." : "Take this one step at a time. Understanding beats rushing." }),
      el("div", { className: "quest-rewards" },
        el("span", null, "REWARDS"),
        el("strong", null, "⚡ +" + (XP_CORRECT * questQuestions.length) + " XP"),
        el("strong", { className: "reward-unavailable" }, "🪙 Coins unavailable")
      ),
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
      el("button", { className: "btn btn-primary quest-start", onClick: function () { p.go("quiz", { topicId: t.id }); } }, "Start quest →")
    )
  );
}

/* ============================ QUIZ ============================ */

function QuizScreen(p) {
  function newQuestions() { return shuffledQuestions(p.topic.quiz[p.tier]).map(function (question, questionIndex) { return Object.assign({}, question, { quizId: questionIndex }); }); }
  var qS = useState(newQuestions), qs = qS[0], setQuestions = qS[1];
  var idxS = useState(0), idx = idxS[0], setIdx = idxS[1];
  var pickedS = useState(null), picked = pickedS[0], setPicked = pickedS[1];
  var correctS = useState(0), correct = correctS[0], setCorrect = correctS[1];
  var resultS = useState({}), results = resultS[0], setResults = resultS[1];
  var phaseS = useState("question"), phase = phaseS[0], setPhase = phaseS[1];
  var revisionS = useState([]), revisionQueue = revisionS[0], setRevisionQueue = revisionS[1];
  var revisionIdxS = useState(0), revisionIdx = revisionIdxS[0], setRevisionIdx = revisionIdxS[1];
  var revisionMasteredS = useState(0), revisionMastered = revisionMasteredS[0], setRevisionMastered = revisionMasteredS[1];
  var initialCorrectS = useState(0), initialCorrect = initialCorrectS[0], setInitialCorrect = initialCorrectS[1];
  var initialMissesS = useState(0), initialMisses = initialMissesS[0], setInitialMisses = initialMissesS[1];
  var sumS = useState(null), summary = sumS[0], setSummary = sumS[1];
  var floatS = useState(0), floatKey = floatS[0], bumpFloat = floatS[1];
  var explainS = useState(false), showExplanation = explainS[0], setShowExplanation = explainS[1];

  var q = phase === "revision" ? revisionQueue[revisionIdx] : qs[Math.min(idx, qs.length - 1)];
  var total = qs.length;
  var isLast = idx === total - 1;

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    setShowExplanation(i === q.answer);
    var ok = i === q.answer;
    setResults(function (old) { var next = Object.assign({}, old); next[q.quizId] = ok; return next; });
    if (ok) { setCorrect(correct + 1); if (phase === "question") setInitialCorrect(initialCorrect + 1); p.onAnswer(true); bumpFloat(floatKey + 1); }
  }
  function next() {
    if (phase === "revision") {
      var revisedCorrectly = picked === q.answer;
      if (revisedCorrectly) {
        var remaining = revisionQueue.filter(function (question) { return question.quizId !== q.quizId; });
        setRevisionMastered(revisionMastered + 1);
        if (!remaining.length) {
          setSummary(p.onComplete(initialCorrect, total, { initialMisses: initialMisses, revisionMastered: revisionMastered + 1, finalMastered: initialCorrect + revisionMastered + 1 }));
          setPhase("summary");
        } else {
          setRevisionQueue(remaining); setRevisionIdx(revisionIdx >= remaining.length ? 0 : revisionIdx); setPicked(null); setShowExplanation(false);
        }
      } else {
        setRevisionIdx((revisionIdx + 1) % revisionQueue.length); setPicked(null); setShowExplanation(false);
      }
      return;
    }
    if (isLast) {
      var misses = qs.filter(function (question) { return results[question.quizId] !== true; });
      setInitialMisses(misses.length);
      if (misses.length) { setRevisionQueue(misses); setRevisionIdx(0); setPicked(null); setShowExplanation(false); setPhase("revision"); }
      else { setSummary(p.onComplete(initialCorrect, total, { initialMisses: 0, revisionMastered: 0, finalMastered: initialCorrect })); setPhase("summary"); }
    } else { setIdx(idx + 1); setPicked(null); setShowExplanation(false); }
  }

  if (phase === "summary") {
    var v = summary.verdict;
    return el(FRAG, null,
      el("div", { className: "back-row", onClick: function () { p.go("topic", { topicId: p.topic.id }); } }, "← " + p.topic.title),
      el("div", { className: "summary quest-summary" + (summary.levelUp ? " level-up" : "") },
        el("div", { className: "summary-emoji " + v.accent }, v.emoji),
        el("div", { className: "summary-title" }, v.title),
        el("div", { className: "summary-headline" }, v.headline),
        summary.levelUp ? el(FinnyMessage, { state: "celebrating", title: "Level up! ⚡", message: "You cleared the path and unlocked the next chapter." }) : summary.masteredNow ? el(FinnyMessage, { state: "celebrating", title: "Quest complete!", message: "That idea is now part of your toolkit." }) : null,
        el("div", { className: "verdict-banner " + v.accent },
          el("div", { className: "verdict-copy" }, v.copy),
          el("div", { className: "next-tier" }, summary.initialMisses ? "Revision complete · " : "Next round: ", el("b", null, summary.initialMisses ? summary.finalMastered + "/" + total : summary.nextTier), summary.initialMisses ? " mastered" : " questions",
            summary.masteredNow ? el("span", { className: "mastered-note" }, " · Topic mastered ✓") : null)
        ),
        el("div", { className: "summary-stats" },
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, summary.initialCorrect + "/" + total), el("div", { className: "sum-lab" }, "initial score")),
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, summary.initialCorrect), el("div", { className: "sum-lab" }, "initially correct")),
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, summary.initialMisses), el("div", { className: "sum-lab" }, "required revision")),
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, summary.finalMastered), el("div", { className: "sum-lab" }, "mastered")),
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, "+" + summary.xpEarned), el("div", { className: "sum-lab" }, "XP earned")),
          el("div", { className: "sum-stat" }, el("div", { className: "sum-num" }, summary.pct + "%"), el("div", { className: "sum-lab" }, "accuracy"))
        ),
        el("div", { className: "summary-actions" },
          v.key === "rebuild"
            ? el("button", { className: "btn btn-ghost", onClick: function () { p.go("topic", { topicId: p.topic.id }); } }, "Review the idea first")
            : null,
          el("button", { className: "btn btn-primary", onClick: function () { setQuestions(newQuestions()); setIdx(0); setPicked(null); setCorrect(0); setResults({}); setRevisionQueue([]); setRevisionIdx(0); setRevisionMastered(0); setInitialCorrect(0); setInitialMisses(0); setSummary(null); setPhase("question"); } }, v.key === "rebuild" ? "Try the Gentle round" : "Go again"),
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
      el("span", { className: "quiz-tier-chip" }, phase === "revision" ? "revision round · " + revisionQueue.length + " left" : p.tier + " round")
    ),
    el("div", { className: "quiz-dots" }, (phase === "revision" ? revisionQueue : qs).map(function (_, i) {
      var dotIndex = phase === "revision" ? revisionIdx : idx;
      return el("span", { key: i, className: "quiz-dot" + (i < dotIndex || (i === dotIndex && answered) ? " filled" : i === dotIndex ? " current" : "") });
    })),
    el("div", { className: "quiz-card quest-quiz-card" },
      el("div", { className: "quest-quiz-banner" }, el("span", null, "⚡ QUEST IN PROGRESS"), el("strong", null, p.topic.title)),
      el("div", { className: "quiz-q" }, q.q),
      el("div", { className: "quiz-opts" }, q.options.map(function (opt, i) {
        var cls = "quiz-opt";
        if (answered) { if (i === q.answer) cls += " correct"; else if (i === picked) cls += " incorrect"; else cls += " dim"; }
        return el("button", { key: i, className: cls, onClick: function () { pick(i); } },
          el("span", { className: "opt-letter" }, String.fromCharCode(65 + i)), opt);
      })),
      answered ? el("div", { className: "feedback " + (ok ? "ok answer-correct" : "bad answer-incorrect") },
        el("div", { className: "feedback-title" },
          ok ? "✓ Correct!" : "Almost there! 😅",
          ok ? el("span", { key: floatKey, className: "xp-float" }, "+" + XP_CORRECT) : null
        ),
        el("div", { className: "feedback-text" }, ok || showExplanation ? q.explain : "This choice misses an important part of the idea. Ask Finny to unpack the reasoning, then try the quest again."),
        !ok ? el("div", { className: "quiz-retry-actions" },
          el("button", { className: "btn btn-ghost", onClick: function () { setPicked(null); setShowExplanation(false); } }, "Try again"),
          el("button", { className: "btn btn-ghost", onClick: function () { setShowExplanation(true); } }, "Explain it")
        ) : null,
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
      el(FinnyMessage, { state: "happy", title: "Ask FinBuddy about money.", message: "I can help with finance, banking and financial literacy—UPI, budgets, investing basics, loans, scams and more. Every lesson ends with a quick Test Yourself challenge." }),
      p.messages.map(function (m, i) {
        if (m.from === "user") return el("div", { key: i, className: "msg-user" }, m.text);
        if (m.kind === "typing") return el("div", { key: i, className: "msg-ai finny-chat-message" }, el(FinnyMessage, { state: "thinking", compact: true, message: "Thinking through that..." }));
        if (m.kind === "error") return el("div", { key: i, className: "msg-ai chat-error finny-chat-message" }, el(FinnyMessage, { state: "concerned", compact: true, message: m.text }));
        if (m.kind === "flag") return el("div", { key: i, className: "msg-ai flag" }, "🌉 ", m.text);
        if (m.kind === "bridge") return el("div", { key: i, className: "msg-ai bridge-wrap" }, el(BridgeChain, { chain: m.chain }));
        if (m.kind === "bridge-blurbs") return null;
        if (m.kind === "suggestions") return el("div", { key: i, className: "suggest-row" }, ASK_SUGGESTIONS.map(function (sug) {
          return el("button", { key: sug, className: "suggest-pill", onClick: function () { p.send(sug); } }, sug);
        }));
        if (m.kind === "quiz") return el("div", { key: i, className: "msg-ai" }, el(InlineQuiz, { quiz: m.quiz, onAnswer: p.onChatAnswer }));
        if (m.kind === "tutor-quiz") return el("div", { key: i, className: "msg-ai tutor-quiz" }, el("div", { className: "tutor-quiz-title" }, "🎯 Test yourself · +" + XP_CORRECT + " XP"), el(InlineQuiz, { quiz: [m.quiz], onAnswer: p.onChatAnswer }));
        return el("div", { key: i, className: "msg-ai finny-chat-message" }, el(FinnyMessage, { state: "explaining", compact: true, message: (m.text || "").replace(/\n/g, " ") }));
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
  return el("section", { className: "scam-page" }, el("span", { className: "eyebrow-chip" }, "SCAM AWARENESS"), el("h1", null, "Spot the warning signs"), el("p", null, "Read the message and choose the safest response."),
    el("div", { className: "scam-question" }, el("span", null, "QUESTION · 1"), el("strong", null, "Would you trust this message?")),
    el("div", { className: "scam-message" }, el("span", { className: "scam-message-label" }, "MESSAGE"), el("div", null, card.text)), el("div", { className: "scam-actions" }, el("button", { onClick: function () { decide(false); } }, "✓ Real"), el("button", { onClick: function () { decide(true); } }, "⚠ Scam")),
    answer !== null ? el("div", { className: "scam-result " + (answer === card.scam ? "good" : "bad") }, el("b", null, answer === card.scam ? "Correct · +10 XP" : "Look closer next time"), el("p", null, card.signs), el("button", { className: "btn btn-primary", onClick: function () { setAnswer(null); setIndex((index + 1) % cards.length); } }, "Next message →")) : null
  );
}

/* ============================ PROGRESS ============================ */

function ProgressScreen(p) {
  var overall = Math.round(CATEGORY_NAMES.reduce(function (sum, name) { return sum + p.scores[name]; }, 0) / CATEGORY_NAMES.length);
  var weakest = CATEGORY_NAMES.slice().sort(function (a, b) { return p.scores[a] - p.scores[b]; })[0];
  var trophies = [
    { id: "banking-beginner", icon: "🏦", name: "Banking Beginner", progress: p.quizzesDone ? 100 : 0, requirement: "Complete your first learning quest", status: p.badges["first-steps"] ? "UNLOCKED" : p.quizzesDone ? "IN PROGRESS" : "LOCKED" },
    { id: "smart-saver", icon: "💰", name: "Smart Saver", progress: p.scores.Saving, requirement: "Build consistent saving confidence", status: trophyStatus(p.scores.Saving) },
    { id: "investor", icon: "📈", name: "Investor", progress: p.scores.Investing, requirement: "Reach 80% investing confidence", status: trophyStatus(p.scores.Investing) },
    { id: "credit-champ", icon: "💳", name: "Credit Champ", progress: p.scores.Credit, requirement: "Reach 80% credit confidence", status: trophyStatus(p.scores.Credit) },
    { id: "risk-warrior", icon: "🛡", name: "Risk Warrior", progress: p.scores["Scam Awareness"], requirement: "Reach 80% protection confidence", status: trophyStatus(p.scores["Scam Awareness"]) },
    { id: "streak-master", icon: "🔥", name: "Streak Master", progress: Math.min(100, Math.round((p.streak / 7) * 100)), requirement: "Learn consistently for 7 days", status: p.streak >= 7 ? "UNLOCKED" : p.streak > 0 ? "IN PROGRESS" : "LOCKED" },
    { id: "financial-planner", icon: "🧠", name: "Financial Planner", progress: p.scores.Budgeting, requirement: "Reach 80% budgeting confidence", status: trophyStatus(p.scores.Budgeting) },
    { id: "wealth-master", icon: "👑", name: "Wealth Master", progress: Math.round((p.masteredCount / p.totalTopics) * 100), requirement: "Master every available topic", status: p.masteredCount === p.totalTopics ? "MASTERED" : p.masteredCount ? "IN PROGRESS" : "LOCKED" }
  ];
  function trophyStatus(progress) { return progress >= 100 ? "MASTERED" : progress >= 80 ? "UNLOCKED" : progress > 0 ? "IN PROGRESS" : "LOCKED"; }
  function trophyClass(status) { return status.toLowerCase().replace(" ", "-"); }
  function trophyReward(trophy) { return trophy.status === "MASTERED" || trophy.status === "UNLOCKED" ? "+" + XP_SHARP_BONUS + " XP" : "XP on mastery"; }
  return el(FRAG, null,
    el("section", { className: "trophy-profile" },
      el("div", { className: "trophy-avatar" }, el(FinnyMascot, { state: overall >= 80 ? "celebrating" : "encouraging", size: "medium" })),
      el("div", { className: "trophy-profile-copy" }, el("span", { className: "trophy-kicker" }, "FINQUEST ADVENTURER"), el("h1", null, "The Trophy Room"), el("p", null, "Your financial character sheet, built from the quests you actually complete.")),
      el("div", { className: "trophy-level" }, el("span", null, "LEVEL"), el("strong", null, p.userLevel), el("small", null, "current hero level"))
    ),
    el("div", { className: "trophy-stats" },
      el("div", null, el("strong", null, p.xp), el("span", null, "total XP")),
      el("div", null, el("strong", null, p.streak), el("span", null, "day streak")),
      el("div", null, el("strong", null, p.masteredCount + "/" + p.totalTopics), el("span", null, "topics mastered")),
      el("div", null, el("strong", null, overall + "%"), el("span", null, "literacy score"))
    ),
    el("div", { className: "trophy-room-heading" }, el("span", null, "COLLECTION"), el("strong", null, "Badges & milestones")),
    el("div", { className: "trophy-grid" }, trophies.map(function (trophy) {
      return el("article", { key: trophy.id, className: "trophy-card trophy-" + trophyClass(trophy.status) },
        el("div", { className: "trophy-card-top" }, el("div", { className: "trophy-icon" }, trophy.status === "LOCKED" ? "🔒" : trophy.icon), el("span", { className: "trophy-status" }, trophy.status)),
        el("h2", null, trophy.name),
        el("div", { className: "trophy-progress-label" }, el("span", null, trophy.progress + "%"), el("span", null, trophy.status === "MASTERED" ? "Mastered" : "Progress")),
        el("div", { className: "trophy-progress" }, el("i", { style: { width: trophy.progress + "%" } })),
        el("p", { className: "trophy-requirement" }, el("b", null, "Unlock: "), trophy.requirement),
        el("div", { className: "trophy-reward" }, el("span", null, "Reward"), el("strong", null, trophyReward(trophy)), el("small", null, "🪙 Coins unavailable"))
      );
    })),
    el("div", { className: "trophy-room-heading compact" }, el("span", null, "SKILL TREE"), el("strong", null, "Where to grow next")),
    el("div", { className: "category-list" }, CATEGORY_NAMES.map(function (name) { return el("div", { key: name, className: "category-row" }, el("span", null, name), el("div", null, el("i", { style: { width: p.scores[name] + "%" } })), el("b", null, p.scores[name] + "%")); })),
    el("button", { className: "trophy-mission", onClick: function () { p.go("scenario"); } }, el("span", null, "🎯"), el("span", null, el("b", null, "Next training mission"), " Practice your " + weakest + " skills."), el("i", null, "→")),
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

function RewardsScreen(p) {
  return el("section", { className: "rewards-page" },
    el("div", { className: "rewards-hero" },
      el("span", null, "POINTS WALLET"),
      el("strong", null, p.xp),
      el("b", null, "points available"),
      el("p", null, "Keep learning, earn small wins, and spend them when something feels worth celebrating.")
    ),
    el("div", { className: "path-title" }, "Rewards"),
    el("div", { className: "reward-grid" }, p.rewards.map(function (reward) {
      var canRedeem = p.xp >= reward.cost;
      return el("article", { key: reward.id, className: "reward-card" },
        el("div", { className: "reward-icon" }, reward.emoji),
        el("div", { className: "reward-copy" }, el("h2", null, reward.name), el("p", null, reward.description)),
        el("div", { className: "reward-footer" },
          el("strong", null, reward.cost + " points"),
          el("button", { className: "btn btn-primary reward-redeem", disabled: !canRedeem, onClick: function () { p.redeem(reward); } }, canRedeem ? "Redeem" : "Need " + (reward.cost - p.xp) + " more")
        )
      );
    })),
    el("div", { className: "path-title small" }, "Redemption history"),
    p.redemptions.length === 0
      ? el("div", { className: "empty-note" }, "No rewards redeemed yet. Your first small win is close.")
      : el("div", { className: "redemption-list" }, p.redemptions.map(function (item, index) {
          return el("div", { key: item.id + "-" + index, className: "redemption-row" },
            el("span", { className: "redemption-icon" }, item.emoji),
            el("span", { className: "redemption-name" }, item.name),
            el("span", { className: "redemption-cost" }, "−" + item.cost),
            el("span", { className: "redemption-when" }, item.when)
          );
        }))
  );
}

/* ============================ TAB BAR ============================ */

function TabBar(p) {
  var tabs = [{ id: "map", icon: "🗺️", label: "Learn" }, { id: "life", icon: "🌱", label: "Life" }, { id: "scam", icon: "🛡️", label: "Scams" }, { id: "ask", icon: "💬", label: "FinBuddy" }, { id: "rewards", icon: "🎁", label: "Rewards" }, { id: "progress", icon: "🏅", label: "Progress" }];
  return el("div", { className: "tabbar" }, tabs.map(function (t) {
    return el("button", { key: t.id, className: "tab" + (p.active === t.id ? " active" : ""), onClick: function () { p.go(t.id); } },
      el("span", { className: "tab-icon" }, t.icon), el("span", null, t.label));
  }));
}

createRoot(document.getElementById("root")).render(h(App, null));
