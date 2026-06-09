"use client";
import { motion } from "framer-motion";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  // These variables represent the data your TanStack Query hooks will provide
  const electiveData = [{ name: 'CS', value: 400 }, { name: 'Math', value: 300 }, { name: 'Physics', value: 200 }];
  const eventData = [{ name: 'Tech Fest', rsps: 150 }, { name: 'Workshop', rsps: 100 }, { name: 'Seminar', rsps: 80 }];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart for Events */}
        <div className="bg-white p-4 rounded-lg shadow-sm h-64">
          <h2 className="text-sm font-semibold mb-2">Upcoming Events RSVPs</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rsps" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for Electives */}
        <div className="bg-white p-4 rounded-lg shadow-sm h-64">
          <h2 className="text-sm font-semibold mb-2">Elective Popularity</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={electiveData} dataKey="value" nameKey="name" fill="#10b981" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}