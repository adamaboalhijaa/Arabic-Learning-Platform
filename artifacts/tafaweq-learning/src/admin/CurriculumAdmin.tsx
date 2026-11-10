import { useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { parseCsv, toRecords } from '../curriculum/csv';
import { rowsFromJson, type ImportFormat, type ImportIssue, type ImportMode, type ImportPlan } from '../curriculum/import';
import { gradeStats, hasDuplicateTitles, overallStats, subjectStats } from '../curriculum/stats';
import {
  addLesson,
  addQuestion,
  addSubject,
  addUnit,
  deleteLesson,
  deleteQuestion,
  deleteSubject,
  deleteUnit,
  exportCurriculum,
  importRows,
  previewImport,
  resetCurriculum,
  updateLesson,
  updateQuestion,
  updateSubject,
  updateUnit,
  useCurriculum,
  type QuestionDraft,
} from '../curriculum/store';
import {
  DIFFICULTY_LABELS,
  QUESTION_KIND_LABELS,
  SEMESTER_LABELS,
  TRUE_FALSE_OPTIONS,
  type CurriculumLesson,
  type CurriculumQuestion,
  type CurriculumSubject,
  type CurriculumUnit,
  type QuestionDifficulty,
  type QuestionKind,
  type SemesterNumber,
} from '../curriculum/types';

type Tab = 'overview' | 'import' | 'editor';

const CSV_HEADERS = [
  'الصف',
  'المادة',
  'الفرع',
  'الفصل',
  'الوحدة',
  'الدرس',
  'هدف الدرس',
  'شرح الدرس',
  'الصفحة',
  'نوع السؤال',
  'السؤال',
  'الخيار 1',
  'الخيار 2',
  'الخيار 3',
  'الخيار 4',
  'الإجابة الصحيحة',
  'الشرح',
  'الصعوبة',
  'المرجع',
];

const CSV_TEMPLATE = `${CSV_HEADERS.join(',')}\n`;

const JSON_TEMPLATE = JSON.stringify(
  [
    {
      grade: 10,
      subjects: [
        {
          title: 'اسم المادة',
          stream: '',
          semesters: [
            {
              number: 1,
              units: [
                {
                  title: 'اسم الوحدة',
                  lessons: [
                    {
                      title: 'اسم الدرس',
                      objective: 'هدف الدرس',
                      explanation: 'شرح الدرس',
                      page: '12',
                      source: 'كتاب الطالب — صفحة 12',
                      questions: [
                        {
                          kind: 'mcq',
                          prompt: 'نص السؤال',
                          options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
                          correctOption: 1,
                          explanation: 'شرح الإجابة',
                          difficulty: 'medium',
                          source: 'كتاب الطالب — صفحة 12',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  null,
  2,
);

type Dialog =
  | { kind: 'subject'; mode: 'create' | 'edit'; subjectId?: string; title: string; stream: string; note: string }
  | { kind: 'unit'; mode: 'create' | 'edit'; subjectId: string; semester: SemesterNumber; unitId?: string; title: string }
  | {
      kind: 'lesson';
      mode: 'create' | 'edit';
      subjectId: string;
      unitId: string;
      lessonId?: string;
      title: string;
      objective: string;
      explanation: string;
      page: string;
      source: string;
    }
  | {
      kind: 'question';
      mode: 'create' | 'edit';
      subjectId: string;
      lessonId: string;
      questionId?: string;
      draft: QuestionDraft;
    }
  | null;

function downloadFile(filename: string, text: string, type: string): void {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function emptyDraft(kind: QuestionKind = 'mcq'): QuestionDraft {
  return {
    kind,
    prompt: '',
    options: kind === 'true_false' ? [...TRUE_FALSE_OPTIONS] : ['', '', '', ''],
    correctOption: 0,
    explanation: '',
    difficulty: 'medium',
    source: '',
  };
}

function toDraft(question: CurriculumQuestion): QuestionDraft {
  return {
    kind: question.kind,
    prompt: question.prompt,
    options: [...question.options],
    correctOption: question.correctOption,
    explanation: question.explanation,
    difficulty: question.difficulty,
    source: question.source,
  };
}

export function CurriculumAdmin() {
  const state = useCurriculum();
  const [tab, setTab] = useState<Tab>('overview');
  const [openGrade, setOpenGrade] = useState<number | null>(10);
  const [gradeNumber, setGradeNumber] = useState(10);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [dialogError, setDialogError] = useState('');
  const [notice, setNotice] = useState('');

  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<ImportFormat>('csv');
  const [importMode, setImportMode] = useState<ImportMode>('skip');
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const totals = useMemo(() => overallStats(state), [state]);
  const subjectCount = useMemo(() => state.grades.reduce((sum, grade) => sum + grade.subjects.length, 0), [state]);
  const completion = useMemo(() => {
    const subjects = state.grades.flatMap((grade) => grade.subjects);
    if (!subjects.length) return 0;
    return Math.round(subjects.reduce((sum, subject) => sum + subjectStats(subject).completion, 0) / subjects.length);
  }, [state]);

  const grade = state.grades.find((entry) => entry.gradeNumber === gradeNumber) ?? state.grades[0];

  const parseRows = (): { rows: Array<Record<string, string>>; issues: ImportIssue[] } => {
    const text = importText.trim();
    if (!text) {
      return { rows: [], issues: [{ row: 0, field: 'file', message: 'الصق بيانات المنهاج أو اختر ملفًا أولًا.' }] };
    }
    if (importFormat === 'csv') return { rows: toRecords(parseCsv(text)), issues: [] };
    try {
      const issues: ImportIssue[] = [];
      const rows = rowsFromJson(JSON.parse(text), issues);
      return { rows, issues };
    } catch {
      return { rows: [], issues: [{ row: 0, field: 'json', message: 'تعذّر تحليل ملف JSON؛ تحقق من صياغته.' }] };
    }
  };

  const handlePreview = () => {
    setNotice('');
    setImportError('');
    const { rows, issues } = parseRows();
    if (!rows.length) {
      setPlan(null);
      setImportError(issues[0]?.message ?? 'لا توجد صفوف قابلة للاستيراد.');
      return;
    }
    setPlan(previewImport(rows, importMode));
  };

  const handleApply = () => {
    setNotice('');
    setImportError('');
    const { rows, issues } = parseRows();
    if (!rows.length) {
      setPlan(null);
      setImportError(issues[0]?.message ?? 'لا توجد صفوف قابلة للاستيراد.');
      return;
    }
    const result = importRows(rows, importMode);
    setPlan(result);
    if (!result.canApply) {
      setImportError('لم يُطبّق الاستيراد لأن هناك صفوفًا تحتوي أخطاء. صحّحها ثم أعد المحاولة.');
      return;
    }
    const created = Object.values(result.creates).reduce((sum, value) => sum + Number(value), 0);
    const updated = Object.values(result.updates).reduce((sum, value) => sum + Number(value), 0);
    setNotice(`تم الاستيراد: ${created} عنصرًا جديدًا و${updated} تحديثًا، وتجاهل ${result.skipped.length} صفًا مكررًا.`);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setImportText(text);
    setImportFormat(file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv');
    setPlan(null);
    setNotice('');
    setImportError('');
  };

  const submitDialog = () => {
    setDialogError('');
    if (!dialog) return;
    if (dialog.kind === 'subject') {
      if (!dialog.title.trim()) return setDialogError('اسم المادة مطلوب.');
      if (dialog.mode === 'create') addSubject(gradeNumber, dialog.title, dialog.stream);
      else if (dialog.subjectId) updateSubject(dialog.subjectId, { title: dialog.title, stream: dialog.stream, note: dialog.note });
    } else if (dialog.kind === 'unit') {
      if (!dialog.title.trim()) return setDialogError('اسم الوحدة مطلوب.');
      if (dialog.mode === 'create') addUnit(dialog.subjectId, dialog.semester, dialog.title);
      else if (dialog.unitId) updateUnit(dialog.subjectId, dialog.unitId, dialog.title);
    } else if (dialog.kind === 'lesson') {
      if (!dialog.title.trim()) return setDialogError('اسم الدرس مطلوب.');
      if (dialog.mode === 'create') {
        addLesson(dialog.subjectId, dialog.unitId, dialog.title);
      } else if (dialog.lessonId) {
        updateLesson(dialog.subjectId, dialog.lessonId, {
          title: dialog.title,
          objective: dialog.objective,
          explanation: dialog.explanation,
          page: dialog.page,
          source: dialog.source,
        });
      }
    } else if (dialog.kind === 'question') {
      const draft = dialog.draft;
      if (!draft.prompt.trim()) return setDialogError('نص السؤال مطلوب.');
      if (!draft.explanation.trim()) return setDialogError('شرح الإجابة مطلوب ليظهر للطالب بعد التصحيح.');
      const options = draft.kind === 'true_false' ? [...TRUE_FALSE_OPTIONS] : draft.options.map((option) => option.trim());
      if (options.some((option) => !option)) return setDialogError('جميع الخيارات مطلوبة.');
      if (draft.correctOption < 0 || draft.correctOption >= options.length) {
        return setDialogError('اختر إجابة صحيحة من الخيارات.');
      }
      const clean: QuestionDraft = { ...draft, options };
      if (dialog.mode === 'create') {
        const added = addQuestion(dialog.subjectId, dialog.lessonId, clean);
        if (!added) return setDialogError('هذا السؤال موجود في الدرس نفسه (تكرار).');
      } else if (dialog.questionId) {
        updateQuestion(dialog.subjectId, dialog.questionId, clean);
      }
    }
    setDialog(null);
    setNotice('تم حفظ التعديل.');
  };

  return (
    <div className="study-app" dir="rtl">
      <header className="study-header">
        <div className="study-header-inner">
          <Link href="/admin/curriculum" className="study-brand" data-testid="link-curriculum-admin-brand">
            <span className="study-brand-mark"><GraduationCap size={20} /></span>
            <span>
              التفوّق
              <small>إدارة المنهاج · الصفوف 1–12</small>
            </span>
          </Link>

          <nav className="study-nav" aria-label="تنقل إدارة المنهاج">
            <Link href="/admin/curriculum" className={tab === 'overview' ? 'active' : ''} data-testid="tab-curriculum-overview" onClick={() => setTab('overview')}>
              <Layers size={15} style={{ marginInlineEnd: 6, verticalAlign: '-2px' }} />
              لوحة الإنجاز
            </Link>
            <Link href="/admin/curriculum" className={tab === 'import' ? 'active' : ''} data-testid="tab-curriculum-import" onClick={() => setTab('import')}>
              <Upload size={15} style={{ marginInlineEnd: 6, verticalAlign: '-2px' }} />
              الاستيراد المجمّع
            </Link>
            <Link href="/admin/curriculum" className={tab === 'editor' ? 'active' : ''} data-testid="tab-curriculum-editor" onClick={() => setTab('editor')}>
              <Pencil size={15} style={{ marginInlineEnd: 6, verticalAlign: '-2px' }} />
              تحرير المحتوى
            </Link>
          </nav>

          <div className="study-xp" data-testid="badge-curriculum-completion">
            <CheckCircle2 size={15} />
            <span>إنجاز المنهاج {completion}%</span>
          </div>
        </div>
      </header>

      <main className="study-main">
        <section className="study-hero">
          <p className="study-eyebrow">المنهاج الأردني · الصفوف من الأول إلى الثاني عشر</p>
          <h1 className="study-title">إدارة المنهاج والاستيراد المجمّع</h1>
          <p className="study-sub">
            الهيكل يشمل {state.grades.length} صفًا و{subjectCount} مادة، وكل مادة مقسّمة إلى فصلين دراسيين.
            الوحدات والدروس والأسئلة تُستورد من ملفات المنهاج الرسمية (CSV أو JSON) ولا تُولّد تلقائيًا،
            ولذلك تعرض لوحة الإنجاز نسبة التغطية الفعلية لكل صف ومادة.
          </p>

          <div className="study-stats">
            <div className="study-stat"><GraduationCap size={18} /><div><strong>{state.grades.length}</strong><span>صفًا</span></div></div>
            <div className="study-stat"><Layers size={18} /><div><strong>{subjectCount}</strong><span>مادة</span></div></div>
            <div className="study-stat"><BookOpen size={18} /><div><strong>{totals.units}</strong><span>وحدة</span></div></div>
            <div className="study-stat"><Database size={18} /><div><strong>{totals.questions}</strong><span>سؤالًا</span></div></div>
          </div>
        </section>

        <div className="toolbar" role="tablist" aria-label="أقسام إدارة المنهاج">
          <button type="button" role="tab" aria-selected={tab === 'overview'} className={`btn ${tab === 'overview' ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setTab('overview')} data-testid="button-tab-overview">
            لوحة إنجاز المنهاج
          </button>
          <button type="button" role="tab" aria-selected={tab === 'import'} className={`btn ${tab === 'import' ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setTab('import')} data-testid="button-tab-import">
            الاستيراد المجمّع
          </button>
          <button type="button" role="tab" aria-selected={tab === 'editor'} className={`btn ${tab === 'editor' ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setTab('editor')} data-testid="button-tab-editor">
            تحرير المنهاج
          </button>
          <Link href="/math" className="btn btn-soft" data-testid="link-curriculum-to-math">قسم الرياضيات</Link>
          <Link href="/admin" className="btn btn-quiet" data-testid="link-curriculum-to-admin">إدارة الموقع</Link>
        </div>

        {notice && (
          <div className="banner" role="status" data-testid="text-curriculum-notice" style={{ marginBottom: 18 }}>
            <CheckCircle2 size={18} />
            <span>{notice}</span>
          </div>
        )}

        {tab === 'overview' && (
          <>
            <div className="section-heading">
              <h2>إنجاز المنهاج حسب الصف والمادة</h2>
              <span className="study-meta">التغطية تُحسب من الوحدات والدروس والأسئلة المستوردة فعليًا</span>
            </div>
            <div className="card table-wrap">
              <table className="study-table">
                <thead>
                  <tr>
                    <th>الصف</th>
                    <th>المرحلة</th>
                    <th>المواد</th>
                    <th>الوحدات</th>
                    <th>الدروس</th>
                    <th>الأسئلة</th>
                    <th>الإنجاز</th>
                    <th>التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {state.grades.map((entry) => {
                    const stats = gradeStats(entry);
                    const isOpen = openGrade === entry.gradeNumber;
                    return (
                      <>
                        <tr key={entry.gradeNumber} data-testid={`row-grade-${entry.gradeNumber}`}>
                          <td><strong>{entry.title}</strong></td>
                          <td className="study-meta">{entry.stage}</td>
                          <td>{stats.subjectCount}</td>
                          <td>{stats.counts.units}</td>
                          <td>{stats.counts.lessons}</td>
                          <td>{stats.counts.questions}</td>
                          <td>
                            <span className={`study-badge ${stats.completion >= 80 ? 'good' : stats.completion > 0 ? 'warn' : ''}`}>
                              {stats.completion}%
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-quiet"
                              onClick={() => setOpenGrade(isOpen ? null : entry.gradeNumber)}
                              data-testid={`button-toggle-grade-${entry.gradeNumber}`}
                            >
                              {isOpen ? 'إخفاء' : 'عرض المواد'}
                            </button>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${entry.gradeNumber}-detail`}>
                            <td colSpan={8} style={{ background: 'hsl(var(--muted) / .35)' }}>
                              {stats.subjects.length ? (
                                <table className="study-table">
                                  <thead>
                                    <tr>
                                      <th>المادة</th>
                                      <th>الفصل الأول</th>
                                      <th>الفصل الثاني</th>
                                      <th>الدروس</th>
                                      <th>الأسئلة</th>
                                      <th>الإنجاز</th>
                                      <th>إجراء</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {stats.subjects.map((subject) => (
                                      <tr key={subject.subjectId} data-testid={`row-subject-${subject.subjectId}`}>
                                        <td>
                                          <strong>{subject.title}</strong>
                                          {subject.stream ? <span className="study-meta"> · {subject.stream}</span> : null}
                                        </td>
                                        <td>{subject.semesterUnits[0]} وحدة</td>
                                        <td>{subject.semesterUnits[1]} وحدة</td>
                                        <td>{subject.lessons}</td>
                                        <td>{subject.questions}</td>
                                        <td>
                                          <span className={`study-badge ${subject.completion >= 80 ? 'good' : subject.completion > 0 ? 'warn' : ''}`}>
                                            {subject.completion}%
                                          </span>
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            className="btn btn-quiet"
                                            onClick={() => {
                                              setGradeNumber(entry.gradeNumber);
                                              setTab('editor');
                                            }}
                                            data-testid={`button-edit-subject-${subject.subjectId}`}
                                          >
                                            تحرير
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="study-meta" style={{ margin: 0 }}>لا توجد مواد بعد لهذا الصف — أضف مادة من تبويب تحرير المنهاج.</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'import' && (
          <>
            <div className="banner" style={{ marginBottom: 18 }}>
              <AlertTriangle size={18} />
              <span>
                الاستيراد لا يخترع محتوى: كل وحدة ودرس وسؤال يجب أن يأتي من ملف المنهاج الرسمي. الأعمدة المقبولة في CSV:
                {' '}الصف، المادة، الفرع، الفصل، الوحدة، الدرس، هدف الدرس، شرح الدرس، الصفحة، نوع السؤال، السؤال،
                الخيار 1–4، الإجابة الصحيحة، الشرح، الصعوبة، المرجع. الصفوف المكررة تُتجاهل تلقائيًا.
              </span>
            </div>

            <div className="toolbar">
              <button type="button" className="btn btn-soft" onClick={() => downloadFile('curriculum-template.csv', CSV_TEMPLATE, 'text/csv')} data-testid="button-download-csv-template">
                <FileSpreadsheet size={16} /> قالب CSV
              </button>
              <button type="button" className="btn btn-soft" onClick={() => downloadFile('curriculum-template.json', JSON_TEMPLATE, 'application/json')} data-testid="button-download-json-template">
                <FileJson size={16} /> قالب JSON
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => downloadFile('curriculum-export.json', exportCurriculum(), 'application/json')} data-testid="button-export-curriculum">
                <Download size={16} /> تصدير المنهاج الحالي
              </button>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  if (!window.confirm('إعادة تعيين المنهاج تعيد الهيكل الرسمي ومحتوى الرياضيات الموثّق فقط، وتحذف أي استيراد أو تعديل إداري. هل تريد المتابعة؟')) return;
                  resetCurriculum();
                  setPlan(null);
                  setNotice('تمت إعادة تعيين المنهاج إلى الهيكل الرسمي والمحتوى الموثّق.');
                }}
                data-testid="button-reset-curriculum"
              >
                <RefreshCw size={16} /> إعادة تعيين
              </button>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end', marginBottom: 14 }}>
                <label className="field" style={{ minWidth: 180, marginBottom: 0 }}>
                  <span>الصيغة</span>
                  <select value={importFormat} onChange={(event) => setImportFormat(event.target.value as ImportFormat)} data-testid="select-import-format">
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </label>
                <label className="field" style={{ minWidth: 200, marginBottom: 0 }}>
                  <span>عند وجود عنصر مطابق</span>
                  <select value={importMode} onChange={(event) => setImportMode(event.target.value as ImportMode)} data-testid="select-import-mode">
                    <option value="skip">تجاهل الموجود (يمنع التكرار)</option>
                    <option value="update">تحديث بيانات السؤال الموجود</option>
                  </select>
                </label>
                <label className="field" style={{ minWidth: 220, marginBottom: 0 }}>
                  <span>ملف المنهاج</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
                    data-testid="input-import-file"
                  />
                </label>
              </div>

              <label className="field">
                <span>بيانات المنهاج (CSV أو JSON)</span>
                <textarea
                  value={importText}
                  onChange={(event) => {
                    setImportText(event.target.value);
                    setPlan(null);
                  }}
                  rows={10}
                  dir="ltr"
                  placeholder={importFormat === 'csv' ? CSV_HEADERS.join(',') : JSON_TEMPLATE}
                  style={{ fontFamily: 'var(--app-font-mono)', fontSize: 12 }}
                  data-testid="textarea-import-data"
                />
              </label>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-quiet" onClick={handlePreview} data-testid="button-preview-import">
                  معاينة فقط (dry-run)
                </button>
                <button type="button" className="btn btn-primary" onClick={handleApply} data-testid="button-apply-import">
                  <Upload size={16} /> تطبيق الاستيراد
                </button>
              </div>

              {importError && (
                <div className="banner" role="alert" style={{ marginTop: 16 }} data-testid="text-import-error">
                  <AlertTriangle size={18} />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            {plan && (
              <>
                <div className="section-heading">
                  <h2>نتيجة الاستيراد</h2>
                  <span className="study-meta">{plan.rows} صفًا في الملف · {plan.canApply ? 'قابل للتطبيق' : 'يحتوي أخطاء'}</span>
                </div>
                <div className="study-stats" style={{ marginTop: 0 }} data-testid="text-import-summary">
                  <div className="study-stat"><Plus size={18} /><div><strong>{plan.creates.questions}</strong><span>أسئلة جديدة</span></div></div>
                  <div className="study-stat"><BookOpen size={18} /><div><strong>{plan.creates.lessons}</strong><span>دروس جديدة</span></div></div>
                  <div className="study-stat"><Layers size={18} /><div><strong>{plan.creates.units}</strong><span>وحدات جديدة</span></div></div>
                  <div className="study-stat"><CheckCircle2 size={18} /><div><strong>{plan.updates.questions}</strong><span>تحديثات</span></div></div>
                  <div className="study-stat"><AlertTriangle size={18} /><div><strong>{plan.skipped.length}</strong><span>صفوف متجاهلة</span></div></div>
                  <div className="study-stat"><X size={18} /><div><strong>{plan.issues.length}</strong><span>أخطاء</span></div></div>
                </div>

                {plan.issues.length > 0 && (
                  <div className="card table-wrap" style={{ marginTop: 16 }}>
                    <table className="study-table">
                      <thead>
                        <tr><th>الصف في الملف</th><th>الحقل</th><th>الخطأ</th></tr>
                      </thead>
                      <tbody>
                        {plan.issues.slice(0, 50).map((issue, index) => (
                          <tr key={`${issue.row}-${issue.field}-${index}`}>
                            <td>{issue.row || '—'}</td>
                            <td>{issue.field}</td>
                            <td>{issue.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {plan.skipped.length > 0 && (
                  <div className="card table-wrap" style={{ marginTop: 16 }}>
                    <table className="study-table">
                      <thead>
                        <tr><th>الصفوف المتجاهلة (مكررة)</th></tr>
                      </thead>
                      <tbody>
                        {plan.skipped.slice(0, 30).map((entry, index) => (
                          <tr key={`skipped-${index}`}>
                            <td>
                              {Object.values(entry as unknown as Record<string, unknown>)
                                .filter((value) => typeof value === 'string' || typeof value === 'number')
                                .join(' · ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === 'editor' && grade && (
          <>
            <div className="section-heading">
              <h2>تحرير منهاج {grade.title}</h2>
              <span className="study-meta">{grade.subjects.length} مادة · {grade.stage}</span>
            </div>

            <div className="toolbar" style={{ marginTop: 0 }}>
              <label className="field" style={{ minWidth: 220, marginBottom: 0 }}>
                <span>الصف</span>
                <select value={gradeNumber} onChange={(event) => setGradeNumber(Number(event.target.value))} data-testid="select-editor-grade">
                  {state.grades.map((entry) => (
                    <option key={entry.gradeNumber} value={entry.gradeNumber}>{entry.title} — {entry.stage}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDialog({ kind: 'subject', mode: 'create', title: '', stream: '', note: '' })}
                data-testid="button-add-subject"
              >
                <Plus size={16} /> إضافة مادة
              </button>
            </div>

            {grade.subjects.length === 0 && (
              <div className="card" style={{ padding: 22 }}>
                <p className="study-meta" style={{ margin: 0 }}>لا توجد مواد لهذا الصف. أضف مادة ثم استورد وحداتها ودروسها من ملف المنهاج.</p>
              </div>
            )}

            <div style={{ display: 'grid', gap: 16 }}>
              {grade.subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onEditSubject={() =>
                    setDialog({ kind: 'subject', mode: 'edit', subjectId: subject.id, title: subject.title, stream: subject.stream, note: subject.note })
                  }
                  onDeleteSubject={() => {
                    if (!window.confirm(`حذف مادة «${subject.title}» وكل وحداتها ودروسها وأسئلتها؟`)) return;
                    deleteSubject(subject.id);
                    setNotice('تم حذف المادة.');
                  }}
                  onAddUnit={(semester) =>
                    setDialog({ kind: 'unit', mode: 'create', subjectId: subject.id, semester, title: '' })
                  }
                  onEditUnit={(unit) => setDialog({ kind: 'unit', mode: 'edit', subjectId: subject.id, semester: 1, unitId: unit.id, title: unit.title })}
                  onDeleteUnit={(unit) => {
                    if (!window.confirm(`حذف وحدة «${unit.title}» وكل دروسها؟`)) return;
                    deleteUnit(subject.id, unit.id);
                    setNotice('تم حذف الوحدة.');
                  }}
                  onAddLesson={(unit) => setDialog({ kind: 'lesson', mode: 'create', subjectId: subject.id, unitId: unit.id, title: '', objective: '', explanation: '', page: '', source: '' })}
                  onEditLesson={(unit, lesson) =>
                    setDialog({
                      kind: 'lesson',
                      mode: 'edit',
                      subjectId: subject.id,
                      unitId: unit.id,
                      lessonId: lesson.id,
                      title: lesson.title,
                      objective: lesson.objective,
                      explanation: lesson.explanation,
                      page: lesson.page,
                      source: lesson.source,
                    })
                  }
                  onDeleteLesson={(lesson) => {
                    if (!window.confirm(`حذف درس «${lesson.title}» وكل أسئلته؟`)) return;
                    deleteLesson(subject.id, lesson.id);
                    setNotice('تم حذف الدرس.');
                  }}
                  onAddQuestion={(lesson) => setDialog({ kind: 'question', mode: 'create', subjectId: subject.id, lessonId: lesson.id, draft: emptyDraft() })}
                  onEditQuestion={(lesson, question) =>
                    setDialog({ kind: 'question', mode: 'edit', subjectId: subject.id, lessonId: lesson.id, questionId: question.id, draft: toDraft(question) })
                  }
                  onDeleteQuestion={(question) => {
                    if (!window.confirm('حذف هذا السؤال؟')) return;
                    deleteQuestion(subject.id, question.id);
                    setNotice('تم حذف السؤال.');
                  }}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="study-footer">
        <span>أكاديمية التفوّق · إدارة المنهاج الأردني للصفوف 1–12</span>
        <span>الاستيراد من ملفات رسمية فقط · منع التكرار تلقائيًا · الحفظ في متصفح المشرف</span>
      </footer>

      {dialog && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="curriculum-dialog-title" dir="rtl">
            <div className="modal-head">
              <div>
                <span className="study-eyebrow">{dialog.mode === 'create' ? 'إضافة' : 'تعديل'}</span>
                <h2 id="curriculum-dialog-title" style={{ margin: '6px 0' }}>
                  {dialog.kind === 'subject' ? 'مادة' : dialog.kind === 'unit' ? 'وحدة' : dialog.kind === 'lesson' ? 'درس' : 'سؤال'}
                </h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setDialog(null)} aria-label="إغلاق" data-testid="button-close-curriculum-dialog">
                <X size={20} />
              </button>
            </div>

            {dialog.kind === 'subject' && (
              <>
                <label className="field">
                  <span>اسم المادة</span>
                  <input value={dialog.title} onChange={(event) => setDialog({ ...dialog, title: event.target.value })} data-testid="input-subject-title" />
                </label>
                <label className="field">
                  <span>الفرع (اختياري)</span>
                  <input value={dialog.stream} onChange={(event) => setDialog({ ...dialog, stream: event.target.value })} placeholder="علمي / أدبي" data-testid="input-subject-stream" />
                </label>
                <label className="field">
                  <span>ملاحظة المصدر</span>
                  <input value={dialog.note} onChange={(event) => setDialog({ ...dialog, note: event.target.value })} data-testid="input-subject-note" />
                </label>
              </>
            )}

            {dialog.kind === 'unit' && (
              <label className="field">
                <span>اسم الوحدة</span>
                <input value={dialog.title} onChange={(event) => setDialog({ ...dialog, title: event.target.value })} data-testid="input-unit-title" />
              </label>
            )}

            {dialog.kind === 'lesson' && (
              <>
                <label className="field">
                  <span>اسم الدرس</span>
                  <input value={dialog.title} onChange={(event) => setDialog({ ...dialog, title: event.target.value })} data-testid="input-lesson-title" />
                </label>
                <label className="field">
                  <span>هدف الدرس</span>
                  <input value={dialog.objective} onChange={(event) => setDialog({ ...dialog, objective: event.target.value })} data-testid="input-lesson-objective" />
                </label>
                <label className="field">
                  <span>شرح الدرس</span>
                  <textarea rows={5} value={dialog.explanation} onChange={(event) => setDialog({ ...dialog, explanation: event.target.value })} data-testid="textarea-lesson-explanation" />
                </label>
                <label className="field">
                  <span>صفحة الكتاب</span>
                  <input value={dialog.page} onChange={(event) => setDialog({ ...dialog, page: event.target.value })} data-testid="input-lesson-page" />
                </label>
                <label className="field">
                  <span>مرجع المصدر</span>
                  <input value={dialog.source} onChange={(event) => setDialog({ ...dialog, source: event.target.value })} placeholder="كتاب الطالب — صفحة 12" data-testid="input-lesson-source" />
                </label>
              </>
            )}

            {dialog.kind === 'question' && (
              <>
                <label className="field">
                  <span>نوع السؤال</span>
                  <select
                    value={dialog.draft.kind}
                    onChange={(event) => {
                      const kind = event.target.value as QuestionKind;
                      setDialog({ ...dialog, draft: { ...dialog.draft, kind, options: kind === 'true_false' ? [...TRUE_FALSE_OPTIONS] : ['', '', '', ''], correctOption: 0 } });
                    }}
                    data-testid="select-question-kind"
                  >
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صح وخطأ</option>
                  </select>
                </label>
                <label className="field">
                  <span>نص السؤال</span>
                  <textarea rows={3} value={dialog.draft.prompt} onChange={(event) => setDialog({ ...dialog, draft: { ...dialog.draft, prompt: event.target.value } })} data-testid="textarea-question-prompt" />
                </label>

                {dialog.draft.kind === 'mcq' ? (
                  dialog.draft.options.map((option, index) => (
                    <label className="field" key={`option-${index}`}>
                      <span>الخيار {index + 1}</span>
                      <input
                        value={option}
                        onChange={(event) => {
                          const options = [...dialog.draft.options];
                          options[index] = event.target.value;
                          setDialog({ ...dialog, draft: { ...dialog.draft, options } });
                        }}
                        data-testid={`input-question-option-${index + 1}`}
                      />
                    </label>
                  ))
                ) : (
                  <p className="study-meta">الخيارات ثابتة: صح / خطأ.</p>
                )}

                <label className="field">
                  <span>الإجابة الصحيحة</span>
                  <select
                    value={dialog.draft.correctOption}
                    onChange={(event) => setDialog({ ...dialog, draft: { ...dialog.draft, correctOption: Number(event.target.value) } })}
                    data-testid="select-question-correct"
                  >
                    {(dialog.draft.kind === 'true_false' ? TRUE_FALSE_OPTIONS : dialog.draft.options).map((option, index) => (
                      <option key={`correct-${index}`} value={index}>
                        {dialog.draft.kind === 'true_false' ? option : `الخيار ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>شرح الإجابة</span>
                  <textarea rows={3} value={dialog.draft.explanation} onChange={(event) => setDialog({ ...dialog, draft: { ...dialog.draft, explanation: event.target.value } })} data-testid="textarea-question-explanation" />
                </label>

                <label className="field">
                  <span>مستوى الصعوبة</span>
                  <select
                    value={dialog.draft.difficulty}
                    onChange={(event) => setDialog({ ...dialog, draft: { ...dialog.draft, difficulty: event.target.value as QuestionDifficulty } })}
                    data-testid="select-question-difficulty"
                  >
                    <option value="easy">{DIFFICULTY_LABELS.easy}</option>
                    <option value="medium">{DIFFICULTY_LABELS.medium}</option>
                    <option value="hard">{DIFFICULTY_LABELS.hard}</option>
                  </select>
                </label>

                <label className="field">
                  <span>مرجع السؤال في الكتاب</span>
                  <input value={dialog.draft.source} onChange={(event) => setDialog({ ...dialog, draft: { ...dialog.draft, source: event.target.value } })} data-testid="input-question-source" />
                </label>
              </>
            )}

            {dialogError && <p role="alert" style={{ color: 'hsl(var(--destructive))' }} data-testid="text-curriculum-dialog-error">{dialogError}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-primary" onClick={submitDialog} data-testid="button-save-curriculum-dialog">حفظ</button>
              <button type="button" className="btn btn-quiet" onClick={() => setDialog(null)} data-testid="button-cancel-curriculum-dialog">إلغاء</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

interface SubjectCardProps {
  subject: CurriculumSubject;
  onEditSubject: () => void;
  onDeleteSubject: () => void;
  onAddUnit: (semester: SemesterNumber) => void;
  onEditUnit: (unit: CurriculumUnit) => void;
  onDeleteUnit: (unit: CurriculumUnit) => void;
  onAddLesson: (unit: CurriculumUnit) => void;
  onEditLesson: (unit: CurriculumUnit, lesson: CurriculumLesson) => void;
  onDeleteLesson: (lesson: CurriculumLesson) => void;
  onAddQuestion: (lesson: CurriculumLesson) => void;
  onEditQuestion: (lesson: CurriculumLesson, question: CurriculumQuestion) => void;
  onDeleteQuestion: (question: CurriculumQuestion) => void;
}

function SubjectCard({
  subject,
  onEditSubject,
  onDeleteSubject,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: SubjectCardProps) {
  const stats = subjectStats(subject);
  const duplicate = hasDuplicateTitles(subject);

  return (
    <article className="card" style={{ padding: 18 }} data-testid={`card-subject-${subject.id}`}>
      <div className="study-unit-head">
        <div>
          <span className="study-badge">{stats.completion}% مكتمل</span>
          <h2 className="study-card-title" style={{ margin: '8px 0 0' }}>
            {subject.title}
            {subject.stream ? <span className="study-meta"> · {subject.stream}</span> : null}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="icon-btn" onClick={onEditSubject} aria-label={`تعديل ${subject.title}`} data-testid={`button-edit-subject-card-${subject.id}`}>
            <Pencil size={16} />
          </button>
          <button type="button" className="icon-btn" onClick={onDeleteSubject} aria-label={`حذف ${subject.title}`} data-testid={`button-delete-subject-${subject.id}`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="study-meta" style={{ margin: '6px 0 0' }}>
        {stats.units} وحدة · {stats.lessons} درسًا · {stats.questions} سؤالًا
        {stats.lessonsWithoutQuestions > 0 ? ` · ${stats.lessonsWithoutQuestions} درسًا بلا أسئلة` : ''}
        {subject.note ? ` · ${subject.note}` : ''}
      </p>

      {duplicate && (
        <div className="banner" style={{ marginTop: 12 }}>
          <AlertTriangle size={18} />
          <span>يوجد عنوان وحدة مكرر داخل هذه المادة. احذف المكرر حفاظًا على تنظيم المنهاج.</span>
        </div>
      )}

      {subject.semesters.map((semester) => (
        <div key={`${subject.id}-sem-${semester.number}`} style={{ marginTop: 16 }}>
          <div className="study-unit-head">
            <strong>{SEMESTER_LABELS[semester.number]}</strong>
            <button type="button" className="btn btn-quiet" onClick={() => onAddUnit(semester.number)} data-testid={`button-add-unit-${subject.id}-${semester.number}`}>
              <Plus size={14} /> وحدة
            </button>
          </div>

          {semester.units.length === 0 && <p className="study-meta">لا توجد وحدات مستوردة في هذا الفصل.</p>}

          {semester.units.map((unit, unitIndex) => (
            <div key={unit.id} style={{ border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 14, marginTop: 10 }} data-testid={`card-unit-${unit.id}`}>
              <div className="study-unit-head">
                <div>
                  <span className="study-badge">الوحدة {unitIndex + 1}</span>
                  <strong style={{ marginInlineStart: 8 }}>{unit.title}</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-quiet" onClick={() => onAddLesson(unit)} data-testid={`button-add-lesson-${unit.id}`}>
                    <Plus size={14} /> درس
                  </button>
                  <button type="button" className="icon-btn" onClick={() => onEditUnit(unit)} aria-label={`تعديل ${unit.title}`} data-testid={`button-edit-unit-${unit.id}`}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => onDeleteUnit(unit)} aria-label={`حذف ${unit.title}`} data-testid={`button-delete-unit-${unit.id}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="study-list">
                {unit.lessons.map((lesson) => (
                  <div key={lesson.id} className="study-lesson-row" data-testid={`row-lesson-${lesson.id}`}>
                    <span style={{ minWidth: 0 }}>
                      <strong>{lesson.title}</strong>
                      <small>
                        {lesson.page ? `ص ${lesson.page} · ` : ''}
                        {lesson.questions.length} سؤالًا
                        {lesson.questions.length === 0 ? ' · بلا أسئلة' : ''}
                      </small>
                    </span>
                    <span className="study-row-end">
                      <button type="button" className="btn btn-quiet" onClick={() => onAddQuestion(lesson)} data-testid={`button-add-question-${lesson.id}`}>
                        <Plus size={14} /> سؤال
                      </button>
                      <button type="button" className="icon-btn" onClick={() => onEditLesson(unit, lesson)} aria-label={`تعديل ${lesson.title}`} data-testid={`button-edit-lesson-${lesson.id}`}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => onDeleteLesson(lesson)} aria-label={`حذف ${lesson.title}`} data-testid={`button-delete-lesson-${lesson.id}`}>
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              {unit.lessons.some((lesson) => lesson.questions.length > 0) && (
                <details style={{ marginTop: 10 }}>
                  <summary className="study-meta">عرض أسئلة الدروس ({unit.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0)})</summary>
                  {unit.lessons.map((lesson) =>
                    lesson.questions.map((question, index) => (
                      <div key={question.id} style={{ borderTop: '1px dashed hsl(var(--border))', padding: '10px 0' }} data-testid={`row-question-${question.id}`}>
                        <div className="study-unit-head" style={{ marginBottom: 4 }}>
                          <span className="study-meta">
                            {lesson.title} · سؤال {index + 1} · {QUESTION_KIND_LABELS[question.kind]} · {DIFFICULTY_LABELS[question.difficulty]}
                          </span>
                          <span className="study-row-end">
                            <button type="button" className="icon-btn" onClick={() => onEditQuestion(lesson, question)} aria-label="تعديل السؤال" data-testid={`button-edit-question-${question.id}`}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="icon-btn" onClick={() => onDeleteQuestion(question)} aria-label="حذف السؤال" data-testid={`button-delete-question-${question.id}`}>
                              <Trash2 size={15} />
                            </button>
                          </span>
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: 13 }}>{question.prompt}</p>
                        <p className="study-meta" style={{ margin: 0 }}>
                          الإجابة: {question.options[question.correctOption] ?? '—'} · {question.source || 'بلا مرجع'}
                        </p>
                      </div>
                    )),
                  )}
                </details>
              )}
            </div>
          ))}
        </div>
      ))}
    </article>
  );
}
