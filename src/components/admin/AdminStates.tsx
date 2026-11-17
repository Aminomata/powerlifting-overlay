import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "../../i18n";

export function AdminLoadingState(): React.JSX.Element {
  const t = useT();

  return (
    <main
      aria-busy="true"
      aria-label={t("admin.loading")}
      className="mx-auto grid min-h-screen max-w-7xl content-start gap-4 p-6 xl:grid-cols-[1.6fr_1fr]"
    >
      <div className="grid gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="grid gap-4 self-start">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </main>
  );
}

interface AdminErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function AdminErrorState({ message, onRetry }: AdminErrorStateProps): React.JSX.Element {
  const t = useT();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card role="alert" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="size-4" />
            {t("admin.loadError")}
          </CardTitle>
          <CardDescription className="break-words">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onRetry}>
            <RotateCw data-icon="inline-start" />
            {t("admin.retry")}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
