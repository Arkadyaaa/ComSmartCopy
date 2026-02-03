import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import {
  getFacilitatorResourcesByChapter,
  downloadFacilitatorResource
} from '../../../services/apiFacilitatorResources';

export default function FacilitatorModal({
  open,
  onClose,
  chapter
}) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (open) loadFiles();
  }, [open]);

  const loadFiles = async () => {
    try {
      const data = await getFacilitatorResourcesByChapter(chapter);
      setFiles(data);
    } catch (err) {
      console.error('Failed to load facilitator resources', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Facilitator PDF Resources</DialogTitle>

      <DialogContent dividers>
        {files.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No PDF resources for this chapter.
          </Typography>
        ) : (
          <List>
            {files.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => downloadFacilitatorResource(file)}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                }
              >
                <PictureAsPdfIcon sx={{ mr: 1, color: 'red' }} />
                <ListItemText
                  primary={" "+ file.filename}
                  secondary={new Date(file.timestamp).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
