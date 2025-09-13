import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Select } from '../components/UI';
import { Save, Download, Upload, Trash2 } from 'lucide-react';

interface SettingsData {
  dailyStudyGoal: number;
  weeklyStudyGoal: number;
  studyReminders: boolean;
  reminderTime: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  timeFormat: '12h' | '24h';
}

const defaultSettings: SettingsData = {
  dailyStudyGoal: 240,
  weeklyStudyGoal: 1680,
  studyReminders: true,
  reminderTime: '09:00',
  notifications: {
    email: true,
    push: true,
    sound: false,
  },
  theme: 'light',
  timeFormat: '12h',
};

export default function Settings() {
  const { state } = useApp();
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('studyTrackerSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings };
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      (newSettings as any)[parent] = {
        ...(newSettings as any)[parent],
        [child]: value
      };
    } else {
      (newSettings as any)[key] = value;
    }
    setSettings(newSettings);
    setHasChanges(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('studyTrackerSettings', JSON.stringify(settings));
      setHasChanges(false);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const exportData = () => {
    try {
      const exportData = {
        settings,
        exams: state.exams,
        chapters: state.chapters,
        topics: state.topics,
        studySessions: state.studySessions,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate and restore settings if present
        if (importedData.settings) {
          setSettings({ ...defaultSettings, ...importedData.settings });
          localStorage.setItem('studyTrackerSettings', JSON.stringify(importedData.settings));
        }
        
        console.log('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        localStorage.clear();
        setSettings(defaultSettings);
        setHasChanges(false);
        console.log('All data cleared successfully');
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Customize your study tracker experience and manage your data.
          </p>
        </div>
        {hasChanges && (
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Study Preferences */}
      <Card title="Study Preferences" subtitle="Configure your study goals and reminders">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Daily Study Goal (minutes)"
            type="number"
            value={settings.dailyStudyGoal.toString()}
            onChange={(value: string) => handleSettingChange('dailyStudyGoal', parseInt(value) || 0)}
            placeholder="240"
          />
          
          <Input
            label="Weekly Study Goal (minutes)"
            type="number"
            value={settings.weeklyStudyGoal.toString()}
            onChange={(value: string) => handleSettingChange('weeklyStudyGoal', parseInt(value) || 0)}
            placeholder="1680"
          />
        </div>
      </Card>

      {/* Reminder Settings */}
      <Card title="Reminder Settings" subtitle="Configure when and how you receive reminders">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Study Reminders</h3>
              <p className="text-sm text-gray-600">Get daily reminders to study</p>
            </div>
            <button
              onClick={() => handleSettingChange('studyReminders', !settings.studyReminders)}
              className={`${
                settings.studyReminders ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.studyReminders ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          
          {settings.studyReminders && (
            <Input
              label="Reminder Time"
              type="time"
              value={settings.reminderTime}
              onChange={(value: string) => handleSettingChange('reminderTime', value)}
            />
          )}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card title="Notification Settings" subtitle="Choose how you want to receive notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications.email', !settings.notifications.email)}
              className={`${
                settings.notifications.email ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.notifications.email ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">Receive browser push notifications</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications.push', !settings.notifications.push)}
              className={`${
                settings.notifications.push ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.notifications.push ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Sound Notifications</h3>
              <p className="text-sm text-gray-600">Play sound with notifications</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications.sound', !settings.notifications.sound)}
              className={`${
                settings.notifications.sound ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.notifications.sound ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card title="Appearance" subtitle="Customize the look and feel">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            label="Theme"
            value={settings.theme}
            onChange={(value: string) => handleSettingChange('theme', value)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto (System)' }
            ]}
          />
          
          <Select
            label="Time Format"
            value={settings.timeFormat}
            onChange={(value: string) => handleSettingChange('timeFormat', value)}
            options={[
              { value: '12h', label: '12 Hour' },
              { value: '24h', label: '24 Hour' }
            ]}
          />
        </div>
      </Card>

      {/* Data Management */}
      <Card title="Data Management" subtitle="Export, import, or clear your data">
        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">Download a backup of all your data</p>
            </div>
            <Button variant="secondary" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          {/* Import Data */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Import Data</h3>
              <p className="text-sm text-gray-600">Restore data from a backup file</p>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <Button 
                variant="secondary" 
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
          
          {/* Clear All Data */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="text-sm font-medium text-red-900">Clear All Data</h3>
              <p className="text-sm text-red-600">Permanently delete all your data</p>
            </div>
            <Button variant="danger" onClick={clearAllData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card title="Statistics" subtitle="Overview of your data">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{state.exams.length}</p>
            <p className="text-sm text-gray-600">Exams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{state.chapters.length}</p>
            <p className="text-sm text-gray-600">Chapters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{state.topics.length}</p>
            <p className="text-sm text-gray-600">Topics</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{state.studySessions.length}</p>
            <p className="text-sm text-gray-600">Study Sessions</p>
          </div>
        </div>
      </Card>
    </div>
  );
}