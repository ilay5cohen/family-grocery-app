# הסל שלנו 🛒 — רשימת קניות משפחתית

אפליקציית רשימת קניות משפחתית משותפת, בעברית מלאה ו-RTL, בעיצוב כהה/ניאון עתידני. נבנתה עם React + Vite + TypeScript + Tailwind CSS v4.

## הרצה מקומית

```bash
npm install
npm run dev
```

## בנייה לפרודקשן

```bash
npm run build
```

הפלט נכתב ל-`dist/`.

## פריסה חינמית ל-Netlify

הראוטינג מוגדר כבר בקובץ [`netlify.toml`](netlify.toml) וגם ב-[`public/_redirects`](public/_redirects), כך שרענון הדף (F5) לא יגרום לשגיאת 404 — כל נתיב מנותב חזרה ל-`index.html`.

### אפשרות א׳ — גרירה ידנית (הכי מהיר, בלי GitHub)

1. בטרמינל, בתוך תיקיית הפרויקט: `npm run build` — זה יוצר תיקיית `dist`.
2. נכנסים ל-[app.netlify.com/drop](https://app.netlify.com/drop).
3. גוררים את תיקיית `dist` (לא את כל הפרויקט!) לתוך הדפדפן.
4. תוך שניות האתר עולה עם כתובת זמנית — אפשר לשנות שם באתר דרך Site settings.

### אפשרות ב׳ — חיבור ל-GitHub (מומלץ לעדכונים שוטפים)

1. דוחפים את התיקייה הזו ל-repo ב-GitHub.
2. ב-Netlify: **Add new site → Import an existing project**, ומחברים את ה-repo.
3. Build command: `npm run build`, Publish directory: `dist` (Netlify יזהה זאת אוטומטית מ-`netlify.toml`).
4. לוחצים Deploy — מכאן כל `git push` יפרוס גרסה חדשה אוטומטית.

שתי האפשרויות חינמיות לחלוטין בתוכנית Netlify החינמית.

## איך הסנכרון בזמן אמת עובד (ובחינם)

הדמו הנוכחי הוא **frontend-only** ומדמה סנכרון בזמן אמת בעזרת `BroadcastChannel` + `localStorage` (ראו [`src/hooks/useSharedState.ts`](src/hooks/useSharedState.ts)) — כל טאב/חלון פתוח באותו דפדפן מסתנכרן מיידית. זה מושלם להדגמה חיה (פתחו כמה טאבים ותראו עדכון מיידי ביניהם), אבל **לא מסנכרן בין מכשירים שונים**.

כדי לקבל סנכרון אמיתי בין בני משפחה במכשירים שונים — בחינם לחלוטין — יש לחבר Backend-as-a-Service בשכבה החינמית:

- **Supabase** (מומלץ): טבלת `items` + `members`, עם [Supabase Realtime](https://supabase.com/docs/guides/realtime) על שינויים ב-Postgres. השכבה החינמית כוללת מסד נתונים, Auth ו-Realtime בחינם.
- **Firebase Spark Plan**: Firestore + `onSnapshot` לסנכרון בזמן אמת, גם בחינם.

בכל שני המקרים, כל מה שצריך הוא להחליף את המימוש הפנימי של `useSharedState` (השארת אותה חתימת API: `[state, setState]`) בקריאות ל-Supabase/Firebase — שום קומפוננטה אחרת לא צריכה להשתנות.

## תכונות עיקריות

- **סנכרון בזמן אמת** בין טאבים/משתמשים (ר' לעיל).
- **זיהוי חכם (AI Parsing)** — הקלידו משפט חופשי כמו *"צריך 3 קופסאות טונה וגם חלבונים ועגבניות"* והמערכת מפרקת אותו לפריטים נפרדים עם כמות, יחידה, קטגוריה ומחיר משוער (`src/utils/aiParse.ts`).
- **תגי תזונה** — פריטים עתירי חלבון מסומנים אוטומטית 💪 (`src/data/itemKnowledge.ts`).
- **שיוך לבן/בת משפחה** — כל פריט אפשר לשייך לאחראי/ת לקנייה.
- **הערכת עלות** — מחיר משוער לכל פריט, וסכומי "סה״כ בעגלה", "כבר הוצא" ו"נותר לקנייה" מתעדכנים בזמן אמת.
- **נתוני דמו** חיים: 4 בני משפחה ו-10 פריטים לדוגמה, חלקם כבר "נקנו".

## מבנה הקוד

```
src/
  types.ts                 טיפוסי הדאטה המרכזיים
  data/
    categories.ts           מטא-דאטה לקטגוריות (צבע/אייקון)
    itemKnowledge.ts         "מאגר ידע" למחירים/קטגוריה/חלבון לפי שם פריט
    seed.ts                  נתוני דמו התחלתיים
  hooks/
    useSharedState.ts        הבסיס לסנכרון בזמן אמת (localStorage + BroadcastChannel)
    useGroceryStore.ts        כל הלוגיקה העסקית (הוספה/סימון/מחיקה/שיוך)
    useCurrentMember.ts       "מי אני" בטאב הנוכחי (להדגמת ריבוי משתמשים)
  utils/
    aiParse.ts                מנוע הזיהוי החכם
    format.ts                 עיצוב מטבע וזמן יחסי
  components/                 כל רכיבי ה-UI
```
