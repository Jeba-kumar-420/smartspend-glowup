import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { Plus, Edit2, Trash2, Palette } from "lucide-react";

const COLOR_OPTIONS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#6b7280"
];

const EMOJI_OPTIONS = [
  "🍕", "🚗", "🎬", "🛍️", "💡", "🏥", "📚", "✈️", "📝", "🎮",
  "💼", "🏠", "🎯", "💳", "⛽", "🍔", "🚌", "🎵", "📱", "💊"
];

export const CategoryManagement = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", color: "#6366f1", icon: "📝" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
    } else {
      await addCategory(formData);
      setIsAddModalOpen(false);
    }

    setFormData({ name: "", color: "#6366f1", icon: "📝" });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: "", color: "#6366f1", icon: "📝" });
  };

  if (loading) {
    return <div className="text-center p-4">Loading categories...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Manage Categories
          </span>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Groceries"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-10 gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`p-2 text-lg rounded border ${
                          formData.icon === emoji ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-9 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-foreground' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Add Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id}>
              {editingCategory?.id === category.id ? (
                <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Category name"
                      required
                    />
                    <div className="flex gap-1">
                      {EMOJI_OPTIONS.slice(0, 5).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: emoji })}
                          className={`p-1 text-sm rounded ${
                            formData.icon === emoji ? 'bg-primary/20' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {COLOR_OPTIONS.slice(0, 6).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-6 h-6 rounded-full border ${
                          formData.color === color ? 'border-foreground border-2' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                      Save
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{category.name}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};