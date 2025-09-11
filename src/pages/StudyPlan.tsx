import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, Button, Modal, Input, Select, Badge } from '../components/UI';
import { useApp } from '../context/AppContext';
import { studyPlanService } from '../services/dataService';
import { StudyPlan } from '../types';
import { getToday, getTomorrow, formatDisplayDate, formatDuration, getDayName } from '../utils/helpers';

export function StudyPlanPage() {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [newTopic, setNewTopic] = useState({
    chapterId: '',
    topicId: '',
    estimatedDuration: 60,
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  useEffect(() => {
    // Load study plans
    const plans = studyPlanService.getAll();
    dispatch({ type: 'LOAD_DATA', payload: { studyPlans: plans } });
  }, [dispatch]);

  useEffect(() => {
    // Load plan for selected date
    const plan = studyPlanService.getByDate(selectedDate);
    setCurrentPlan(plan);
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const createNewPlan = () => {
    if (!currentPlan) {
      const newPlan = studyPlanService.create({
        examId: '', // Will be set when adding topics
        date: selectedDate,
        topics: [],
        totalPlannedTime: 0,
        actualTime: 0
      });
      setCurrentPlan(newPlan);
      dispatch({ type: 'ADD_STUDY_PLAN', payload: newPlan });
    }
  };

  const addTopicToPlan = () => {
    if (!currentPlan) {
      createNewPlan();
      return;
    }

    const updatedTopics = [
      ...currentPlan.topics,
      {
        ...newTopic,
        completed: false
      }
    ];

    const totalTime = updatedTopics.reduce((sum, topic) => sum + topic.estimatedDuration, 0);

    const updatedPlan = studyPlanService.update(currentPlan.id, {
      topics: updatedTopics,
      totalPlannedTime: totalTime
    });

    if (updatedPlan) {
      setCurrentPlan(updatedPlan);
      dispatch({ type: 'UPDATE_STUDY_PLAN', payload: updatedPlan });
    }

    setNewTopic({
      chapterId: '',
      topicId: '',
      estimatedDuration: 60,
      priority: 'medium'
    });
    setIsModalOpen(false);
  };

  const toggleTopicCompletion = (topicIndex: number) => {
    if (!currentPlan) return;

    const updatedTopics = currentPlan.topics.map((topic, index) => 
      index === topicIndex ? { ...topic, completed: !topic.completed } : topic
    );

    const updatedPlan = studyPlanService.update(currentPlan.id, {
      topics: updatedTopics
    });

    if (updatedPlan) {
      setCurrentPlan(updatedPlan);
      dispatch({ type: 'UPDATE_STUDY_PLAN', payload: updatedPlan });
    }
  };

  const removeTopicFromPlan = (topicIndex: number) => {
    if (!currentPlan) return;

    const updatedTopics = currentPlan.topics.filter((_, index) => index !== topicIndex);
    const totalTime = updatedTopics.reduce((sum, topic) => sum + topic.estimatedDuration, 0);

    const updatedPlan = studyPlanService.update(currentPlan.id, {
      topics: updatedTopics,
      totalPlannedTime: totalTime
    });

    if (updatedPlan) {
      setCurrentPlan(updatedPlan);
      dispatch({ type: 'UPDATE_STUDY_PLAN', payload: updatedPlan });
    }
  };

  const getDatesForWeek = () => {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: getDayName(date),
        isToday: date.toDateString() === new Date().toDateString(),
        isTomorrow: date.toDateString() === new Date(Date.now() + 86400000).toDateString()
      });
    }
    return dates;
  };

  const weekDates = getDatesForWeek();
  const completedTopics = currentPlan?.topics.filter(topic => topic.completed).length || 0;
  const totalTopics = currentPlan?.topics.length || 0;
  const completionPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Plan</h1>
          <p className="mt-2 text-gray-600">
            Plan and track your daily study schedule.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {/* Week View */}
      <Card title="This Week" subtitle="Quick overview of your weekly plan">
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((dayInfo) => {
            const dayPlan = studyPlanService.getByDate(dayInfo.date);
            const dayTopics = dayPlan?.topics.length || 0;
            const dayCompleted = dayPlan?.topics.filter(t => t.completed).length || 0;
            
            return (
              <button
                key={dayInfo.date}
                onClick={() => handleDateChange(dayInfo.date)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  selectedDate === dayInfo.date
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  dayInfo.isToday ? 'ring-2 ring-primary-200' : ''
                }`}
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-600">{dayInfo.day.slice(0, 3)}</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(dayInfo.date).getDate()}
                  </p>
                  {dayTopics > 0 && (
                    <div className="mt-1">
                      <div className="text-xs text-gray-600">
                        {dayCompleted}/{dayTopics}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-primary-600 h-1 rounded-full" 
                          style={{ width: `${dayTopics > 0 ? (dayCompleted / dayTopics) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Plan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card 
            title={`Study Plan for ${formatDisplayDate(new Date(selectedDate))}`}
            subtitle={`${getDayName(new Date(selectedDate))} - ${totalTopics} topics planned`}
          >
            {currentPlan && currentPlan.topics.length > 0 ? (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{completedTopics} of {totalTopics} topics completed</span>
                  <span>{completionPercentage.toFixed(0)}% complete</span>
                </div>

                {/* Topics List */}
                <div className="space-y-3">
                  {currentPlan.topics.map((topic, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        topic.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleTopicCompletion(index)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            topic.completed 
                              ? 'bg-green-600 border-green-600' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {topic.completed && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </button>
                        <div>
                          <p className={`font-medium ${topic.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                            Topic {index + 1}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDuration(topic.estimatedDuration)}
                            </span>
                            <Badge 
                              variant={topic.priority === 'high' ? 'danger' : topic.priority === 'medium' ? 'warning' : 'default'}
                              size="sm"
                            >
                              {topic.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTopicFromPlan(index)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No study plan for this date</h3>
                <p className="text-gray-600 mb-6">
                  Create a study plan to organize your learning for {formatDisplayDate(new Date(selectedDate))}.
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Topic
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Time Summary */}
          <Card title="Time Summary">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Planned Time:</span>
                <span className="font-medium">{formatDuration(currentPlan?.totalPlannedTime || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actual Time:</span>
                <span className="font-medium">{formatDuration(currentPlan?.actualTime || 0)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-primary-600">
                    {formatDuration(Math.max(0, (currentPlan?.totalPlannedTime || 0) - (currentPlan?.actualTime || 0)))}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
              <Button variant="secondary" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Copy Plan
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Topic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Topic to Study Plan"
      >
        <div className="space-y-4">
          <Select
            label="Priority"
            value={newTopic.priority}
            onChange={(value) => setNewTopic({ ...newTopic, priority: value as 'high' | 'medium' | 'low' })}
            options={[
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' }
            ]}
          />
          
          <Input
            label="Estimated Duration (minutes)"
            type="number"
            value={newTopic.estimatedDuration.toString()}
            onChange={(value) => setNewTopic({ ...newTopic, estimatedDuration: parseInt(value) || 0 })}
            placeholder="60"
          />

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTopicToPlan}>
              Add Topic
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}