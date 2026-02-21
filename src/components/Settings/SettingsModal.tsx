import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Moon, Sun, Volume2, VolumeX, Download, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">Settings</DialogTitle>
          <DialogDescription>
            Customize your chat experience and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-mode" className="text-sm font-medium">
                  Theme
                </Label>
                <Select defaultValue="dark">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode" className="text-sm font-medium">
                  Compact Mode
                </Label>
                <Switch id="compact-mode" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="animations" className="text-sm font-medium">
                  Enable Animations
                </Label>
                <Switch id="animations" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Chat Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chat Settings</CardTitle>
              <CardDescription>
                Configure your chat behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-effects" className="text-sm font-medium">
                  Sound Effects
                </Label>
                <Switch id="sound-effects" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="typing-indicators" className="text-sm font-medium">
                  Typing Indicators
                </Label>
                <Switch id="typing-indicators" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scroll" className="text-sm font-medium">
                  Auto-scroll to Latest Message
                </Label>
                <Switch id="auto-scroll" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="message-timestamps" className="text-sm font-medium">
                  Show Message Timestamps
                </Label>
                <Switch id="message-timestamps" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="font-size" className="text-sm font-medium">
                  Font Size
                </Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="save-conversations" className="text-sm font-medium">
                  Save Conversations Locally
                </Label>
                <Switch id="save-conversations" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="text-sm font-medium">
                  Usage Analytics
                </Label>
                <Switch id="analytics" />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Chat History
                </Button>
                
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Build:</strong> 2024.01</p>
                <p><strong>Last Updated:</strong> Jan 2024</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};