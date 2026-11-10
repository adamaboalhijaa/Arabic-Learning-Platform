import { Redirect, Route, Switch } from 'wouter';
import { MathHub } from './MathHub';
import { MathLessonPage } from './MathLessonPage';
import { MathProgressPage } from './MathProgressPage';
import { MathQuiz } from './MathQuiz';
import { MathUnitPage } from './MathUnitPage';

/** تطبيق قسم الرياضيات: يعمل مستقلًا عن تسجيل الدخول وعن خدمة الـ API. */
export function StudyApp() {
  return (
    <Switch>
      <Route path="/math" component={MathHub} />
      <Route path="/math/progress" component={MathProgressPage} />
      <Route path="/math/unit/:unitId" component={MathUnitPage} />
      <Route path="/math/lesson/:lessonId" component={MathLessonPage} />
      <Route path="/math/lesson/:lessonId/quiz" component={MathQuiz} />
      <Route path="/">
        <Redirect to="/math" />
      </Route>
      <Route>
        <Redirect to="/math" />
      </Route>
    </Switch>
  );
}
