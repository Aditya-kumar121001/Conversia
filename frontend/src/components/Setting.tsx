"use client";

import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");

  const handleSave = () => {
    // TODO: send updated settings to backend
    console.log({ username, email, notifications, darkMode });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Profile Settings */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Profile</h3>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button className="mt-4" onClick={handleSave}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Preferences</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Enable Notifications</Label>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">Dark Mode</Label>
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Account</h3>
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
