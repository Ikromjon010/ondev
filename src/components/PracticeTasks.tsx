import { useState, useMemo } from "react";
import { Terminal, CheckCircle2, ArrowRight, Code2, Eye } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface PracticeTasksProps {
  contentMd: string | null;
  starterCode: string | null;
  lessonId: number;
  submitted: boolean;
  running: boolean;
  output: string;
  completedTasks: Set<number>;
  savedTaskCodes: Record<number, string>;
  onRun: (code: string) => void;
  onSubmit: (code: string, taskIndex: number, totalTasks: number, taskDescription: string) => void;
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
  completedTasks,
  savedTaskCodes,
  onRun,
  onSubmit,
}: PracticeTasksProps) => {
  const isMobile = useIsMobile();
  const tasks = useMemo(() => parseTasksFromMarkdown(contentMd), [contentMd]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskCodes, setTaskCodes] = useState<Record<number, string>>({});
  const [mobileView, setMobileView] = useState<"code" | "output">("code");

  const hasTasks = tasks.length > 0;
  const currentTask = hasTasks ? tasks[currentTaskIndex] : null;
  const currentCode = taskCodes[currentTaskIndex] ?? savedTaskCodes[currentTaskIndex] ?? currentTask?.code ?? starterCode ?? "# Kodingizni shu yerga yozing\n";
  const allTasksCompleted = hasTasks && completedTasks.size >= tasks.length;
  const isCurrentCompleted = completedTasks.has(currentTaskIndex);
  const isLastTask = currentTaskIndex === tasks.length - 1;

  const handleCodeChange = (value: string | undefined) => {
    setTaskCodes((prev) => ({ ...prev, [currentTaskIndex]: value || "" }));
  };

  const handleSubmitTask = () => {
    const desc = currentTask?.description || "Topshiriqni bajaring";
    onSubmit(currentCode, currentTaskIndex, tasks.length, desc);
    if (isMobile) setMobileView("output");
  };

  const handleRunCode = () => {
    onRun(currentCode);
    if (isMobile) setMobileView("output");
  };

  const editorBlock = (
    <div className="glass-card flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-4 h-4 text-accent shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">solution.py</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleRunCode}
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
            {isCurrentCompleted || (submitted && !hasTasks) ? "✓ Yuborildi" : "Tekshirish"}
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
            fontSize: isMobile ? 13 : 14,
            fontFamily: "'JetBrains Mono', monospace",
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            lineNumbers: isMobile ? "off" : "on",
            renderLineHighlight: "line",
            automaticLayout: true,
            wordWrap: isMobile ? "on" : "off",
            folding: !isMobile,
            glyphMargin: false,
            lineDecorationsWidth: isMobile ? 4 : 10,
            lineNumbersMinChars: isMobile ? 0 : 3,
            scrollbar: {
              verticalScrollbarSize: isMobile ? 6 : 10,
              horizontalScrollbarSize: isMobile ? 6 : 10,
            },
            quickSuggestions: !isMobile,
          }}
        />
      </div>
    </div>
  );

  const outputBlock = (
    <div className="glass-card flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-xs sm:text-sm font-medium text-foreground">Natija</span>
      </div>
      <div className="flex-1 p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-auto">
        {output ? (
          <pre className="text-foreground whitespace-pre-wrap break-words">{output}</pre>
        ) : (
          <p className="text-muted-foreground italic">
            Natijani ko'rish uchun kodingizni ishga tushiring...
          </p>
        )}
      </div>
    </div>
  );

  const nextActionBlock = (
    <div className="glass-card p-3 sm:p-4">
      {isCurrentCompleted && !isLastTask && (
        <button
          onClick={() => {
            setCurrentTaskIndex((i) => i + 1);
            if (isMobile) setMobileView("code");
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-all"
        >
          Keyingi topshiriq
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
      {(allTasksCompleted || (submitted && !hasTasks)) && (
        <Link
          to={`/lesson/${lessonId + 1}?tab=video`}
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
            ? `Bajaring (${completedTasks.size}/${tasks.length})`
            : "Keyingi darsni ochish uchun kodni yuboring"}
        </div>
      )}
    </div>
  );

  // ===== Mobile layout =====
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 h-[calc(100vh-180px)] pb-20">
        {/* Task tabs — horizontal scroll */}
        {hasTasks && (
          <div className="flex items-center gap-2 overflow-x-auto -mx-3 px-3 pb-1 scrollbar-none">
            {tasks.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTaskIndex(i)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  completedTasks.has(i)
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : i === currentTaskIndex
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {completedTasks.has(i) && <span className="mr-1">✓</span>}
                #{i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Code/Output toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
          <button
            onClick={() => setMobileView("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mobileView === "code" ? "bg-accent/15 text-accent" : "text-muted-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Kod
          </button>
          <button
            onClick={() => setMobileView("output")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mobileView === "output" ? "bg-accent/15 text-accent" : "text-muted-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Natija
          </button>
        </div>

        {/* Task description (collapsible-ish) */}
        {hasTasks && currentTask?.description && mobileView === "code" && (
          <details className="glass-card text-xs text-muted-foreground leading-relaxed">
            <summary className="px-3 py-2 cursor-pointer font-medium text-foreground">
              📋 Topshiriq matni
            </summary>
            <div className="px-3 pb-3 whitespace-pre-wrap">{currentTask.description}</div>
          </details>
        )}

        {/* Active panel */}
        {mobileView === "code" ? editorBlock : outputBlock}

        {nextActionBlock}

        {/* Sticky action bar (mobile) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border p-2 flex gap-2">
          <button
            onClick={handleRunCode}
            disabled={running}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-secondary text-foreground disabled:opacity-50"
          >
            {running ? "..." : "▶ Ishga tushirish"}
          </button>
          <button
            onClick={handleSubmitTask}
            disabled={running || isCurrentCompleted || (submitted && !hasTasks)}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
          >
            {isCurrentCompleted || (submitted && !hasTasks) ? "✓ Yuborildi" : "Yuborish"}
          </button>
        </div>
      </div>
    );
  }

  // ===== Desktop layout =====
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 h-[calc(100vh-180px)]">
      <div className="flex flex-col gap-3 min-h-0">
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

        {hasTasks && currentTask?.description && (
          <div className="glass-card p-4 text-sm text-muted-foreground leading-relaxed max-h-36 overflow-auto whitespace-pre-wrap">
            {currentTask.description}
          </div>
        )}

        {editorBlock}
      </div>

      <div className="flex flex-col gap-3 min-h-0">
        {outputBlock}
        {nextActionBlock}
      </div>
    </div>
  );
};

export default PracticeTasks;
