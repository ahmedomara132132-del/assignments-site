// دوال مشتركة: الاتصال بالـ n8n + وضع تجريبي (?demo=1) من غير سيرفر.
(function () {
  if (typeof window === "undefined") return;

  var CFG = window.APP_CONFIG;
  var params = new URLSearchParams(location.search);
  var demo = params.has("demo");
  var ready = !!CFG.API_URL && CFG.API_URL.indexOf("PUT_YOUR") !== 0;

  // ---------- بناء عناصر الصفحة بأمان (من غير innerHTML) ----------
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) {
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
    } catch (e) { return String(iso); }
  }

  // ---------- مخزن تجريبي (للتجربة بس) ----------
  var memStore = null;
  function loadStore() {
    if (memStore) return memStore;
    try {
      var raw = sessionStorage.getItem("demoStore");
      if (raw) { memStore = JSON.parse(raw); return memStore; }
    } catch (e) { /* ok */ }
    memStore = {
      assignments: [
        CFG.DEFAULT_ASSIGNMENT,
        { id: "demo-two", title: "Sonnet analysis", question: "اشرح باختصار بنية السونيت الإيطالي.", deadline: null }
      ],
      submissions: {
        "leda-and-the-swan-define": [
          { fullName: "طالب تجريبي ثالث", submittedAt: new Date().toISOString(), answer: "Leda and the Swan is a sonnet by W. B. Yeats about Zeus and Leda." }
        ]
      }
    };
    return memStore;
  }
  function saveStore() {
    try { sessionStorage.setItem("demoStore", JSON.stringify(memStore)); } catch (e) { /* ok */ }
  }

  function demoApi(body) {
    var s = loadStore();
    switch (body.action) {
      case "submit":
        (s.submissions[body.assignmentId] = s.submissions[body.assignmentId] || []).push({
          fullName: body.fullName, submittedAt: body.submittedAt, answer: body.answer
        });
        saveStore();
        return { ok: true };
      case "listAssignments":
        return { ok: true, assignments: s.assignments };
      case "getAssignment":
        var a = s.assignments.filter(function (x) { return x.id === body.id; })[0];
        return a ? { ok: true, assignment: a } : { ok: false, message: "الأسيجنمنت ده مش موجود." };
      case "adminCheck":
        return body.adminCode ? { ok: true } : { ok: false, error: "unauthorized", message: "الكود غير صحيح." };
      case "createAssignment":
        s.assignments.unshift(body.assignment);
        saveStore();
        return { ok: true };
      case "listSubmissions":
        return { ok: true, submissions: s.submissions[body.assignmentId] || [] };
      case "submitDoctorAnswer":
        // للتجربة: أي رقم سري مقبول ما عدا "wrong" (علشان تجرب رسالة الخطأ)
        if (!body.adminCode || body.adminCode === "wrong") {
          return { ok: false, error: "unauthorized", message: "الرقم السري غير صحيح." };
        }
        s.doctorAnswers = s.doctorAnswers || {};
        s.doctorAnswers[body.assignmentId] = { answer: body.answer, submittedAt: body.submittedAt };
        saveStore();
        return { ok: true };
      default:
        return { ok: false, message: "action غير معروف" };
    }
  }

  // ---------- الاتصال الفعلي ----------
  async function call(body) {
    if (demo) {
      await new Promise(function (r) { setTimeout(r, 400); });
      return demoApi(body);
    }
    if (!ready) throw new Error("NOT_CONFIGURED");

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, CFG.TIMEOUT_MS);
    try {
      var res = await fetch(CFG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      var data = null;
      try { data = await res.json(); } catch (e) { /* الرد مش JSON */ }
      if (!res.ok) throw new Error("HTTP_" + res.status);
      return data || { ok: true };
    } finally {
      clearTimeout(timer);
    }
  }

  window.Api = { call: call, demo: demo, enabled: demo || ready };
  window.h = h;
  window.fmtDate = fmtDate;
})();
