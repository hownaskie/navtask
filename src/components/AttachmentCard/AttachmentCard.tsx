import { Box, Typography } from "@mui/material";
import {
  InsertDriveFileOutlined,
  DescriptionOutlined,
  PictureAsPdfOutlined,
  TableChartOutlined,
  SlideshowOutlined,
} from "@mui/icons-material";

type AttachmentType = "image" | "pdf" | "doc" | "sheet" | "slide" | "file";

interface AttachmentCardProps {
  fileName: string;
  attachmentUrl: string;
  attachmentType: AttachmentType;
}

const AttachmentCard = ({
  fileName,
  attachmentUrl,
  attachmentType,
}: AttachmentCardProps) => {
  return (
    <Box
      component="a"
      href={attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        width: 140,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        overflow: "hidden",
        textDecoration: "none",
        bgcolor: "background.paper",
        transition: "all 0.15s",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-1px)",
        },
      }}
    >
      {attachmentType === "image" ? (
        <Box
          component="img"
          src={attachmentUrl}
          alt={fileName}
          sx={{
            width: "100%",
            height: 96,
            objectFit: "cover",
            display: "block",
            bgcolor: "action.hover",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 96,
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
          }}
        >
          {attachmentType === "pdf" && (
            <PictureAsPdfOutlined sx={{ fontSize: 36, color: "error.main" }} />
          )}
          {attachmentType === "doc" && (
            <DescriptionOutlined sx={{ fontSize: 36, color: "primary.main" }} />
          )}
          {attachmentType === "sheet" && (
            <TableChartOutlined sx={{ fontSize: 36, color: "success.main" }} />
          )}
          {attachmentType === "slide" && (
            <SlideshowOutlined sx={{ fontSize: 36, color: "warning.main" }} />
          )}
          {attachmentType === "file" && (
            <InsertDriveFileOutlined
              sx={{ fontSize: 36, color: "text.secondary" }}
            />
          )}
        </Box>
      )}
      <Typography
        sx={{
          px: 1,
          py: 0.75,
          fontSize: "0.75rem",
          color: "text.secondary",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {fileName}
      </Typography>
    </Box>
  );
};

export default AttachmentCard;