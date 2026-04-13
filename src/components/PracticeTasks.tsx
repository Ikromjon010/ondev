import { useState, useMemo } from "react";
import { Terminal, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Extract student section
  const studentMatch = md.match(/#{1,3}\s*📚\s*STUDENT KONSPEKTI[\s\S]*/i);
  const content = studentMatch ? studentMatch[0] : md;

  // Find homework section
  const homeworkMatch = content.match(/##\s*🏠\s*Uy Topshirig'i([\s\S]*?)(?=\n##\s[^#]|$)/i);
  if (!homeworkMatch) {
    // Try "Dars Topshirig'i" as fallback
    const classTaskMatch = content.match(/##\s*✅\s*Dars Topshirig'i([\s\S]*?)(?=\n##\s[^#]|$)/i);
    if (!classTaskMatch) return [];
    return parseTaskSection(classTaskMatch[1]);
  }

  return parseTaskSection(homeworkMatch[1]);
}

function parseTaskSection(section: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  // Split by ### Topshiriq N
  const taskParts = section.split(/###\s*Topshiriq\s*\d+/i).slice(1);

  for (const part of taskParts) {
    // Extract title (first line after split)
    const lines = part.trim().split("\n");
    const titleLine = lines[0]?.replace(/^[\s—\-]+/, "").trim() || "Topshiriq";

    // Extract code block
    const codeMatch = part.match(/```python\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : "";

    // Description is everything except the code block
    const description = part
      .replace(/```python[\s\S]*?```/g, "")
      .trim();

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

  const handleNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex((i) => i + 1);
    }
  };

  const handlePrevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex((i) => i - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
      {/* Editor */}
      <div className="glass-card flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              {hasTasks
                ? `Topshiriq ${currentTaskIndex + 1}/${tasks.length}: ${currentTask?.title || ""}`
                : "solution.py"}
            </span>
          </div>
          {hasTasks && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevTask}
                disabled={currentTaskIndex === 0}
                className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {tasks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTaskIndex(i)}
                  className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                    completedTasks.has(i)
                      ? "bg-primary/20 text-primary"
                      : i === currentTaskIndex
                      ? "bg-accent/20 text-accent"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {completedTasks.has(i) ? "✓" : i + 1}
                </button>
              ))}
              <button
                onClick={handleNextTask}
                disabled={currentTaskIndex === tasks.length - 1}
                className="p-1 rounded hover:bg-secondary disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Task description */}
        {hasTasks && currentTask?.description && (
          <div className="px-4 py-2 border-b border-border bg-secondary/30 text-sm text-muted-foreground max-h-24 overflow-auto">
            {currentTask.description}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border">
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

        <div className="flex-1">
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

      {/* Output */}
      <div className="glass-card flex flex-col overflow-hidden">
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

        {/* Next action */}
        <div className="border-t border-border p-4">
          {isCurrentCompleted && !isLastTask && (
            <button
              onClick={handleNextTask}
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
