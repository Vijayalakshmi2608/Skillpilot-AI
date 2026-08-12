import * as React from "react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

function PageHeader({ title, description, breadcrumbs, actions, icon: Icon, children }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((c, i) => (
            <Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {c.to ? (
                <Link to={c.to} className="transition-colors hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{c.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </motion.div>
  );
}

export { PageHeader };
