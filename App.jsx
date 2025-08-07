
// Slaughter and May Holiday Tracker – Multi-User Holiday Tracker App
// Built with React, Tailwind CSS, Firebase (for multi-user backend)

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase"; // Firebase should be set up with Firestore
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export default function SlaughterMayApp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState("");
  const [reason, setReason] = useState("Holiday");
  const [entries, setEntries] = useState([]);
  const [totalDays, setTotalDays] = useState(25);

  const addDayOff = async () => {
    if (!user) return alert("Please enter your name first.");

    const newEntry = {
      user,
      date: selectedDate.toISOString().split("T")[0],
      reason,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, "holidays"), newEntry);
    fetchEntries();
  };

  const fetchEntries = async () => {
    if (!user) return;
    const q = query(collection(db, "holidays"), where("user", "==", user));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => doc.data());
    setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const holidaysTaken = entries.length;
  const daysRemaining = totalDays - holidaysTaken;

  return (
    <div className="min-h-screen p-4 bg-white text-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-center">Slaughter and May Holiday Tracker</h1>

      <Card className="mb-4 max-w-md mx-auto">
        <CardContent className="p-4">
          <label className="block text-sm font-medium mb-1">Enter your name:</label>
          <Input
            placeholder="e.g. John Smith"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="mb-2"
          />
        </CardContent>
      </Card>

      {user && (
        <Tabs defaultValue="home" className="max-w-3xl mx-auto">
          <TabsList className="mb-4">
            <TabsTrigger value="home">Dashboard</TabsTrigger>
            <TabsTrigger value="add">Add Leave</TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <Card className="mb-4">
              <CardContent className="p-4">
                <p className="text-xl font-medium">User: {user}</p>
                <p>Total Days: {totalDays}</p>
                <p>Holidays Taken: {holidaysTaken}</p>
                <p>Remaining: {daysRemaining}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Booked Days:</h2>
                <ul className="list-disc pl-4">
                  {entries.map((entry, idx) => (
                    <li key={idx}>{entry.date} – {entry.reason}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="mb-4"
                />
                <Input
                  className="mb-2"
                  placeholder="Enter reason (e.g. Holiday, Sick, WFH)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <Button onClick={addDayOff}>Book Day Off</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
