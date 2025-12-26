'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Video, Plus, Pencil, Trash2, Eye, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalViews: 0,
    totalLikes: 0,
    avgPerformance: 0
  });

  const [formData, setFormData] = useState({
    video_title: '',
    duration_seconds: '',
    upload_date: '',
    video_type: '',
    video_format: '',
    views_count: '',
    likes_count: '',
    platform_distributed_on: '',
    created_by: '',
    subtitles_available: false,
    performance_rating: '',
    remarks: ''
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing-videos');
      const result = await response.json();
      
      if (result.success) {
        setVideos(result.data);
        calculateStats(result.data);
      } else {
        toast.error('Failed to load videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Error loading videos');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const totalViews = data.reduce((sum, v) => sum + (v.views_count || 0), 0);
    const totalLikes = data.reduce((sum, v) => sum + (v.likes_count || 0), 0);
    const ratingsSum = data.reduce((sum, v) => sum + (v.performance_rating || 0), 0);
    const avgPerformance = total > 0 ? Math.round(ratingsSum / total) : 0;
    
    setStats({ total, totalViews, totalLikes, avgPerformance });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = selectedVideo 
        ? `/api/marketing-videos/${selectedVideo.id}`
        : '/api/marketing-videos';
      
      const method = selectedVideo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds) : null,
          views_count: formData.views_count ? parseInt(formData.views_count) : 0,
          likes_count: formData.likes_count ? parseInt(formData.likes_count) : 0,
          performance_rating: formData.performance_rating ? parseInt(formData.performance_rating) : null
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(selectedVideo ? 'Video updated successfully' : 'Video created successfully');
        setIsAddOpen(false);
        setIsEditOpen(false);
        resetForm();
        fetchVideos();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/marketing-videos/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Video deleted successfully');
        fetchVideos();
      } else {
        toast.error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  }

  function handleEdit(video) {
    setSelectedVideo(video);
    setFormData({
      video_title: video.video_title || '',
      duration_seconds: video.duration_seconds || '',
      upload_date: video.upload_date ? video.upload_date.split('T')[0] : '',
      video_type: video.video_type || '',
      video_format: video.video_format || '',
      views_count: video.views_count || '',
      likes_count: video.likes_count || '',
      platform_distributed_on: video.platform_distributed_on || '',
      created_by: video.created_by || '',
      subtitles_available: video.subtitles_available || false,
      performance_rating: video.performance_rating || '',
      remarks: video.remarks || ''
    });
    setIsEditOpen(true);
  }

  function resetForm() {
    setFormData({
      video_title: '',
      duration_seconds: '',
      upload_date: '',
      video_type: '',
      video_format: '',
      views_count: '',
      likes_count: '',
      platform_distributed_on: '',
      created_by: '',
      subtitles_available: false,
      performance_rating: '',
      remarks: ''
    });
    setSelectedVideo(null);
  }

  function formatDuration(seconds) {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Videos</h1>
          <p className="text-gray-600 mt-1">Manage your video content library</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Badge variant="outline">{stats.avgPerformance}/10</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPerformance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
          <CardDescription>View and manage all marketing videos</CardDescription>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first video entry</p>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">{video.video_title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{video.video_type}</Badge>
                    </TableCell>
                    <TableCell>{formatDuration(video.duration_seconds)}</TableCell>
                    <TableCell>{(video.views_count || 0).toLocaleString()}</TableCell>
                    <TableCell>{(video.likes_count || 0).toLocaleString()}</TableCell>
                    <TableCell>{video.platform_distributed_on || 'N/A'}</TableCell>
                    <TableCell>
                      {video.performance_rating ? (
                        <Badge>{video.performance_rating}/10</Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(video)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(video.id)}
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
            <DialogTitle>{selectedVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            <DialogDescription>
              {selectedVideo ? 'Update video information' : 'Create a new video entry'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="video_title">Video Title *</Label>
                <Input
                  id="video_title"
                  value={formData.video_title}
                  onChange={(e) => setFormData({ ...formData, video_title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="video_type">Video Type *</Label>
                <Input
                  id="video_type"
                  value={formData.video_type}
                  onChange={(e) => setFormData({ ...formData, video_type: e.target.value })}
                  placeholder="e.g., Tutorial, Promotional"
                  required
                />
              </div>

              <div>
                <Label htmlFor="video_format">Video Format</Label>
                <Input
                  id="video_format"
                  value={formData.video_format}
                  onChange={(e) => setFormData({ ...formData, video_format: e.target.value })}
                  placeholder="e.g., MP4, MOV"
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
                <Label htmlFor="upload_date">Upload Date</Label>
                <Input
                  id="upload_date"
                  type="date"
                  value={formData.upload_date}
                  onChange={(e) => setFormData({ ...formData, upload_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="views_count">Views Count</Label>
                <Input
                  id="views_count"
                  type="number"
                  value={formData.views_count}
                  onChange={(e) => setFormData({ ...formData, views_count: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="likes_count">Likes Count</Label>
                <Input
                  id="likes_count"
                  type="number"
                  value={formData.likes_count}
                  onChange={(e) => setFormData({ ...formData, likes_count: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="platform_distributed_on">Platform</Label>
                <Input
                  id="platform_distributed_on"
                  value={formData.platform_distributed_on}
                  onChange={(e) => setFormData({ ...formData, platform_distributed_on: e.target.value })}
                  placeholder="e.g., YouTube, Vimeo"
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

              <div>
                <Label htmlFor="performance_rating">Performance Rating (1-10)</Label>
                <Input
                  id="performance_rating"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.performance_rating}
                  onChange={(e) => setFormData({ ...formData, performance_rating: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="subtitles_available"
                  type="checkbox"
                  checked={formData.subtitles_available}
                  onChange={(e) => setFormData({ ...formData, subtitles_available: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="subtitles_available">Subtitles Available</Label>
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
                {selectedVideo ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}