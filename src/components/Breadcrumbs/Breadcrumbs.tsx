import { Breadcrumbs as MuiBreadcrumbs, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbState {
  breadcrumbs?: BreadcrumbItem[];
}

interface AppBreadcrumbsProps {
  pathname: string;
  breadcrumbs?: BreadcrumbItem[];
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/add": "New Task",
  "/edit": "Edit",
  "/view": "View Task",
};

const getNormalizedPath = (pathname: string) => pathname.replace(/\/\d+$/, "");

const getBreadcrumbLabel = (pathname: string) => {
  const normalizedPath = getNormalizedPath(pathname);

  return (
    PAGE_TITLES[normalizedPath] ??
    normalizedPath
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/-/g, " ") ??
    "Dashboard"
  );
};

export const buildBreadcrumbTrail = (pathname: string): BreadcrumbItem[] => {
  const normalizedPath = getNormalizedPath(pathname);

  if (normalizedPath === "/dashboard") {
    return [{ label: PAGE_TITLES[normalizedPath], href: "/dashboard" }];
  }

  return [
    {
      label: getBreadcrumbLabel(pathname),
      href: pathname,
    },
  ];
};

const AppBreadcrumbs = ({ pathname, breadcrumbs }: AppBreadcrumbsProps) => {
  const items = breadcrumbs && breadcrumbs.length > 0
    ? breadcrumbs
    : buildBreadcrumbTrail(pathname);

  return (
    <Stack sx={{ display: { xs: "none", md: "flex" } }}>
      <MuiBreadcrumbs
        separator={
          <Typography
            component="span"
            color="text.disabled"
            sx={{ fontSize: "0.95rem" }}
          >
            /
          </Typography>
        }
        aria-label="breadcrumb"
      >
        {items.map((item, index) =>
          index === items.length - 1 ? (
            <Typography
              key={`${item.label}-${index}`}
              variant="h6"
              sx={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {item.label}
            </Typography>
          ) : (
            <Link
              key={`${item.label}-${index}`}
              component={RouterLink}
              to={item.href ?? "/dashboard"}
              underline="hover"
              color="text.secondary"
              sx={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              {item.label}
            </Link>
          ),
        )}
      </MuiBreadcrumbs>
    </Stack>
  );
};

export default AppBreadcrumbs;