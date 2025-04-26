import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Comment } from '../../types/comment';
import { addCommentToTask, fetchComments } from '../../services/taskService';

interface CommentBoxProps {
  taskId: number;
}

const CommentBox: React.FC<CommentBoxProps> = ({ taskId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState<string>('');

  // Lấy danh sách comment từ API khi component mount
  useEffect(() => {
    const loadComments = async () => {
      try {
        // Gọi API để lấy comment của taskId
        const commentList = await fetchComments(taskId);  // Truyền taskId thay vì đối tượng
        setComments(commentList);  // setComments nhận mảng Comment[]
      } catch (error) {
        console.error('Lỗi khi lấy comments:', error);
      }
    };

    loadComments();
  }, [taskId]);

  const handleCommentSubmit = async () => {
    if (content.trim()) {
      const newComment = await addCommentToTask(taskId, content);
      setComments([...comments, newComment]);  // Cập nhật lại danh sách comment
      setContent('');  // Reset content input
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Comments</Typography>
      <List>
        {comments.map((comment) => (
          <ListItem key={comment.id}>
            <ListItemText primary={comment.content} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
        <TextField
          label="Add a comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
        />
        <Button onClick={handleCommentSubmit} variant="contained" sx={{ mt: 1 }}>
          Submit Comment
        </Button>
      </Box>
    </Box>
  );
};

export default CommentBox;
