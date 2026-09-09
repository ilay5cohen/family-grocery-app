export interface OnboardingSlide {
  icon: string
  title: string
  description: string
  glow: string
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    icon: '👋',
    title: 'ברוכים הבאים ל״הסל שלנו״',
    description:
      'אפליקציית קניות משפחתית אחת שמרכזת הכל במקום — מי צריך מה, מי כבר קנה, ובכמה. בואו נעבור בקצרה על מה שהיא יודעת לעשות.',
    glow: 'from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_50px_-8px_rgba(217,70,239,0.7)]',
  },
  {
    icon: '🔄',
    title: 'רשימה משותפת, בזמן אמת',
    description:
      'כל בני המשפחה רואים את אותה רשימה בדיוק. כשמישהו מסמן שקנה משהו, זה נעלם מהרשימה של כולם באותו רגע — בלי לתאם בטלפון ובלי קניות כפולות.',
    glow: 'from-cyan-400 via-sky-500 to-blue-500 shadow-[0_0_50px_-8px_rgba(34,211,238,0.7)]',
  },
  {
    icon: '✨',
    title: 'הוספה חכמה בשפה חופשית',
    description:
      'פשוט מקלידים בעברית רגילה, למשל: "צריך 3 קופסאות טונה וגם חלב וביצים" — וה-AI מזהה לבד את הפריטים, הכמויות, היחידות והמחיר המשוער של כל אחד.',
    glow: 'from-fuchsia-400 via-pink-500 to-rose-500 shadow-[0_0_50px_-8px_rgba(244,114,182,0.7)]',
  },
  {
    icon: '💪',
    title: 'תגי תזונה ומעקב הוצאות',
    description:
      'פריטים עתירי חלבון מתויגים אוטומטית עם 💪, כדי שיהיה קל לעקוב אחרי תזונה בריאה. ולצד זה — מחיר משוער לכל פריט, וסיכום חי של סה״כ העגלה, כמה כבר הוצא וכמה נשאר.',
    glow: 'from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_50px_-8px_rgba(52,211,153,0.7)]',
  },
  {
    icon: '🙋',
    title: 'שיוך משימות לבני המשפחה',
    description:
      'כל פריט ברשימה אפשר לשייך לבן או בת משפחה אחראים על הקנייה — כך כל אחד יודע בדיוק מה עליו להביא, ורואים מי קנה מה ומתי.',
    glow: 'from-amber-400 via-orange-500 to-red-500 shadow-[0_0_50px_-8px_rgba(251,191,36,0.7)]',
  },
]
