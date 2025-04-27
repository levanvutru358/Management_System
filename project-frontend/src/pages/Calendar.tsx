import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import api from "../services/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  dueDate: string;
  status: "pending" | "completed" | "cancelled";
  reminderEmails: string;
  createdBy: number;
  assignedBy: number;
}

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string(),
  dueDate: z.string(),
  status: z.enum(["pending", "completed", "cancelled"]),
  reminderEmails: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/calendar");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/calendar/${id}`);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingEvent(undefined);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEvent(undefined);
  };

  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: editingEvent
      ? {
          title: editingEvent.title,
          description: editingEvent.description || "",
          startDate: editingEvent.startDate.split("T")[0],
          dueDate: editingEvent.dueDate.split("T")[0],
          status: editingEvent.status,
          reminderEmails: editingEvent.reminderEmails,
        }
      : {
          title: "",
          description: "",
          startDate: new Date().toISOString().split("T")[0],
          dueDate: new Date().toISOString().split("T")[0],
          status: "pending",
          reminderEmails: "[]",
        },
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      if (editingEvent?.id) {
        await api.put(`/calendar/${editingEvent.id}`, data);
      } else {
        await api.post("/calendar", data);
      }
      fetchEvents();
      handleClose();
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: "5px", mt: 2 }}>
          <Typography variant="h4">Calendar</Typography>
          <Button variant="contained" onClick={handleAdd} sx={{ mb: 1 }}>
            Add Event
          </Button>
          <List>
            {events.map((event) => (
              <ListItem key={event.id} sx={{ border: "1px solid #ddd", mb: 1, borderRadius: "4px" }}>
                <ListItemText
                  primary={event.title}
                  secondary={`Due: ${event.dueDate}, Status: ${event.status}`}
                />
                <Button onClick={() => handleEdit(event)} sx={{ mr: 1 }}>
                  Edit
                </Button>
                <Button onClick={() => handleDelete(event.id)} color="error">
                  Delete
                </Button>
              </ListItem>
            ))}
          </List>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add Event"}</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  label="Title"
                  {...register("title")}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Description"
                  {...register("description")}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Start Date"
                  type="date"
                  {...register("startDate")}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Due Date"
                  type="date"
                  {...register("dueDate")}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select {...register("status")} defaultValue="pending">
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Reminder Emails (JSON array)"
                  {...register("reminderEmails")}
                  error={!!errors.reminderEmails}
                  helperText={errors.reminderEmails?.message}
                  fullWidth
                  margin="normal"
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Calendar;