"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface BillingData {
  currentPlan: string;
  creditsUsed: number;
  creditsRemaining: number;
  nextBillingDate: string;
}

export default function Billing() {

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Billing & Credits</h2>

      {/* Current Plan */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Current Plan: Basic</h3>          <Button className="mt-4">Upgrade Plan</Button>
        </CardContent>
      </Card>

      {/* Credits Info */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Credits</h3>
          <div className="flex justify-between mt-2">
            <p className="text-gray-600">Used: 0</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Remaining: 3</p>
          </div>
          <Button variant="outline" className="mt-4">Buy More Credits</Button>
        </CardContent>
      </Card>
    </div>
  );
}
