import { PanelHeader } from "@/components/ControlPanel/panelHeader";
import { TodosBoard, Todo } from "@/components/ControlPanel/todosBoard";
import { getSessionCookieHeader } from "@/lib/server-auth";

const base = process.env.API_URL ?? "http://localhost:3001";

async function getTodos(): Promise<Todo[]> {
  const authHeaders = await getSessionCookieHeader();
  try {
    const res = await fetch(`${base}/api/todos`, { cache: "no-store", headers: authHeaders });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <div className="flex flex-col min-h-screen">
      <PanelHeader title="TODOS_" description="Suas tarefas privadas e as tarefas compartilhadas entre os usuários do painel" />
      <main className="flex-1 p-3 sm:p-6">
        <TodosBoard initialTodos={todos} />
      </main>
    </div>
  );
}
