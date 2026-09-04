import { useEffect, useState } from "react";
import { db } from "./db";
import "./App.css";

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    db.open()
      .then(() => setDbReady(true))
      .catch((err) => console.error("failed to open local database", err));
  }, []);

  return (
    <main dir="rtl">
      <h1>אפליקציית ניטור שטח</h1>
      <p>שלד הפרויקט — ניטור עדשת דלק, מערכות SVE / Bio-venting ודיגום מי תהום.</p>
      <p>
        מסד נתונים מקומי (IndexedDB):{" "}
        <strong>{dbReady ? "מוכן" : "בטעינה..."}</strong>
      </p>
      <p>
        טפסי השטח והמסכים הניהוליים עדיין לא מומשו — ראו{" "}
        <code>docs/roadmap.md</code> בשורש המאגר לסדר הפיתוח המתוכנן.
      </p>
    </main>
  );
}

export default App;
