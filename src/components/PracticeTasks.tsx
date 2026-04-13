import { useState, useMemo } from "react";
import { Terminal, CheckCircle2, ArrowRight } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";

interface PracticeTasksProps {
  contentMd: string | null;
  starterCode: string | null;
  lessonId: number;
  submitted: boolean;
  running: boolean;
  output: string;
  onRun: (code: string) => void;
  onSubmit: (code: string, taskIndex: number, totalTasks: number) => void;
}

interface ParsedTask {
  title: string;
  description: string;
  code: string;
}

function parseTasksFromMarkdown(md: string | null): ParsedTask[] {
  if (!md) return [];
  const studentMatch = md.match(/#{1,3}\s*📚\s*STUDENT KONSPEKTI[\s\S]*/i);
  const content = studentMatch ? studentMatch[0] : md;

  const homeworkMatch = content.match(/##\s*🏠\s*Uy Topshirig'i([\s\S]*?)(?=\n##\s[^#]|$)/i);
  if (!homeworkMatch) {
    const classTaskMatch = content.match(/##\s*✅\s*Dars Topshirig'i([\s\S]*?)(?=\n##\s[^#]|$)/i);
    if (!classTaskMatch) return [];
    return parseTaskSection(classTaskMatch[1]);
  }
  return parseTaskSection(homeworkMatch[1]);
}

function parseTaskSection(section: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  const taskParts = section.split(/###\s*Topshiriq\s*\d+/i).slice(1);

  for (const part of taskParts) {
    const lines = part.trim().split("\n");
    const titleLine = lines[0]?.replace(/^[\s—\-]+/, "").trim() || "Topshiriq";
    const codeMatch = part.match(/```python\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : "";
    const description = part.replace(/```python[\s\S]*?```/g, "").trim();
    tasks.push({ title: titleLine, description, code });
  }
  return tasks;
}

const PracticeTasks = ({
  contentMd,
  starterCode,
  lessonId,
  submitted,
  running,
  output,
  onRun,
  onSubmit,
}: PracticeTasksProps) => {
  const tasks = useMemo(() => parseTasksFromMarkdown(contentMd), [contentMd]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskCodes, setTaskCodes] = useState<Record<number, string>>({});
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  const hasTasks = tasks.length > 0;
  const currentTask = hasTasks ? tasks[currentTaskIndex] : null;
  const currentCode = taskCodes[currentTaskIndex] ?? currentTask?.code ?? starterCode ?? "# Kodingizni shu yerga yozing\n";
  const allTasksCompleted = hasTasks && completedTasks.size >= tasks.length;
  const isCurrentCompleted = completedTasks.has(currentTaskIndex);
  const isLastTask = currentTaskIndex === tasks.length - 1;

  const handleCodeChange = (value: string | undefined) => {
    setTaskCodes((prev) => ({ ...prev, [currentTaskIndex]: value || "" }));
  };

  const handleSubmitTask = () => {
    setCompletedTasks((prev) => new Set(prev).add(currentTaskIndex));
    onSubmit(currentCode, currentTaskIndex, tasks.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 h-[calc(100vh-180px)]">
      {/* Left: Tabs + Description + Editor */}
      <div className="flex flex-col gap-3 min-h-0">
        {/* Task tabs */}
        {hasTasks && (
          <div className="flex items-center gap-2 flex-wrap">
            {tasks.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTaskIndex(i)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-all ${
                  completedTasks.has(i)
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : i === currentTaskIndex
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                {completedTasks.has(i) && <span className="mr-1">✓</span>}
                Topshiriq {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Task description */}
        {hasTasks && currentTask?.description && (
          <div className="glass-card p-4 text-sm text-muted-foreground leading-relaxed max-h-36 overflow-auto whitespace-pre-wrap">
            {currentTask.description}
          </div>
        )}

        {/* Editor */}
        <div className="glass-card flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">solution.py</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRun(currentCode)}
                disabled={running}
                className="px-3 py-1 text-xs font-medium rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                {running ? "Ishlamoqda..." : "▶ Ishga tushirish"}
              </button>
              <button
                onClick={handleSubmitTask}
                disabled={running || isCurrentCompleted || (submitted && !hasTasks)}
                className="px-3 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isCurrentCompleted || (submitted && !hasTasks) ? "✓ Yuborildi" : "Tekshirish uchun yuborish"}
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={currentCode}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Right: Output + Next action */}
      <div className="flex flex-col gap-3 min-h-0">
        <div className="glass-card flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Natija</span>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto">
            {output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-muted-foreground italic">
                Natijani ko'rish uchun kodingizni ishga tushiring...
              </p>
            )}
          </div>
        </div>

        {/* Next action */}
        <div className="glass-card p-4">
          {isCurrentCompleted && !isLastTask && (
            <button
              onClick={() => setCurrentTaskIndex((i) => i + 1)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-all"
            >
              Keyingi topshiriq
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {(allTasksCompleted || (submitted && !hasTasks)) && (
            <Link
              to={`/lesson/${lessonId + 1}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow-success"
            >
              <CheckCircle2 className="w-4 h-4" />
              Keyingi dars
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {!allTasksCompleted && !submitted && (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm bg-secondary text-muted-foreground cursor-not-allowed">
              {hasTasks
                ? `Barcha topshiriqlarni bajaring (${completedTasks.size}/${tasks.length})`
                : "Keyingi darsni ochish uchun kodni yuboring"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeTasks;
