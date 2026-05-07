import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CalorieChart } from '../components/ProgressChart';
import { Plus, Trash2, Apple, TrendingUp, ChevronLeft, ChevronRight, X } from 'lucide-react';

function MacroBar({ label, value, max, color }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold" style={{ color }}>{value.toFixed(0)}g</span>
      </div>
      <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function AddMealModal({ onClose, onAdd, accentColor }) {
  const [form, setForm] = useState({
    meal_name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.meal_name) return;
    onAdd({
      meal_name: form.meal_name,
      calories: parseInt(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      fat: parseFloat(form.fat) || 0,
      carbs: parseFloat(form.carbs) || 0
    });
    onClose();
  };

  const fields = [
    { key: 'calories', label: 'Calorías', unit: 'kcal', color: accentColor },
    { key: 'protein', label: 'Proteína', unit: 'g', color: '#F59E0B' },
    { key: 'fat', label: 'Grasas', unit: 'g', color: '#EC4899' },
    { key: 'carbs', label: 'Carbohidratos', unit: 'g', color: '#10B981' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1E293B] rounded-t-3xl w-full max-w-md p-6 slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Añadir Comida</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#0F172A] text-slate-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Nombre de la comida *</label>
            <input
              type="text"
              value={form.meal_name}
              onChange={e => setForm(prev => ({ ...prev, meal_name: e.target.value }))}
              placeholder="Ej: Pollo con arroz, Proteína..."
              className="input-dark"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map(field => (
              <div key={field.key}>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: field.color }}>
                  {field.label} ({field.unit})
                </label>
                <input
                  type="number"
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder="0"
                  className="input-dark text-center"
                  inputMode="decimal"
                  min="0"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={!form.meal_name}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            Añadir
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Nutrition() {
  const { user, apiCall } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [nutritionData, setNutritionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const accentColor = user?.color || '#3B82F6';

  useEffect(() => {
    if (!user) return;
    fetchNutrition();
  }, [user, currentDate]);

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  async function fetchNutrition() {
    setLoading(true);
    try {
      const res = await apiCall(`/nutrition/${user.id}/${currentDate}`);
      if (res.ok) {
        setNutritionData(await res.json());
      }
    } catch (err) {
      console.error('Error fetching nutrition:', err);
    }
    setLoading(false);
  }

  async function fetchHistory() {
    try {
      const res = await apiCall(`/nutrition/history/${user.id}?days=14`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.dailyTotals || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }

  async function addMeal(mealData) {
    try {
      const res = await apiCall('/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          date: currentDate,
          ...mealData
        })
      });
      if (res.ok) {
        await fetchNutrition();
        await fetchHistory();
      }
    } catch (err) {
      console.error('Error adding meal:', err);
    }
  }

  async function deleteMeal(id) {
    try {
      const res = await apiCall(`/nutrition/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchNutrition();
        await fetchHistory();
      }
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  }

  function changeDate(days) {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Hoy';
    if (dateStr === yesterday) return 'Ayer';

    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const calories = nutritionData?.totals?.calories || 0;
  const goal = nutritionData?.goal || user?.calories_goal || 2000;
  const remaining = goal - calories;
  const progress = Math.min((calories / goal) * 100, 100);

  // Approximate protein/carb/fat goals
  const proteinGoal = user?.gender === 'male' ? 160 : 100;
  const fatGoal = user?.gender === 'male' ? 90 : 50;
  const carbsGoal = user?.gender === 'male' ? 350 : 150;

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24 fade-in">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ paddingTop: `calc(env(safe-area-inset-top) + 1.5rem)` }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Nutrición</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-3">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-xl bg-[#1E293B] text-slate-400 active:scale-90">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <span className="text-white font-semibold">{formatDate(currentDate)}</span>
            {currentDate !== new Date().toISOString().split('T')[0] && (
              <button
                onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
                className="ml-2 text-xs px-2 py-0.5 rounded-lg bg-[#1E293B] text-slate-400"
              >
                Hoy
              </button>
            )}
          </div>
          <button
            onClick={() => changeDate(1)}
            disabled={currentDate >= new Date().toISOString().split('T')[0]}
            className="p-2 rounded-xl bg-[#1E293B] text-slate-400 active:scale-90 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Calorie progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-white">{calories.toFixed(0)}</div>
              <div className="text-slate-400 text-sm">de {goal} kcal</div>
            </div>
            <div className="text-right">
              <div
                className="text-2xl font-bold"
                style={{ color: remaining >= 0 ? accentColor : '#EF4444' }}
              >
                {Math.abs(remaining).toFixed(0)}
              </div>
              <div className="text-slate-400 text-sm">
                {remaining >= 0 ? 'restantes' : 'pasadas'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-[#0F172A] rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                backgroundColor: progress > 100 ? '#EF4444' : accentColor
              }}
            />
          </div>

          {/* Macros */}
          <div className="space-y-3">
            <MacroBar label="Proteína" value={nutritionData?.totals?.protein || 0} max={proteinGoal} color="#F59E0B" />
            <MacroBar label="Carbohidratos" value={nutritionData?.totals?.carbs || 0} max={carbsGoal} color="#10B981" />
            <MacroBar label="Grasas" value={nutritionData?.totals?.fat || 0} max={fatGoal} color="#EC4899" />
          </div>
        </div>

        {/* Meals list */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Apple size={18} style={{ color: accentColor }} />
              <h3 className="font-semibold text-white">Comidas del día</h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm font-semibold flex items-center gap-1 active:scale-95"
              style={{ color: accentColor }}
            >
              <Plus size={14} />
              Añadir
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
            </div>
          ) : nutritionData?.meals?.length === 0 ? (
            <div className="text-center py-8">
              <Apple size={36} className="mx-auto mb-2 text-slate-600" />
              <p className="text-slate-500 text-sm">No hay comidas registradas hoy</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm font-semibold active:scale-95"
                style={{ color: accentColor }}
              >
                Añadir primera comida
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {nutritionData?.meals?.map((meal) => (
                <div key={meal.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#0F172A]">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{meal.meal_name}</div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs font-semibold" style={{ color: accentColor }}>
                        {meal.calories} kcal
                      </span>
                      <span className="text-xs text-slate-500">P: {meal.protein?.toFixed(0)}g</span>
                      <span className="text-xs text-slate-500">C: {meal.carbs?.toFixed(0)}g</span>
                      <span className="text-xs text-slate-500">G: {meal.fat?.toFixed(0)}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-2 rounded-xl text-slate-500 active:scale-90 active:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calorie history chart */}
        {history.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} style={{ color: accentColor }} />
              <h3 className="font-semibold text-white">Últimas 2 semanas</h3>
            </div>
            <CalorieChart data={history} goal={goal} color={accentColor} />
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMealModal
          onClose={() => setShowAddModal(false)}
          onAdd={addMeal}
          accentColor={accentColor}
        />
      )}
    </div>
  );
}
