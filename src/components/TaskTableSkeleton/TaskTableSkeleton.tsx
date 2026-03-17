import {
  Box,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const ROWS = 5;

const TaskTableSkeleton = ({ rows = ROWS }: { rows?: number }) => (
  <Table>
    <TableHead>
      <TableRow sx={{ bgcolor: "rgba(37,99,235,0.03)" }}>
        {/* Checkbox */}
        <TableCell padding="checkbox" sx={{ pl: 2, width: 48 }}>
          <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 1 }} />
        </TableCell>
        {["Title", "Due Date", "Priority", "Status"].map((col) => (
          <TableCell key={col} sx={{ py: 1.5, px: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Skeleton variant="text" width={col === "Title" ? 60 : 70} height={18} />
              <Skeleton variant="circular" width={14} height={14} />
            </Stack>
          </TableCell>
        ))}
        {/* Actions */}
        <TableCell sx={{ width: 48 }} />
      </TableRow>
    </TableHead>

    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow
          key={i}
          sx={{
            borderTop: i === 0 ? "none" : "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Checkbox */}
          <TableCell padding="checkbox" sx={{ pl: 2 }}>
            <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 1 }} />
          </TableCell>

          {/* Title */}
          <TableCell sx={{ py: 1.5, px: 2 }}>
            <Skeleton variant="text" width={`${50 + (i * 23) % 40}%`} height={20} />
          </TableCell>

          {/* Due Date */}
          <TableCell sx={{ py: 1.5, px: 2 }}>
            <Skeleton variant="text" width={80} height={18} />
          </TableCell>

          {/* Priority chip */}
          <TableCell sx={{ py: 1.5, px: 2 }}>
            <Skeleton variant="rounded" width={52} height={22} sx={{ borderRadius: "6px" }} />
          </TableCell>

          {/* Status chip */}
          <TableCell sx={{ py: 1.5, px: 2 }}>
            <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "6px" }} />
          </TableCell>

          {/* Edit icon */}
          <TableCell sx={{ py: 1.5, px: 1 }}>
            <Box sx={{ width: 28, height: 28 }} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default TaskTableSkeleton;
