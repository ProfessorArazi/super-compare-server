const shufersalProductsNames = [
  "המבורגר מזרחי מבקר משובח", //
  "סטייקבורגר", //
  "קבב מזרחי מבקר מתובל", //
  "שניצל אמיתי פריך", //
  "המבורגר מזרחי", //
  "המבורגר זהב מבקר טחון", //
  "שניצל דק מן הצומח", //
  "נקניקיות עוף", //
  "קוטג' תנובה 5% שומן", //
  "קוטג' תנובה 3% שומן", //
  "חלב בקרטון 3% שומן", //
  "חלב 3% בקרטון מהדרין", //
  "קוטג' 5%", //
  "שוקו יטבתה בבקבוק", //
  "חלב יטבתה מועשר1% בקבוק", //
  "גבינה לבנה רכה 5% שומן", //
  "גבינת סימפוניה 5%זיתים", //
  "גבינה גוש חלב פרוס 28%", //
  "גבינת גלבוע 22%", //
  "מילקי בטעם שוקולד", //
  "אקטימל לבן מארז", //
  "דנונה בר פקאן", //
  "גבינה בולגרית פיראוס5%", //
  "שמנת לבישול 15%עם פקק", //
  "פתיתים אפויים אורז", //
  "פתיתים אפויים טבעות", //
  "פתיתים אפויים קוסקוס", //
  "נודלס אטריות מסולסלות", //
  "אורז בסמטי קלאסי בשקית", //
  "אטריות בינוניות", //
  "לזניה ברילה", //
  "קוסקוס דק סוגת", //
  "קוואקר שיבולת שועל בפחית", //
  "פסטה ספגטי מס' 8", //
  "קורנפלקס של אלופים", //
  "קוקומן חום לבן", //
  "סלים דליס לילדים שוק.חלב", //
  "דגני בוקר פיטנס", //
  "כריות נוגט", //
  "גרנולה שוקולד פיטנס", //
  "תפוח עץ יונתן", //
  "תפוח עץ סמיט", //
  "בננה מובחרת", //
  "מלון מובחר", //
  "קיווי", //
  "תפוז גדול", //
  "קלמנטינה", //
  "עגבניה", //
  "מלפפון", //
  "פלפל אדום", //
  "פומלית", //
  "תפוח אדמה אורגני", //
  "בטטה", //
  "בצל יבש", //
  "לימון", //
  "כרוב לבן", //
  "אנטריקוט דק דק אל גאוצו", //
  "סטייקבורגר בלאק אנגוס", //
  "בקר טחון לקציצות וקבב", //
  "זוג סטייק אנטריקוט מקומי", //
  "נקניקיות וינר", //
  "קבנוס", //
  "טונה בשמן סטארקיסט", //
  "סלמון מעושן מצונן", //
];

const megaProductsNames = [
  "המבורגר", //
  "סטיק בורגר", //
  "קבב מזרחי 8 יח'", //
  "שניצל אמיתי פריך חזה עוף בציפוי פירורי לחם פריכים", //
  "המבורגר מזרחי 4 יחידות", //
  "ה", //
  "שניצל דק צמחוני בטעם ביתי", //
  "נקניקיות עוף", //
  "קוטג' 5%", //
  "קוטג' 3%", //
  "חלב 3% קרטון - בפיקוח", //
  "חלב 3% קרטון מהדרין", //
  "ק", //
  "משקה חלב שוקווווו", //
  "חלב מועשר 1% בקבוק", //
  "גבינה לבנה 5% - בפיקוח", //
  "סימפוניה גבינה במרקם שמנת 5%", //
  "גוש חלב פרוסות גבינה חצי קשה 28%",
  "גבינת גלבוע 22%",
  "מעדן מילקי בטעם שוקולד",
  "אקטימל משקה יוגורט פרוביוטי במתיקות מעודנת 1.6%",
  "יוגורט עם שבבי פקאן מסוכרים מצופים שוקולד 4.7%",
  "גבינה בולגרית 5%",
  "ש", //
  "פתיתים אפויים אורז",
  "פתיתים אפויים טבעות",
  "פתיתים אפויים קוסקוס",
  "נודלס אטריות מסולסלות",
  "אורז בסמטי קלאסי",
  "אטריות בינוניות",
  "לזניה",
  "קוסקוס בינוני",
  "שיבולת שועל להכנה מהירה",
  "פסטה ספגטי 8",
  "קורנפלקס של אלופים",
  "קוקומן חום לבן דגנים פריכים בטעם שוקו ווניל",
  "חטיף דגנים מלאים מצופה שוקולד חלב",
  "דגני בוקר מדגנים מלאים ואורז שוקולד",
  "כריות נוגט",
  "גרנולה שקדים ודבש",
  "תפוח עץ יונתן",
  "תפוח עץ גרנד סמיט",
  "בננה מובחרת",
  "מלון",
  "קיווי",
  "תפוזים",
  "קלמנטינות",
  "עגבניות",
  "מלפפון",
  "פלפל אדום",
  "פומלית",
  "תפוח אדמה לבן תפזורת",
  "בטטה",
  "בצל יבש",
  "לימון",
  "כרוב לבן",
  "אנטריקוט דק דק", //
  "מינוט סטייק 300 גרם", //
  "בשר בקר טחון", //
  "סטייק אנטריקוט טרי", //
  "נ", //
  "נקניק קבנוס", //
  "נתחי טונה בהירה בשמן", //
  "סלמון מעושן", //
];

const bitanProductsNames = [
  "המבורגר מזרחי",
  "סטיק בורגר",
  "קבב מזרחי 8 יח'",
  "שניצל אמיתי פריך",
  "המבורגר מזרחי 5 יחידות",
  "המבורגר זהב 5 יחידות",
  "שניצל דק צמחוני בטעם ביתי",
  "נקניקיות עוף",
  "קוטג' תנובה 5% שומן",
  "קוטג' תנובה 3% שומן",
  "חלב בקרטון 3% שומן",
  "חלב 3% בקרטון מהדרין",
  "קוטג' 5%",
  "משקה חלב שוקו",
  "חלב מועשר 1% בקבוק",
  "גבינה לבנה 5% - בפיקוח",
  "סימפוניה גבינה במרקם שמנת 5%",
  "גוש חלב פרוסות גבינה חצי קשה 28%",
  "גלבוע גבינה צהובה פרוסה 22%",
  "מעדן מילקי בטעם שוקולד",
  "אקטימל משקה יוגורט פרוביוטי במתיקות מעודנת 1.6%",
  "יוגורט עם שבבי פקאן מסוכרים מצופים שוקולד",
  "גבינה בולגרית 5%",
  "שמנת לבישול 15%",
  "פתיתים אפויים אורז",
  "פתיתים אפויים טבעות",
  "פתיתים אפויים קוסקוס",
  "נודלס אטריות מסולסלות",
  "אורז בסמטי קלאסי",
  "אטריות בינוניות",
  "לזניה",
  "קוסקוס בינוני",
  "שיבולת שועל להכנה מהירה",
  "פסטה ספגטי 8",
  "קורנפלקס של אלופים",
  "קוקומן חום לבן דגנים פריכים בטעם שוקו ווניל",
  "חטיף דגנים מלאים מצופה שוקולד חלב",
  "דגני בוקר שוקולד",
  "כריות נוגט",
  "גרנולה שוקולד",
  "תפוח עץ יונתן",
  "תפוח עץ גרנד סמית",
  "בננה מובחרת",
  "מלון",
  "קיווי",
  "תפוזים",
  "קלמנטינה",
  "עגבניות",
  "מלפפונים",
  "פלפל אדום",
  "פומלית",
  "תפוח אדמה לבן תפזורת",
  "בטטה מתוקה",
  "בצל יבש",
  "לימון מובחר",
  "כרוב לבן",
  "אנטריקוט דק דק",
  "סטייק בורגר זהב",
  "טחון בקר טרי יבוא",
  "סטיק עם עצם חלק טרי",
  "נקניקיות וינר",
  "קבנוס מעודן",
  "נתחי טונה בהירה בשמן",
  "סלמון מעושן פרוס",
];

module.exports = {
  shufersalProductsNames,
  megaProductsNames,
  bitanProductsNames,
};