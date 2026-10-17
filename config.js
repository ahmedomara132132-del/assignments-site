// ============================================================
// الإعدادات: غيّر اللينك ده بس بعد ما تعمل الـ webhook في n8n.
// كل الصفحات (الطالب والدكتور) بتبعت لنفس اللينك، والـ n8n
// بيفرّق بينهم من حقل "action" (شوف API.md).
// ============================================================
window.APP_CONFIG = {
  API_URL: "https://omaran8n.omara.click/webhook/8bf3d7e1-84ff-4b8f-b09b-846a01d7de44",
  TIMEOUT_MS: 20000,
  MIN_ANSWER: 20,
  MAX_ANSWER: 5000,

  // الأسيجنمنت الافتراضي: بيظهر لو الـ API لسه مش متظبط
  DEFAULT_ASSIGNMENT: {
    id: "leda-and-the-swan-define",
    title: "Leda and the Swan",
    question: "Define the poem “Leda and the Swan”.",
    deadline: null
  }
};
