import React, { useState } from 'react';
import { 
  Settings as SettingsIcon,
  Bell,
  Clock,
  Download,
  Upload,
  Trash2,
  Save,
  User,
  Shield,
  Palette
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { useApp } from '../context/AppContext';
import { UserSettings } from '../types';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '../utils/helpers';

export function Settings() {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState<UserSettings>(state.userSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'data'>('general');

  const handleSettingsChange = (key: keyof UserSettings, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
  };

  const handleNestedSettingsChange = (parentKey: keyof UserSettings, childKey: string, value: any) => {
    const updatedSettings = {
      ...settings,
      [parentKey]: {
        ...(settings[parentKey] as any),
        [childKey]: value
      }
    };
    setSettings(updatedSettings);
  };

  const saveSettings = () => {
    dispatch({ type: 'UPDATE_USER_SETTINGS', payload: settings });
    saveToLocalStorage('userSettings', settings);
    alert('Settings saved successfully!');
  };

  const exportData = () => {
    const exportData = {
      exams: state.exams,
      chapters: state.chapters,
      topics: state.topics,
      studySessions: state.studySessions,
      studyPlans: state.studyPlans,
      notifications: state.notifications,
      performances: state.performances,
      userSettings: state.userSettings,
      exportDate: new Date().toISOString(),
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
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate the data structure
        if (importedData.exams && importedData.userSettings) {
          dispatch({ type: 'LOAD_DATA', payload: importedData });
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (error) {
        alert('Error reading backup file.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all data? This action cannot be undone.'
    );
    
    if (confirmed) {
      // Clear localStorage
      removeFromLocalStorage('exams');
      removeFromLocalStorage('chapters');
      removeFromLocalStorage('topics');
      removeFromLocalStorage('studySessions');
      removeFromLocalStorage('studyPlans');
      removeFromLocalStorage('notifications');
      removeFromLocalStorage('performances');
      removeFromLocalStorage('userSettings');
      
      // Reset application state
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Download },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Customize your study tracker preferences and manage your data.
          </p>
        </div>
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card title="Study Goals" subtitle="Set your daily and weekly study targets">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Daily Study Goal (minutes)"
                type="number"
                value={settings.dailyStudyGoal.toString()}
                onChange={(value) => handleSettingsChange('dailyStudyGoal', parseInt(value) || 0)}
                placeholder="240"
              />
              <Input
                label="Weekly Study Goal (minutes)"
                type="number"
                value={settings.weeklyStudyGoal.toString()}
                onChange={(value) => handleSettingsChange('weeklyStudyGoal', parseInt(value) || 0)}
                placeholder="1680"
              />
            </div>
          </Card>

          <Card title="Appearance" subtitle="Customize the look and feel">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Theme"
                value={settings.theme}
                onChange={(value) => handleSettingsChange('theme', value)}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto (System)' },
                ]}
              />
              <Select
                label="Time Format"
                value={settings.timeFormat}
                onChange={(value) => handleSettingsChange('timeFormat', value)}
                options={[
                  { value: '12h', label: '12 Hour (AM/PM)' },
                  { value: '24h', label: '24 Hour' },
                ]}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card title="Study Reminders" subtitle="Configure when and how you want to be reminded">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Enable Study Reminders</h3>
                  <p className="text-sm text-gray-600">Get reminded to study at your scheduled times</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.studyReminders}
                  onChange={(e) => handleSettingsChange('studyReminders', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              
              {settings.studyReminders && (
                <Input
                  label="Daily Reminder Time"
                  type="time"
                  value={settings.reminderTime}
                  onChange={(value) => handleSettingsChange('reminderTime', value)}
                />
              )}
            </div>
          </Card>

          <Card title="Notification Channels" subtitle="Choose how you want to receive notifications">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleNestedSettingsChange('notifications', 'email', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive browser push notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleNestedSettingsChange('notifications', 'push', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sound Notifications</h3>
                  <p className="text-sm text-gray-600">Play sound when receiving notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.sound}
                  onChange={(e) => handleNestedSettingsChange('notifications', 'sound', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card title="Backup & Restore" subtitle="Export and import your study data">
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
          </Card>

          {/* Clear All Data */}
          <Card title="Danger Zone" subtitle="Irreversible actions">
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
          </Card>
        </div>
      )}

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