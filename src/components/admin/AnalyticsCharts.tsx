'use client';

import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#1A365D', '#f6AD55', '#dc2626']; // Primary, Secondary, Danger

// 1. Line Chart: Tren Paket Masuk
export const TrendChart = ({ data }: { data: { date: string; entry: number; pickup: number }[] }) => {
  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEntry" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A365D" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#1A365D" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPickup" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f6AD55" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f6AD55" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={(str: string) => {
              const d = new Date(str);
              return d.getDate().toString();
            }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Area type="monotone" dataKey="entry" name="Entry" stroke="#1A365D" strokeWidth={3} fillOpacity={1} fill="url(#colorEntry)" />
          <Area type="monotone" dataKey="pickup" name="Pickup" stroke="#f6AD55" strokeWidth={3} fillOpacity={1} fill="url(#colorPickup)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Bar Chart: Distribusi per Blok
export const BlockChart = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
          <Bar dataKey="value" fill="#1A365D" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Pie Chart: Status Paket
export const StatusPieChart = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Bar Chart: Denda per Bulan
export const PenaltyChart = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
          <Bar dataKey="value" fill="#f87171" opacity={0.5} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
