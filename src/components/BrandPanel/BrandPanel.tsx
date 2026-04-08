import type { FC } from "react";
import { Box, Stack, Typography } from "@mui/material";
import NavtaskIcon from "../NavTaskIcon";
import { NavtaskLogoNew } from "../../assets";

interface BrandPanelProps {
  subtitle?: string;
}

const WATERMARKS = [
  { top: -40, left: -40, size: 160 },
  { top: -40, left: 160, size: 120 },
  { top: -40, right: 40, size: 150 },
  { top: 120, left: -60, size: 130 },
  { top: 100, left: 140, size: 100 },
  { top: 80, right: -30, size: 140 },
  { top: "40%", left: -50, size: 150 },
  { top: "38%", left: 130, size: 110 },
  { top: "36%", right: -40, size: 130 },
  { bottom: 60, left: -40, size: 160 },
  { bottom: 40, left: 150, size: 120 },
  { bottom: 20, right: -30, size: 150 },
];

const BrandPanel: FC<BrandPanelProps> = () => (
  <Box
    sx={{
      display: { xs: "none", md: "flex" },
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      position: "relative",
      overflow: "hidden",
      background:
        "linear-gradient(145deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)",
      px: 6,
    }}
  >
    {/* Tiled watermark logos */}
    {WATERMARKS.map((w, i) => (
      <Box
        key={i}
        sx={{
          position: "absolute",
          top: w.top,
          bottom: w.bottom,
          left: w.left,
          right: w.right,
          opacity: 0.055,
          pointerEvents: "none",
          lineHeight: 0,
        }}
      >
        <NavtaskIcon width={w.size} height={w.size} color="white" />
      </Box>
    ))}

    <Box sx={{ position: "relative", zIndex: 1, textAlign: "left" }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "16px",
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={NavtaskLogoNew}
            alt="NavTask logo"
            sx={{ width: 50, height: 50, objectFit: "contain" }}
          />
        </Box>

        <Stack direction="column" spacing={0.25}>
          <Typography variant="h4" sx={{ color: "white", lineHeight: 1.2 }}>
            NavTask
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.95rem",
              lineHeight: 1.2,
            }}
          >
            Stay Organized, Get More Done!
          </Typography>
        </Stack>
      </Stack>
    </Box>
  </Box>
);

export default BrandPanel;
