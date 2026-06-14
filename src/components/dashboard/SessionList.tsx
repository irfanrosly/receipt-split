import { SessionCard } from "./SessionCard";
import type { Session } from "@/types/session";

interface SessionWithCounts extends Session {
  participants: { count: number }[];
  items: { count: number }[];
}

export function SessionList({ sessions }: { sessions: SessionWithCounts[] }) {
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          participantCount={session.participants[0]?.count ?? 0}
          itemCount={session.items[0]?.count ?? 0}
        />
      ))}
    </div>
  );
}
