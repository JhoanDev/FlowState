import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
        Activity & Study Tracker
      </h1>
      <p className="text-lg text-foreground/70 text-center max-w-lg">
        Bem-vindo. O setup do projeto foi concluído com sucesso.
      </p>
    </main>
  );
}
