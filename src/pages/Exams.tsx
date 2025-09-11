import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  ArrowRight,
  Search
} from 'lucide-react';
import { Card, Button, Modal, Input, Select, Badge } from '../components/UI';
import { useApp } from '../context/AppContext';
import { examService } from '../services/dataService';
import { ExamType, Exam } from '../types';
import { formatDisplayDate, generateId } from '../utils/helpers';

export function Exams() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as ExamType,
    category: '',
    targetDate: '',
    description: '',
  });

  useEffect(() => {
    // Load exams from storage
    const exams = examService.getAll();
    dispatch({ type: 'LOAD_DATA', payload: { exams } });
  }, [dispatch]);

  const examTypes: { value: ExamType; label: string }[] = [
    { value: 'UPSC', label: 'UPSC' },
    { value: 'CSE', label: 'CSE (Computer Science Engineering)' },
    { value: 'ESE', label: 'ESE (Engineering Services Examination)' },
    { value: 'GATE', label: 'GATE' },
    { value: 'Other', label: 'Other' },
  ];

  const filteredExams = state.exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || exam.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExam) {
      // Update existing exam
      const updatedExam = examService.update(editingExam.id, {
        ...formData,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
      });
      if (updatedExam) {
        dispatch({ type: 'UPDATE_EXAM', payload: updatedExam });
      }
    } else {
      // Create new exam
      const newExam = examService.create({
        ...formData,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
      });
      dispatch({ type: 'ADD_EXAM', payload: newExam });
    }

    // Reset form and close modal
    setFormData({
      name: '',
      type: '' as ExamType,
      category: '',
      targetDate: '',
      description: '',
    });
    setEditingExam(null);
    setIsModalOpen(false);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      type: exam.type,
      category: exam.category,
      targetDate: exam.targetDate ? exam.targetDate.toISOString().split('T')[0] : '',
      description: exam.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam? This will also delete all related chapters and topics.')) {
      const success = examService.delete(examId);
      if (success) {
        dispatch({ type: 'DELETE_EXAM', payload: examId });
      }
    }
  };

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      name: '',
      type: '' as ExamType,
      category: '',
      targetDate: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const getExamTypeColor = (type: ExamType) => {
    switch (type) {
      case 'UPSC': return 'primary';
      case 'CSE': return 'success';
      case 'ESE': return 'warning';
      case 'GATE': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="mt-2 text-gray-600">
            Manage your exams and track your preparation progress.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search exams..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedType}
            onChange={setSelectedType}
            options={[
              { value: '', label: 'Filter by type' },
              ...examTypes
            ]}
          />
        </div>
      </Card>

      {/* Exams Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{exam.category}</p>
                  </div>
                  <Badge variant={getExamTypeColor(exam.type)}>
                    {exam.type}
                  </Badge>
                </div>

                {exam.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{exam.description}</p>
                )}

                {exam.targetDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Target Date: {formatDisplayDate(exam.targetDate)}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Link to={`/exams/${exam.id}`}>
                    <Button size="sm" variant="secondary">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedType 
                ? 'Try adjusting your search criteria.' 
                : 'Get started by adding your first exam.'}
            </p>
            {!searchTerm && !selectedType && (
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Exam
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Add/Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Exam' : 'Add New Exam'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Exam Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="e.g., UPSC Civil Services 2025"
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Exam Type"
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as ExamType })}
              options={examTypes}
              required
            />

            <Input
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              placeholder="e.g., Prelims, Mains, Interview"
              required
            />
          </div>

          <Input
            label="Target Date"
            type="date"
            value={formData.targetDate}
            onChange={(value) => setFormData({ ...formData, targetDate: value })}
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Additional details about the exam..."
          />

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingExam ? 'Update Exam' : 'Add Exam'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}