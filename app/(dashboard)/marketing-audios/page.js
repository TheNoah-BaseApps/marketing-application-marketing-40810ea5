'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Headphones, Plus, Pencil, Trash2, Music, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingAudiosPage() {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalListeners: 0,
    avgFeedback: 0,
    totalDuration: 0
  });

  const [formData, setFormData] = useState({
    audio_title: '',
    audio_type: '',
    duration_seconds: '',
    recorded_date: '',
    release_date: '',
    format_type: '',
    published_on: '',
    listeners_count: '',
    feedback_score: '',
    created_by: '',
    licensing_info: '',
    remarks: ''
  });

  useEffect(() => {
    fetchAudios();
  }, []);

  async function fetchAudios() {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing-audios');
      const result = await response.json();
      
      if (result.success) {
        setAudios(result.data);
        calculateStats(result.data);
      } else {
        toast.error('Failed to load audios');
      }
    } catch (error) {
      console.error('Error fetching audios:', error);
      toast.error('Error loading audios');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const totalListeners = data.reduce((sum, a) => sum + (a.listeners_count || 0), 0);
    const feedbackSum = data.reduce((sum, a) => sum + (a.feedback_score || 0), 0);
    const avgFeedback = total > 0 ? Math.round(feedbackSum / total) : 0;
    const totalDuration = data.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
    
    setStats({ total, totalListeners, avgFeedback, totalDuration });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = selectedAudio 
        ? `/api/marketing-audios/${selectedAudio.id}`
        : '/api/marketing-audios';
      
      const method = selectedAudio ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds) : null,
          listeners_count: formData.listeners_count ? parseInt(formData.listeners_count) : 0,
          feedback_score: formData.feedback_score ? parseInt(formData.feedback_score) : null
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(selectedAudio ? 'Audio updated successfully' : 'Audio created successfully');
        setIsAddOpen(false);
        setIsEditOpen(false);
        resetForm();
        fetchAudios();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this audio?')) return;

    try {
      const response = await fetch(`/api/marketing-audios/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Audio deleted successfully');
        fetchAudios();
      } else {
        toast.error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  }

  function handleEdit(audio) {
    setSelectedAudio(audio);
    setFormData({
      audio_title: audio.audio_title || '',
      audio_type: audio.audio_type || '',
      duration_seconds: audio.duration_seconds || '',
      recorded_date: audio.recorded_date ? audio.recorded_date.split('T')[0] : '',
      release_date: audio.release_date ? audio.release_date.split('T')[0] : '',
      format_type: audio.format_type || '',
      published_on: audio.published_on || '',
      listeners_count: audio.listeners_count || '',
      feedback_score: audio.feedback_score || '',
      created_by: audio.created_by || '',
      licensing_info: audio.licensing_info || '',
      remarks: audio.remarks || ''
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      audio_title: '',
      audio_type: '',
      duration_seconds: '',
      recorded_date: '',
      release_date: '',
      format_type: '',
      published_on: '',
      listeners_count: '',
      feedback_score: '',
      created_by: '',
      licensing_info: '',
      remarks: ''
    });
    setSelectedAudio(null);
  }

  function formatDuration(seconds) {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatTotalDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Audios</h1>
          <p className="text-gray-600 mt-1">Manage your audio content library</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Audio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audios</CardTitle>
            <Headphones className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listeners</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListeners.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Feedback</CardTitle>
            <Badge variant="outline">{stats.avgFeedback}/10</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgFeedback}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Music className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTotalDuration(stats.totalDuration)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Audios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audios</CardTitle>
          <CardDescription>View and manage all marketing audio content</CardDescription>
        </CardHeader>
        <CardContent>
          {audios.length === 0 ? (
            <div className="text-center py-12">
              <Headphones className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audios yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first audio entry</p>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Audio
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Listeners</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Published On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audios.map((audio) => (
                  <TableRow key={audio.id}>
                    <TableCell className="font-medium">{audio.audio_title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{audio.audio_type}</Badge>
                    </TableCell>
                    <TableCell>{formatDuration(audio.duration_seconds)}</TableCell>
                    <TableCell>{audio.format_type || 'N/A'}</TableCell>
                    <TableCell>{(audio.listeners_count || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {audio.feedback_score ? (
                        <Badge>{audio.feedback_score}/10</Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{audio.published_on || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(audio)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(audio.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAudio ? 'Edit Audio' : 'Add New Audio'}</DialogTitle>
            <DialogDescription>
              {selectedAudio ? 'Update audio information' : 'Create a new audio entry'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="audio_title">Audio Title *</Label>
                <Input
                  id="audio_title"
                  value={formData.audio_title}
                  onChange={(e) => setFormData({ ...formData, audio_title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="audio_type">Audio Type *</Label>
                <Input
                  id="audio_type"
                  value={formData.audio_type}
                  onChange={(e) => setFormData({ ...formData, audio_type: e.target.value })}
                  placeholder="e.g., Podcast, Advertisement"
                  required
                />
              </div>

              <div>
                <Label htmlFor="format_type">Format Type</Label>
                <Input
                  id="format_type"
                  value={formData.format_type}
                  onChange={(e) => setFormData({ ...formData, format_type: e.target.value })}
                  placeholder="e.g., MP3, WAV"
                />
              </div>

              <div>
                <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="recorded_date">Recorded Date</Label>
                <Input
                  id="recorded_date"
                  type="date"
                  value={formData.recorded_date}
                  onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="published_on">Published On</Label>
                <Input
                  id="published_on"
                  value={formData.published_on}
                  onChange={(e) => setFormData({ ...formData, published_on: e.target.value })}
                  placeholder="e.g., Spotify, SoundCloud"
                />
              </div>

              <div>
                <Label htmlFor="listeners_count">Listeners Count</Label>
                <Input
                  id="listeners_count"
                  type="number"
                  value={formData.listeners_count}
                  onChange={(e) => setFormData({ ...formData, listeners_count: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="feedback_score">Feedback Score (1-10)</Label>
                <Input
                  id="feedback_score"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.feedback_score}
                  onChange={(e) => setFormData({ ...formData, feedback_score: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="created_by">Created By</Label>
                <Input
                  id="created_by"
                  value={formData.created_by}
                  onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="licensing_info">Licensing Info</Label>
                <Input
                  id="licensing_info"
                  value={formData.licensing_info}
                  onChange={(e) => setFormData({ ...formData, licensing_info: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedAudio ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}