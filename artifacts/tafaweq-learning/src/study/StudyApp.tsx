import { Redirect, Route, Switch } from 'wouter';
import { MathProvider } from './math-context';
import { MathHub } from './MathHub';
import { MathLessonPage } from './MathLessonPage';
import { MathProgressPage } from './MathProgressPage';
import { MathQuiz } from './MathQuiz';
import { MathUnitPage } from './MathUnitPage';

/**
 * تطبيق قسم الرياضيات: يعمل مستقلًا عن تسجيل الدخول وعن خدمة الـ API.
 * المسار /math يخص الصف العاشر (المسار الأصلي)، و/math/grade/:grade لأي صف آخر.
 */
export function StudyApp() {
  return (
    <Switch>
      {/* الصف العاشر — المسار الأصلي */}
      <Route path="/math">{() => <MathProvider grade={10}><MathHub /></MathProvider>}</Route>
      <Route path="/math/progress">{() => <MathProvider grade={10}><MathProgressPage /></MathProvider>}</Route>
      <Route path="/math/unit/:unitId">
        {(params) => <MathProvider grade={10}><MathUnitPage unitId={params.unitId} /></MathProvider>}
      </Route>
      <Route path="/math/lesson/:lessonId/quiz">
        {(params) => <MathProvider grade={10}><MathQuiz lessonId={params.lessonId} /></MathProvider>}
      </Route>
      <Route path="/math/lesson/:lessonId">
        {(params) => <MathProvider grade={10}><MathLessonPage lessonId={params.lessonId} /></MathProvider>}
      </Route>

      {/* أي صف آخر (مثل الصف الأول) */}
      <Route path="/math/grade/:grade">{() => <MathHub />}</Route>
      <Route path="/math/grade/:grade/progress">{() => <MathProgressPage />}</Route>
      <Route path="/math/grade/:grade/unit/:unitId">
        {(params) => <MathUnitPage unitId={params.unitId} />}
      </Route>
      <Route path="/math/grade/:grade/lesson/:lessonId/quiz">
        {(params) => <MathQuiz lessonId={params.lessonId} />}
      </Route>
      <Route path="/math/grade/:grade/lesson/:lessonId">
        {(params) => <MathLessonPage lessonId={params.lessonId} />}
      </Route>

      <Route path="/">
        <Redirect to="/math" />
      </Route>
      <Route>
        <Redirect to="/math" />
      </Route>
    </Switch>
  );
}
