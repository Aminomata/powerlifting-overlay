import { useId } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminPanelProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  contentClassName?: string;
  children: React.ReactNode;
}

export function AdminPanel({
  title,
  description,
  action,
  contentClassName,
  children,
}: AdminPanelProps): React.JSX.Element {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm tracking-[0.16em] text-primary uppercase">
            <h2 id={titleId}>{title}</h2>
          </CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
          {action && <CardAction className="flex flex-wrap items-center justify-end gap-2">{action}</CardAction>}
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </section>
  );
}
