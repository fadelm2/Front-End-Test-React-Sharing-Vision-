import React, { useState, useEffect } from 'react';
import '@/App.css';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('publish');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [paging, setPaging] = useState({ page: 1, size: 10, total_item: 0, total_page: 0 });

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchArticles();
  }, [currentPage, activeTab]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/article`, {
        params: { page: currentPage, size: pageSize }
      });
      setArticles(response.data.data || []);
      setPaging(response.data.paging || { page: 1, size: 10, total_item: 0, total_page: 0 });

    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to fetch articles');
    }
  };

  const handleTrashArticle = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.put(`${API}/article/${id}`);
      toast.success('Article moved to trash');
      fetchArticles();
      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
        setPreviewArticle(null);
      }
    } catch (error) {
      console.error('Error trashing article:', error);
      toast.error('Failed to move article to trash');
    }
  };

  const fetchArticleDetail = async (id) => {
    try {
      const response = await axios.get(`${API}/article/${id}`);
      setPreviewArticle(response.data.data);
    } catch (error) {
      console.error('Error fetching article detail:', error);
      toast.error('Failed to fetch article details');
    }
  };

  const handleRowClick = (article) => {
    setSelectedArticle(article);
    fetchArticleDetail(article.id);
  };

  console.log()
  const handleAddArticle = async () => {
    try {
      await axios.post(`${API}/articles`, formData);
      toast.success('Article created successfully');
      setShowAddModal(false);
      setFormData({ title: '', category: '', content: '', status: 'draft' });
      setCurrentPage(1); // Reset to first page
      fetchArticles();
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Failed to create article');
    }
  };

  console.log(paging)

  const handleEditClick = (article, e) => {
    e.stopPropagation();
    setEditingArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      content: article.content,
      status: article.status
    });
    setShowEditModal(true);
  };

  const handleUpdateArticle = async () => {
    try {
      await axios.put(`${API}/article/${editingArticle.id}`, formData);
      toast.success('Article updated successfully');
      setShowEditModal(false);
      setEditingArticle(null);
      setFormData({ title: '', category: '', content: '', status: 'draft' });
      fetchArticles();
      if (selectedArticle?.id === editingArticle.id) {
        fetchArticleDetail(editingArticle.id);
      }
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Failed to update article');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paging.total_page) {
      setCurrentPage(newPage);
      setSelectedArticle(null);
      setPreviewArticle(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedArticle(null);
    setPreviewArticle(null);
  };

  const filteredArticles = articles.filter(article => article.status === activeTab);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title" data-testid="app-title">Tes Frontend Sharing Vision 2023</h1>
        <div className="header-actions">
          <Button 
            variant="ghost" 
            onClick={() => handleTabChange('publish')}
            data-testid="all-posts-btn"
          >
            All Posts
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setShowAddModal(true)}
            data-testid="add-new-btn"
          >
            Add New
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              if (selectedArticle) {
                window.open(`/preview/${selectedArticle.id}`, '_blank');
              } else {
                toast.info('Please select an article first');
              }
            }}
            data-testid="preview-btn"
          >
            Preview
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className={`articles-section ${selectedArticle ? 'with-preview' : ''}`}>
          <div className="articles-card">
            <h2 className="section-title" data-testid="section-title">All Posts</h2>
            
            {/* Tabs */}
            <div className="tabs" data-testid="status-tabs">
              <button 
                className={`tab ${activeTab === 'publish' ? 'active' : ''}`}
                onClick={() => handleTabChange('publish')}
                data-testid="published-tab"
              >
                Published
              </button>
              <button 
                className={`tab ${activeTab === 'draft' ? 'active' : ''}`}
                onClick={() => handleTabChange('draft')}
                data-testid="drafts-tab"
              >
                Drafts
              </button>
              <button 
                className={`tab ${activeTab === 'trash' ? 'active' : ''}`}
                onClick={() => handleTabChange('trash')}
                data-testid="trashed-tab"
              >
                Trashed
              </button>
            </div>

            {/* Table */}
            <div className="table-container">
              <table className="articles-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr 
                      key={article.id} 
                      onClick={() => handleRowClick(article)}
                      className={selectedArticle?.id === article.id ? 'selected' : ''}
                      data-testid={`article-row-${article.id}`}
                    >
                      <td data-testid={`article-title-${article.id}`}>{article.title}</td>
                      <td data-testid={`article-category-${article.id}`}>{article.category}</td>
                      <td>
                        <div className="action-buttons">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => handleEditClick(article, e)}
                            data-testid={`edit-btn-${article.id}`}
                          >
                            Edit
                          </Button>

                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan="3" className="no-data">No articles found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paging.total_page > 1 && (
              <div className="pagination" data-testid="pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  data-testid="prev-page-btn"
                >
                  Previous
                </Button>
                
                <div className="pagination-info" data-testid="pagination-info">
                  Page {paging.page} of {paging.total_page} ({paging.total_item} items)
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paging.total_page}
                  data-testid="next-page-btn"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {selectedArticle && previewArticle && (
          <div className="preview-panel" data-testid="preview-panel">
            <div className="preview-content">
              <h3 className="preview-title" data-testid="preview-title">{previewArticle.title}</h3>
              <div className="preview-meta">
                <span className="preview-category" data-testid="preview-category">{previewArticle.category}</span>
                <span className="preview-date" data-testid="preview-date">
                  {new Date(previewArticle.created_date).toLocaleDateString()}
                </span>
              </div>
              <div className="preview-body" data-testid="preview-body">
                {previewArticle.content}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Article Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent data-testid="add-article-modal">
          <DialogHeader>
            <DialogTitle>Add New Article</DialogTitle>
            <DialogDescription>Create a new article</DialogDescription>
          </DialogHeader>
          <div className="form-fields">
            <div className="form-field">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="add-title-input"
              />
            </div>
            <div className="form-field">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                data-testid="add-category-input"
              />
            </div>
            <div className="form-field">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                data-testid="add-content-input"
              />
            </div>
            <div className="form-field">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger data-testid="add-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="publish">Publish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddArticle} className="w-full" data-testid="add-submit-btn">
              Create Article
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Article Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent data-testid="edit-article-modal">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>Update article details</DialogDescription>
          </DialogHeader>
          <div className="form-fields">
            <div className="form-field">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="edit-title-input"
              />
            </div>
            <div className="form-field">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                data-testid="edit-category-input"
              />
            </div>
            <div className="form-field">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                data-testid="edit-content-input"
              />
            </div>
            <div className="form-field">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger data-testid="edit-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateArticle} className="w-full" data-testid="edit-submit-btn">
              Update Article
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;